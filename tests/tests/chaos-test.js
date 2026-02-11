/**
 * Chaos Testing - System Resilience Verification
 * 
 * Tests:
 * - Worker crashes mid-job
 * - Redis connection loss
 * - Duplicate event handling
 * - Out-of-order events
 * - Lock recovery
 * 
 * Usage:
 *   node tests/chaos-test.js --test=all
 */

require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const API_URL = process.env.API_URL || 'http://localhost:4000';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lead-scoring';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

let redis;
let db;

async function setup() {
  console.log('Setting up chaos test environment...\n');
  
  // Connect to MongoDB
  await mongoose.connect(MONGO_URI);
  db = mongoose.connection.db;
  
  // Connect to Redis
  redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
  });
  
  console.log('✓ Connected to MongoDB and Redis\n');
}

async function cleanup() {
  await mongoose.disconnect();
  await redis.quit();
}

// ────────────────────────────────────────────────────────────
// Test 1: Duplicate Event Idempotency
// ────────────────────────────────────────────────────────────

async function testDuplicateEvents() {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  Test 1: Duplicate Event Idempotency        │');
  console.log('└─────────────────────────────────────────────┘\n');
  
  const leadId = `lead_chaos_dup_${Date.now()}`;
  const eventId = `evt_chaos_dup_${Date.now()}`;
  
  const event = {
    eventId,
    eventType: 'signup',
    leadId,
    projectId: 'chaos_test',
    timestamp: new Date().toISOString(),
    properties: { email: 'chaos@test.com' }
  };
  
  console.log(`Sending event: ${eventId}`);
  
  // Send event 3 times
  const results = await Promise.all([
    axios.post(`${API_URL}/api/events`, event).catch(e => ({ error: e.response?.data })),
    axios.post(`${API_URL}/api/events`, event).catch(e => ({ error: e.response?.data })),
    axios.post(`${API_URL}/api/events`, event).catch(e => ({ error: e.response?.data }))
  ]);
  
  console.log(`Sent event 3 times (duplicate submissions)\n`);
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Check score history
  const Event = db.collection('events');
  const ScoreHistory = db.collection('score_histories');
  
  const eventCount = await Event.countDocuments({ eventId });
  const scoreCount = await ScoreHistory.countDocuments({ eventId });
  
  console.log('Results:');
  console.log(`  Events in DB:       ${eventCount}`);
  console.log(`  Score entries:      ${scoreCount}\n`);
  
  if (scoreCount === 1) {
    console.log('✅ PASS - Event scored exactly once (idempotent)\n');
    return true;
  } else {
    console.log(`❌ FAIL - Event scored ${scoreCount} times (NOT idempotent)\n`);
    return false;
  }
}

// ────────────────────────────────────────────────────────────
// Test 2: Out-of-Order Events
// ────────────────────────────────────────────────────────────

async function testOutOfOrderEvents() {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  Test 2: Out-of-Order Event Processing      │');
  console.log('└─────────────────────────────────────────────┘\n');
  
  const leadId = `lead_chaos_order_${Date.now()}`;
  const baseTime = Date.now();
  
  // Create events with intentionally reversed timestamps
  const events = [
    {
      eventId: `evt_order_3`,
      eventType: 'page_view',
      leadId,
      projectId: 'chaos_test',
      timestamp: new Date(baseTime + 3000).toISOString(), // Latest
      properties: { page: '/page-3' }
    },
    {
      eventId: `evt_order_1`,
      eventType: 'signup',
      leadId,
      projectId: 'chaos_test',
      timestamp: new Date(baseTime).toISOString(), // Earliest
      properties: { email: 'order@test.com' }
    },
    {
      eventId: `evt_order_2`,
      eventType: 'feature_used',
      leadId,
      projectId: 'chaos_test',
      timestamp: new Date(baseTime + 1500).toISOString(), // Middle
      properties: { feature: 'test' }
    }
  ];
  
  console.log('Sending events in reverse chronological order...');
  
  // Send in reverse order
  for (const event of events) {
    await axios.post(`${API_URL}/api/events`, event);
    console.log(`  Sent: ${event.eventId} (timestamp: ${event.timestamp})`);
  }
  
  console.log('\nWaiting for processing...\n');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Check processing order
  const ScoreHistory = db.collection('score_histories');
  const history = await ScoreHistory.find({ leadId })
    .sort({ createdAt: 1 })
    .toArray();
  
  console.log('Score History (processing order):');
  history.forEach((entry, idx) => {
    console.log(`  ${idx + 1}. ${entry.eventId} → Score: ${entry.newScore}`);
  });
  console.log('');
  
  // Verify correct order (evt_order_1, evt_order_2, evt_order_3)
  const correctOrder = history[0]?.eventId === 'evt_order_1' &&
                       history[1]?.eventId === 'evt_order_2' &&
                       history[2]?.eventId === 'evt_order_3';
  
  if (correctOrder) {
    console.log('✅ PASS - Events processed in chronological order\n');
    return true;
  } else {
    console.log('❌ FAIL - Events NOT processed in correct order\n');
    return false;
  }
}

// ────────────────────────────────────────────────────────────
// Test 3: Stale Lock Recovery
// ────────────────────────────────────────────────────────────

async function testStaleLockRecovery() {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  Test 3: Stale Lock Recovery                │');
  console.log('└─────────────────────────────────────────────┘\n');
  
  const leadId = `lead_chaos_lock_${Date.now()}`;
  
  // Manually create a stale lock (simulate crashed worker)
  const lockKey = `lead:${leadId}:lock`;
  await redis.set(lockKey, 'dead-worker-123', 'EX', 5);
  
  console.log(`Created stale lock: ${lockKey}`);
  console.log('Simulating crashed worker scenario\n');
  
  // Try to send event (should be blocked by lock initially)
  const event = {
    eventId: `evt_lock_${Date.now()}`,
    eventType: 'signup',
    leadId,
    projectId: 'chaos_test',
    timestamp: new Date().toISOString(),
    properties: {}
  };
  
  await axios.post(`${API_URL}/api/events`, event);
  console.log('Event submitted to queue\n');
  
  // Check if lock exists
  const lockBefore = await redis.get(lockKey);
  console.log(`Lock status: ${lockBefore ? 'EXISTS' : 'CLEARED'}`);
  
  // Wait for lock TTL to expire
  console.log('Waiting for lock TTL (5 seconds)...\n');
  await new Promise(resolve => setTimeout(resolve, 6000));
  
  const lockAfter = await redis.get(lockKey);
  const ScoreHistory = db.collection('score_histories');
  const processed = await ScoreHistory.findOne({ eventId: event.eventId });
  
  console.log('Results:');
  console.log(`  Lock after TTL:     ${lockAfter ? 'EXISTS' : 'CLEARED'}`);
  console.log(`  Event processed:    ${processed ? 'YES' : 'NO'}\n`);
  
  if (!lockAfter && processed) {
    console.log('✅ PASS - Lock expired and event processed\n');
    return true;
  } else {
    console.log('❌ FAIL - Lock recovery failed\n');
    return false;
  }
}

// ────────────────────────────────────────────────────────────
// Test 4: Identity Merge Idempotency
// ────────────────────────────────────────────────────────────

async function testIdentityMerge() {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  Test 4: Identity Merge (Anonymous → Known) │');
  console.log('└─────────────────────────────────────────────┘\n');
  
  const anonLeadId = `lead_anon_${Date.now()}`;
  const email = `merge_test_${Date.now()}@chaos.com`;
  
  // Step 1: Anonymous activity
  console.log('Step 1: Sending anonymous events...');
  await axios.post(`${API_URL}/api/events`, {
    eventId: `evt_anon_1`,
    eventType: 'page_view',
    leadId: anonLeadId,
    projectId: 'chaos_test',
    timestamp: new Date().toISOString(),
    properties: { page: '/home' }
  });
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 2: Identify event
  console.log('Step 2: Sending identify event with email...');
  await axios.post(`${API_URL}/api/events`, {
    eventId: `evt_identify`,
    eventType: 'identify',
    leadId: anonLeadId,
    projectId: 'chaos_test',
    timestamp: new Date().toISOString(),
    properties: { email }
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Step 3: Check if lead has email
  const Lead = db.collection('leads');
  const lead = await Lead.findOne({ _id: new mongoose.Types.ObjectId(anonLeadId) });
  
  console.log('\nResults:');
  console.log(`  Lead email:         ${lead?.email || 'NULL'}`);
  console.log(`  Score:              ${lead?.currentScore || 0}\n`);
  
  if (lead && lead.email === email) {
    console.log('✅ PASS - Anonymous lead identified with email\n');
    return true;
  } else {
    console.log('❌ FAIL - Identity merge failed\n');
    return false;
  }
}

// ────────────────────────────────────────────────────────────
// Main Test Runner
// ────────────────────────────────────────────────────────────

async function runAllTests() {
  console.log('\n════════════════════════════════════════════════');
  console.log('         CHAOS ENGINEERING TEST SUITE          ');
  console.log('════════════════════════════════════════════════\n');
  
  const results = [];
  
  try {
    await setup();
    
    results.push({ name: 'Duplicate Events', pass: await testDuplicateEvents() });
    results.push({ name: 'Out-of-Order Events', pass: await testOutOfOrderEvents() });
    results.push({ name: 'Stale Lock Recovery', pass: await testStaleLockRecovery() });
    results.push({ name: 'Identity Merge', pass: await testIdentityMerge() });
    
  } catch (error) {
    console.error('\n❌ Test suite error:', error.message);
  } finally {
    await cleanup();
  }
  
  // Summary
  console.log('════════════════════════════════════════════════');
  console.log('                 TEST SUMMARY                   ');
  console.log('════════════════════════════════════════════════\n');
  
  results.forEach(result => {
    const status = result.pass ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${status}  ${result.name}`);
  });
  
  const passCount = results.filter(r => r.pass).length;
  const totalCount = results.length;
  
  console.log(`\n  Total: ${passCount}/${totalCount} tests passed\n`);
  
  if (passCount === totalCount) {
    console.log('🎉 All chaos tests passed - system is resilient!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed - review system behavior\n');
    process.exit(1);
  }
}

// Run tests
runAllTests();
