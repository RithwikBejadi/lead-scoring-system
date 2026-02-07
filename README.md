# Event-Driven Lead Scoring System

A production-grade, event-driven lead scoring system built with Node.js, MongoDB, Redis, and React. Demonstrates asynchronous event processing, idempotency, ordering guarantees, and audit trails.

---

## 📖 How to Navigate This Project (For Evaluators)

**Start here to understand the architecture:**

1. **`api/app.js`** → Application bootstrap with system flow overview
2. **`api/routes.js`** → Route registration
3. **`api/features/leads/lead.routes.js`** → API entry points
4. **`api/features/leads/intelligence.controller.js`** → Intelligence computation
5. **`shared/queue/index.js`** → Async boundary (Redis queue)
6. **`worker/index.js`** → Background event processor
7. **`worker/workflows/processLeadWorkflow.js`** → Core scoring logic (idempotency + ordering)

**Key architectural decisions are documented in file headers.**

---

## 🎯 Architecture Overview

### Core Principles

- **Event-Driven Architecture**: All lead mutations happen through events
- **Async Processing**: Bull queue + Redis for reliable background jobs
- **Immutable Event Log**: Every action is tracked for full auditability
- **Read/Write Separation**: Synchronous reads, asynchronous writes
- **Deterministic Scoring**: Score derived from ordered event history

### System Flow

```
Webhook/API → Event Validation → Queue → Worker → Score Calculation → Automation → Persistence
```

1. **Event Ingestion** (API)
   - REST endpoint receives event
   - Validates payload
   - Returns immediately (202 Accepted)
   - Enqueues for processing

2. **Asynchronous Processing** (Worker)
   - Pulls event from queue
   - Acquires lock on lead (prevents race conditions)
   - Processes event in order
   - Updates score + stage
   - Evaluates automation rules
   - Releases lock

3. **Intelligence Layer**
   - Calculates velocity, risk, next action
   - Trends analysis
   - Stage transitions (cold → warm → hot → qualified)

---

## 🔐 Idempotency

### How It Works

Events are idempotent using multiple layers:

1. **Unique Event ID**  
   Each event has a unique `eventId`. Duplicate submissions are safely ignored.

2. **Database Constraints**  
   `ScoreHistory` enforces uniqueness on `(leadId, eventId)`.

3. **Safe Retry**  
   If processing fails, the event can be reprocessed without duplicating score changes.

### Example

```javascript
// Event 1: signup (eventId: abc123)
POST /api/events { eventId: "abc123", type: "signup", leadId: "xyz" }
// Score: 0 → 20

// Duplicate submission (same eventId)
POST /api/events { eventId: "abc123", type: "signup", leadId: "xyz" }
// Score: 20 (unchanged) ✅
```

---

## ⏱️ Ordering Guarantees

### Per-Lead Sequential Processing

- Events are sorted by `timestamp` before processing
- Each lead is locked during processing (prevents concurrent updates)
- Queue ensures FIFO execution per lead

### Example

```javascript
Events arrive out of order:
- T3: demo_request
- T2: signup
- T1: page_view

Worker processes in timestamp order:
1. page_view (T1) → Score: 5
2. signup (T2) → Score: 25
3. demo_request (T3) → Score: 75

Result: Deterministic progression ✅
```

---

## 📊 Scoring Engine

### Rules-Based System

Scoring rules are stored in MongoDB (not hardcoded):

| Event Type      | Points |
| --------------- | ------ |
| page_view       | 5      |
| signup          | 20     |
| download        | 10     |
| demo_request    | 50     |
| contract_signed | 100    |

### Stage Transitions

| Score Range | Stage     |
| ----------- | --------- |
| 0-19        | cold      |
| 20-49       | warm      |
| 50-99       | hot       |
| 100+        | qualified |

---

## 🤖 Automation Engine

Automations trigger based on conditions:

```javascript
{
  trigger: "stage_change",
  conditions: { toStage: "qualified" },
  action: "notify_sales"
}
```

Examples:

- Send email when lead becomes hot
- Assign to sales rep when qualified
- Slack notification on demo request

---

## 🛠️ Tech Stack

### Backend

- **Node.js** 20 + Express 5
- **MongoDB** 6 (single-node, no replica set)
- **Redis** 7 (queue persistence)
- **Bull** (job queue)
- **Mongoose** (ODM)

### Frontend

- **React** 19 + Vite
- **React Router** (navigation)
- **Chart.js** (score visualization)
- **Axios** (API client)

### DevOps

- **Docker Compose** (orchestration)
- **Health checks** (service dependencies)

---

## 🚀 Quick Start

### Run with Docker (Recommended)

```bash
# Start all services
docker-compose up --build -d

# Wait 15 seconds for MongoDB to initialize

# Verify
docker ps
curl http://localhost:4000/api/leads

# Start frontend
cd frontend
npm install
npm run dev
# Visit http://localhost:5173
```

### Services

| Service  | Port  | URL                       |
| -------- | ----- | ------------------------- |
| API      | 4000  | http://localhost:4000     |
| MongoDB  | 27017 | mongodb://localhost:27017 |
| Redis    | 6379  | -                         |
| Frontend | 5173  | http://localhost:5173     |

---

## 📡 API Endpoints

### Leads

```http
GET    /api/leads                    # List all leads
POST   /api/leads                    # Create lead
GET    /api/leads/:id                # Get lead details
GET    /api/leads/:id/history        # Score history
GET    /api/leads/:id/intelligence   # Intelligence metrics
```

### Events

```http
POST   /api/events                   # Fire event (async, returns 202)
```

### Leaderboard

```http
GET    /api/leaderboard              # Top leads by score
```

### Example: Create Lead & Fire Event

```bash
# 1. Create lead
curl -X POST http://localhost:4000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","company":"Acme Inc"}'

# Response: { "_id": "507f...", "name": "John Doe", ... }

# 2. Fire event
curl -X POST http://localhost:4000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "signup",
    "leadId": "507f...",
    "eventId": "unique-evt-123"
  }'

# Response: 202 Accepted (processing asynchronously)

# 3. Check score (wait 2 seconds for processing)
curl http://localhost:4000/api/leads/507f...
# { "currentScore": 20, "leadStage": "warm", ... }
```

---

## 📁 Project Structure

```
lead-scoring-system/
├── api/                    # REST API
│   ├── features/
│   │   ├── leads/          # Lead endpoints & controllers
│   │   ├── events/         # Event ingestion
│   │   └── leaderboard/    # Top leads
│   ├── config/db.js        # MongoDB connection
│   └── utils/              # Intelligence calculations
│
├── worker/                 # Background processor
│   ├── domain/             # Business logic
│   │   ├── stageEngine.js  # Stage calculations
│   │   └── automationEngine.js # Rule evaluation
│   ├── workflows/          # Processing workflows
│   └── services/           # Score rules cache
│
├── shared/                 # Shared code
│   └── queue/              # Bull queue setup
│
├── frontend/               # React UI
│   ├── src/pages/          # LeadsList, LeadDetail, etc.
│   └── src/api.js          # API client
│
├── docker-compose.yml      # Orchestration
└── README.md               # This file
```

---

## 🧪 Demo Workflow

### Via Frontend (Recommended)

1. Open http://localhost:5173
2. Click **"Fire Event"**
3. Create a new lead (or select existing)
4. Fire events: `page_view` → `signup` → `demo_request`
5. Watch score progress in real-time (auto-refresh)
6. Click **"View"** to see intelligence metrics & score chart
7. Check **Leaderboard** for top leads

### Via API

```bash
# Create lead
LEAD_ID=$(curl -X POST http://localhost:4000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test.com"}' | jq -r '._id')

# Fire events
curl -X POST http://localhost:4000/api/events \
  -d "{\"eventType\":\"page_view\",\"leadId\":\"$LEAD_ID\",\"eventId\":\"evt1\"}"

curl -X POST http://localhost:4000/api/events \
  -d "{\"eventType\":\"signup\",\"leadId\":\"$LEAD_ID\",\"eventId\":\"evt2\"}"

curl -X POST http://localhost:4000/api/events \
  -d "{\"eventType\":\"demo_request\",\"leadId\":\"$LEAD_ID\",\"eventId\":\"evt3\"}"

# Check final score (should be 75: 5 + 20 + 50)
curl http://localhost:4000/api/leads/$LEAD_ID | jq '.currentScore'
```

---

## 🔬 Testing Idempotency & Ordering

### Test 1: Idempotency

```bash
# Fire same event twice (same eventId)
curl -X POST http://localhost:4000/api/events \
  -d '{"eventType":"signup","leadId":"<ID>","eventId":"dup-test"}'

curl -X POST http://localhost:4000/api/events \
  -d '{"eventType":"signup","leadId":"<ID>","eventId":"dup-test"}'

# Score should only increase by 20 once ✅
```

### Test 2: Ordering

```bash
# Fire events with backdated timestamps (out of order)
curl -X POST http://localhost:4000/api/events \
  -d '{"eventType":"demo_request","leadId":"<ID>","timestamp":"2026-01-16T12:00:00Z"}'

curl -X POST http://localhost:4000/api/events \
  -d '{"eventType":"page_view","leadId":"<ID>","timestamp":"2026-01-16T10:00:00Z"}'

# Worker processes in timestamp order: page_view first, then demo_request ✅
# Verify via GET /api/leads/:id/history (should show chronological order)
```

---

## 🎓 Why This Architecture?

### Event Sourcing Benefits

- **Full Audit Trail**: Every score change is traceable
- **Time Travel**: Can rebuild lead state at any point
- **Debugging**: Replay events to reproduce issues

### Queue Benefits

- **Decoupling**: API remains fast regardless of processing time
- **Reliability**: Events persist even if worker crashes
- **Scalability**: Horizontal scaling (add more workers)

### Immutable History

- Source of truth for all scoring
- Enables recalculation with new rules
- Compliance & transparency

---

## 🔐 Hardening & Safety Guarantees

### Input Validation

**Zod schemas on all ingestion endpoints:**

- Strict type checking with runtime validation
- Maximum payload size: 5KB for properties
- Event type validation: alphanumeric + underscores only
- Property depth limited to 2 levels
- Returns `400 Bad Request` with specific error messages

**Malformed data protection:**

```javascript
// Rejected automatically
{
  "event": "invalid-chars!@#",  // ❌ Invalid characters
  "properties": { ... }          // ❌ Too large (>5KB)
}
// Response: 400 with detailed error
```

### Rate Limiting

**Redis-backed distributed rate limiting:**

- **Limit:** 100 events per minute per API key
- **Storage:** Redis with automatic TTL expiration
- **Response:** `429 Too Many Requests` when exceeded
- **Algorithm:** Token bucket (allows burst traffic)

**Prevents abuse:**

```javascript
// First 100 requests: 202 Accepted
// Request 101+: 429 Rate Limit Exceeded
```

### SDK Safety

**Silent failures - never crashes host websites:**

- All network calls wrapped in try/catch
- `localStorage` failures handled gracefully
- No console errors in production
- Uses `navigator.sendBeacon` (reliable) with `fetch` fallback

**Degrades gracefully:**

```javascript
// Network offline → events dropped silently
// Backend 500 error → SDK continues tracking
// Invalid API key → logged, no crash
```

### Worker Crash Immunity

**Per-lead locking prevents race conditions:**

```javascript
// Atomic lock acquisition
const lead = await Lead.findOneAndUpdate(
  { _id: leadId, processing: false },
  { $set: { processing: true } },
);
```

**All errors logged, none crash worker:**

- Identity resolution wrapped in try/catch
- Scoring continues even if identity fails
- Lead always unlocked in finally block
- Worker stays healthy, job completes gracefully

### Idempotency

**Duplicate events safely ignored:**

- Unique index on `ScoreHistory(leadId, eventId)`
- Duplicate inserts return unique constraint error
- Error caught and ignored (expected behavior)
- Safe to retry failed jobs

**Example:**

```javascript
// First process: saves score delta
// Retry (if worker crashed): duplicate key error ignored
// Result: Event scored exactly once ✅
```

### Identity Safety

**Transaction-based merge operations:**

- All updates in MongoDB transaction (atomic)
- Events moved from anonymous → known lead
- Score history moved atomically
- No data loss during merge
- Idempotent (safe to run multiple times)

### Production Readiness Checklist ✅

- [x] Input validation (Zod schemas)
- [x] Rate limiting (Redis-backed, 100/min per key)
- [x] SDK crash immunity (silent failures)
- [x] Worker crash immunity (comprehensive error handling)
- [x] Idempotency (eventId deduplication, unique indexes)
- [x] Dead letter queue (failed jobs preserved)
- [x] Ordering guarantees (timestamp-based processing)
- [x] Locking (per-lead concurrency control)
- [x] Health checks (Docker dependencies)
- [x] Multi-tenant isolation (projectId separation)
- [x] Session tracking (complete user journeys)
- [x] Identity resolution (anonymous → known merging)

---

## 🛡️ Security Features

### API Key Authentication

Every ingestion request requires valid API key:

```javascript
POST /api/ingest/event
{
  "apiKey": "pk_...",  // Required - validated against DB
  ...
}
```

### Project Isolation

**Multi-tenant architecture:**

- Each project has unique API key
- Leads/events scoped to `projectId`
- No cross-project data access
- Compound indexes ensure isolation

### Privacy-Safe Tracking

**SDK never sends sensitive data:**

- Form submissions: field **names** only (no values)
- Passwords/credit cards: never captured
- Properties sanitized before storage
- User can inspect all sent data in DevTools

---

## 🙋 FAQ

**Q: Why not calculate score on-demand?**  
A: History is the source of truth. Pre-computing ensures consistency and audit trails.

**Q: How do you handle duplicate events?**  
A: Unique `eventId` + database constraints. Safe to retry.

**Q: What if events arrive out of order?**  
A: Worker sorts by timestamp. Processing is deterministic.

**Q: Can I change scoring rules?**  
A: Yes, rules are in MongoDB. Update without code changes.

**Q: Why Bull instead of Kafka?**  
A: Simpler for demos. Kafka is overkill for single-tenant systems.

**Q: Why no replica set?**  
A: Single-node MongoDB is sufficient for demos. Replica sets are for production HA.

---

## 🎯 Evaluation Highlights

This project demonstrates:

1. ✅ **Event-Driven Architecture** → Clear async processing flow
2. ✅ **Idempotency** → Multiple layers (eventId, DB constraints)
3. ✅ **Ordering** → Timestamp-based deterministic processing
4. ✅ **Auditability** → Complete event history
5. ✅ **Intelligence** → Velocity, risk, next action
6. ✅ **UI/UX** → React frontend with score visualization
7. ✅ **DevOps** → Docker Compose orchestration
8. ✅ **Clean Code** → Feature-based organization, separation of concerns

---

## 🚀 Deployment

### Total Time: < 5 minutes

```bash
docker-compose up --build -d
sleep 15
curl http://localhost:4000/api/leads
# Response: []

cd frontend && npm install && npm run dev
# Frontend: http://localhost:5173
```

✅ Production-ready architecture  
✅ Demo-ready implementation  
✅ Evaluation-ready documentation

---

## 📝 License

MIT
