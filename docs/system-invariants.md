# System Invariants

These are **rules that must never break**. Violations indicate data corruption or bugs.

---

## Core Invariants

### 1. Event Scoring Exactness
**Rule**: An event is scored **at most once**.

**Enforcement**:
- ScoreHistory has unique index on `(leadId, eventId)`
- Insert will fail on duplicate

**Check**:
```javascript
// No duplicate score entries
SELECT leadId, eventId, COUNT(*) 
FROM score_histories 
GROUP BY leadId, eventId 
HAVING COUNT(*) > 1
```

**Violation Severity**: 🔴 CRITICAL

---

### 2. Lock Release Guarantee
**Rule**: A lead lock **must always be released**.

**Enforcement**:
- Redis lock TTL (30 seconds)
- Lock recovery loop (every 60 seconds)
- Try-finally blocks in workflow

**Check**:
```javascript
// Locks older than 2 minutes
redis.keys('lead:*:lock')
// Should be empty or very few
```

**Violation Severity**: 🟡 MEDIUM

---

### 3. ScoreHistory Append-Only
**Rule**: ScoreHistory entries are **never modified or deleted** (except during rebuild).

**Enforcement**:
- No update/delete operations in application code
- Audit trail preservation

**Check**:
```javascript
// Track updatedAt vs createdAt
SELECT COUNT(*) FROM score_histories 
WHERE updatedAt > createdAt
// Should be 0
```

**Violation Severity**: 🔴 CRITICAL

---

### 4. Identity Merge Preserves Events
**Rule**: When merging leads, **all events must be transferred**.

**Enforcement**:
- Transaction-based merge
- Count verification before/after

**Check**:
```javascript
// After merge, anonymous lead should have 0 events
// Known lead should have sum of both
```

**Violation Severity**: 🔴 CRITICAL

---

### 5. Automation Once-Per-Day
**Rule**: An automation rule executes **at most once per day per lead**.

**Enforcement**:
- Unique index on `(leadId, ruleId, dateBucket)`
- dateBucket = "2026-02-10" format

**Check**:
```javascript
SELECT leadId, ruleId, dateBucket, COUNT(*) 
FROM automation_executions 
GROUP BY leadId, ruleId, dateBucket 
HAVING COUNT(*) > 1
```

**Violation Severity**: 🟡 MEDIUM

---

### 6. Event Order Consistency
**Rule**: ScoreHistory timestamps **match event timestamps** (in order).

**Enforcement**:
- Events sorted by timestamp before processing
- ScoreHistory inherits event timestamp

**Check**:
```javascript
// For each lead, ScoreHistory.timestamp should be monotonically increasing
```

**Violation Severity**: 🟠 HIGH

---

### 7. Score Monotonicity (Optional)
**Rule**: Lead scores **never go negative**.

**Enforcement**:
- All rules have positive or zero points
- Score decay applies percentage reduction

**Check**:
```javascript
SELECT COUNT(*) FROM leads WHERE currentScore < 0
// Should be 0
```

**Violation Severity**: 🟡 MEDIUM

---

## How to Monitor

### Automated Checks
Add to worker startup or cron job:

```javascript
// worker/utils/invariantChecker.js
async function checkInvariants() {
  const violations = [];
  
  // Check 1: Duplicate scores
  const dupes = await ScoreHistory.aggregate([
    { $group: { _id: { leadId: '$leadId', eventId: '$eventId' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);
  
  if (dupes.length > 0) {
    violations.push({ invariant: 'Event Scoring Exactness', severity: 'CRITICAL' });
  }
  
  // Check 2: Stale locks
  const locks = await redis.keys('lead:*:lock');
  if (locks.length > 10) {
    violations.push({ invariant: 'Lock Release', severity: 'MEDIUM' });
  }
  
  // ... more checks
  
  if (violations.length > 0) {
    logger.error('Invariant violations detected', { violations });
    // Alert ops team
  }
}

setInterval(checkInvariants, 5 * 60 * 1000); // Every 5 minutes
```

### Manual Verification
Use admin endpoint:
```bash
curl http://localhost:4000/api/admin/system-health
```

---

## Alert Thresholds

| Invariant | Check Frequency | Alert On |
|-----------|-----------------|----------|
| Duplicate scores | 5 minutes | Any violation |
| Stale locks | 1 minute | > 10 locks |
| Negative scores | 5 minutes | Any violation |
| Orphaned history | 1 hour | > 100 entries |
| Score mismatches | 15 minutes | > 5 leads |

---

## Recovery Procedures

### Duplicate Score Entries
**Cause**: Race condition or bug in idempotency logic

**Fix**:
1. Identify affected leads
2. Run rebuild: `POST /api/admin/rebuild/:leadId`
3. Fix root cause in code

### Stale Locks
**Cause**: Worker crash or network partition

**Fix**:
1. Lock recovery loop auto-cleans (60s interval)
2. Manual: `redis-cli DEL lead:XXX:lock`

### Score Mismatches
**Cause**: Manual DB edits or incomplete transactions

**Fix**:
1. Rebuild affected lead
2. Investigate transaction logs

---

## Testing Invariants

```bash
# Run chaos tests to verify invariants hold under stress
node tests/chaos-test.js

# Check system health
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/admin/system-health

# Load test + health check
node tests/load-test.js --events=10000
curl http://localhost:4000/api/admin/system-health
```

---

**Status**: 📋 DOCUMENTED
**Last Reviewed**: 2026-02-10
