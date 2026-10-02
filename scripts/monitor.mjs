const target = process.env.HEALTH_URL;
if (!target || new URL(target).protocol !== 'https:') throw new Error('HEALTH_URL must be an explicit HTTPS health endpoint');
let passed = false;
for (let attempt = 1; attempt <= 3; attempt++) {
  const start = performance.now();
  try {
    const response = await fetch(target, { signal: AbortSignal.timeout(10000), redirect: 'error' });
    const result = await response.json();
    const data = result.data ?? result;
    if (!response.ok || data.status !== 'ok') throw new Error('Health check failed');
    const latency = performance.now() - start;
    if (latency > Number(process.env.HEALTH_MAX_MS || 5000)) throw new Error('Health check too slow');
    console.log(JSON.stringify({ healthy: true, latencyMs: Math.round(latency) }));
    passed = true;
    break;
  } catch { console.error(JSON.stringify({ healthy: false, attempt })); }
}
if (!passed) process.exitCode = 1;
