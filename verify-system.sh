#!/bin/bash
# Don't exit on error - we want to count all test results
# set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PRODUCTION READINESS VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS="${GREEN}✓${NC}"
FAIL="${RED}✗${NC}"
WAIT="${YELLOW}⏳${NC}"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${PASS} $2"
        ((TESTS_PASSED++))
    else
        echo -e "${FAIL} $2"
        ((TESTS_FAILED++))
    fi
}

# Generate ObjectIds using Node
echo "Generating test data..."
LEAD_ID=$(node -e "const m = require('mongoose'); console.log(new m.Types.ObjectId().toString())")
PROJECT_ID=$(node -e "const m = require('mongoose'); console.log(new m.Types.ObjectId().toString())")
EVENT_ID="evt_verify_$(date +%s)"

echo "  Lead ID:    $LEAD_ID"
echo "  Project ID: $PROJECT_ID"
echo "  Event ID:   $EVENT_ID"
echo ""

# ============================================
# TEST 1: Health Check
# ============================================
echo "━━━ Test 1: System Health ━━━"
HEALTH_RESPONSE=$(curl -s http://localhost:4000/api/health)
echo "$HEALTH_RESPONSE" | grep -q "healthy"
test_result $? "API health endpoint responding"
echo ""

# ============================================
# TEST 2: Event Ingestion
# ============================================
echo "━━━ Test 2: Event Ingestion ━━━"
EVENT_PAYLOAD=$(cat <<EOF
{
  "projectId": "$PROJECT_ID",
  "event": "signup",
  "anonymousId": "anon_verify_$(date +%s)",
  "properties": {
    "email": "test@verify.com",
    "source": "verification"
  }
}
EOF
)

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST http://localhost:4000/api/events/ingest \
  -H "Content-Type: application/json" \
  -d "$EVENT_PAYLOAD")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "202" ]; then
    test_result 0 "Event accepted (HTTP $HTTP_CODE)"
else
    test_result 1 "Event rejected (HTTP $HTTP_CODE)"
fi
echo ""

# ============================================
# TEST 3: Event Queued
# ============================================
echo "━━━ Test 3: Event Storage ━━━"
sleep 2
EVENT_COUNT=$(docker exec lead-scoring-mongo mongosh lead_scoring_system \
  --quiet --eval "db.events.countDocuments({eventId: '$EVENT_ID'})")

if [ "$EVENT_COUNT" -ge 1 ]; then
    test_result 0 "Event stored in database"
else
    test_result 1 "Event NOT found in database"
fi
echo ""

# ============================================
# TEST 4: Worker Processing
# ============================================
echo "━━━ Test 4: Async Processing ━━━"
echo -e "${WAIT} Waiting 10 seconds for worker to process..."
sleep 10

PROCESSED=$(docker exec lead-scoring-mongo mongosh lead_scoring_system \
  --quiet --eval "db.events.findOne({eventId: '$EVENT_ID'}).processed")

if [ "$PROCESSED" = "true" ]; then
    test_result 0 "Event processed by worker"
else
    test_result 1 "Event NOT processed (still pending)"
fi
echo ""

# ============================================
# TEST 5: Score Calculation
# ============================================
echo "━━━ Test 5: Score Calculation ━━━"
SCORE_HISTORY_COUNT=$(docker exec lead-scoring-mongo mongosh lead_scoring_system \
  --quiet --eval "db.score_histories.countDocuments({eventId: '$EVENT_ID'})")

if [ "$SCORE_HISTORY_COUNT" -eq 1 ]; then
    test_result 0 "Score history created (exactly 1 entry)"
else
    test_result 1 "Score history incorrect (expected 1, got $SCORE_HISTORY_COUNT)"
fi

LEAD_EXISTS=$(docker exec lead-scoring-mongo mongosh lead_scoring_system \
  --quiet --eval "db.leads.countDocuments({_id: ObjectId('$LEAD_ID')})")

if [ "$LEAD_EXISTS" -ge 1 ]; then
    test_result 0 "Lead created/updated"
    
    CURRENT_SCORE=$(docker exec lead-scoring-mongo mongosh lead_scoring_system \
      --quiet --eval "db.leads.findOne({_id: ObjectId('$LEAD_ID')}).currentScore")
    echo "  Lead Score: $CURRENT_SCORE points"
else
    test_result 1 "Lead NOT found"
fi
echo ""

# ============================================
# TEST 6: Idempotency
# ============================================
echo "━━━ Test 6: Idempotency (Duplicate Event) ━━━"
# Send same event again
curl -s -X POST http://localhost:4000/api/events \
  -H "Content-Type: application/json" \
  -d "$EVENT_PAYLOAD" > /dev/null

sleep 3

SCORE_HISTORY_AFTER=$(docker exec lead-scoring-mongo mongosh lead_scoring_system \
  --quiet --eval "db.score_histories.countDocuments({eventId: '$EVENT_ID'})")

if [ "$SCORE_HISTORY_AFTER" -eq 1 ]; then
    test_result 0 "Idempotency maintained (still 1 score entry)"
else
    test_result 1 "CRITICAL: Double scoring detected ($SCORE_HISTORY_AFTER entries)"
fi
echo ""

# ============================================
# TEST 7: Out-of-Order Events
# ============================================
echo "━━━ Test 7: Event Ordering ━━━"
LEAD_ID_2=$(node -e "const m = require('mongoose'); console.log(new m.Types.ObjectId().toString())")
NOW=$(date +%s)

# Send events in reverse chronological order
ANON_ORDER="anon_order_$NOW"
EVENT_3=$(cat <<EOF
{
  "projectId": "$PROJECT_ID",
  "event": "page_view",
  "anonymousId": "$ANON_ORDER",
  "properties": {"sequence": 3}
}
EOF
)

EVENT_1=$(cat <<EOF
{
  "projectId": "$PROJECT_ID",
  "event": "signup",
  "anonymousId": "$ANON_ORDER",
  "properties": {"sequence": 1}
}
EOF
)

EVENT_2=$(cat <<EOF
{
  "projectId": "$PROJECT_ID",
  "event": "feature_used",
  "anonymousId": "$ANON_ORDER",
  "properties": {"sequence": 2}
}
EOF
)

# Send in wrong order: 3, 1, 2
curl -s -X POST http://localhost:4000/api/events/ingest -H "Content-Type: application/json" -d "$EVENT_3" > /dev/null
sleep 0.2
curl -s -X POST http://localhost:4000/api/events/ingest -H "Content-Type: application/json" -d "$EVENT_1" > /dev/null
sleep 0.2
curl -s -X POST http://localhost:4000/api/events/ingest -H "Content-Type: application/json" -d "$EVENT_2" > /dev/null

echo -e "${WAIT} Waiting for processing..."
sleep 8

# Check if processed in correct chronological order
FIRST_EVENT=$(docker exec lead-scoring-mongo mongosh lead_scoring_system \
  --quiet --eval "db.score_histories.find({leadId: ObjectId('$LEAD_ID_2')}).sort({createdAt: 1}).limit(1).toArray()[0].eventId" | tr -d '"')

if [[ "$FIRST_EVENT" == *"order_1"* ]]; then
    test_result 0 "Events processed in chronological order"
else
    test_result 1 "Events NOT in correct order (first: $FIRST_EVENT)"
fi
echo ""

# ============================================
# TEST 8: Worker Recovery
# ============================================
echo "━━━ Test 8: Worker Crash Recovery ━━━"
echo "  Stopping worker..."
docker stop lead-scoring-worker > /dev/null 2>&1

RECOVERY_EVENT_ID="evt_recovery_$(date +%s)"
RECOVERY_LEAD_ID=$(node -e "const m = require('mongoose'); console.log(new m.Types.ObjectId().toString())")

RECOVERY_EVENT=$(cat <<EOF
{
  "projectId": "$PROJECT_ID",
  "event": "signup",
  "anonymousId": "anon_recovery_$(date +%s)",
  "properties": {"test": "recovery"}
}
EOF
)

curl -s -X POST http://localhost:4000/api/events \
  -H "Content-Type: application/json" \
  -d "$RECOVERY_EVENT" > /dev/null

echo "  Event queued while worker down"
sleep 2

echo "  Restarting worker..."
docker start lead-scoring-worker > /dev/null 2>&1
sleep 8

RECOVERY_PROCESSED=$(docker exec lead-scoring-mongo mongosh lead_scoring_system \
  --quiet --eval "db.events.findOne({eventId: '$RECOVERY_EVENT_ID'}).processed")

if [ "$RECOVERY_PROCESSED" = "true" ]; then
    test_result 0 "Worker recovered and processed queued event"
else
    test_result 1 "Worker did NOT process event after restart"
fi
echo ""

# ============================================
# TEST 9: System Invariants
# ============================================
echo "━━━ Test 9: Data Integrity Checks ━━━"

# Check for duplicate scores
DUPLICATE_SCORES=$(docker exec lead-scoring-mongo mongosh lead_scoring_system \
  --quiet --eval "db.score_histories.aggregate([
    { \$group: { _id: { leadId: '\$leadId', eventId: '\$eventId' }, count: { \$sum: 1 } } },
    { \$match: { count: { \$gt: 1 } } }
  ]).toArray().length")

if [ "$DUPLICATE_SCORES" -eq 0 ]; then
    test_result 0 "No duplicate score entries"
else
    test_result 1 "CRITICAL: Found $DUPLICATE_SCORES duplicate scores"
fi

# Check for orphaned score history
ORPHANED=$(docker exec lead-scoring-mongo mongosh lead_scoring_system \
  --quiet --eval "db.score_histories.aggregate([
    { \$lookup: { from: 'events', localField: 'eventId', foreignField: 'eventId', as: 'event' } },
    { \$match: { event: { \$size: 0 } } }
  ]).toArray().length")

if [ "$ORPHANED" -eq 0 ]; then
    test_result 0 "No orphaned score history"
else
    test_result 1 "Found $ORPHANED orphaned score entries"
fi

# Check for negative scores
NEGATIVE_SCORES=$(docker exec lead-scoring-mongo mongosh lead_scoring_system \
  --quiet --eval "db.leads.countDocuments({currentScore: { \$lt: 0 }})")

if [ "$NEGATIVE_SCORES" -eq 0 ]; then
    test_result 0 "No negative scores"
else
    test_result 1 "Found $NEGATIVE_SCORES leads with negative scores"
fi
echo ""

# ============================================
# SUMMARY
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
PASS_RATE=$(awk "BEGIN {printf \"%.1f\", ($TESTS_PASSED/$TOTAL_TESTS)*100}")

echo "  Total Tests:     $TOTAL_TESTS"
echo -e "  Passed:          ${GREEN}$TESTS_PASSED${NC}"
echo -e "  Failed:          ${RED}$TESTS_FAILED${NC}"
echo "  Pass Rate:       $PASS_RATE%"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  ✓ ALL TESTS PASSED - PRODUCTION READY${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  ✗ TESTS FAILED - DO NOT DEPLOY${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
