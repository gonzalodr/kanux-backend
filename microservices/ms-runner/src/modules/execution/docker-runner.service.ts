import Docker, { Container, ImageInfo } from "dockerode";
import tar from "tar-stream";
import { PassThrough, Readable } from "stream";
import {
  RUNNER_IMAGE,
  RUNNER_MAX_LOG_BYTES,
  RUNNER_MEMORY_BYTES,
  RUNNER_NANO_CPUS,
  RUNNER_PER_TEST_TIMEOUT_MS,
  RUNNER_PIDS_LIMIT,
  RUNNER_TIMEOUT_MS,
} from "../../config/constants";
import { RUNNER_WRAPPER } from "./runner-wrapper";
import { ExecutionRequest, ExecutionResult, ExecutionTestCase } from "./types";

export class DockerRunnerService {
  private docker: Docker;

  constructor() {
    this.docker = new Docker();
  }

  async run(request: ExecutionRequest): Promise<ExecutionResult> {
    await this.ensureImage(RUNNER_IMAGE);

    const container = await this.docker.createContainer({
      Image: RUNNER_IMAGE,
      Cmd: ["node", "/runner/runner.js"],
      WorkingDir: "/runner",
      Tty: true,
      AttachStdout: true,
      AttachStderr: true,
      Env: [
        `ENTRYPOINT=${request.entrypoint}`,
        `PER_TEST_TIMEOUT_MS=${request.perTestTimeoutMs || RUNNER_PER_TEST_TIMEOUT_MS}`,
        `MAX_LOG_BYTES=${RUNNER_MAX_LOG_BYTES}`,
      ],
      HostConfig: {
        AutoRemove: false,
        NetworkMode: "none",
        Memory: RUNNER_MEMORY_BYTES,
        NanoCpus: RUNNER_NANO_CPUS,
        PidsLimit: RUNNER_PIDS_LIMIT,
      },
    });

    const archive = this.buildArchive(
      request.code,
      request.tests,
      request.entrypoint,
    );

    await container.putArchive(archive, { path: "/runner" });

    const timeout = setTimeout(async () => {
      await this.safeKill(container);
    }, request.timeoutMs || RUNNER_TIMEOUT_MS);

    try {
      await container.start();
      const status = await container.wait({ condition: "not-running" });
      // Read logs immediately after container stops, before auto-removal
      let logs = "";
      try {
        logs = await this.readLogs(container);
      } catch (logError) {
        // Container may have already been auto-removed, use empty logs
        logs = JSON.stringify({
          status: "error",
          error: "Failed to read container logs",
        });
      }
      const parsed = this.extractResult(logs);
      return {
        ...parsed,
        logs: this.trimLogs(logs),
        exitCode: status.StatusCode,
      };
    } finally {
      clearTimeout(timeout);
      await this.safeRemove(container);
    }
  }

  private buildArchive(
    code: string,
    tests: ExecutionTestCase[],
    entrypoint: string,
  ): Readable {
    const pack = tar.pack();

    const exportHelper = `
// Auto-export the expected entrypoint so plain function declarations work
(function() {
  try {
    const entrypointName = '${entrypoint}';
    let __entry = undefined;
    
    // Try to get the function using eval to access the local scope
    try {
      __entry = eval(entrypointName);
    } catch (_) {}
    
    // Fallback: check module.exports
    if (!__entry && module.exports && typeof module.exports[entrypointName] === 'function') {
      __entry = module.exports[entrypointName];
    }
    
    // Fallback: check if module.exports itself is the function
    if (!__entry && typeof module.exports === 'function') {
      __entry = module.exports;
    }
    
    // Fallback: check globalThis
    if (!__entry && typeof globalThis !== 'undefined' && typeof globalThis[entrypointName] === 'function') {
      __entry = globalThis[entrypointName];
    }
    
    // Fallback: check global
    if (!__entry && typeof global !== 'undefined' && typeof global[entrypointName] === 'function') {
      __entry = global[entrypointName];
    }
    
    if (typeof __entry === 'function') {
      // Ensure it's exported
      module.exports = module.exports || {};
      module.exports[entrypointName] = __entry;
      if (typeof exports !== 'undefined') {
        exports[entrypointName] = __entry;
      }
      if (typeof globalThis !== 'undefined') {
        try { globalThis[entrypointName] = __entry; } catch (_) {}
      }
    }
  } catch (_err) {
    // Silently ignore export helper errors
  }
})();
`;

    const userCode = `${code}\n\n${exportHelper}`;

    pack.entry({ name: "user-code.js" }, userCode);
    pack.entry({ name: "tests.json" }, JSON.stringify(tests));
    pack.entry({ name: "runner.js" }, RUNNER_WRAPPER);
    pack.finalize();
    return pack;
  }

  private async readLogs(container: Container): Promise<string> {
    try {
      const raw = await container.logs({
        stdout: true,
        stderr: true,
        follow: false,
      });

      if (Buffer.isBuffer(raw)) {
        return raw.toString("utf8");
      }

      if (Array.isArray(raw)) {
        return Buffer.concat(raw).toString("utf8");
      }

      const maybeStream: any = raw as any;
      if (maybeStream && typeof maybeStream.on === "function") {
        const stdout = new PassThrough();
        const stderr = new PassThrough();
        const stdoutChunks: Buffer[] = [];
        const stderrChunks: Buffer[] = [];

        stdout.on("data", (chunk: Buffer | string) => {
          stdoutChunks.push(
            Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk),
          );
        });
        stderr.on("data", (chunk: Buffer | string) => {
          stderrChunks.push(
            Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk),
          );
        });

        this.docker.modem.demuxStream(maybeStream, stdout, stderr);

        await Promise.all([
          new Promise<void>((resolve) => stdout.on("end", resolve)),
          new Promise<void>((resolve) => stderr.on("end", resolve)),
        ]);

        return Buffer.concat([...stdoutChunks, ...stderrChunks]).toString(
          "utf8",
        );
      }

      return JSON.stringify(raw);
    } catch (error: any) {
      // Handle case where container was already removed (HTTP 409)
      if (error?.statusCode === 409) {
        return JSON.stringify({
          status: "error",
          error: "Container was already removed",
        });
      }
      throw error;
    }
  }

  private extractResult(logs: string): ExecutionResult {
    const lines = logs.split(/\r?\n/).filter(Boolean).reverse();
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.status === "ok") {
          return {
            status: "ok",
            results: parsed.results?.map((item: any) => ({
              id: item.id,
              description: item.description,
              expected: item.expected,
              output: item.output,
              pass: Boolean(item.pass),
              error: item.error,
              durationMs: item.durationMs,
            })),
          };
        }
        return { status: "error", error: parsed.message || "Runner error" };
      } catch (error) {
        continue;
      }
    }
    return { status: "error", error: "No parsable output from runner" };
  }

  private trimLogs(logs: string): string {
    if (logs.length <= RUNNER_MAX_LOG_BYTES) return logs;
    return logs.slice(-RUNNER_MAX_LOG_BYTES);
  }

  private async ensureImage(image: string): Promise<void> {
    const images: ImageInfo[] = await this.docker.listImages();
    const exists = images.some((img: ImageInfo) =>
      img.RepoTags?.includes(image),
    );
    if (exists) return;
    await new Promise<void>((resolve, reject) => {
      this.docker.pull(
        image,
        (err: unknown, stream: NodeJS.ReadableStream | undefined) => {
          if (err) return reject(err);
          if (!stream)
            return reject(new Error("Docker pull stream unavailable"));
          this.docker.modem.followProgress(stream, (pullErr: unknown) => {
            if (pullErr) return reject(pullErr);
            resolve();
          });
        },
      );
    });
  }

  private async safeKill(container: Container): Promise<void> {
    try {
      await container.kill({ signal: "SIGKILL" });
    } catch (error) {
      // container may already be stopped
    }
  }

  private async safeRemove(container: Container): Promise<void> {
    try {
      await container.remove({ force: true });
    } catch (error) {
      // ignore cleanup errors
    }
  }
}
