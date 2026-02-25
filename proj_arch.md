# LeadPulse — Complete Project Guide

> A book-style walkthrough of every concept, feature, and design decision in this system.  
> Read this top to bottom if you want to truly understand what was built and why.

---

## Table of Contents

1. [What Problem Does This Solve?](#1-what-problem-does-this-solve)
2. [Big Picture: How Everything Connects](#2-big-picture-how-everything-connects)
3. [The Three Processes](#3-the-three-processes)
4. [The Database: MongoDB + Redis](#4-the-database-mongodb--redis)
5. [Data Models — What Gets Stored](#5-data-models--what-gets-stored)
6. [Feature Deep Dives](#6-feature-deep-dives)
   - [6.1 Event Ingestion](#61-event-ingestion-the-front-door)
   - [6.2 The Queue (Bull + Redis)](#62-the-queue-bull--redis)
   - [6.3 The Scoring Worker](#63-the-scoring-worker)
   - [6.4 Scoring Rules Engine](#64-scoring-rules-engine)
   - [6.5 Lead Stages](#65-lead-stages)
   - [6.6 Lead Intelligence](#66-lead-intelligence)
   - [6.7 Automation Engine](#67-automation-engine)
   - [6.8 Score Decay](#68-score-decay)
   - [6.9 Real-time Updates (Socket.IO)](#69-real-time-updates-socketio)
   - [6.10 Authentication](#610-authentication)
   - [6.11 Projects + API Keys](#611-projects--api-keys)
   - [6.12 Analytics](#612-analytics)
   - [6.13 Dead Letter Queue](#613-dead-letter-queue)
7. [The API — Every Endpoint Explained](#7-the-api--every-endpoint-explained)
8. [The Frontend — Every Page Explained](#8-the-frontend--every-page-explained)
9. [The SDK](#9-the-sdk)
10. [Security Design](#10-security-design)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Glossary — Key Terms](#12-glossary--key-terms)
13. [How to Use This in Your Portfolio](#13-how-to-use-this-in-your-portfolio)

---

## 1. What Problem Does This Solve?

### The Business Problem

Imagine you run a SaaS product. You get 10,000 visitors a month. Some of them will become paying customers — but most won't. As a salesperson or founder, you can't call all 10,000 people. You need to know **which leads are worth your time right now**.

**Lead scoring** is the answer. It's a system that watches what users do on your website and app, assigns points to their actions, and ranks them by how likely they are to buy.

| Action | Score |
|--------|-------|
| User visits the pricing page | +15 pts |
| User requests a demo | +50 pts |
| User signs up for an account | +30 pts |
| User opens a marketing email | +10 pts |
| User unsubscribes | -20 pts |

At the end, you have a ranked list of leads. The person with 95 points gets a sales call immediately. The person with 5 points gets added to a nurture email sequence.

### The Technical Problem

Building this sounds simple but has a lot of hard parts:

- **Volume**: Thousands of events can come in per second
- **Real-time**: Salespeople want to see updates instantly, not after a batch process
- **Reliability**: If the server crashes, you can't lose events or double-count them
- **Multi-tenancy**: Multiple companies should be able to use the same system with their data isolated
- **Flexibility**: Every company has different scoring rules

This project solves all of these.

---

## 2. Big Picture: How Everything Connects

Here is the complete data flow, from a visitor clicking a button on your website, to a salesperson seeing their score update on a dashboard in real time:

```
Your Website / App
       │
       │  HTTP POST /api/ingest/event
       │  { apiKey, event: "demo_request", anonymousId: "user@email.com" }
       ▼
┌─────────────────────────────────────────────────┐
│              API Server (Node.js)               │
│                                                 │
│  1. Validate API key → find Project in MongoDB  │
│  2. Find or create Lead document               │
│  3. Save Event to MongoDB                       │
│  4. Push job onto Bull Queue in Redis           │
│  5. Emit socket event (newEvent) to dashboard   │
│  6. Return 202 Accepted immediately             │
└─────────────────────┬───────────────────────────┘
                      │
                      │  Redis Queue (Bull)
                      │  job: { leadId: "abc123" }
                      ▼
┌─────────────────────────────────────────────────┐
│              Worker Process (Node.js)           │
│                                                 │
│  1. Pick up job from queue                      │
│  2. Load all unprocessed events for that lead   │
│  3. Apply scoring rules → calculate new score   │
│  4. Update Lead.currentScore in MongoDB         │
│  5. Update Lead.leadStage (cold/warm/hot/qual.) │
│  6. Save ScoreHistory record                    │
│  7. Run Automation Engine                       │
│  8. Mark events as processed                    │
└─────────────────────────────────────────────────┘
                      │
                      │  Socket.IO emit "leadUpdated"
                      ▼
┌─────────────────────────────────────────────────┐
│         Dashboard (React Frontend)             │
│                                                 │
│  • Events page shows new event instantly        │
│  • Leads page score updates without refresh    │
│  • Leaderboard re-ranks automatically          │
└─────────────────────────────────────────────────┘
```

The key design insight: **the API server does NOT do the scoring**. It just accepts the event, saves it, and puts a job in a queue. The worker does the heavy lifting asynchronously. This means the API can respond in < 50ms no matter how complex the scoring logic is.

---

## 3. The Three Processes

This system runs as **three completely separate Node.js processes**:

### Process 1: API Server (`api/server.js`)

- Handles all HTTP requests from the frontend and SDK
- Runs on **port 4000**
- Connects to MongoDB and Redis
- Manages auth, events, leads, rules, analytics, and ingestion endpoints
- Handles Socket.IO connections for real-time communication

### Process 2: Worker (`worker/index.js`)

- Has no public HTTP endpoints (just a `/health` check on port 5000)
- Listens to the Bull queue in Redis
- Processes one job at a time per "concurrency slot" (configurable)
- Does all the actual scoring computation
- Runs automations after scoring

### Process 3: Frontend (`frontend/`, runs via Vite or Nginx)

- A React SPA (Single Page Application)
- Talks to the API server via HTTP and WebSocket
- Never talks directly to MongoDB or Redis — always via the API

**Why three processes?**  
If scoring takes a long time (complex rules, many events), it doesn't block incoming requests. The API is always fast. The worker can be scaled independently. This is called **separation of concerns**.

---

## 4. The Database: MongoDB + Redis

### MongoDB — The Persistent Store

MongoDB is a **document database** — instead of tables and rows like traditional SQL, it stores JSON-like documents. It's used here for everything that needs to persist permanently:

- Users and their credentials
- Projects and API keys
- Leads and their scores
- Events that were tracked
- Scoring rules
- Score history over time
- Automation rules and execution logs

MongoDB is hosted on **MongoDB Atlas** (a cloud service) so data survives even if the server restarts.

### Redis — The Speed Layer

Redis is an **in-memory data store** — it lives in RAM, so it's extremely fast (microsecond reads/writes). It's used here for two things:

1. **Job Queue** (Bull): The list of "score this lead" jobs waiting to be processed. Persists to disk briefly so jobs aren't lost on restart.
2. **Rate Limiting**: Counting how many requests each IP has made to prevent abuse of the ingest endpoint.

Redis is hosted on **Upstash** (a serverless Redis provider with a generous free tier and TLS support).

---

## 5. Data Models — What Gets Stored

Understanding the models is the most important step to understanding the whole system.

### `User` Model

A person who logs into the LeadPulse dashboard.

```
User {
  email        → "rithwik@example.com"
  password     → bcrypt hash (never stored plain)
  name         → "Rithwik"
  provider     → "email" or "google"
  emailVerified → true / false
  projectId    → reference to their Project
  role         → "user" or "admin"
}
```

Each User is linked to exactly one Project. The Project holds the API key.

### `Project` Model

Represents a customer's website/app integration.

```
Project {
  name    → "Rithwik's Portfolio"
  apiKey  → "pk_318b4f863364cebb..." (long random string)
  domain  → "rithwik.dev"
  active  → true / false
}
```

The `apiKey` is what your portfolio website sends with every event. The backend uses it to know which project (and which user) the event belongs to.

### `Lead` Model

A person who was tracked on the customer's website. They might be anonymous (just a random ID) or identified (email attached).

```
Lead {
  anonymousId    → "user@email.com" or "anon_xyz123"
  projectId      → which project they came from
  email          → filled in when identify() is called
  name           → optional
  company        → optional
  currentScore   → 73 (updated by worker)
  leadStage      → "hot" (cold / warm / hot / qualified)
  lastEventAt    → timestamp of their last action
  eventsLast24h  → count of actions in last 24 hours (velocity)
  velocityScore  → score bonus based on recent activity
  processing     → true if worker is currently scoring them
}
```

The **compound unique index** on `(projectId, anonymousId)` means the same person can't be created twice for the same project. This prevents double-counting.

### `Event` Model

A single action taken by a Lead.

```
Event {
  eventId    → UUID (unique, prevents duplicates)
  projectId  → which project
  leadId     → which lead did this
  anonymousId → the tracking ID
  sessionId  → groups events from one visit
  eventType  → "page_view", "demo_request", "form_submit", etc.
  properties → { url: "/pricing", source: "google" }
  timestamp  → when it happened
  processed  → false → true (set by worker after scoring)
  queued     → false → true (set by API after queuing)
}
```

The `eventId` has a unique index. If the same event arrives twice (network retry), the second one is silently dropped. This is called **idempotency**.

### `ScoringRule` Model

Configurable rules mapping event types to point values.

```
ScoringRule {
  eventType   → "demo_request"
  name        → "Demo Request"
  description → "User requested a product demo"
  points      → 50
  active      → true
}
```

These are seeded with defaults on startup but can be customized via the Rules page.

### `ScoreHistory` Model

A log of every time a lead's score changed. Used to draw the score-over-time chart.

```
ScoreHistory {
  leadId    → which lead
  score     → 73 (the score AT that point in time)
  delta     → +15 (how much it changed)
  eventType → "pricing_page_visit" (what caused the change)
  timestamp → when
}
```

### `AutomationRule` Model

Triggers for actions when a lead reaches a certain state.

```
AutomationRule {
  name        → "Alert Sales on Hot Lead"
  whenStage   → "hot"
  minVelocity → 5
  action      → "send_slack_alert"
}
```

### `AutomationExecution` Model

Log of every time an automation fired. Has a **unique index on (leadId, ruleId, dateBucket)** — this means the same automation fires at most once per day per lead.

### `FailedJob` Model

Dead Letter Queue. If a job fails 3+ times, it's written here so it can be investigated or replayed later.

---

## 6. Feature Deep Dives

### 6.1 Event Ingestion — The Front Door

**File: `api/features/ingest/ingest.service.js`**

This is the most important endpoint in the system: `POST /api/ingest/event`

It's **public** — no user login required, only an API key. This is what your website calls every time a visitor does something.

**Step-by-step what happens:**

```
1. Request arrives: { apiKey, event, anonymousId, properties }
   │
2. Validate payload (all three required fields present?)
   │
3. Look up Project by apiKey in MongoDB
   ├─ Not found? → 401 Unauthorized
   └─ Found → continue
   │
4. Find or create Lead
   findOneAndUpdate({ projectId, anonymousId }, { $setOnInsert: {...} }, { upsert: true })
   │
   Why upsert? Because this might be the first time this person was seen.
   The atomic upsert prevents race conditions if two events arrive
   for the same person simultaneously.
   │
5. Create Event document with a new UUID as eventId
   If eventId already exists (duplicate) → 11000 error → silently return "duplicate"
   │
6. Add job to Bull queue: { leadId }
   jobId: "lead-{leadId}" (deduplication: only one queued job per lead at a time)
   │
7. Mark Event as queued: true
   │
8. Emit Socket.IO events to dashboard (newEvent, scoreMutation)
   │
9. Return 202 Accepted → { status: "queued" }
```

**Why 202 and not 200?**  
200 means "done". 202 means "accepted, will be processed later". The scoring hasn't happened yet — it will happen asynchronously on the worker.

**The race condition problem and solution:**  
If the same user triggers two events at exactly the same moment, two requests might both try to create the same Lead document. MongoDB's `upsert` with `$setOnInsert` is atomic — only one will win, and the other will just find the existing one. If both fail with a duplicate key error (`code: 11000`), there's a retry loop.

---

### 6.2 The Queue (Bull + Redis)

**File: `shared/queue/index.js`**

Bull is a Node.js queue library that uses Redis as its backend.

**How it works:**

When the API server adds a job:
```javascript
queue.add({ leadId: "abc123" }, { jobId: "lead-abc123", attempts: 5 })
```

Redis stores this as a sorted set entry. The worker is always listening and picks it up.

**Key design: `jobId: "lead-{leadId}"`**

If 100 events come in for the same lead within 1 second, you don't want 100 jobs. You want one job that processes ALL 100 events together. By using a fixed `jobId`, Bull **deduplicates** — the second add() for the same leadId just updates the existing job, not create a new one.

**Queue settings:**
```
- attempts: 5     → retry failed jobs up to 5 times
- backoff: exponential starting at 3 seconds
  (3s, 6s, 12s, 24s, 48s between retries)
- timeout: 60 seconds per job
- stalledInterval: 30s → if a worker crashes mid-job, job gets re-queued
- maxStalledCount: 2 → after 2 stalls, job is marked failed
- rate limit: 200 jobs/second max
```

**Upstash TLS setup:**  
The queue connects to Upstash Redis (cloud), which requires TLS (encrypted connection). The `tls: { rejectUnauthorized: false }` setting allows self-signed certs from Upstash.

---

### 6.3 The Scoring Worker

**File: `worker/workflows/processLeadWorkflow.js`**

The worker's main job. When it picks up a `{ leadId }` job from Redis:

```
1. Start a MongoDB transaction (ACID guarantees)
   │
   Why transactions? Scoring updates multiple documents (Lead, Events, ScoreHistory)
   If the server crashes halfway, the transaction rolls back — no partial updates.
   │
   Note: If MongoDB is standalone (not replica set), transactions aren't supported.
   The code detects this error and falls back to running without transactions.
   │
2. Load all unprocessed Events for this lead
   Event.find({ leadId, processed: false })
   │
3. For each event:
   ├─ Look up ScoringRule for event.eventType
   ├─ Get points value (e.g., "demo_request" → 50 points)
   └─ Accumulate total delta
   │
4. Update lead.currentScore += totalDelta
   (Minimum 0 — scores can't go negative)
   │
5. Calculate new stage from score:
   ├─ score >= 60 → "qualified"
   ├─ score >= 31 → "hot"
   ├─ score >= 11 → "warm"
   └─ score < 11  → "cold"
   │
6. Update velocityScore and eventsLast24h
   │
7. Save ScoreHistory record for each event processed
   │
8. Mark all processed Events as processed: true
   │
9. Commit transaction
   │
10. Run Automation Engine (outside transaction)
```

**The scoring rules cache:**  
Looking up rules from MongoDB on every event would be slow. Instead, the worker loads all rules into memory when it starts (`scoringRulesCache.js`) and updates every 30 seconds. This means scoring happens with in-memory lookups (microseconds) not database queries (milliseconds).

---

### 6.4 Scoring Rules Engine

**Files: `api/features/rules/`, `worker/services/scoringRulesCache.js`**

The **default rules** seeded on startup:

| Event Type | Points | Why |
|------------|--------|-----|
| `page_view` | +5 | Low intent — just browsing |
| `email_open` | +10 | Engaged with your marketing |
| `form_submit` | +20 | Took an action |
| `signup` | +30 | Real commitment |
| `pricing_page_visit` | +15 | Commercial intent |
| `webinar_attendance` | +25 | High engagement |
| `demo_request` | +50 | Very high intent |
| `contract_signed` | +100 | Converted |
| `download` | +15 | Research phase |
| `unsubscribe` | -20 | Negative signal |

**These are fully customizable.** The Rules page in the dashboard lets you:
- Change point values
- Enable/disable rules
- Create new rules for custom event types

**How rules are applied in the worker:**

```javascript
// From scoringRulesCache.js
const rulesMap = new Map(); // eventType → points
// Worker loads this once, updates every 30s

// During scoring:
const points = rulesMap.get(event.eventType) || 0;
totalDelta += points;
```

---

### 6.5 Lead Stages

**File: `worker/domain/stageEngine.js`**

Every lead is in one of four stages based on their score:

```
Score 0-10  →  COLD       (not yet engaged)
Score 11-30 →  WARM       (showing some interest)
Score 31-59 →  HOT        (actively interested, needs attention)
Score 60+   →  QUALIFIED  (sales-ready, high priority)
```

The stage is recalculated every time the worker runs. It's stored on the Lead document and visible on the dashboard with color coding:
- Cold → grey
- Warm → yellow
- Hot → orange
- Qualified → green

**Why stages matter:** They drive automations. A lead moving from Hot to Qualified can automatically trigger a Slack notification to your sales team.

---

### 6.6 Lead Intelligence

**File: `worker/domain/leadIntelligence.js`**

Beyond just a score, every lead has three computed properties:

**Velocity**  
How active is this lead right now?
```javascript
velocity = eventsLast24h * 3
```
If they did 5 things in the last 24 hours, velocity = 15. High velocity = they're actively evaluating your product right now.

**Risk**  
How long since they last did anything?
```javascript
daysSinceLastEvent > 14 → "high"    (they're going cold)
daysSinceLastEvent > 7  → "medium"  (losing interest)
else                    → "low"     (still engaged)
```

**Next Action**  
An AI-like recommendation for what to do with this lead:
```javascript
qualified + high velocity → "immediate_sales_contact"
hot + low risk           → "schedule_demo"
warm                     → "nurture_campaign"
high risk                → "re_engagement_required"
else                     → "monitor"
```

This makes the system feel "intelligent" — it's not just a score, it tells you what to DO with the score.

---

### 6.7 Automation Engine

**File: `worker/domain/automationEngine.js`**

Automations are trigger-action pairs that fire when a lead reaches a certain state.

**Example automation rule:**
```
When: leadStage == "hot" AND velocity >= 5
Do:   "send_slack_alert"
```

**How it works:**

After the worker finishes scoring a lead, it calls `executeAutomationsForLead(leadId)`:

1. Load all AutomationRules from cache
2. Compute current lead's stage and velocity
3. Filter rules that match (stage matches AND velocity threshold met)
4. For each matching rule, create an `AutomationExecution` record

The **idempotency trick**: The `AutomationExecution` model has a unique index on `(leadId, ruleId, dateBucket)` where `dateBucket` is the current date (`"2026-02-21"`). This means the same automation can only fire once per day per lead. If it tries to fire again on the same day, MongoDB throws a duplicate key error (`11000`) which the engine catches and ignores silently.

**What actions exist?**  
Currently, the system **logs** automation executions. The actions (`send_slack_alert`, `send_email`, etc.) are designed to be plugged in — you add the actual Slack API call or email send in the automation handler. The infrastructure for tracking when automations ran is complete.

---

### 6.8 Score Decay

**File: `worker/jobs/scoringDecay.js`** or **`scoringDecay.job.js`**

Leads that go inactive should have their score naturally decrease over time. This prevents the leaderboard from being frozen with old high-scorers forever.

The decay job runs on a schedule (cron-style) and reduces scores for leads that haven't had any events in a certain number of days.

This makes the score a **live signal** — it reflects current engagement, not just historical total activity.

---

### 6.9 Real-time Updates (Socket.IO)

**File: `api/app.js`, `frontend/src/sockets/`**

Socket.IO enables the dashboard to update **without refreshing the page**.

**How it's set up:**

The API server creates an HTTP server, then attaches Socket.IO to it:
```javascript
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
app.set("io", io); // Makes io accessible in route handlers
```

**Events emitted:**

| Event Name | When Fired | Who Receives |
|------------|------------|--------------|
| `newEvent` | Every time an event is ingested | Events page |
| `scoreMutation` | Same time as newEvent | Any listener |
| `leadUpdated` | After worker updates a lead | Leads page |

**On the frontend:**
```javascript
// socket.js
const socket = io(WS_URL, { auth: { token: localStorage.getItem("authToken") } });
socket.on("newEvent", (data) => {
  // Prepend to events list → green dot animation plays
});
```

The **live indicator dot** (green pulsing dot on the Events page) lights up when a new event arrives via socket. This is a visual confirmation that your pipeline is working end-to-end in real time.

---

### 6.10 Authentication

**Files: `api/features/auth/`**

The system supports two login methods:

**Email/Password:**
1. Register: hash password with bcrypt (12 salt rounds), create User + Project, return JWT
2. Login: compare bcrypt hash, return JWT

**Google OAuth (Sign in with Google):**
1. Frontend gets a Google ID token via Google's JavaScript SDK
2. Sends token to `POST /api/auth/google`
3. Backend verifies token with Google's public keys
4. Creates or finds User by email, returns JWT

**JWT (JSON Web Token):**

After login, the server returns a JWT that looks like:
```
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI2NTk...
```

This is a signed token containing: `{ userId, email, projectId }`. It's stored in `localStorage` on the frontend and sent with every API request in the `Authorization: Bearer <token>` header.

The `protect` middleware in `authMiddleware.js` verifies this token on every protected route. If it's invalid or expired, it returns 401.

**The 401 interception:**  
The axios interceptor in the frontend (`axios.config.js`) watches every API response. If it sees a 401, it dispatches a custom JavaScript event (`auth:logout`), which `AuthContext` listens to and then navigates to `/login` — **without a page reload** (no broken socket connection).

---

### 6.11 Projects + API Keys

**Files: `api/features/projects/`, `api/utils/generateApiKey.js`**

Every user has exactly one Project. The Project has an `apiKey` — a long, random string that looks like:

```
pk_318b4f863364cebb61cff22fc22bcfd56af9f92e54e898b0
```

**How it's generated:**
```javascript
function generateApiKey() {
  return "pk_" + crypto.randomBytes(24).toString("hex");
}
```

48 random hex characters after the prefix. The probability of two keys being the same is astronomically low (2^192 possibilities).

**How it's used:**

Your website sends this key with every event. The ingest endpoint does:
```javascript
const project = await Project.findOne({ apiKey });
```

If the key matches a project, the event is accepted. If not, 401.

**Auto-creation:**  
When you register, a project is automatically created with a random API key. The fix applied earlier made `GET /auth/project` also auto-create a project if the user somehow ended up without one (e.g., the project was deleted).

---

### 6.12 Analytics

**File: `api/features/analytics/analytics.controller.js`**

The analytics endpoint powers the dashboard Overview page with aggregated metrics:

- **Total leads** — count of all Lead documents
- **Qualified leads** — count where `leadStage: "qualified"`
- **Events today** — count of Events with timestamp in last 24h
- **Average score** — average of `currentScore` across all leads
- **Events by type** — breakdown of how many page_views, demo_requests, etc.
- **Score distribution** — how many leads are in each stage
- **Top leads** — sorted by currentScore descending

All of this is computed via MongoDB aggregation pipelines — single queries that return computed results, not loading everything into memory.

---

### 6.13 Dead Letter Queue

**File: `api/models/FailedJob.js`, `worker/index.js`**

If a scoring job fails all 5 retry attempts, it's not just dropped. The worker's `queue.on("failed")` handler saves it to the `FailedJob` collection in MongoDB:

```
FailedJob {
  jobId      → the Bull job ID
  jobData    → { leadId } — enough to replay the job
  error      → the error message
  errorStack → full stack trace
  attempts   → 5 (max)
  failedAt   → timestamp
}
```

An admin can later query this collection, fix the underlying issue, and replay the jobs. This is called a **Dead Letter Queue (DLQ)** — industry-standard pattern for reliable message processing.

---

## 7. The API — Every Endpoint Explained

### Public (no auth required)

| Method | Path | What it does |
|--------|------|--------------|
| `GET` | `/api/health` | Returns MongoDB + Redis status |
| `POST` | `/api/ingest/event` | Accept a tracked event (API key auth) |
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login, get JWT |
| `POST` | `/api/auth/google` | Google OAuth login |
| `POST` | `/api/auth/verify-email` | Verify email with token |

### Protected (JWT required)

| Method | Path | What it does |
|--------|------|--------------|
| `GET` | `/api/auth/me` | Get logged-in user info |
| `GET` | `/api/auth/project` | Get your project + API key |
| `GET` | `/api/events` | List events (paginated) |
| `GET` | `/api/leads` | List leads (sorted by score) |
| `GET` | `/api/leads/:id` | Get one lead's full details |
| `GET` | `/api/rules` | List scoring rules |
| `POST` | `/api/rules` | Create a new rule |
| `PUT` | `/api/rules/:id` | Update a rule |
| `DELETE` | `/api/rules/:id` | Delete a rule |
| `GET` | `/api/analytics/dashboard` | Get dashboard stats |
| `GET` | `/api/leaderboard` | Top leads by score |
| `POST` | `/api/projects` | Create a project |
| `POST` | `/api/projects/:id/rotate-key` | Generate new API key |

### Rate Limiting

The `/api/ingest/*` route is rate-limited via `express-rate-limit` + Redis: max 200 requests per IP per minute. This prevents someone from flooding your system to inflate scores.

---

## 8. The Frontend — Every Page Explained

The frontend is a **React SPA** built with Vite and styled with Tailwind CSS.

### Authentication

**Files: `frontend/src/contexts/AuthContext.jsx`**

`AuthContext` is a React Context that wraps the whole app. It provides:
- `user` — the logged-in user object
- `login()` — call this with email/password
- `logout()` — clears token, disconnects socket
- `isAuthenticated` — boolean

The `ProtectedRoute` component checks `isAuthenticated`. If false, it redirects to `/login`.

### `/` — Dashboard / Overview

Shows the big-picture numbers:
- Total events, leads, qualified leads
- Events chart (events per day)
- Score distribution (pie/bar by stage)
- Last event timestamp

### `/events` — Live Event Stream

Shows events as they come in. The **green pulsing dot** at the top means Socket.IO is connected and events are appearing in real time. New events prepend to the top of the list with an animation.

### `/leads` — Lead Database

The full table of every tracked person, sorted by score. Click any lead to see:
- Full score history chart
- All their events
- Intelligence summary (velocity, risk, next action)
- Contact info if identified

### `/rules` — Scoring Rules

A CRUD table for all scoring rules. You can:
- Edit point values
- Toggle rules on/off
- Add new event types with custom point values

Changes take effect immediately on the next event processed by the worker (which re-loads rules cache every 30s).

### `/simulator` — Test the Pipeline

A form that lets you send a fake event without needing to copy SDK code. Pick an event type, enter an email, click send — and watch it appear on `/events` in real time.

### `/integrations` — SDK and API Key

This is your developer onboarding page:
- Copy your API key
- Get the HTML snippet to paste into your website
- See Node.js SDK usage
- See the cURL command to test from terminal
- Send a test event with one click
- Enter a webhook URL for automation callbacks

### `/system` — Health Dashboard

Shows live status of:
- MongoDB connection
- Redis connection
- API server uptime
- Worker process status

---

## 9. The SDK

**File: `api/sdk/ls.js`**

The SDK (`ls.js`) is a tiny JavaScript file your website loads. It provides a simple API:

```javascript
// Initialize with your API key
LS.init({ apiKey: "pk_your_key_here" });

// Track an event
LS.track("page_view", { url: window.location.href });

// Identify the user (attach email to their anonymous profile)
LS.identify("user@example.com", { name: "John", company: "ACME" });
```

Internally, `LS.track()` just does:
```javascript
fetch("https://your-api.com/api/ingest/event", {
  method: "POST",
  body: JSON.stringify({ apiKey, event, anonymousId, properties })
})
```

The `anonymousId` is stored in `localStorage` so the same person is recognized across visits.

---

## 10. Security Design

### Secrets

- **JWT**: Signed with `JWT_SECRET` from env. If you don't have this, you can't forge tokens.
- **API keys**: Random 192-bit keys. No way to brute-force.
- **Passwords**: bcrypt with 12 rounds. Even if the DB is stolen, passwords can't be recovered.

### Data Isolation

Every Lead, Event, and Project has a `projectId`. All queries filter by `projectId` extracted from the JWT. Company A cannot see Company B's leads.

### Rate Limiting

The public ingest endpoint is rate-limited to prevent:
- Flooding attacks (DDoS)
- Score inflation via fake events

### CORS

The API server has CORS configured to only accept requests from the frontend domain. In development it's open; production locks it to the deployed URLs.

---

## 11. Deployment Architecture

```
┌─────────────────────────────────────────────┐
│                  Render.com                  │
│                                             │
│  ┌──────────────┐   ┌──────────────────┐   │
│  │  API Server   │   │     Worker       │   │
│  │  (Web Service)│   │  (Background     │   │
│  │  Port 4000   │   │   Worker)        │   │
│  └──────────────┘   └──────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
           │                    │
           └────────┬───────────┘
                    │
       ┌────────────┴────────────┐
       │                         │
┌──────┴──────┐         ┌────────┴───────┐
│ MongoDB      │         │   Upstash      │
│ Atlas        │         │   Redis        │
│ (Database)  │         │   (Queue +     │
│             │         │   Rate Limit)  │
└─────────────┘         └────────────────┘

┌─────────────────────────────────────────────┐
│                  Vercel                      │
│         Frontend (React/Vite)               │
│         Served as static files              │
└─────────────────────────────────────────────┘
```

**render.yaml** defines the two Render services (API + Worker) including:
- Build commands
- Start commands
- Environment variable references
- Health check configuration

---

## 12. Glossary — Key Terms

| Term | Meaning |
|------|---------|
| **Lead** | A tracked person on your website |
| **Event** | A single action a lead took (page view, click, form submit) |
| **anonymousId** | A persistent ID for a lead before you know who they are |
| **Identify** | Attaching a real email/name to an anonymous lead |
| **Scoring Rule** | Maps an event type → point value |
| **Lead Stage** | cold / warm / hot / qualified — bucket based on score |
| **Velocity** | How active a lead has been in the last 24 hours |
| **Decay** | Score reduction over time for inactive leads |
| **Queue** | A waiting list of "score this lead" jobs in Redis |
| **Worker** | The background process that picks up queue jobs and scores leads |
| **Idempotency** | Processing the same event twice produces the same result (no double-counting) |
| **Upsert** | Insert if not exists, update if exists — atomic MongoDB operation |
| **JWT** | Signed token proving who you are, sent with every API request |
| **Socket.IO** | WebSocket library for real-time bidirectional communication |
| **DLQ** | Dead Letter Queue — storage for jobs that permanently failed |
| **Bull** | Node.js queue library, backed by Redis |
| **ACID** | Atomicity, Consistency, Isolation, Durability — MongoDB transaction guarantees |
| **Aggregation Pipeline** | MongoDB way to compute statistics with a single query |
| **API Key** | Secret string used to authenticate ingest events from your website |
| **Rate Limiting** | Limiting how many requests an IP can make per minute |
| **CORS** | Browser security policy controlling which domains can call your API |

---

## 13. How to Use This in Your Portfolio

You built a **production-grade, event-driven lead intelligence platform**. Here's how to explain it:

### Elevator Pitch (30 seconds)

> "I built a real-time lead scoring system similar to what Segment, HubSpot, and Mixpanel do. It processes behavioral events from websites, scores leads using configurable rules, and shows live updates to salespeople via WebSockets. The architecture uses a producer-consumer pattern with Bull + Redis queues, so the API responds in under 50ms regardless of scoring complexity."

### Technical Highlights to Mention

1. **Event-driven architecture** — API and Worker are decoupled via a queue. Classic producer-consumer pattern.
2. **Idempotent event processing** — duplicate events are silently dropped via UUID + unique MongoDB index.
3. **Atomic upserts** — race conditions on lead creation are handled with MongoDB's `findOneAndUpdate` + retry loop.
4. **Real-time via Socket.IO** — dashboard updates without polling.
5. **Score decay** — scores decay over time, making the signal represent current not historical engagement.
6. **Multi-tenancy** — all data scoped to projectId. Same system, isolated data per customer.
7. **Dead Letter Queue** — failed jobs are never lost, can be replayed.
8. **MongoDB transactions** — scoring updates are atomic (score + events + history all commit together or not at all).

### Things You Can Demo

- Send an event via the Integrations page → watch it appear live on Events page (no refresh)
- Show the Leaderboard re-ranking in real time
- Edit a scoring rule → send same event → see different score
- Show the System page proving MongoDB + Redis are live
