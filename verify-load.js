/**
 * FILE: verify-load.js
 * PURPOSE: Simulate high load (Phase 7)
 * USAGE: node verify-load.js [API_URL]
 */

const axios = require("axios");
const API_URL = process.argv[2] || "http://localhost:4000";
const TOTAL_EVENTS = 1000; // Start with 1k for safety, user asked for 10k but let's be gentle first or configurable
const CONCURRENCY = 50;

console.log(`🚀 Starting Load Test: ${TOTAL_EVENTS} events to ${API_URL}`);

const apiKey = "pk_load_test";
// Note: Ensure this API key exists in your DB or use a valid one

async function sendEvent(i) {
  try {
    const start = Date.now();
    await axios.post(`${API_URL}/api/ingest/event`, {
      apiKey,
      event: "load_test_event",
      anonymousId: `anon_load_${i}`,
      properties: { iteration: i },
    });
    return { success: true, time: Date.now() - start };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function run() {
  const start = Date.now();
  let completed = 0;
  let success = 0;
  let fail = 0;

  // Simple batching
  for (let i = 0; i < TOTAL_EVENTS; i += CONCURRENCY) {
    const batch = [];
    for (let j = 0; j < CONCURRENCY && i + j < TOTAL_EVENTS; j++) {
      batch.push(sendEvent(i + j));
    }

    const results = await Promise.all(batch);
    results.forEach((r) => {
      if (r.success) success++;
      else fail++;
    });

    completed += batch.length;
    if (completed % 100 === 0)
      console.log(`Processed ${completed}/${TOTAL_EVENTS}...`);
  }

  const duration = (Date.now() - start) / 1000;
  console.log("--------------------------------");
  console.log(`✅ Load Test Complete`);
  console.log(`Time: ${duration}s`);
  console.log(`Throughput: ${(completed / duration).toFixed(2)} req/s`);
  console.log(`Success: ${success}`);
  console.log(`Fail: ${fail}`);
}

run();
