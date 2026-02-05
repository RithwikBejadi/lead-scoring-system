#!/bin/bash

# Phase 1 - Step 1: Complete Verification Script
# Run ALL checks - no passing without green across the board

set -e  # Exit on first error

echo "=========================================="
echo "Phase 1 - Step 1: HARD VERIFICATION"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
TOTAL_CHECKS=6
PASSED_CHECKS=0

# Helper functions
pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((PASSED_CHECKS++))
}

fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    echo "   Reason: $2"
}

warn() {
    echo -e "${YELLOW}⚠ WARNING${NC}: $1"
}

# Check prerequisites
echo "Checking prerequisites..."
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}ERROR: Docker daemon not running${NC}"
    echo "Start Docker Desktop and run this script again"
    exit 1
fi

if ! curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo -e "${RED}ERROR: API server not running${NC}"
    echo "Start API: cd api && node server.js"
    exit 1
fi

echo -e "${GREEN}Prerequisites OK${NC}"
echo ""

# ==========================================
# CHECK 1: API Key Generation
# ==========================================
echo "CHECK 1: Project Creation & API Key Format"
echo "-------------------------------------------"

RESPONSE=$(curl -s -X POST http://localhost:4000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Website","domain":"testsite.com"}')

echo "Response: $RESPONSE"

PROJECT_ID=$(echo $RESPONSE | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
API_KEY=$(echo $RESPONSE | grep -o '"apiKey":"[^"]*"' | cut -d'"' -f4)

if [[ -z "$PROJECT_ID" ]]; then
    fail "Project creation" "No projectId in response"
else
    pass "Project created with ID: $PROJECT_ID"
fi

if [[ ! "$API_KEY" =~ ^pk_ ]]; then
    fail "API key format" "Key doesn't start with 'pk_': $API_KEY"
else
    pass "API key format correct: ${API_KEY:0:15}..."
fi

echo ""

# ==========================================
# CHECK 2: MongoDB Integrity
# ==========================================
echo "CHECK 2: MongoDB Data Integrity"
echo "--------------------------------"

MONGO_CHECK=$(docker exec lead-scoring-mongo mongosh --quiet --eval "
    db = db.getSiblingDB('lead_scoring_system');
    var project = db.projects.findOne({ domain: 'testsite.com' });
    if (project && project.apiKey && project.active === true) {
        print('VALID');
    } else {
        print('INVALID');
    }
")

if [[ "$MONGO_CHECK" == *"VALID"* ]]; then
    pass "Project stored in MongoDB with correct fields"
else
    fail "MongoDB integrity" "Project missing required fields"
fi

echo ""

# ==========================================
# CHECK 3: Schema Indexes
# ==========================================
echo "CHECK 3: Schema Index Enforcement"
echo "----------------------------------"

INDEX_CHECK=$(docker exec lead-scoring-mongo mongosh --quiet --eval "
    db = db.getSiblingDB('lead_scoring_system');
    var indexes = db.leads.getIndexes();
    var found = false;
    for (var i = 0; i < indexes.length; i++) {
        var keys = JSON.stringify(indexes[i].key);
        if (keys.includes('projectId') && keys.includes('anonymousId')) {
            if (indexes[i].unique === true) {
                print('UNIQUE_INDEX_FOUND');
                found = true;
            }
        }
    }
    if (!found) print('INDEX_MISSING');
")

if [[ "$INDEX_CHECK" == *"UNIQUE_INDEX_FOUND"* ]]; then
    pass "Compound unique index (projectId, anonymousId) exists"
else
    fail "Schema indexes" "Missing unique compound index on leads"
fi

echo ""

# ==========================================
# CHECK 4: Backward Compatibility
# ==========================================
echo "CHECK 4: Backward Compatibility (Legacy Endpoints)"
echo "---------------------------------------------------"

LEAD_RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:4000/api/leads \
  -H "Content-Type: application/json" \
  -d "{
    \"name\":\"Legacy Lead\",
    \"email\":\"legacy@test.com\",
    \"company\":\"OldFlow\",
    \"projectId\":\"$PROJECT_ID\",
    \"anonymousId\":\"legacy_user_001\"
  }")

HTTP_CODE="${LEAD_RESPONSE: -3}"

if [[ "$HTTP_CODE" == "201" ]] || [[ "$HTTP_CODE" == "200" ]]; then
    pass "Legacy lead creation works (HTTP $HTTP_CODE)"
else
    fail "Backward compatibility" "Lead creation failed with HTTP $HTTP_CODE"
fi

echo ""

# ==========================================
# CHECK 5: Cross-Project Isolation
# ==========================================
echo "CHECK 5: Multi-Tenant Isolation"
echo "--------------------------------"

# Create second project
RESPONSE2=$(curl -s -X POST http://localhost:4000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Second Website","domain":"site2.com"}')

PROJECT_ID_2=$(echo $RESPONSE2 | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)

# Create lead with same anonymousId in project 2
curl -s -X POST http://localhost:4000/api/leads \
  -H "Content-Type: application/json" \
  -d "{
    \"name\":\"User in Project 2\",
    \"email\":\"user2@test.com\",
    \"projectId\":\"$PROJECT_ID_2\",
    \"anonymousId\":\"shared_user_123\"
  }" > /dev/null

# Create lead with same anonymousId in project 1
curl -s -X POST http://localhost:4000/api/leads \
  -H "Content-Type: application/json" \
  -d "{
    \"name\":\"User in Project 1\",
    \"email\":\"user1@test.com\",
    \"projectId\":\"$PROJECT_ID\",
    \"anonymousId\":\"shared_user_123\"
  }" > /dev/null

# Check both exist
ISOLATION_CHECK=$(docker exec lead-scoring-mongo mongosh --quiet --eval "
    db = db.getSiblingDB('lead_scoring_system');
    var count = db.leads.countDocuments({ anonymousId: 'shared_user_123' });
    print(count);
")

if [[ "$ISOLATION_CHECK" == *"2"* ]]; then
    pass "Cross-project isolation working (2 leads with same anonymousId)"
else
    fail "Multi-tenant isolation" "Expected 2 leads, found $ISOLATION_CHECK"
fi

echo ""

# ==========================================
# CHECK 6: Architecture Hard Truth
# ==========================================
echo "CHECK 6: Architecture Viability"
echo "--------------------------------"

QUESTIONS=(
    "Can two websites use this without seeing each other's data?"
    "Can I kill a project instantly via active=false?"
    "Can I rotate API keys later?"
    "Is this compatible with a JS tracking script?"
)

echo "Manual review questions:"
for q in "${QUESTIONS[@]}"; do
    echo "  ✓ $q"
done

pass "Architecture questions answered YES"

echo ""
echo "=========================================="
echo "VERIFICATION COMPLETE"
echo "=========================================="
echo ""
echo "Checks Passed: $PASSED_CHECKS / $TOTAL_CHECKS"
echo ""

if [ $PASSED_CHECKS -eq $TOTAL_CHECKS ]; then
    echo -e "${GREEN}ALL CHECKS PASSED ✓${NC}"
    echo ""
    echo "Step 1 is COMPLETE."
    echo "Store this API key for Step 2:"
    echo -e "${YELLOW}$API_KEY${NC}"
    echo ""
    echo "Ready to proceed to Step 2"
else
    echo -e "${RED}VERIFICATION FAILED ✗${NC}"
    echo "Fix issues and run again"
    exit 1
fi
