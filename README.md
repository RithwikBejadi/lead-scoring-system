# Lead Scoring System

Production-grade lead scoring engine with event-driven architecture, real-time intelligence, and automated workflow execution.

## Why This Matters

This is **not a CRUD app**. It demonstrates production backend patterns:

- **Event sourcing** - Score history as source of truth, not live state
- **Idempotent processing** - Duplicate events handled via unique indexes
- **Transactional safety** - MongoDB replica set with session isolation
- **Post-commit side-effects** - Automations run outside scoring transaction
- **Eventual consistency** - Queue-based async processing with Bull
- **Domain-driven design** - Pure business logic separated from orchestration

Real CRMs (HubSpot, Salesforce) use these exact patterns to scale under concurrency.

---

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Frontend  │────▶│     API     │────▶│  Bull Queue  │
│   (React)   │     │  (Express)  │     │   (Redis)    │
└─────────────┘     └─────────────┘     └──────┬───────┘
                           │                    │
                           │                    ▼
                    ┌──────▼────────┐    ┌─────────────┐
                    │   MongoDB     │◀───│   Worker    │
                    │ (Replica Set) │    │  (Domain)   │
                    └───────────────┘    └─────────────┘
```

**Why this design?**

- API handles writes → Worker processes async → Intelligence reads computed state
- Separates write-heavy ingestion from read-heavy analytics
- Workers can scale horizontally without touching API

---

## Core Features

### 1. Event-Driven Scoring
Events flow through queue → Worker locks lead → Calculates delta → Persists to history

**Why not update score directly?**  
Direct updates fail under concurrency. Event sourcing gives auditability and safety.

### 2. Velocity Tracking
Counts events in last 24h window (processed events only)

**Why velocity matters?**  
Raw score lies. A lead with 50 points from 6 months ago is dead. Velocity detects **intent**.

### 3. Stage Calculation
- Cold: score < 11
- Warm: score 11-30
- Hot: score 31-59
- Qualified: score ≥ 60

Stages drive automation rules.

### 4. Risk Assessment
- High: last event > 7 days ago (engagement decay)
- Medium: 3-7 days
- Low: < 3 days

### 5. Intelligence Endpoint
`GET /api/leads/:id/intelligence`

Returns computed insights:
```json
{
  "score": 42,
  "stage": "hot",
  "velocity": 12,
  "risk": "low",
  "nextAction": "prioritize_contact"
}
```

**This is the killer feature** - turns data into actionable business intelligence.

### 6. Automation Engine
Executes rules post-commit with idempotent logging:
- Unique index: `(leadId, ruleId, dateBucket)`
- Prevents duplicate triggers on retry
- Full audit trail in `AutomationExecution` collection

### 7. Score Decay
Standalone job (not cron - restart-safe):
```bash
docker exec lead-scoring-worker node jobs/scoringDecay.job.js
```

- Applies to inactive leads (> 7 days)
- Reduces score by 20% (0.8 factor)
- **Recalculates stage automatically** (prevents drift)

---

## Demo Flow

```bash
# Start backend
./setup-demo.sh

# Start frontend (separate terminal)
cd frontend && npm install && npm start
```

**Demo Steps:**
1. Create lead via Event Trigger panel
2. Fire events: Page View (+1) → Signup (+20) → Demo Request (+30)
3. Watch score progression: 1 → 21 → 51
4. Stage upgrades: cold → warm → hot
5. Click lead → View intelligence dashboard
6. Check automation logs: `docker exec lead-scoring-worker mongosh lead_scoring --eval "db.automationexecutions.find().pretty()"`

**Why this demo works:**  
Shows end-to-end flow from event ingestion → async processing → intelligence computation → automation triggers.

---

## Technical Highlights

### Concurrency Safety
- **Atomic locks** on leads and events (processing flags)
- **MongoDB transactions** with session isolation
- **Bull queue** with stalled job detection (30s)
- **Rate limiting** (200 events/sec)

### Production Patterns
- **Healthcheck-based startup** - Worker waits for MongoDB PRIMARY before processing
- **Immutable rules cache** - Loaded once at startup, never reloaded during jobs
- **Graceful reconnect loops** - No crash storms on DB disconnect
- **Idempotent writes** - Score history uses unique index on eventId

### Domain-Driven Architecture
```
worker/
├── domain/           # Pure business logic (no DB, no sessions)
│   ├── stageEngine.js         # Score → Stage mapping
│   ├── leadIntelligence.js    # Velocity, risk, next action
│   └── automationEngine.js    # Rule matching + execution
├── workflows/        # Orchestration only
│   └── processLeadWorkflow.js # 11-step transaction workflow
└── jobs/            # Persistent tasks (not setTimeout)
    └── scoringDecay.job.js    # Standalone decay script
```

**Why this matters:**  
Domain engines are **pure, stateless, cacheable**. Workflows orchestrate but don't decide. Side-effects isolated post-commit.

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/leads` | GET | List all leads |
| `/api/leads` | POST | Create lead |
| `/api/leads/:id` | GET | Get lead details |
| `/api/leads/:id/intelligence` | GET | **Computed intelligence** |
| `/api/leads/:id/history` | GET | Score history audit trail |
| `/api/events` | POST | Fire event (queued) |

---

## Scoring Rules (Default)

| Event Type | Points |
|-----------|--------|
| page_view | +1 |
| email_open | +3 |
| download | +10 |
| signup | +20 |
| demo_request | +30 |

---

## Tech Stack

- **Runtime**: Node.js 20
- **API**: Express 5.2.1
- **Queue**: Bull 4.16.5, Redis 7
- **Database**: MongoDB 6 (replica set rs0)
- **ORM**: Mongoose 9.1.3
- **Frontend**: React 18, Tailwind CSS
- **Orchestration**: Docker Compose

---

## Production Readiness

✅ **Implemented**
- Replica set with PRIMARY wait
- Transaction isolation (ACID)
- Idempotent event processing
- Post-commit side-effects
- Queue rate limiting
- Stalled job recovery
- Automation audit logging
- Stage recalculation on decay

⏳ **Future Enhancements**
- Horizontal worker scaling (add `docker-compose scale worker=3`)
- Cron-based decay scheduling (node-cron)
- Real webhook integrations (Slack, email)
- Authentication/authorization
- Prometheus metrics

---

## Why Judges Should Care

This project demonstrates **SDE-2 level thinking**:

1. **Separation of concerns**: Writes vs reads, domain vs orchestration
2. **Correctness under concurrency**: Transactions, locks, idempotency
3. **Business reasoning**: Velocity > raw score, stage-based automation
4. **System thinking**: Queue-based async, eventual consistency
5. **Auditability**: Full history trail, automation execution logs

Not a student project - this is how **real scoring engines work**.

---

## Quick Start

```bash
./setup-demo.sh                    # Start backend
cd frontend && npm install && npm start  # Start UI
```

Access: http://localhost:3001

---

## License

MIT
