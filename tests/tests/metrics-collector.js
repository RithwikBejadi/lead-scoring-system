/**
 * Metrics Collector - Real-time System Monitoring
 * 
 * Monitors:
 * - Queue depth
 * - Worker lag
 * - Processing rate
 * - Redis memory
 * - MongoDB performance
 * 
 * Usage:
 *   node tests/metrics-collector.js --duration=60
 */

require('dotenv').config();
const Redis = require('ioredis');
const mongoose = require('mongoose');
const Bull = require('bull');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lead-scoring';
const DURATION = parseInt(process.argv.find(arg => arg.startsWith('--duration='))?.split('=')[1] || '60');

let redis;
let db;
let queue;

const metrics = {
  timestamp: [],
  queueDepth: [],
  processingRate: [],
  workerLag: [],
  redisMemory: [],
  activeJobs: [],
  failedJobs: []
};

async function setup() {
  redis = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
  await mongoose.connect(MONGO_URI);
  db = mongoose.connection.db;
  
  queue = new Bull('lead-processing', {
    redis: { host: REDIS_HOST, port: REDIS_PORT }
  });
}

async function collectMetrics() {
  const now = Date.now();
  metrics.timestamp.push(now);
  
  // Queue metrics
  const waiting = await queue.getWaitingCount();
  const active = await queue.getActiveCount();
  const failed = await queue.getFailedCount();
  
  metrics.queueDepth.push(waiting);
  metrics.activeJobs.push(active);
  metrics.failedJobs.push(failed);
  
  // Calculate processing rate (events/sec)
  const Event = db.collection('events');
  const oneSecondAgo = new Date(now - 1000);
  const recentProcessed = await Event.countDocuments({
    processed: true,
    updatedAt: { $gte: oneSecondAgo }
  });
  metrics.processingRate.push(recentProcessed);
  
  // Worker lag (oldest unprocessed event age)
  const oldestEvent = await Event.findOne({ processed: false })
    .sort({ timestamp: 1 });
  
  const lag = oldestEvent 
    ? (now - new Date(oldestEvent.timestamp).getTime()) / 1000
    : 0;
  metrics.workerLag.push(lag);
  
  // Redis memory
  const info = await redis.info('memory');
  const memMatch = info.match(/used_memory_human:(\S+)/);
  metrics.redisMemory.push(memMatch ? memMatch[1] : 'N/A');
}

function printMetrics() {
  const idx = metrics.timestamp.length - 1;
  const time = new Date(metrics.timestamp[idx]).toISOString().split('T')[1].split('.')[0];
  
  process.stdout.write(
    `[${time}] ` +
    `Queue: ${metrics.queueDepth[idx].toString().padStart(4)} | ` +
    `Active: ${metrics.activeJobs[idx].toString().padStart(3)} | ` +
    `Rate: ${metrics.processingRate[idx].toString().padStart(3)}/s | ` +
    `Lag: ${metrics.workerLag[idx].toFixed(1).padStart(6)}s | ` +
    `Redis: ${metrics.redisMemory[idx].padStart(8)} | ` +
    `Failed: ${metrics.failedJobs[idx].toString().padStart(3)}\r`
  );
}

function printSummary() {
  console.log('\n\n┌─────────────────────────────────────────────┐');
  console.log('│        Metrics Collection Summary           │');
  console.log('└─────────────────────────────────────────────┘\n');
  
  const avgQueue = (metrics.queueDepth.reduce((a, b) => a + b, 0) / metrics.queueDepth.length).toFixed(0);
  const maxQueue = Math.max(...metrics.queueDepth);
  const avgRate = (metrics.processingRate.reduce((a, b) => a + b, 0) / metrics.processingRate.length).toFixed(2);
  const maxLag = Math.max(...metrics.workerLag).toFixed(2);
  const avgLag = (metrics.workerLag.reduce((a, b) => a + b, 0) / metrics.workerLag.length).toFixed(2);
  const totalFailed = metrics.failedJobs[metrics.failedJobs.length - 1];
  
  console.log('Queue Metrics:');
  console.log(`  Avg Depth:         ${avgQueue}`);
  console.log(`  Max Depth:         ${maxQueue}\n`);
  
  console.log('Processing:');
  console.log(`  Avg Rate:          ${avgRate} events/s`);
  console.log(`  Avg Lag:           ${avgLag}s`);
  console.log(`  Max Lag:           ${maxLag}s\n`);
  
  console.log('Reliability:');
  console.log(`  Total Failed:      ${totalFailed}\n`);
  
  // Health assessment
  console.log('Assessment:');
  
  if (maxLag < 5) {
    console.log('  ✅ Excellent lag - workers keeping up');
  } else if (maxLag < 30) {
    console.log('  ✓ Acceptable lag - workers slightly behind');
  } else {
    console.log('  ❌ High lag - workers overwhelmed');
  }
  
  if (totalFailed === 0) {
    console.log('  ✅ No failed jobs');
  } else {
    console.log(`  ⚠ ${totalFailed} failed jobs - investigate errors`);
  }
  
  console.log('');
}

async function run() {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│     Real-time Metrics Collection            │');
  console.log('└─────────────────────────────────────────────┘\n');
  console.log(`Duration: ${DURATION} seconds\n`);
  
  await setup();
  
  const interval = setInterval(async () => {
    await collectMetrics();
    printMetrics();
  }, 1000);
  
  setTimeout(async () => {
    clearInterval(interval);
    printSummary();
    
    await redis.quit();
    await mongoose.disconnect();
    process.exit(0);
  }, DURATION * 1000);
}

run().catch(error => {
  console.error('Metrics collector error:', error);
  process.exit(1);
});
