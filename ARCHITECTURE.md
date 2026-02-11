# Lead Scoring System - Architecture Documentation

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Core Components](#core-components)
5. [Data Flow](#data-flow)
6. [Key Architectural Patterns](#key-architectural-patterns)
7. [Data Models](#data-models)
8. [API Structure](#api-structure)
9. [Worker Architecture](#worker-architecture)
10. [Frontend Architecture](#frontend-architecture)
11. [Infrastructure & Deployment](#infrastructure--deployment)
12. [Security & Authentication](#security--authentication)
13. [Scalability & Performance](#scalability--performance)
14. [Monitoring & Observability](#monitoring--observability)

---

## System Overview

### Purpose
The **Event-Driven Lead Scoring System** is a production-grade application that tracks, scores, and qualifies leads based on their behavioral events. It provides real-time intelligence, automated workflows, and comprehensive analytics for sales and marketing teams.

### Core Principles

- **Event-Driven Architecture**: All lead mutations happen through immutable events
- **Asynchronous Processing**: Non-blocking architecture using message queues
- **Idempotency**: Safe retries and duplicate event handling
- **Ordering Guarantees**: Sequential event processing per lead
- **Auditability**: Complete event history with score change tracking
- **Real-time Updates**: WebSocket-based live dashboard updates
- **Scalability**: Horizontal scaling through worker pools

### System Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  API Server │────▶│ Redis Queue │────▶│   Worker    │
│ (Webhook/UI)│     │  (Express)  │     │   (Bull)    │     │  (Processor)│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                                        │
                           ▼                                        ▼
                    ┌─────────────┐                          ┌─────────────┐
                    │  Socket.IO  │                          │   MongoDB   │
                    │ (Real-time) │                          │  (Storage)  │
                    └─────────────┘                          └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Frontend  │
                    │   (React)   │
                    └─────────────┘
```

---

## Architecture Diagram

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Webhook   │  │   REST API  │  │   SDK/JS    │  │  Frontend   │        │
│  │  Endpoints  │  │   Client    │  │   Library   │  │     App     │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │                │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                   │
┌──────────────────────────────────┼────────────────────────────────────────────┐
│                             API LAYER (Port 4000)                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Express.js Server                            │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│    │
│  │  │    Auth     │  │   Events    │  │    Leads    │  │   Rules     ││    │
│  │  │   Routes    │  │   Routes    │  │   Routes    │  │   Routes    ││    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│    │
│  │                                                                      │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│    │
│  │  │   Project   │  │ Leaderboard │  │  Webhooks   │  │   Ingest    ││    │
│  │  │   Routes    │  │   Routes    │  │   Routes    │  │   Routes    ││    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Middleware Layer                             │    │
│  │  • Authentication (JWT/API Key)                                      │    │
│  │  • Rate Limiting (Redis-backed)                                      │    │
│  │  • Error Handling & Validation                                       │    │
│  │  • CORS Configuration                                                │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Socket.IO Server                             │    │
│  │  • Real-time event broadcasting                                      │    │
│  │  • Lead score updates                                                │    │
│  │  • Activity notifications                                            │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└───────────────────────────────┬───────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
┌───────────────────▼──────────┐  ┌─────────▼────────────────────────────────┐
│      MESSAGE QUEUE            │  │         DATA LAYER                       │
├──────────────────────────────┤  ├──────────────────────────────────────────┤
│                               │  │                                          │
│  ┌────────────────────────┐  │  │  ┌────────────────────────────────────┐ │
│  │    Redis + Bull Queue  │  │  │  │         MongoDB Database           │ │
│  │                        │  │  │  │                                    │ │
│  │  • Job Management      │  │  │  │  Collections:                      │ │
│  │  • Retry Logic         │  │  │  │  • events                          │ │
│  │  • Rate Limiting       │  │  │  │  • leads                           │ │
│  │  • Concurrency Control │  │  │  │  • users                           │ │
│  │  • Dead Letter Queue   │  │  │  │  • scoring_rules                   │ │
│  │                        │  │  │  │  • score_histories                 │ │
│  └────────────────────────┘  │  │  │  • automation_rules                │ │
│                               │  │  │  • automation_executions           │ │
└───────────────┬───────────────┘  │  │  • failed_jobs                     │ │
                │                  │  │  • projects                        │ │
                │                  │  └────────────────────────────────────┘ │
                │                  │                                          │
┌───────────────▼──────────────────┴──────────────────────────────────────────┐
│                           WORKER LAYER (Port 5000)                           │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                          Event Processor                             │    │
│  │                                                                      │    │
│  │  ┌────────────────────────────────────────────────────────────┐    │    │
│  │  │              Process Lead Workflow                         │    │    │
│  │  │                                                             │    │    │
│  │  │  1. Acquire Lead Lock (Prevent Race Conditions)            │    │    │
│  │  │  2. Fetch All Unprocessed Events                           │    │    │
│  │  │  3. Sort Events by Timestamp (Ordering)                    │    │    │
│  │  │  4. Identity Resolution (Email → Lead Merge)               │    │    │
│  │  │  5. Calculate Score Changes                                │    │    │
│  │  │  6. Apply Score with Decay                                 │    │    │
│  │  │  7. Update Lead Stage (Cold/Warm/Hot/Qualified)            │    │    │
│  │  │  8. Calculate Velocity & Risk Metrics                      │    │    │
│  │  │  9. Persist to Database                                    │    │    │
│  │  │ 10. Release Lock                                           │    │    │
│  │  └────────────────────────────────────────────────────────────┘    │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                       Automation Engine                              │    │
│  │                                                                      │    │
│  │  • Rule Evaluation                                                   │    │
│  │  • Webhook Triggers                                                  │    │
│  │  • Email Notifications                                               │    │
│  │  • CRM Integration Actions                                           │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     Supporting Services                              │    │
│  │                                                                      │    │
│  │  • Scoring Rules Cache                                               │    │
│  │  • Lead Intelligence Service                                         │    │
│  │  • Stage Calculation Engine                                          │    │
│  │  • Lock Recovery Loop (Stale Lock Cleanup)                           │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER (Port 5173)                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         React SPA (Vite)                             │    │
│  │                                                                      │    │
│  │  Pages:                                                              │    │
│  │  • Dashboard (Real-time Analytics)                                   │    │
│  │  • Leads List & Detail                                               │    │
│  │  • Lead Activity Timeline                                            │    │
│  │  • Leaderboard                                                       │    │
│  │  • Scoring Rules Management                                          │    │
│  │  • Authentication (Login/Register)                                   │    │
│  │                                                                      │    │
│  │  Features:                                                           │    │
│  │  • Real-time updates via Socket.IO                                   │    │
│  │  • Interactive charts (Chart.js/Recharts)                            │    │
│  │  • Responsive design (Tailwind CSS)                                  │    │
│  │  • Context-based state management                                    │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend (API)
- **Runtime**: Node.js v18+
- **Framework**: Express.js v4
- **Database**: MongoDB v6 (with Mongoose ODM)
- **Cache/Queue**: Redis v7
- **Queue Management**: Bull v4
- **Real-time**: Socket.IO v4
- **Authentication**: JWT (jsonwebtoken) + API Keys
- **Validation**: Custom validators with Joi-like patterns

### Backend (Worker)
- **Runtime**: Node.js v18+
- **Queue Consumer**: Bull v4
- **Database**: MongoDB v6
- **Transaction Support**: MongoDB transactions (replica set)
- **Concurrency**: Configurable worker pool

### Frontend
- **Framework**: React v19
- **Build Tool**: Vite v7
- **Routing**: React Router v6
- **HTTP Client**: Axios v1
- **Real-time**: Socket.IO Client v4
- **Charts**: Chart.js v4 + Recharts v3
- **Styling**: Tailwind CSS v4
- **State Management**: React Context API

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Deployment**: Render.com (render.yaml configuration)
- **Frontend Hosting**: Vercel
- **Environment**: dotenv for configuration

### Development Tools
- **Linting**: ESLint v9
- **Package Manager**: npm
- **Module System**: CommonJS (API/Worker), ES Modules (Frontend)

---

## Core Components

### 1. API Server (`/api`)

**Purpose**: REST API gateway, event ingestion, and real-time communication.

**Key Responsibilities**:
- Accept webhook events and API requests
- Validate and authenticate incoming requests
- Enqueue events for async processing
- Serve synchronous read operations (leads, scores, analytics)
- Broadcast real-time updates via WebSockets
- Serve SDK files statically

**Entry Point**: `api/server.js`

**Structure**:
```
api/
├── app.js                 # Express setup, middleware, Socket.IO
├── server.js              # Server initialization
├── routes.js              # Route aggregation
├── config/
│   ├── db.js             # MongoDB connection
│   └── redis.js          # Redis client
├── middleware/
│   ├── authMiddleware.js # JWT + API key validation
│   ├── errorHandler.js   # Global error handling
│   └── rateLimiter.js    # Rate limiting
├── features/             # Domain-driven feature modules
│   ├── auth/            # User authentication
│   ├── events/          # Event ingestion & batch processing
│   ├── leads/           # Lead management & intelligence
│   ├── leaderboard/     # Top leads & analytics
│   ├── projects/        # Multi-tenant projects
│   ├── rules/           # Scoring rule CRUD
│   └── webhooks/        # Webhook subscriptions
├── models/              # Mongoose schemas
└── sdk/                 # JavaScript SDK for clients
    ├── ls.js
    └── test.html
```

### 2. Worker Service (`/worker`)

**Purpose**: Background event processing, score calculation, and automation execution.

**Key Responsibilities**:
- Consume events from Redis queue
- Process events in order per lead
- Calculate and update lead scores
- Perform identity resolution (email merging)
- Execute automation rules
- Handle retries and dead letter queue

**Entry Point**: `worker/index.js`

**Structure**:
```
worker/
├── index.js                    # Worker initialization & queue consumer
├── config/
│   └── index.js               # Worker configuration
├── workflows/
│   └── processLeadWorkflow.js # Core scoring workflow
├── domain/
│   ├── automationEngine.js    # Rule-based automation
│   ├── leadIntelligence.js    # Risk & velocity calculations
│   └── stageEngine.js         # Stage progression logic
├── jobs/
│   ├── scoringDecay.job.js    # Scheduled score decay
│   └── scoringDecay.js
├── services/
│   ├── eventProcessor.js      # Event processing utilities
│   ├── leadIntelligence.js    # Intelligence metrics
│   └── scoringRulesCache.js   # In-memory rules cache
├── utils/
│   ├── health.js              # Health check endpoint
│   ├── logger.js              # Structured logging
│   ├── recoverLocks.js        # Stale lock recovery
│   └── waitForMongoPrimary.js # Replica set readiness
└── models/                     # Shared models with API
```

### 3. Shared Queue (`/shared/queue`)

**Purpose**: Centralized message queue configuration.

**Features**:
- Bull queue instance with Redis
- Retry logic (5 attempts, exponential backoff)
- Rate limiting (200 jobs/second)
- Job timeout (60 seconds)
- Observability hooks

**Configuration**:
```javascript
{
  limiter: { max: 200, duration: 1000 },
  attempts: 5,
  backoff: { type: 'exponential', delay: 3000 },
  timeout: 60000
}
```

### 4. Frontend Application (`/frontend`)

**Purpose**: User interface for lead management and analytics.

**Key Features**:
- Real-time dashboard with live updates
- Lead browsing, filtering, and search
- Activity timeline visualization
- Scoring rule management
- Leaderboard and analytics
- User authentication

**Structure**:
```
frontend/src/
├── main.jsx              # App entry point
├── App.jsx               # Root component with routing
├── api.js                # Axios API client
├── config.js             # Environment configuration
├── pages/                # Route components
│   ├── Dashboard.jsx
│   ├── Leads.jsx
│   ├── LeadDetail.jsx
│   ├── LeadActivity.jsx
│   ├── Leaderboard.jsx
│   ├── ScoringRules.jsx
│   └── Login.jsx
├── components/           # Reusable UI components
├── contexts/             # React Context providers
├── sockets/              # Socket.IO client setup
└── api/                  # API service modules
```

---

## Data Flow

### Event Ingestion Flow

```
┌────────────┐
│  Client    │
│ (Webhook)  │
└─────┬──────┘
      │
      │ POST /api/events
      │ { eventType, leadId, properties, timestamp }
      │
      ▼
┌─────────────────────────────────────────────────┐
│            API Server (Express)                 │
│                                                 │
│  1. Validate payload (event.validator.js)       │
│  2. Check authentication                        │
│  3. Check rate limit                            │
│  4. Create Event document (MongoDB)             │
│  5. Enqueue job (Bull/Redis)                    │
│  6. Return 202 Accepted                         │
└─────┬───────────────────────────────────────────┘
      │
      │ Job: { leadId }
      │
      ▼
┌─────────────────────────────────────────────────┐
│         Redis Queue (Bull)                      │
│                                                 │
│  • Queue: "lead-processing"                     │
│  • Job ID: "lead-{leadId}"                      │
│  • Retry: 5 attempts                            │
│  • Priority: FIFO per lead                      │
└─────┬───────────────────────────────────────────┘
      │
      │ Worker pulls job
      │
      ▼
┌─────────────────────────────────────────────────┐
│          Worker Process                         │
│                                                 │
│  1. Acquire lead lock (Redis)                   │
│  2. Fetch unprocessed events                    │
│  3. Sort by timestamp (ordering)                │
│  4. For each event:                             │
│     a. Check idempotency (eventId)              │
│     b. Resolve identity (email → merge)         │
│     c. Apply scoring rule                       │
│     d. Create ScoreHistory entry                │
│     e. Mark event processed                     │
│  5. Calculate final score with decay            │
│  6. Update Lead document                        │
│  7. Calculate stage (cold/warm/hot/qualified)   │
│  8. Calculate velocity & risk                   │
│  9. Execute automation rules                    │
│ 10. Release lock                                │
└─────┬───────────────────────────────────────────┘
      │
      │ Lead updated
      │
      ▼
┌─────────────────────────────────────────────────┐
│         MongoDB (Persistence)                   │
│                                                 │
│  • Event marked processed=true                  │
│  • ScoreHistory entry created                   │
│  • Lead score & stage updated                   │
│  • AutomationExecution logged                   │
└─────┬───────────────────────────────────────────┘
      │
      │ Socket.IO emit
      │
      ▼
┌─────────────────────────────────────────────────┐
│         Real-time Broadcast                     │
│                                                 │
│  io.emit('leadUpdated', { leadId, score })      │
└─────┬───────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────┐
│         Frontend (React)                        │
│                                                 │
│  • Dashboard updates                            │
│  • Lead detail refreshes                        │
│  • Notification displayed                       │
└─────────────────────────────────────────────────┘
```

### Read Flow (Synchronous)

```
┌────────────┐
│  Client    │
└─────┬──────┘
      │
      │ GET /api/leads/:id
      │
      ▼
┌─────────────────────────────────────────────────┐
│            API Server                           │
│                                                 │
│  1. Authenticate request                        │
│  2. Query MongoDB                               │
│  3. Calculate intelligence metrics              │
│  4. Return JSON response                        │
└─────┬───────────────────────────────────────────┘
      │
      │ { lead, score, stage, velocity, risk }
      │
      ▼
┌────────────┐
│  Client    │
└────────────┘
```

---

## Key Architectural Patterns

### 1. Event-Driven Architecture

**Pattern**: All state changes are triggered by immutable events.

**Benefits**:
- Full audit trail
- Easy debugging (replay events)
- Temporal queries (score at any point in time)
- Loose coupling between components

**Implementation**:
```javascript
// Event structure
{
  eventId: "evt_abc123",        // Unique identifier
  eventType: "page_view",       // Event type
  leadId: "lead_xyz",           // Lead reference
  timestamp: "2026-02-10T10:00:00Z",
  properties: {                 // Custom metadata
    page: "/pricing",
    duration: 45
  },
  processed: false              // Processing state
}
```

### 2. Idempotency

**Pattern**: Processing the same event multiple times produces the same result.

**Mechanisms**:
1. **Unique Event ID**: Each event has a globally unique `eventId`
2. **Database Constraint**: ScoreHistory has unique index on `(leadId, eventId)`
3. **Graceful Handling**: Duplicate insertions fail silently

**Implementation**:
```javascript
// ScoreHistory ensures idempotency
await ScoreHistory.create({
  leadId: lead._id,
  eventId: event.eventId,  // Unique constraint
  scoreDelta: rule.points,
  newScore: newScore
});
// If eventId already exists → NOOP (no duplicate scoring)
```

### 3. Ordering Guarantees

**Pattern**: Events are processed in chronological order per lead.

**Mechanisms**:
1. **Timestamp Sorting**: Events sorted before processing
2. **Per-Lead Locking**: Prevents concurrent updates
3. **FIFO Queue**: Bull ensures sequential job delivery

**Implementation**:
```javascript
// Fetch and sort events
const events = await Event.find({ leadId, processed: false })
  .sort({ timestamp: 1 })  // Order by timestamp
  .session(session);
```

### 4. Distributed Locking

**Pattern**: Prevent race conditions when multiple workers process the same lead.

**Mechanism**: Redis-based locks with TTL

**Implementation**:
```javascript
// Acquire lock before processing
const lockKey = `lead:${leadId}:lock`;
const locked = await redis.set(lockKey, workerId, 'EX', 30, 'NX');

if (!locked) {
  throw new Error('Lead is currently being processed');
}

// Process lead...

// Release lock
await redis.del(lockKey);
```

### 5. Dead Letter Queue

**Pattern**: Capture failed jobs after exhausting retries.

**Implementation**:
```javascript
eventQueue.on('failed', async (job, err) => {
  if (job.attemptsMade >= 3) {
    await FailedJob.create({
      jobId: job.id,
      jobData: job.data,
      error: err.message,
      attempts: job.attemptsMade
    });
  }
});
```

### 6. CQRS (Command Query Responsibility Segregation)

**Pattern**: Separate read and write operations.

- **Commands** (Write): POST /api/events → Async processing
- **Queries** (Read): GET /api/leads → Synchronous response

**Benefits**:
- Optimized read/write paths
- Read scaling independence
- Non-blocking event ingestion

### 7. Feature-Based Organization

**Pattern**: Organize code by business domain, not technical layer.

**Structure**:
```
features/
  leads/
    lead.controller.js    # HTTP handlers
    lead.service.js       # Business logic
    lead.routes.js        # Route definitions
    lead.validator.js     # Input validation
```

**Benefits**:
- High cohesion
- Easy to locate related code
- Scalable for large teams

---

## Data Models

### Event
**Collection**: `events`

```javascript
{
  _id: ObjectId,
  eventId: String,           // Unique event identifier (indexed)
  eventType: String,         // "signup", "page_view", "feature_used", etc.
  leadId: ObjectId,          // Reference to Lead
  projectId: ObjectId,       // Multi-tenancy
  timestamp: Date,           // Event occurred time
  properties: Object,        // Flexible metadata (email, page, etc.)
  processed: Boolean,        // Processing state
  queued: Boolean,           // Queue submission state
  processing: Boolean,       // Currently being processed
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ eventId: 1 }                                   // Unique
{ leadId: 1, processed: 1, timestamp: 1 }       // Query optimization
{ projectId: 1, timestamp: -1 }                  // Analytics
```

### Lead
**Collection**: `leads`

```javascript
{
  _id: ObjectId,
  leadId: String,            // External identifier
  projectId: ObjectId,       // Reference to Project
  email: String,             // Optional (null for anonymous)
  name: String,
  company: String,
  
  // Scoring
  currentScore: Number,      // Current total score
  leadStage: String,         // "cold", "warm", "hot", "qualified"
  
  // Velocity & Engagement
  velocityScore: Number,     // 0-10 engagement intensity
  eventsLast24h: Number,     // Event count in last 24 hours
  lastEventAt: Date,         // Most recent event timestamp
  
  // Metadata
  firstSeenAt: Date,
  source: String,            // UTM source, referrer, etc.
  metadata: Object,          // Custom fields
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ projectId: 1, email: 1 }                      // Unique (identity resolution)
{ leadId: 1 }                                    // Unique
{ currentScore: -1 }                             // Leaderboard
{ leadStage: 1, currentScore: -1 }              // Filtering
```

### ScoreHistoryx
**Collection**: `score_histories`

```javascript
{
  _id: ObjectId,
  leadId: ObjectId,          // Reference to Lead
  eventId: String,           // Reference to Event (unique constraint)
  eventType: String,
  scoreDelta: Number,        // Points added/subtracted
  newScore: Number,          // Score after this event
  reason: String,            // Human-readable explanation
  timestamp: Date,           // When score changed
  createdAt: Date
}

// Indexes
{ leadId: 1, eventId: 1 }                       // Unique (idempotency)
{ leadId: 1, timestamp: -1 }                    // Timeline queries
```

### ScoringRule
**Collection**: `scoring_rules`

```javascript
{
  _id: ObjectId,
  projectId: ObjectId,       // Multi-tenant isolation
  eventType: String,         // "signup", "page_view", etc.
  points: Number,            // Score to add
  description: String,
  active: Boolean,
  
  // Conditional rules (future)
  conditions: Object,
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ projectId: 1, eventType: 1 }                  // Rule lookup
```

### User
**Collection**: `users`

```javascript
{
  _id: ObjectId,
  email: String,             // Unique
  password: String,          // Bcrypt hashed
  name: String,
  apiKey: String,            // API authentication
  projectId: ObjectId,       // Default project
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ email: 1 }                                     // Unique
{ apiKey: 1 }                                    // API key lookup
```

### AutomationRule
**Collection**: `automation_rules`

```javascript
{
  _id: ObjectId,
  projectId: ObjectId,
  name: String,
  action: String,            // "send_email", "webhook", "slack_notify"
  whenStage: String,         // Trigger stage (optional)
  minVelocity: Number,       // Minimum velocity to trigger
  enabled: Boolean,
  config: Object,            // Action-specific configuration
  createdAt: Date,
  updatedAt: Date
}
```

### AutomationExecution
**Collection**: `automation_executions`

```javascript
{
  _id: ObjectId,
  leadId: ObjectId,
  ruleId: ObjectId,
  dateBucket: String,        // "2026-02-10" (once per day)
  payload: Object,           // Execution details
  status: String,            // "executed", "failed"
  createdAt: Date
}

// Indexes
{ leadId: 1, ruleId: 1, dateBucket: 1 }        // Unique (prevent duplicates)
```

### FailedJob
**Collection**: `failed_jobs`

```javascript
{
  _id: ObjectId,
  jobId: String,
  jobData: Object,           // Original job payload
  error: String,             // Error message
  errorStack: String,        // Stack trace
  attempts: Number,
  queueName: String,
  failedAt: Date,
  retried: Boolean,          // Manual retry flag
  createdAt: Date
}
```

---

## API Structure

### Authentication Endpoints
**Base**: `/api/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create new user account |
| POST | `/login` | Authenticate and get JWT |
| POST | `/generate-api-key` | Generate API key for webhooks |

### Event Endpoints
**Base**: `/api/events`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Ingest single event |
| POST | `/batch` | Ingest multiple events |
| GET | `/` | List events (filtered) |

### Lead Endpoints
**Base**: `/api/leads`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all leads (paginated) |
| GET | `/:id` | Get lead details |
| GET | `/:id/timeline` | Get lead activity timeline |
| GET | `/:id/intelligence` | Get AI-driven insights |
| PUT | `/:id` | Update lead metadata |
| DELETE | `/:id` | Delete lead |

### Scoring Rule Endpoints
**Base**: `/api/scoring-rules`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all rules |
| POST | `/` | Create new rule |
| PUT | `/:id` | Update rule |
| DELETE | `/:id` | Delete rule |

### Leaderboard Endpoints
**Base**: `/api/leaderboard`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Top leads by score |
| GET | `/by-stage` | Leads grouped by stage |

### Webhook Endpoints
**Base**: `/api/webhooks`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/subscribe` | Register webhook URL |
| GET | `/` | List subscriptions |
| DELETE | `/:id` | Unsubscribe |

### SDK
**Base**: `/sdk`

| File | Description |
|------|-------------|
| `ls.js` | JavaScript SDK for client-side tracking |
| `test.html` | SDK demo page |

---

## Worker Architecture

### Process Lead Workflow

**File**: `worker/workflows/processLeadWorkflow.js`

**Steps**:

1. **Acquire Lock**
   ```javascript
   const lockKey = `lead:${leadId}:lock`;
   await redis.set(lockKey, 'worker-1', 'EX', 30, 'NX');
   ```

2. **Fetch Unprocessed Events**
   ```javascript
   const events = await Event.find({ leadId, processed: false })
     .sort({ timestamp: 1 });
   ```

3. **Identity Resolution**
   - Detect "identify" events with email
   - Merge anonymous leads into known leads
   - Transfer all events and score history

4. **Score Calculation**
   ```javascript
   for (const event of events) {
     const rule = await getRule(event.eventType);
     const scoreDelta = rule.points;
     
     await ScoreHistory.create({
       leadId,
       eventId: event.eventId,
       scoreDelta,
       newScore: currentScore + scoreDelta
     });
     
     currentScore += scoreDelta;
   }
   ```

5. **Apply Score Decay**
   ```javascript
   const daysSinceLastEvent = (now - lastEventAt) / (1000 * 60 * 60 * 24);
   if (daysSinceLastEvent > 7) {
     const decayRate = 0.05;
     currentScore *= Math.pow(1 - decayRate, daysSinceLastEvent - 7);
   }
   ```

6. **Stage Calculation**
   ```javascript
   let stage = 'cold';
   if (currentScore >= 100) stage = 'qualified';
   else if (currentScore >= 60) stage = 'hot';
   else if (currentScore >= 30) stage = 'warm';
   ```

7. **Velocity Calculation**
   ```javascript
   const eventsLast24h = await Event.countDocuments({
     leadId,
     timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
   });
   
   const velocityScore = Math.min(10, eventsLast24h);
   ```

8. **Persist Updates**
   ```javascript
   await Lead.updateOne({ _id: leadId }, {
     currentScore,
     leadStage: stage,
     velocityScore,
     eventsLast24h,
     lastEventAt: new Date()
   });
   ```

9. **Mark Events Processed**
   ```javascript
   await Event.updateMany(
     { _id: { $in: eventIds } },
     { $set: { processed: true } }
   );
   ```

10. **Release Lock**
    ```javascript
    await redis.del(lockKey);
    ```

### Automation Engine

**File**: `worker/domain/automationEngine.js`

**Trigger Conditions**:
- Lead reaches specific stage
- Velocity exceeds threshold
- Score crosses boundary

**Actions**:
- Webhook POST request
- Email notification
- Slack message
- CRM update (future)

**Idempotency**: One execution per rule per day per lead (dateBucket)

### Lock Recovery

**File**: `worker/utils/recoverLocks.js`

**Purpose**: Clean up stale locks from crashed workers

**Logic**:
- Runs every 60 seconds
- Finds locks older than 2 minutes
- Deletes expired locks
- Re-queues affected leads

---

## Frontend Architecture

### Technology Choices

- **Vite**: Fast build tool with HMR
- **React Router**: Client-side routing
- **Context API**: Global state (auth, theme)
- **Axios**: HTTP client with interceptors
- **Socket.IO Client**: Real-time updates
- **Chart.js/Recharts**: Data visualization
- **Tailwind CSS**: Utility-first styling

### State Management

**Auth Context** (`contexts/AuthContext.jsx`):
```javascript
{
  user: { id, email, name },
  token: "jwt_token",
  login: (email, password) => {},
  logout: () => {},
  isAuthenticated: boolean
}
```

**Socket Context** (`sockets/socket.js`):
```javascript
{
  socket: SocketIO.Client,
  connected: boolean,
  on: (event, callback) => {},
  emit: (event, data) => {}
}
```

### Real-time Updates

```javascript
// Listen for lead updates
socket.on('leadUpdated', (data) => {
  // Refresh dashboard
  // Update lead detail if viewing that lead
  // Show notification
});

socket.on('newLead', (data) => {
  // Add to leads list
  // Update count
});
```

### API Client

**File**: `frontend/src/api.js`

```javascript
const api = axios.create({
  baseURL: process.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: Add JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Logout user
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Infrastructure & Deployment

### Docker Compose Setup

**File**: `docker-compose.yml`

**Services**:

1. **MongoDB** (Port 27017)
   - Image: `mongo:6`
   - Volume: `mongo-data`
   - Health check: `mongosh --eval "db.adminCommand('ping')"`

2. **Redis** (Port 6379)
   - Image: `redis:7`
   - No persistence (queue data is transient)

3. **API** (Port 4000)
   - Build: `api/Dockerfile`
   - Depends on: mongo, redis
   - Auto-restart: `unless-stopped`

4. **Worker** (Port 5000)
   - Build: `worker/Dockerfile`
   - Depends on: mongo, redis
   - Auto-restart: `unless-stopped`

### Environment Variables

**.env.example**:
```bash
# Database
MONGO_URI=mongodb://mongo:27017/lead-scoring

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS=false

# API
NODE_ENV=production
PORT=4000
JWT_SECRET=your-secret-key-here
FRONTEND_URL=https://your-frontend.vercel.app

# Worker
WORKER_CONCURRENCY=5
```

### Deployment (Render.com)

**File**: `render.yaml`

**Services**:
- Web Service (API)
- Background Worker
- MongoDB (managed)
- Redis (managed)

### Frontend Deployment (Vercel)

**File**: `frontend/vercel.json`

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Build Command**: `npm run build`
**Output Directory**: `dist`

---

## Security & Authentication

### Authentication Methods

1. **JWT (JSON Web Tokens)**
   - Used for: Frontend session management
   - Expiration: 7 days
   - Storage: localStorage (frontend)
   - Header: `Authorization: Bearer <token>`

2. **API Keys**
   - Used for: Webhook integrations
   - Header: `X-API-Key: <key>`
   - Generation: `/api/auth/generate-api-key`

### Middleware Stack

```javascript
// authMiddleware.js
async function authenticate(req, res, next) {
  // 1. Check JWT token
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  }
  
  // 2. Check API key
  const apiKey = req.headers['x-api-key'];
  if (apiKey) {
    const user = await User.findOne({ apiKey });
    if (user) {
      req.user = user;
      return next();
    }
  }
  
  // 3. Unauthorized
  res.status(401).json({ error: 'Authentication required' });
}
```

### Rate Limiting

**File**: `api/middleware/rateLimiter.js`

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: req.rateLimit.resetTime
    });
  }
});
```

### CORS Configuration

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://lead-scoring-system-brown.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));
```

---

## Scalability & Performance

### Horizontal Scaling

**API Server**:
- Stateless design (no in-memory sessions)
- Load balancer compatible
- Shared Redis for rate limiting

**Worker**:
- Configurable concurrency (`WORKER_CONCURRENCY`)
- Multiple worker instances supported
- Distributed locking prevents conflicts

### Performance Optimizations

1. **Database Indexes**:
   - Event lookups: `{ leadId: 1, processed: 1, timestamp: 1 }`
   - Leaderboard: `{ currentScore: -1 }`
   - Identity: `{ projectId: 1, email: 1 }`

2. **Caching**:
   - Scoring rules cached in worker memory
   - Redis for distributed locks
   - Mongoose model caching

3. **Queue Optimization**:
   - Job deduplication by leadId
   - Exponential backoff for retries
   - Rate limiting (200 jobs/sec)

4. **Connection Pooling**:
   - MongoDB: `maxPoolSize: 10`
   - Redis: Persistent connection per service

### Monitoring Points

- Queue depth (Bull metrics)
- Event processing latency
- Failed job rate
- Lock acquisition failures
- Database query performance
- API endpoint response times

---

## Monitoring & Observability

### Logging

**Structured Logs** (`worker/utils/logger.js`):
```javascript
logger.info('Event processed', {
  leadId: 'lead_123',
  eventType: 'signup',
  scoreDelta: 20,
  duration: 45
});
```

**Log Levels**:
- `error`: System failures, exceptions
- `warn`: Degraded performance, retries
- `info`: Business events (event processed, lead scored)
- `debug`: Detailed debugging info

### Health Checks

**API**: `GET /health`
```json
{
  "status": "ok",
  "uptime": 3600,
  "mongodb": "connected",
  "redis": "connected"
}
```

**Worker**: `GET /health` (Port 5000)
```json
{
  "status": "ok",
  "service": "worker",
  "mongodb": "connected"
}
```

### Queue Observability

**Bull Events**:
```javascript
eventQueue.on('ready', () => console.log('Queue ready'));
eventQueue.on('completed', (job) => console.log(`Job ${job.id} completed`));
eventQueue.on('failed', (job, err) => console.error(`Job ${job.id} failed`));
eventQueue.on('stalled', (job) => console.warn(`Job ${job.id} stalled`));
```

### Metrics to Track

- **Throughput**: Events/second ingested
- **Latency**: Event ingestion → score update time
- **Queue Depth**: Pending jobs count
- **Error Rate**: Failed jobs / total jobs
- **Lock Contention**: Lock acquisition failures
- **Stage Distribution**: Leads per stage
- **Velocity Trends**: High-velocity leads count

---

## Summary

This Lead Scoring System is a **production-grade, event-driven application** that demonstrates:

✅ **Asynchronous Architecture** with message queues  
✅ **Idempotency** via unique event IDs and database constraints  
✅ **Ordering Guarantees** through timestamp sorting and locks  
✅ **Audit Trail** with immutable event history  
✅ **Real-time Updates** via WebSockets  
✅ **Horizontal Scalability** through stateless design  
✅ **Multi-tenancy** with project isolation  
✅ **Automation** with rule-based workflows  
✅ **Intelligence** with velocity, risk, and stage analysis  
✅ **Developer Experience** with feature-based organization  

**Key Differentiators**:
- Identity resolution (anonymous → known lead merging)
- Score decay over time
- Distributed locking for race condition prevention
- Dead letter queue for failed jobs
- SDK for easy client integration
- Comprehensive API with intelligence endpoints

This architecture is designed for **reliability, scalability, and maintainability** in production environments.
