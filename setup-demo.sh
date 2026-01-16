#!/bin/bash
set -e

echo "🚀 Starting Lead Scoring System Demo Setup..."

cd "$(dirname "$0")"

echo ""
echo "Step 1: Cleaning previous state..."
docker-compose down -v 2>/dev/null || true

echo ""
echo "Step 2: Building containers..."
docker-compose build --no-cache

echo ""
echo "Step 3: Starting services..."
docker-compose up -d

echo ""
echo "Step 4: Waiting for services to be ready..."
sleep 15

echo ""
echo "Step 5: Seeding scoring rules..."
docker exec lead-scoring-api node -e "
const mongoose = require('mongoose');
const ScoringRule = require('./models/ScoringRule');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await ScoringRule.deleteMany({});
  await ScoringRule.insertMany([
    { eventType: 'page_view', points: 1 },
    { eventType: 'signup', points: 20 },
    { eventType: 'download', points: 10 },
    { eventType: 'email_open', points: 3 },
    { eventType: 'demo_request', points: 30 }
  ]);
  console.log('✓ Rules seeded successfully');
  process.exit(0);
});
" 2>/dev/null

echo ""
echo "✅ Backend ready!"
echo ""
echo "Next steps:"
echo "1. cd frontend"
echo "2. npm install (first time only)"
echo "3. npm start"
echo ""
echo "System will be available at:"
echo "  - API: http://localhost:3000"
echo "  - Frontend: http://localhost:3001"
echo ""
echo "Check services: docker-compose ps"
echo "View logs: docker-compose logs -f"
