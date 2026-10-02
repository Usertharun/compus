const fs = require('node:fs/promises');
const base = (process.env.TARGET_URL || 'http://localhost:3000/api/v1').replace(/\/$/, '');
const token = process.env.LOAD_TEST_TOKEN;
const total = Number(process.env.LOAD_REQUESTS || 200);
const concurrency = Number(process.env.LOAD_CONCURRENCY || 10);
const maxP95 = Number(process.env.LOAD_MAX_P95_MS || 1000);
const maxErrorRate = Number(process.env.LOAD_MAX_ERROR_RATE || 0.01);
if (!token) throw new Error('LOAD_TEST_TOKEN is required for authenticated flow coverage');
if (![total, concurrency, maxP95].every(n => Number.isInteger(n) && n > 0) || concurrency > 100 || total > 100000 || maxErrorRate < 0 || maxErrorRate > 1) throw new Error('Invalid benchmark limits');
const endpoints = ['/health', '/feed/latest?limit=20', '/events/browse?limit=20', '/events/registrations?limit=20', '/opportunities/saved?limit=20', '/communities/browse?limit=20'];
async function main() {
  const report = { timestamp: new Date().toISOString(), total, concurrency, endpoints: [] };
  for (const endpoint of endpoints) {
    let next = 0, failures = 0;
    const statuses = {}, latencies = [];
    const started = performance.now();
    async function worker() {
      while (next++ < total) {
        const start = performance.now();
        let status = 0;
        try {
          const response = await fetch(base + endpoint, { headers: { Authorization: 'Bearer ' + token }, signal: AbortSignal.timeout(15000), redirect: 'error' });
          status = response.status;
          const body = await response.json();
          if (!response.ok || typeof body !== 'object' || body === null) failures++;
        } catch { failures++; }
        latencies.push(performance.now() - start);
        statuses[status] = (statuses[status] || 0) + 1;
      }
    }
    await Promise.all(Array.from({ length: Math.min(total, concurrency) }, worker));
    latencies.sort((a, b) => a - b);
    const percentile = p => Math.round(latencies[Math.max(0, Math.ceil(p * latencies.length) - 1)]);
    const result = { endpoint, requests: latencies.length, failures, errorRate: failures / total, p50Ms: percentile(.5), p95Ms: percentile(.95), p99Ms: percentile(.99), requestsPerSecond: Math.round(total * 1000 / (performance.now() - started)), statuses };
    result.passed = result.p95Ms <= maxP95 && result.errorRate <= maxErrorRate;
    report.endpoints.push(result);
    console.log(JSON.stringify(result));
  }
  await fs.writeFile(process.env.LOAD_REPORT_PATH || 'load-report.json', JSON.stringify(report, null, 2));
  if (report.endpoints.some(result => !result.passed)) process.exitCode = 1;
}
main().catch(() => { console.error('Load benchmark failed'); process.exitCode = 1; });
