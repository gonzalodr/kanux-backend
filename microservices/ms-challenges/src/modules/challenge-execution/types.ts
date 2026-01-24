/**
 * Types and interfaces for the code execution system
 */

export type ErrorCategory =
  | "SYNTAX"
  | "RUNTIME"
  | "TIMEOUT"
  | "SECURITY"
  | "LOGIC"
  | "SYSTEM";

export interface ExecutionErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    category: ErrorCategory;
    suggestions?: string[];
    originalError?: string;
  };
  data?: any;
}

export interface ExecutionSuccessResponse {
  success: true;
  message: string;
  data: {
    status: "ok";
    results: TestResult[];
  };
}

export interface TestResult {
  id: string | number;
  description: string;
  expected: any;
  output: any;
  pass: boolean;
  error?: string;
  durationMs: number;
}

export type ExecutionResponse =
  | ExecutionSuccessResponse
  | ExecutionErrorResponse;

/**
 * Payload to execute a challenge
 */
export interface ExecutionPayload {
  challengeId: string;
  code: string;
  language?: "javascript" | "typescript";
  userId?: string;
}

/**
 * Execution configuration
 */
export interface ExecutionConfig {
  timeoutMs?: number;
  perTestTimeoutMs?: number;
  maxMemoryMb?: number;
  allowedModules?: string[];
}

/**
 * Raw result from the runner
 */
export interface RunnerResult {
  status: "ok" | "error";
  results?: TestResult[];
  error?: string;
  message?: string;
}

/**
 * Type guard to check if it is an error
 */
export function isExecutionError(
  response: ExecutionResponse,
): response is ExecutionErrorResponse {
  return response.success === false;
}

/**
 * Type guard to check if it is a success
 */
export function isExecutionSuccess(
  response: ExecutionResponse,
): response is ExecutionSuccessResponse {
  return response.success === true;
}
