# Testing & Verification Guide

## Quick Start

```bash
# 1. Start system
docker-compose up -d

# 2. Run load test
cd tests
node load-test.js --events=10000 --concurrent=100

# 3. Run chaos tests
node chaos-test.js

# 4. Collect metrics (60 seconds)
node metrics-collector.js --duration=60

# 5. Check system health
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/admin/system-health
```

---

## Test Scripts

### Load Test (`tests/load-test.js`)

**Purpose**: Stress test event ingestion and measure performance.

**Usage**:
```bash
node load-test.js --events=10000 --concurrent=100
```

**Options**:
- `--events`: Total events to send (default: 10000)
- `--concurrent`: Concurrent requests (default: 100)

**Measures**:
- API p95 latency
- Throughput (events/sec)
- Success rate
- Error distribution

**Output**:
```
Progress: 100% | Sent: 10000 | Rate: 450 events/s | Success: 9998 | Failed: 2

Results:
  Total Events:      10,000
  Duration:          22.34s
  Throughput:        447 events/s
  Success Rate:      99.98%
  
  p95 Latency:       85.32ms
  
  ✅ Excellent - 99.98% success rate
  ✅ Excellent latency - p95: 85ms
```

---

### Chaos Test (`tests/chaos-test.js`)

**Purpose**: Verify system invariants under failure conditions.

**Usage**:
```bash
node chaos-test.js
```

**Tests**:
1. **Duplicate Events** - Idempotency check
2. **Out-of-Order Events** - Timestamp sorting
3. **Stale Lock Recovery** - Lock TTL expiration
4. **Identity Merge** - Anonymous → Known lead

**Output**:
```
════════════════════════════════════════════════
         CHAOS ENGINEERING TEST SUITE          
════════════════════════════════════════════════

✅ PASS  Duplicate Events
✅ PASS  Out-of-Order Events
✅ PASS  Stale Lock Recovery
✅ PASS  Identity Merge

Total: 4/4 tests passed

🎉 All chaos tests passed - system is resilient!
```

---

### Metrics Collector (`tests/metrics-collector.js`)

**Purpose**: Real-time system monitoring.

**Usage**:
```bash
node metrics-collector.js --duration=60
```

**Options**:
- `--duration`: Collection duration in seconds (default: 60)

**Monitors**:
- Queue depth
- Active jobs
- Processing rate
- Worker lag
- Redis memory
- Failed jobs

**Output**:
```
[12:34:56] Queue:  145 | Active:  12 | Rate: 238/s | Lag:    2.3s | Redis:   45.2MB | Failed:   0

Summary:
  Avg Queue Depth:     132
  Max Queue Depth:     287
  Avg Processing Rate: 235 events/s
  Max Worker Lag:      4.2s
  
  ✅ Excellent lag - workers keeping up
  ✅ No failed jobs
```

---

## Admin Endpoints

### Rebuild Lead
**Deletes score history and reprocesses all events for a lead.**

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/admin/rebuild/LEAD_ID
```

**Response**:
```json
{
  "success": true,
  "message": "Lead rebuild initiated",
  "leadId": "65f...",
  "stats": {
    "historyDeleted": 45,
    "eventsReset": 48
  }
}
```

**Use Cases**:
- Scoring rule changed
- Data corruption detected
- Testing replay capability

---

### Rebuild Project
**Rebuilds all leads in a project.**

⚠️ **WARNING**: Resource intensive - use carefully in production.

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/admin/rebuild-project/PROJECT_ID
```

---

### System Health Check
**Verifies system invariants.**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/admin/system-health
```

**Response**:
```json
{
  "status": "HEALTHY",
  "timestamp": "2026-02-10T12:34:56Z",
  "violations": [],
  "summary": {
    "total": 0,
    "critical": 0,
    "healthy": true
  }
}
```

**Checks**:
- ScoreHistory uniqueness
- Processed events have score history
- No orphaned score entries
- Lead scores match latest history
- No stale locks

---

### Failed Jobs (Dead Letter Queue)
**View jobs that failed after retries.**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:4000/api/admin/failed-jobs?limit=20"
```

---

### Retry Failed Job
**Re-queue a failed job.**

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/admin/retry-failed/JOB_ID
```

---

## Failure Simulation

### Kill Worker Mid-Job
```bash
# Send events
node load-test.js --events=1000 &

# Kill worker after 5 seconds
sleep 5 && docker stop lead-scoring-worker

# Restart worker
docker start lead-scoring-worker

# Verify recovery
node metrics-collector.js --duration=30
```

**Expected**: Worker restarts, acquires locks, processes remaining events.

---

### Redis Connection Loss
```bash
# Stop Redis
docker stop lead-scoring-redis

# API should return 503 errors
curl http://localhost:4000/api/events

# Restart Redis
docker start lead-scoring-redis

# Verify queue recovery
node metrics-collector.js --duration=30
```

**Expected**: Queue reconnects, processing resumes.

---

### High Load Scenario
```bash
# Sustained high load (100k events)
node load-test.js --events=100000 --concurrent=200 &

# Monitor in parallel
node metrics-collector.js --duration=120

# Check health after
curl http://localhost:4000/api/admin/system-health
```

**Expected**: 
- Queue depth increases temporarily
- Worker lag stays < 30s
- No invariant violations
- Success rate > 99%

---

## Benchmarking

### Baseline Performance
1. Start fresh system: `docker-compose down -v && docker-compose up -d`
2. Wait 10 seconds for services to stabilize
3. Run load test: `node load-test.js --events=10000`
4. Record metrics in `docs/operational-proof.md`

### Finding Breaking Point
Gradually increase load until failure:

```bash
node load-test.js --events=10000   # Baseline
node load-test.js --events=50000   # 5x
node load-test.js --events=100000  # 10x
node load-test.js --events=200000  # 20x
```

**Monitor for**:
- Success rate drops below 95%
- p95 latency exceeds 1 second
- Worker lag exceeds 60 seconds
- Redis memory exhaustion
- MongoDB connection pool saturation

---

## Continuous Testing

### Pre-Deployment Checklist
```bash
# 1. Unit tests (if implemented)
npm test

# 2. System tests
node tests/chaos-test.js

# 3. Load test
node tests/load-test.js --events=5000

# 4. Health check
curl http://localhost:4000/api/admin/system-health

# All must pass ✅
```

### Production Monitoring
```bash
# Run metrics collector in background
nohup node metrics-collector.js --duration=86400 > metrics.log 2>&1 &

# Check health every 5 minutes
*/5 * * * * curl http://localhost:4000/api/admin/system-health >> health.log
```

---

## Troubleshooting

### High Worker Lag
**Symptoms**: Queue depth growing, lag > 30s

**Diagnosis**:
```bash
node metrics-collector.js --duration=60
```

**Fixes**:
- Increase worker concurrency: `WORKER_CONCURRENCY=10`
- Add more worker instances
- Check MongoDB slow queries

---

### Failed Jobs Accumulating
**Symptoms**: Failed jobs count increasing

**Diagnosis**:
```bash
curl http://localhost:4000/api/admin/failed-jobs?limit=10
```

**Fixes**:
- Check error patterns
- Fix data validation issues
- Retry jobs: `POST /api/admin/retry-failed/:jobId`

---

### Invariant Violations
**Symptoms**: Health check shows violations

**Diagnosis**:
```bash
curl http://localhost:4000/api/admin/system-health
```

**Fixes**:
- Critical violations: Stop system immediately
- Rebuild affected leads: `POST /api/admin/rebuild/:leadId`
- Investigate root cause in logs

---

## Next Steps

After verification complete:
1. ✅ Document results in `docs/operational-proof.md`
2. ✅ Set up monitoring alerts
3. ✅ **Freeze core engine** - no more changes to scoring logic
4. ✅ Move to leverage phase (SaaS or portfolio)

---

**Status**: 🟢 READY
**Last Updated**: 2026-02-10
