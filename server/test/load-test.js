/**
 * Compus Production Load & Concurrency Benchmark Script
 * Evaluates latency, throughput, and error rates across core endpoints.
 */

const http = require('http');

const BASE_URL = process.env.TARGET_URL || 'http://localhost:4000';
const CONCURRENT_REQUESTS = 50;
const TOTAL_REQUESTS = 200;

async function executeRequest(endpoint) {
  return new Promise((resolve) => {
    const start = Date.now();
    http.get(`${BASE_URL}${endpoint}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const latency = Date.now() - start;
        resolve({ statusCode: res.statusCode, latency });
      });
    }).on('error', (err) => {
      resolve({ statusCode: 500, error: err.message, latency: Date.now() - start });
    });
  });
}

async function runLoadBenchmark() {
  console.log(`🚀 Starting Compus Load Benchmark against ${BASE_URL}...`);
  console.log(`📊 Concurrency: ${CONCURRENT_REQUESTS} parallel clients | Total: ${TOTAL_REQUESTS} requests\n`);

  const endpoints = [
    '/api/v1/health',
    '/api/v1/feed/latest',
    '/api/v1/opportunities/latest',
    '/api/v1/search/discovery',
  ];

  for (const endpoint of endpoints) {
    const latencies = [];
    let successCount = 0;
    let failCount = 0;

    const startTotal = Date.now();

    for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENT_REQUESTS) {
      const batch = Array.from({ length: CONCURRENT_REQUESTS }, () => executeRequest(endpoint));
      const results = await Promise.all(batch);

      results.forEach((r) => {
        latencies.push(r.latency);
        if (r.statusCode >= 200 && r.statusCode < 400) successCount++;
        else failCount++;
      });
    }

    const durationSeconds = (Date.now() - startTotal) / 1000;
    const avgLatency = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2);
    const rps = (TOTAL_REQUESTS / durationSeconds).toFixed(2);

    console.log(`Endpoint: ${endpoint}`);
    console.log(`  - Success / Fail: ${successCount} / ${failCount}`);
    console.log(`  - Avg Latency: ${avgLatency} ms`);
    console.log(`  - Throughput: ${rps} req/sec\n`);
  }

  console.log('✅ Load benchmark complete.');
}

if (require.main === module) {
  runLoadBenchmark();
}
