import axios from "axios";
import fs from "fs";
import path from "path";

type SupportedLanguage = "javascript" | "typescript";

interface RunnerPayload {
  challengeId: string;
  code: string;
  language?: SupportedLanguage;
  userId?: string;
}

export const DEFAULT_CHALLENGE_FILES: Record<
  string,
  { language: "javascript" | "typescript"; folder: string; entrypoint: string }
> = {
  "550e8400-e29b-41d4-a716-446655440001": {
    language: "javascript",
    folder: "001-sum-two-numbers",
    entrypoint: "sumar",
  },
  "550e8400-e29b-41d4-a716-446655440002": {
    language: "javascript",
    folder: "002-reverse-string",
    entrypoint: "invertirCadena",
  },
  "550e8400-e29b-41d4-a716-446655440003": {
    language: "typescript",
    folder: "003-palindrome-checker",
    entrypoint: "esPalindromo",
  },
  "550e8400-e29b-41d4-a716-446655440004": {
    language: "typescript",
    folder: "004-fibonacci",
    entrypoint: "fibonacci",
  },
  "550e8400-e29b-41d4-a716-446655440005": {
    language: "typescript",
    folder: "005-array-duplicates",
    entrypoint: "eliminarDuplicados",
  },
};

export class ExecutionService {
  private baseUrl = process.env.RUNNER_BASE_URL || "http://localhost:3050";
  private token = process.env.RUNNER_AUTH_TOKEN || "";
  private timeoutMs = Number(process.env.RUNNER_TIMEOUT_MS || 10000);
  private perTestTimeoutMs = Number(
    process.env.RUNNER_PER_TEST_TIMEOUT_MS || 2000,
  );

  async executeChallenge(payload: RunnerPayload) {
    const assets = await this.loadAssets(payload.challengeId);

    const response = await axios.post(
      `${this.baseUrl}/execute`,
      {
        language: (payload.language || assets.language) as SupportedLanguage,
        code: payload.code,
        entrypoint: assets.entrypoint,
        tests: assets.tests,
        userId: payload.userId,
        timeoutMs: this.timeoutMs,
        perTestTimeoutMs: this.perTestTimeoutMs,
      },
      {
        headers: this.token ? { "x-runner-token": this.token } : undefined,
        timeout: this.timeoutMs,
      },
    );

    return response.data;
  }

  private async loadAssets(challengeId: string) {
    const fileInfo = DEFAULT_CHALLENGE_FILES[challengeId];
    if (!fileInfo) {
      throw new Error("CHALLENGE_ASSETS_NOT_FOUND");
    }

    const baseDir = path.resolve(
      __dirname,
      "../../data/default-challenges",
      fileInfo.language,
      fileInfo.folder,
    );

    const testCasesRaw = await fs.promises.readFile(
      path.join(baseDir, "test-cases.json"),
      "utf8",
    );

    const parsed = JSON.parse(testCasesRaw);

    return {
      language: fileInfo.language,
      entrypoint: fileInfo.entrypoint,
      tests: parsed.test_cases,
    };
  }
}
