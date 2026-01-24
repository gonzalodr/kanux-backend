import ts from "typescript";
import {
  RUNNER_PER_TEST_TIMEOUT_MS,
  RUNNER_TIMEOUT_MS,
} from "../../config/constants";
import { DockerRunnerService } from "./docker-runner.service";
import { ExecutionRequest, ExecutionResult } from "./types";

const BLOCKED_PATTERNS: RegExp[] = [
  /require\(['"](child_process|fs|os|net|http|https|cluster|worker_threads)['"]\)/i,
  /process\.exit\s*\(/i,
];

const sanitizeCode = (code: string) => {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(code)) {
      throw new Error("Forbidden API detected in source code");
    }
  }
};

export class ExecutionService {
  constructor(private dockerRunner = new DockerRunnerService()) {}

  async execute(payload: ExecutionRequest): Promise<ExecutionResult> {
    sanitizeCode(payload.code);

    const language = payload.language || "javascript";
    const timeoutMs = payload.timeoutMs || RUNNER_TIMEOUT_MS;
    const perTestTimeoutMs =
      payload.perTestTimeoutMs || RUNNER_PER_TEST_TIMEOUT_MS;

    const transpiledCode =
      language === "typescript"
        ? ts.transpileModule(payload.code, {
            compilerOptions: {
              module: ts.ModuleKind.CommonJS,
              target: ts.ScriptTarget.ES2020,
            },
            reportDiagnostics: false,
          }).outputText
        : payload.code;

    return this.dockerRunner.run({
      ...payload,
      language: "javascript",
      code: transpiledCode,
      timeoutMs,
      perTestTimeoutMs,
    });
  }
}
