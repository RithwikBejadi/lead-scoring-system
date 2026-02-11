#!/bin/bash
# FILE: verify-production-ingest.sh
# PURPOSE: Simulate external ingestion, verify rate limits, and idempotency
# USAGE: ./verify-production-ingest.sh [API_URL]

API_URL="${1:-http://localhost:4000}"
API_KEY="pk_test_123"

echo "🚀 Starting Production Ingestion Verification against $API_URL"
echo "---------------------------------------------------"

# 1. Single Event Ingestion
echo "1️⃣  Testing Single Event Ingestion..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/ingest/event" \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "'"$API_KEY"'",
    "event": "page_view",
    "anonymousId": "anon_prod_test_1",
    "sessionId": "sess_prod_test_1",
    "properties": { "url": "https://prod-test.com" }
  }')

if [ "$RESPONSE" == "202" ]; then
  echo "✅ Single Event Accepted (202)"
else
  echo "❌ Single Event Failed: $RESPONSE"
  exit 1
fi

# 2. Idempotency Check
echo -e "\n2️⃣  Testing Idempotency (Same Event ID)..."
EVENT_ID="evt_idempotency_$(date +%s)"
PAYLOAD='{
    "apiKey": "'"$API_KEY"'",
    "eventId": "'"$EVENT_ID"'",
    "event": "feature_used",
    "anonymousId": "anon_idempotency",
    "properties": { "feature": "export" }
}'

# First Send
curl -s -X POST "$API_URL/api/ingest/event" -H "Content-Type: application/json" -d "$PAYLOAD" > /dev/null
# Second Send (Should be accepted by API, but ignored by worker)
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/ingest/event" -H "Content-Type: application/json" -d "$PAYLOAD")

if [ "$RESPONSE" == "202" ]; then
  echo "✅ Duplicate Event Accepted by API (Correct - Worker handles dedup)"
else
  echo "❌ Duplicate Event API Error: $RESPONSE"
fi

# 3. Rate Limit Check (Optional - brute force)
echo -e "\n3️⃣  Testing Rate Limit (Sending 120 reqs)..."
COUNT=0
for i in {1..120}; do
  RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/ingest/event" \
    -H "Content-Type: application/json" \
    -d '{ "apiKey": "pk_rate_limit", "event": "ping" }')
  
  if [ "$RES" == "429" ]; then
    echo "✅ Rate Limit Triggered at request #$i"
    break
  fi
  COUNT=$((COUNT+1))
done

if [ "$COUNT" -eq 120 ]; then
  echo "❌ Rate Limit NOT Triggered (Check configuration)"
fi

echo -e "\n---------------------------------------------------"
echo "DONE. Check worker logs to confirm processing and idempotency."
