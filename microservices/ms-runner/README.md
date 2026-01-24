# ms-runner

Service dedicated to executing code in ephemeral containers, without network and with CPU/memory limits.

## Endpoints

- `POST /execute`: receives `{ language, code, entrypoint, tests, userId?, timeoutMs?, perTestTimeoutMs? }` and returns the test results.

## Security

- Container without network (`NetworkMode: none`), auto-remove, memory and CPU limits, PID limits and timeout cutoff.
- Blocking of `require` to `fs`, `child_process`, `net`, etc. in the wrapper.
- Mandatory token in the `x-runner-token` header.
- Rate limit per user/IP: 10 executions per minute by default.

## Environment Variables

- `RUNNER_PORT` (optional, default `3050`)
- `RUNNER_AUTH_TOKEN` (required)
- `RUNNER_IMAGE` (optional, default `node:22-alpine`)
- `RUNNER_TIMEOUT_MS` (optional, default `10000`)
- `RUNNER_PER_TEST_TIMEOUT_MS` (optional, default `2000`)
- `RUNNER_MEMORY_BYTES` (optional, default `268435456`)
- `RUNNER_NANO_CPUS` (optional, default `1000000000`)
- `RUNNER_PIDS_LIMIT` (optional, default `128`)
- `RUNNER_MAX_LOG_BYTES` (optional, default `16000`)
- `RUNNER_RATE_LIMIT_MAX` and `RUNNER_RATE_LIMIT_WINDOW_MS` (optional, rate limiting)

## Request Example

```json
{
  "language": "typescript",
  "code": "function sumar(a: number, b: number) { return a + b; }",
  "entrypoint": "sumar",
  "tests": [{ "id": 1, "input": { "a": 2, "b": 3 }, "expected_output": 5 }],
  "userId": "user-123"
}
```
