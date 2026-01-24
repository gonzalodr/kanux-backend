export interface ExecutionTestCase {
  id: string | number;
  input: unknown;
  expected_output: unknown;
  description?: string;
  timeout_ms?: number;
}

export interface ExecutionRequest {
  language: "javascript" | "typescript";
  code: string;
  entrypoint: string;
  tests: ExecutionTestCase[];
  userId?: string;
  timeoutMs?: number;
  perTestTimeoutMs?: number;
}

export interface ExecutionResult {
  status: "ok" | "error";
  results?: Array<{
    id: string | number;
    description?: string;
    pass: boolean;
    expected: unknown;
    output: unknown;
    durationMs: number;
    error?: string;
  }>;
  logs?: string;
  error?: string;
  exitCode?: number;
}
