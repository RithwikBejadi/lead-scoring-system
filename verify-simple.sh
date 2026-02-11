#!/bin/bash
set -e

# Simple production readiness test using /api/events/ingest

API_URL="http://localhost:4000"
# Use existing project from database
PROJECT_ID="69848827e10d2fdf8a458a9e"
ANON_ID="anon_test_$(date +%s)"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SIMPLE PRODUCTION TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Project ID: $PROJECT_ID"
echo "Anonymous ID: $ANON_ID"
echo ""

# Test 1: Health check
echo "━━━ Test 1: Health Check ━━━"
HEALTH=$(curl -s $API_URL/api/health | grep -o "healthy" || echo "unhealthy")
if [ "$HEALTH" = "healthy" ]; then
    echo "✓ API is healthy"
else
    echo "✗ API is NOT healthy"
    exit 1
fi
echo ""

# Test 2: Submit first event (should auto-create lead)
echo "━━━ Test 2: Event Submission (Auto-Create Lead) ━━━"
RESPONSE=$(curl -s -X POST $API_URL/api/events/ingest \
  -H "Content-Type: application/json" \
  -d "{
    \"projectId\": \"$PROJECT_ID\",
    \"event\": \"signup\",
    \"anonymousId\": \"$ANON_ID\",
    \"properties\": {\"email\": \"test@example.com\"}
  }")

echo "Response: $RESPONSE"
if echo "$RESPONSE" | grep -q "queued\|duplicate"; then
    echo "✓ Event accepted"
else
    echo "✗ Event rejected"
    exit 1
fi
echo ""

# Test 3: Wait for async processing
echo "━━━ Test 3: Async Processing ━━━"
echo "Waiting 10 seconds for worker to process..."
sleep 10

# Check if lead was created
LEAD_COUNT=$(docker exec lead-scoring-mongo mongosh lead_scoring_system --quiet --eval "
  db.leads.countDocuments({projectId: ObjectId('$PROJECT_ID'), anonymousId: '$ANON_ID'})
")

if [ "$LEAD_COUNT" -ge 1 ]; then
    echo "✓ Lead created ($LEAD_COUNT found)"
else
    echo "✗ Lead NOT created"
    exit 1
fi

# Check if event was processed
EVENT_PROCESSED=$(docker exec lead-scoring-mongo mongosh lead_scoring_system --quiet --eval "
  db.events.countDocuments({projectId: ObjectId('$PROJECT_ID'), anonymousId: '$ANON_ID', processed: true})
")

if [ "$EVENT_PROCESSED" -ge 1 ]; then
    echo "✓ Event processed ($EVENT_PROCESSED processed)"
else
    echo "✗ Event NOT processed"
    exit 1
fi
echo ""

# Test 4: Score calculation
echo "━━━ Test 4: Score Calculation ━━━"
LEAD_SCORE=$(docker exec lead-scoring-mongo mongosh lead_scoring_system --quiet --eval "
  const lead = db.leads.findOne({projectId: ObjectId('$PROJECT_ID'), anonymousId: '$ANON_ID'});
  print(lead ? lead.currentScore : 0);
")

if [ "$LEAD_SCORE" -gt 0 ]; then
    echo "✓ Score calculated (score: $LEAD_SCORE)"
else
    echo "✗ Score is zero (signup should have points)"
    exit 1
fi
echo ""

# Test 5: Second event (different type)
echo "━━━ Test 5: Multiple Events ━━━"
curl -s -X POST $API_URL/api/events/ingest \
  -H "Content-Type: application/json" \
  -d "{
    \"projectId\": \"$PROJECT_ID\",
    \"event\": \"page_view\",
    \"anonymousId\": \"$ANON_ID\",
    \"properties\": {\"page\": \"/dashboard\"}
  }" > /dev/null

sleep 8

LEAD_SCORE_AFTER=$(docker exec lead-scoring-mongo mongosh lead_scoring_system --quiet --eval "
  const lead = db.leads.findOne({projectId: ObjectId('$PROJECT_ID'), anonymousId: '$ANON_ID'});
  print(lead ? lead.currentScore : 0);
")

if [ "$LEAD_SCORE_AFTER" -gt "$LEAD_SCORE" ]; then
    echo "✓ Score increased ($LEAD_SCORE → $LEAD_SCORE_AFTER)"
else
    echo "✗ Score did NOT increase (still $LEAD_SCORE_AFTER)"
    exit 1
fi
echo ""

# Test 6: Data integrity
echo "━━━ Test 6: Data Integrity ━━━"

# Check for duplicate score entries
DUPLICATE_COUNT=$(docker exec lead-scoring-mongo mongosh lead_scoring_system --quiet --eval '
  db.scorehistories.aggregate([
    {$group: {_id: "$eventId", count: {$sum: 1}}},
    {$match: {count: {$gt: 1}}}
  ]).toArray().length
')

if [ "$DUPLICATE_COUNT" -eq 0 ]; then
    echo "✓ No duplicate score entries"
else
    echo "✗ Found $DUPLICATE_COUNT duplicate eventIds in score_histories"
    exit 1
fi

# Check for orphaned scores
ORPHAN_COUNT=$(docker exec lead-scoring-mongo mongosh lead_scoring_system --quiet --eval '
  db.scorehistories.countDocuments({leadId: null})
')

if [ "$ORPHAN_COUNT" -eq 0 ]; then
    echo "✓ No orphaned scores"
else
    echo "✗ Found $ORPHAN_COUNT orphaned scores"
    exit 1
fi

# Check for negative scores
NEGATIVE_COUNT=$(docker exec lead-scoring-mongo mongosh lead_scoring_system --quiet --eval '
  db.leads.countDocuments({currentScore: {$lt: 0}})
')

if [ "$NEGATIVE_COUNT" -eq 0 ]; then
    echo "✓ No negative scores"
else
    echo "✗ Found $NEGATIVE_COUNT leads with negative scores"
    exit 1
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✓ ALL TESTS PASSED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  - Events ingested successfully"
echo "  - Leads auto-created"
echo "  - Async processing works"
echo "  - Scores calculated correctly"
echo "  - Data integrity maintained"
echo ""
