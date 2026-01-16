DEMO_SCRIPT.md

# Lead Scoring System - Demo Script

## Prerequisites
- Docker Desktop running
- Terminals ready

---

## Step 1: Start System (2 min)

```bash
cd /Users/sairithwikbejadi/Desktop/lead-scoring-system

# Clean start
docker-compose down -v
docker-compose build
docker-compose up -d

# Wait 10 seconds for services
sleep 10

# Check services
docker-compose ps
```

---

## Step 2: Seed Scoring Rules (1 min)

```bash
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
  console.log('Rules seeded');
  process.exit(0);
});
"
```

---

## Step 3: Start Frontend (1 min)

```bash
cd frontend
npm install
npm start
```

Browser opens at http://localhost:3001

---

## Step 4: Demo Flow (5 min)

### A. Create Lead
1. Click "Event Trigger" tab
2. Fill form:
   - Email: demo@example.com
   - Name: Demo Lead
3. Click "Create Lead"
4. Select lead from dropdown

### B. Fire Events (Show Score Progression)
1. Click "Page View" → Score = 1
2. Click "Email Open" → Score = 4
3. Click "Page View" → Score = 5
4. Click "Download" → Score = 15 (Stage: WARM)
5. Click "Signup" → Score = 35 (Stage: HOT)
6. Click "Demo Request" → Score = 65 (Stage: QUALIFIED)

### C. Show Intelligence
1. Click "Lead List" tab
2. See updated score/stage in table
3. Click on lead row
4. Show:
   - Score: 65
   - Stage: QUALIFIED
   - Velocity: calculated
   - Risk: low
   - Next Action: "prioritize_contact"

### D. Show Automation Logs
```bash
docker exec lead-scoring-worker mongosh lead_scoring --eval "
  db.automationexecutions.find().pretty()
"
```

### E. Demonstrate Decay (Optional - 2 min wait)
```bash
# Manually trigger decay (simulates 7-day wait)
docker exec lead-scoring-worker node jobs/scoringDecay.job.js
```

Then refresh Lead List → Score reduced by 20% (65 → 52)

---

## Key Talking Points

1. **Concurrency-Safe**
   - Atomic locks on leads/events
   - Mongo transactions with replica set
   - Idempotent score history writes

2. **Domain-Driven Architecture**
   - Pure business logic in /domain
   - Workflows orchestrate only
   - Side-effects isolated post-commit

3. **Production Patterns**
   - Healthcheck-based startup sequencing
   - Immutable rules cache
   - Reconnect loops (no crash storms)
   - Bull queue with stalled job detection

4. **Business Intelligence**
   - Real-time stage calculation
   - Velocity tracking (24h window)
   - Risk assessment (engagement decay)
   - Actionable next steps

5. **Scalability**
   - Worker concurrency configurable
   - Queue rate limiting (200/sec)
   - Horizontal scaling ready (stateless workers)

---

## Cleanup

```bash
docker-compose down
```

---

**Total Demo Time: ~10 minutes**
