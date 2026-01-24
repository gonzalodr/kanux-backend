export const RUNNER_WRAPPER = `
const fs = require('node:fs');
const assert = require('node:assert');
const path = require('node:path');

const ENTRYPOINT = process.env.ENTRYPOINT;
const PER_TEST_TIMEOUT_MS = Number(process.env.PER_TEST_TIMEOUT_MS || 2000);
const MAX_LOG_BYTES = Number(process.env.MAX_LOG_BYTES || 16000);

const testsPath = path.join('/runner', 'tests.json');
const tests = JSON.parse(fs.readFileSync(testsPath, 'utf8'));

const blocked = new Set([
  'fs',
  'child_process',
  'worker_threads',
  'cluster',
  'os',
  'net',
  'http',
  'https',
  'tls',
  'dgram',
  'dns',
  'process',
]);
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function patchedRequire(name) {
  if (blocked.has(name)) {
    throw new Error('Blocked module: ' + name);
  }
  return originalRequire.apply(this, arguments);
};

const userModule = require('./user-code.js');
const entryCandidate = userModule?.[ENTRYPOINT] || (typeof userModule === 'function' ? userModule : global[ENTRYPOINT]);
if (typeof entryCandidate !== 'function') {
  throw new Error('Entrypoint not found: ' + ENTRYPOINT);
}

const results = [];

const invokeWithTimeout = async (fn, args, timeoutMs) => {
  return await Promise.race([
    Promise.resolve(fn(...args)),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Test timeout')), timeoutMs)),
  ]);
};

(async () => {
  for (const test of tests) {
    const args = Array.isArray(test.input)
      ? test.input
      : Object.values(test.input || {});

    const started = Date.now();
    let output;
    let error;
    let pass = false;
    try {
      const value = await invokeWithTimeout(
        entryCandidate,
        args,
        Number(test.timeout_ms || PER_TEST_TIMEOUT_MS),
      );
      output = value;
      assert.deepStrictEqual(value, test.expected_output);
      pass = true;
    } catch (err) {
      error = err?.message || String(err);
    }
    results.push({
      id: test.id,
      description: test.description,
      expected: test.expected_output,
      output,
      pass,
      error,
      durationMs: Date.now() - started,
    });
  }

  const serialized = JSON.stringify({ status: 'ok', results });
  if (serialized.length > MAX_LOG_BYTES) {
    console.log(serialized.slice(0, MAX_LOG_BYTES));
  } else {
    console.log(serialized);
  }
})().catch((err) => {
  console.error(JSON.stringify({ status: 'error', message: err?.message || String(err) }));
  process.exit(1);
});
`;
