import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, unlink, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

for (const status of [200, 503]) {
  test(`load harness reports every endpoint and ${status === 200 ? 'passes successes' : 'fails server errors'}`, async () => {
    let requests = 0;
    const server = createServer((req, res) => {
      requests++;
      assert.equal(req.headers.authorization, 'Bearer fixture-token');
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: { status: 'ok', items: [] } }));
    });
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    assert(address && typeof address === 'object');
    const directory = await mkdtemp(join(tmpdir(), 'compus-load-'));
    const reportPath = join(directory, 'report.json');
    try {
      const child = spawn(process.execPath, ['server/scripts/load-test.cjs'], { env: { ...process.env, TARGET_URL: `http://127.0.0.1:${address.port}`, LOAD_TEST_TOKEN: 'fixture-token', LOAD_REQUESTS: '3', LOAD_CONCURRENCY: '2', LOAD_MAX_P95_MS: '10000', LOAD_REPORT_PATH: reportPath }, stdio: 'ignore' });
      const exitCode = await new Promise<number | null>((resolve, reject) => { child.once('error', reject); child.once('exit', resolve); });
      assert.equal(exitCode, status === 200 ? 0 : 1);
      const report = JSON.parse(await readFile(reportPath, 'utf8'));
      assert.equal(requests, 18);
      assert.equal(report.endpoints.length, 6);
      for (const endpoint of report.endpoints) {
        assert.equal(endpoint.requests, 3);
        assert.equal(endpoint.failures, status === 200 ? 0 : 3);
        assert.equal(endpoint.passed, status === 200);
      }
    } finally {
      await new Promise<void>(resolve => server.close(() => resolve()));
      await unlink(reportPath).catch(() => {});
      await rmdir(directory);
    }
  });
}
