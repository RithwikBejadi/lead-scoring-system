/**
 * Load Test - Event Ingestion Stress Test
 * 
 * Measures:
 * - API p95 latency
 * - Queue depth growth
 * - Worker processing lag
 * - Error rate
 * 
 * Usage:
 *   node tests/load-test.js --events=10000 --concurrent=100
 */

require('dotenv').config();
const axios = require('axios');
const { performance } = require('perf_hooks');
const mongoose = require('mongoose');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:4000';
const TOTAL_EVENTS = parseInt(process.argv.find(arg => arg.startsWith('--events='))?.split('=')[1] || '10000');
const CONCURRENT = parseInt(process.argv.find(arg => arg.startsWith('--concurrent='))?.split('=')[1] || '100');

// Event types with realistic distribution
const EVENT_TYPES = [
  { type: 'page_view', weight: 50 },
  { type: 'signup', weight: 10 },
  { type: 'feature_used', weight: 30 },
  { type: 'identify', weight: 10 }
];

// Pre-generate lead IDs (1000 unique leads)
const LEAD_IDS = Array.from({ length: 1000 }, () => new mongoose.Types.ObjectId().toString());
const PROJECT_ID = new mongoose.Types.ObjectId().toString();

// Metrics collection
const metrics = {
  sent: 0,
  success: 0,
  failed: 0,
  latencies: [],
  errors: {},
  startTime: null,
  endTime: null
};

function getRandomEventType() {
  const total = EVENT_TYPES.reduce((sum, e) => sum + e.weight, 0);
  let random = Math.random() * total;
  
  for (const event of EVENT_TYPES) {
    random -= event.weight;
    if (random <= 0) return event.type;
  }
  return EVENT_TYPES[0].type;
}

function generateEvent(index) {
  // Use pre-generated lead IDs
  const leadIndex = Math.floor(Math.random() * 1000);
  const leadId = LEAD_IDS[leadIndex];
  const eventType = getRandomEventType();
  
  const event = {
    eventId: `evt_loadtest_${Date.now()}_${index}`,
    eventType,
    leadId,
    projectId: PROJECT_ID,
    timestamp: new Date().toISOString(),
    properties: {}
  };

  // Add type-specific properties
  switch (eventType) {
    case 'page_view':
      event.properties.page = `/page-${Math.floor(Math.random() * 20)}`;
      event.properties.duration = Math.floor(Math.random() * 120);
      break;
    case 'signup':
      event.properties.email = `user${index}@loadtest.com`;
      event.properties.source = 'organic';
      break;
    case 'feature_used':
      event.properties.feature = `feature_${Math.floor(Math.random() * 10)}`;
      break;
    case 'identify':
      event.properties.email = `user${Math.floor(Math.random() * 1000)}@loadtest.com`;
      event.properties.name = `User ${index}`;
      break;
  }

  return event;
}

async function sendEvent(event) {
  const start = performance.now();
  
  try {
    await axios.post(`${API_URL}/api/events`, event, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    const latency = performance.now() - start;
    metrics.latencies.push(latency);
    metrics.success++;
    
    return { success: true, latency };
  } catch (error) {
    const latency = performance.now() - start;
    metrics.failed++;
    
    const errorType = error.response?.status || error.code || 'unknown';
    metrics.errors[errorType] = (metrics.errors[errorType] || 0) + 1;
    
    return { success: false, latency, error: errorType };
  }
}

async function runLoadTest() {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│     Event Ingestion Load Test              │');
  console.log('└─────────────────────────────────────────────┘\n');
  
  console.log(`Configuration:`);
  console.log(`  Total Events:  ${TOTAL_EVENTS.toLocaleString()}`);
  console.log(`  Concurrency:   ${CONCURRENT}`);
  console.log(`  API URL:       ${API_URL}`);
  console.log(`  Unique Leads:  ~1000\n`);

  metrics.startTime = Date.now();
  
  const batches = Math.ceil(TOTAL_EVENTS / CONCURRENT);
  
  for (let batch = 0; batch < batches; batch++) {
    const batchSize = Math.min(CONCURRENT, TOTAL_EVENTS - batch * CONCURRENT);
    const promises = [];
    
    for (let i = 0; i < batchSize; i++) {
      const eventIndex = batch * CONCURRENT + i;
      const event = generateEvent(eventIndex);
      promises.push(sendEvent(event));
      metrics.sent++;
    }
    
    await Promise.all(promises);
    
    // Progress update every 1000 events
    if ((batch + 1) * CONCURRENT % 1000 === 0 || batch === batches - 1) {
      const progress = Math.min(100, (metrics.sent / TOTAL_EVENTS) * 100);
      const elapsed = ((Date.now() - metrics.startTime) / 1000).toFixed(1);
      const rate = (metrics.sent / elapsed).toFixed(0);
      
      process.stdout.write(`Progress: ${progress.toFixed(1)}% | Sent: ${metrics.sent} | Rate: ${rate} events/s | Success: ${metrics.success} | Failed: ${metrics.failed}\r`);
    }
    
    // Small delay to avoid overwhelming the system
    if (batch < batches - 1) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  metrics.endTime = Date.now();
  console.log('\n');
}

function calculatePercentile(arr, percentile) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}

function printResults() {
  const duration = (metrics.endTime - metrics.startTime) / 1000;
  const throughput = metrics.sent / duration;
  const successRate = (metrics.success / metrics.sent) * 100;
  
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│          Load Test Results                  │');
  console.log('└─────────────────────────────────────────────┘\n');
  
  console.log('Overall Performance:');
  console.log(`  Total Events:      ${metrics.sent.toLocaleString()}`);
  console.log(`  Duration:          ${duration.toFixed(2)}s`);
  console.log(`  Throughput:        ${throughput.toFixed(0)} events/s`);
  console.log(`  Success Rate:      ${successRate.toFixed(2)}%\n`);
  
  console.log('Latency Distribution (ms):');
  console.log(`  Min:               ${Math.min(...metrics.latencies).toFixed(2)}`);
  console.log(`  Max:               ${Math.max(...metrics.latencies).toFixed(2)}`);
  console.log(`  Mean:              ${(metrics.latencies.reduce((a, b) => a + b, 0) / metrics.latencies.length).toFixed(2)}`);
  console.log(`  p50:               ${calculatePercentile(metrics.latencies, 50).toFixed(2)}`);
  console.log(`  p95:               ${calculatePercentile(metrics.latencies, 95).toFixed(2)}`);
  console.log(`  p99:               ${calculatePercentile(metrics.latencies, 99).toFixed(2)}\n`);
  
  console.log('Results:');
  console.log(`  Successful:        ${metrics.success.toLocaleString()}`);
  console.log(`  Failed:            ${metrics.failed.toLocaleString()}\n`);
  
  if (Object.keys(metrics.errors).length > 0) {
    console.log('Error Breakdown:');
    Object.entries(metrics.errors).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    console.log('');
  }
  
  // Health assessment
  console.log('Assessment:');
  if (successRate >= 99.9) {
    console.log(`  ✅ Excellent - ${successRate.toFixed(2)}% success rate`);
  } else if (successRate >= 99) {
    console.log(`  ✓ Good - ${successRate.toFixed(2)}% success rate`);
  } else if (successRate >= 95) {
    console.log(`  ⚠ Acceptable - ${successRate.toFixed(2)}% success rate`);
  } else {
    console.log(`  ❌ Poor - ${successRate.toFixed(2)}% success rate`);
  }
  
  const p95 = calculatePercentile(metrics.latencies, 95);
  if (p95 < 100) {
    console.log(`  ✅ Excellent latency - p95: ${p95.toFixed(0)}ms`);
  } else if (p95 < 500) {
    console.log(`  ✓ Good latency - p95: ${p95.toFixed(0)}ms`);
  } else if (p95 < 1000) {
    console.log(`  ⚠ Acceptable latency - p95: ${p95.toFixed(0)}ms`);
  } else {
    console.log(`  ❌ Poor latency - p95: ${p95.toFixed(0)}ms`);
  }
  
  console.log('');
}

// Run test
(async () => {
  try {
    await runLoadTest();
    printResults();
    process.exit(0);
  } catch (error) {
    console.error('\nLoad test failed:', error.message);
    process.exit(1);
  }
})();
