import dotenv from "dotenv";

dotenv.config();

export const RUNNER_PORT =
  process.env.RUNNER_PORT || process.env.PORT || "3050";
export const RUNNER_IMAGE = process.env.RUNNER_IMAGE || "node:22-alpine";
export const RUNNER_TIMEOUT_MS = Number(process.env.RUNNER_TIMEOUT_MS || 10000);
export const RUNNER_PER_TEST_TIMEOUT_MS = Number(
  process.env.RUNNER_PER_TEST_TIMEOUT_MS || 2000,
);
export const RUNNER_MEMORY_BYTES = Number(
  process.env.RUNNER_MEMORY_BYTES || 256 * 1024 * 1024,
);
export const RUNNER_NANO_CPUS = Number(
  process.env.RUNNER_NANO_CPUS || 1_000_000_000,
);
export const RUNNER_PIDS_LIMIT = Number(process.env.RUNNER_PIDS_LIMIT || 128);
export const RUNNER_MAX_LOG_BYTES = Number(
  process.env.RUNNER_MAX_LOG_BYTES || 16_000,
);
export const RUNNER_AUTH_TOKEN = process.env.RUNNER_AUTH_TOKEN || "";
export const RATE_LIMIT_MAX = Number(process.env.RUNNER_RATE_LIMIT_MAX || 10);
export const RATE_LIMIT_WINDOW_MS = Number(
  process.env.RUNNER_RATE_LIMIT_WINDOW_MS || 60_000,
);
