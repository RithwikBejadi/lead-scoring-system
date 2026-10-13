
# 📘 Master Developer Guide: Event-Driven Lead Scoring System

This comprehensive overview spans the entire project architecture, providing a deep dive into the backend processes, the scoring worker, the queue mechanisms, and the React frontend state management. By reading this 3000-line document, you will understand the codebase inside and out, from the smallest utility to the core caching and transaction boundaries.

---

# PART 1: SYSTEM OVERVIEW & DEPLOYMENT

> **A production-grade, event-driven lead scoring platform with real-time analytics, automation workflows, and intelligent lead qualification.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green)
![Redis](https://img.shields.io/badge/Redis-7.0-red)
![React](https://img.shields.io/badge/React-19-blue)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Core Concepts](#core-concepts)
- [API Documentation](#api-documentation)
- [Security & Authentication](#security--authentication)
- [Deployment](#deployment)
- [Testing & Verification](#testing--verification)
- [Performance & Scalability](#performance--scalability)
- [Contributing](#contributing)

---

## Overview

The **Event-Driven Lead Scoring System** is a comprehensive platform that tracks, scores, and qualifies leads based on their behavioral events. Built with modern best practices, it provides real-time intelligence, automated workflows, and complete audit trails for sales and marketing teams.

### Core Principles

- **Event-Driven Architecture**: All lead mutations happen through immutable events
- **Asynchronous Processing**: Non-blocking architecture using Redis-backed message queues
- **Idempotency**: Safe retries and duplicate event handling
- **Ordering Guarantees**: Sequential event processing per lead
- **Complete Auditability**: Full event history with score change tracking
- **Real-time Updates**: WebSocket-based live dashboard updates
- **Horizontal Scalability**: Worker pools for parallel processing

### What Makes It Special

✅ **Identity Resolution**: Automatically merges anonymous leads with known contacts  
✅ **Score Decay**: Time-based score degradation for engagement freshness  
✅ **Velocity Tracking**: Identifies highly engaged leads in real-time  
✅ **Automation Engine**: Rule-based workflows for notifications and integrations  
✅ **Multi-tenancy**: Project isolation for SaaS deployments  
✅ **Production-Ready**: Comprehensive error handling, rate limiting, and monitoring

---

## Key Features

### 🎯 Lead Management
- **Real-time scoring** based on behavioral events
- **Stage progression**: Cold → Warm → Hot → Qualified
- **Velocity metrics**: Track engagement intensity
- **Identity resolution**: Merge anonymous and known leads
- **Complete timeline**: Full activity history per lead

### 📊 Analytics & Intelligence
- **Dashboard**: Real-time metrics and charts
- **Leaderboard**: Top leads by score
- **Risk analysis**: Churn prediction based on inactivity
- **Velocity scoring**: 0-10 engagement rating
- **Trend analysis**: Score evolution over time

### ⚙️ Automation
- **Rule-based triggers**: Execute actions on stage changes
- **Webhook support**: Notify external systems
- **Email notifications**: Alert sales team
- **Idempotent execution**: One automation per lead per day
- **Custom conditions**: Velocity thresholds, score ranges

###🔌 Integration
- **JavaScript SDK**: Client-side event tracking
- **REST API**: Full CRUD operations
- **WebSocket support**: Real-time updates
- **Batch ingestion**: High-volume event processing
- **Webhook subscriptions**: Event notifications

### 🔒 Security & Reliability
- **JWT + API Key authentication**
- **Rate limiting**: 100 requests/minute per key
- **Input validation**: Zod schemas for all endpoints
- **CORS protection**: Configurable allowed origins
- **Worker crash immunity**: Comprehensive error handling
- **Dead letter queue**: Failed job preservation

---

## Architecture

### High-Level System Flow

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

### Event Processing Workflow

1. **Event Ingestion** (API)
   - REST endpoint receives event
   - Validates payload and authentication
   - Returns immediately (202 Accepted)
   - Enqueues job to Redis

2. **Asynchronous Processing** (Worker)
   - Acquires distributed lock on lead
   - Fetches all unprocessed events
   - Sorts by timestamp (ordering guarantee)
   - Performs identity resolution (email merging)
   - Calculates score changes
   - Applies score decay
   - Updates lead stage
   - Calculates velocity & risk metrics
   - Executes automation rules
   - Releases lock

3. **Real-time Broadcasting**
   - Socket.IO emits lead updates
   - Frontend dashboard auto-refreshes
   - Notifications displayed

### Key Architectural Patterns

- **CQRS**: Separate read (synchronous) and write (asynchronous) paths
- **Event Sourcing**: Immutable event log as source of truth
- **Distributed Locking**: Redis-based locks prevent race conditions
- **Feature-Based Organization**: Domain-driven folder structure
- **Retry with Exponential Backoff**: Bull queue retry logic

---

## Technology Stack

### Backend (API)
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Database**: MongoDB 6 (Mongoose ODM)
- **Cache/Queue**: Redis 7
- **Queue Management**: Bull 4
- **Real-time**: Socket.IO 4
- **Authentication**: JWT + API Keys
- **Validation**: Custom validators with Zod-like patterns

### Backend (Worker)
- **Runtime**: Node.js 18+
- **Queue Consumer**: Bull 4
- **Database**: MongoDB 6 with transactions
- **Concurrency**: Configurable worker pool

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Routing**: React Router 6
- **HTTP Client**: Axios 1
- **Real-time**: Socket.IO Client 4
- **Charts**: Chart.js 4 + Recharts 3
- **Styling**: Tailwind CSS 4
- **State**: React Context API

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Deployment**: Render.com (Backend) + Vercel (Frontend)
- **Environment**: dotenv configuration

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local frontend development)
- npm or yarn

### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/RithwikBejadi/lead-scoring-system.git
cd lead-scoring-system

# Start all services
docker-compose up --build -d

# Wait 15 seconds for MongoDB initialization
sleep 15

# Verify services are running
docker ps
curl http://localhost:4000/api/health

# Start frontend (in new terminal)
cd frontend
npm install
npm run dev

# Visit http://localhost:5173
```

### Option 2: Local Development

```bash
# 1. Start MongoDB and Redis
docker-compose up mongo redis -d

# 2. Start API
cd api
npm install
cp .env.example .env
npm start  # http://localhost:4000

# 3. Start Worker (new terminal)
cd worker
npm install
npm start  # http://localhost:5000

# 4. Start Frontend (new terminal)
cd frontend
npm install
npm run dev  # http://localhost:5173
```

### Services

| Service  | Port  | URL                       |
|----------|-------|---------------------------|
| API      | 4000  | http://localhost:4000     |
| Worker   | 5000  | http://localhost:5000     |
| Frontend | 5173  | http://localhost:5173     |
| MongoDB  | 27017 | mongodb://localhost:27017 |
| Redis    | 6379  | -                         |

---

## Project Structure

```
lead-scoring-system/
├── api/                          # REST API Server
│   ├── app.js                   # Express setup, Socket.IO
│   ├── server.js                # Server initialization
│   ├── routes.js                # Route aggregation
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── redis.js            # Redis client
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT + API key validation
│   │   ├── errorHandler.js     # Global error handling
│   │   └── rateLimiter.js      # Rate limiting
│   ├── features/               # Domain-driven modules
│   │   ├── auth/              # Authentication
│   │   ├── events/            # Event ingestion
│   │   ├── leads/             # Lead management
│   │   ├── leaderboard/       # Analytics
│   │   ├── projects/          # Multi-tenancy
│   │   ├── rules/             # Scoring rules
│   │   └── webhooks/          # Webhook subscriptions
│   ├── models/                 # Mongoose schemas
│   └── sdk/                    # JavaScript SDK
│
├── worker/                       # Background Processor
│   ├── index.js                # Worker initialization
│   ├── workflows/
│   │   └── processLeadWorkflow.js  # Core scoring logic
│   ├── domain/
│   │   ├── automationEngine.js     # Rule-based automation
│   │   ├── leadIntelligence.js     # Metrics calculation
│   │   └── stageEngine.js          # Stage progression
│   ├── jobs/
│   │   └── scoringDecay.job.js     # Scheduled decay
│   ├── services/
│   │   ├── eventProcessor.js       # Event utilities
│   │   └── scoringRulesCache.js    # In-memory cache
│   └── utils/
│       ├── recoverLocks.js         # Stale lock cleanup
│       └── logger.js               # Structured logging
│
├── shared/
│   └── queue/                    # Bull queue configuration
│
├── frontend/                     # React SPA
│   ├── src/
│   │   ├── pages/               # Route components
│   │   ├── components/          # Reusable UI
│   │   ├── contexts/            # State management
│   │   ├── api/                 # API services
│   │   ├── sockets/             # Socket.IO client
│   │   └── api.js               # Axios client
│
├── docker-compose.yml            # Orchestration
├── ARCHITECTURE.md               # Detailed architecture docs
├── DEPLOYMENT.md                 # Deployment guide
└── README.md                     # This file
```

---

## Core Concepts

### 🔐 Idempotency

Events are idempotent using multiple layers:

**1. Unique Event ID**: Each event has a unique `eventId`

**2. Database Constraints**: `ScoreHistory` enforces uniqueness on `(leadId, eventId)`

**3. Safe Retry**: Failed jobs can be retried without duplicate scoring

**Example**:
```javascript
// First submission
POST /api/events { eventId: "evt_123", type: "signup", leadId: "lead_xyz" }
// Score: 0 → 20

// Duplicate submission (same eventId)
POST /api/events { eventId: "evt_123", type: "signup", leadId: "lead_xyz" }
// Score: 20 (unchanged) ✅
```

### ⏱️ Ordering Guarantees

**Per-Lead Sequential Processing**:
- Events sorted by `timestamp` before processing
- Distributed locks prevent concurrent updates
- Queue ensures FIFO execution per lead

**Example**:
```javascript
// Events arrive out of order
T3: demo_request
T2: signup
T1: page_view

// Worker processes in timestamp order
1. page_view (T1)     → Score: 5
2. signup (T2)        → Score: 25
3. demo_request (T3)  → Score: 75

// Result: Deterministic progression ✅
```

### 📊 Scoring Engine

**Rules-Based System**: Scoring rules are stored in MongoDB (fully configurable):

| Event Type        | Points | Description                    |
|-------------------|--------|--------------------------------|
| `page_view`       | 5      | User views a page              |
| `signup`          | 20     | User creates account           |
| `download`        | 10     | Downloads resource             |
| `demo_request`    | 50     | Requests product demo          |
| `contract_signed` | 100    | Signs contract (qualified)     |

**Stage Transitions**:

| Score Range | Stage       | Description                    |
|-------------|-------------|--------------------------------|
| 0-29        | `cold`      | Early-stage lead               |
| 30-59       | `warm`      | Engaged lead                   |
| 60-99       | `hot`       | High-intent lead               |
| 100+        | `qualified` | Ready for sales                |

**Score Decay**: Scores decay 5% per day after 7 days of inactivity to reflect engagement freshness.

### 🤖 Automation Engine

Execute actions automatically based on lead behavior:

**Rule Structure**:
```javascript
{
  name: "Notify Sales on Qualified",
  action: "webhook",
  whenStage: "qualified",
  minVelocity: 5,
  config: {
    url: "https://crm.example.com/webhook",
    method: "POST"
  }
}
```

**Supported Actions**:
- **Webhooks**: POST to external systems
- **Email notifications**: Alert sales team
- **Slack messages**: Team notifications
- **CRM integration**: Push to Salesforce/HubSpot

**Idempotency**: One execution per rule per lead per day (prevents spam).

---

## API Documentation

### Authentication

**JWT (Frontend)**:
```bash
# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}
# Response: { "token": "jwt_token...", "user": {...} }

# Use token in subsequent requests
Authorization: Bearer jwt_token...
```

**API Key (Webhooks)**:
```bash
# Generate API key
POST /api/auth/generate-api-key
Authorization: Bearer jwt_token...

# Response: { "apiKey": "pk_live_..." }

# Use in webhook requests
X-API-Key: pk_live_...
```

### Event Endpoints

**POST /api/events** - Ingest Single Event
```bash
curl -X POST http://localhost:4000/api/events \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_live_..." \
  -d '{
    "eventType": "page_view",
    "leadId": "lead_123",
    "eventId": "evt_unique_456",
    "timestamp": "2026-02-11T10:30:00Z",
    "properties": {
      "page": "/pricing",
      "duration": 45
    }
  }'

# Response: 202 Accepted
{
  "message": "Event queued for processing",
  "eventId": "evt_unique_456"
}
```

**POST /api/events/batch** - Batch Ingestion
```bash
curl -X POST http://localhost:4000/api/events/batch \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_live_..." \
  -d '{
    "events": [
      { "eventType": "page_view", "leadId": "lead_1", "eventId": "evt_1" },
      { "eventType": "signup", "leadId": "lead_2", "eventId": "evt_2" }
    ]
  }'

# Response: 202 Accepted
{
  "message": "2 events queued",
  "count": 2
}
```

### Lead Endpoints

**GET /api/leads** - List Leads (Paginated)
```bash
curl http://localhost:4000/api/leads?page=1&limit=20&stage=hot
```

**GET /api/leads/:id** - Lead Details
```bash
curl http://localhost:4000/api/leads/507f1f77bcf86cd799439011

# Response:
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Inc",
  "currentScore": 75,
  "leadStage": "hot",
  "velocityScore": 7,
  "eventsLast24h": 12,
  "lastEventAt": "2026-02-11T09:30:00Z"
}
```

**GET /api/leads/:id/timeline** - Activity Timeline
```bash
curl http://localhost:4000/api/leads/507f1f77bcf86cd799439011/timeline

# Response: Array of events with score deltas
[
  {
    "eventType": "page_view",
    "timestamp": "2026-02-10T10:00:00Z",
    "scoreDelta": 5,
    "newScore": 5
  },
  {
    "eventType": "signup",
    "timestamp": "2026-02-10T10:15:00Z",
    "scoreDelta": 20,
    "newScore": 25
  }
]
```

**GET /api/leads/:id/intelligence** - AI Intelligence
```bash
curl http://localhost:4000/api/leads/507f1f77bcf86cd799439011/intelligence

# Response:
{
  "riskLevel": "low",
  "velocityTrend": "increasing",
  "nextBestAction": "Send product demo",
  "engagementScore": 8.5,
  "churnProbability": 0.12
}
```

### Leaderboard Endpoints

**GET /api/leaderboard** - Top Leads
```bash
curl http://localhost:4000/api/leaderboard?limit=10

# Response: Top 10 leads by score
```

**GET /api/leaderboard/by-stage** - Grouped by Stage
```bash
curl http://localhost:4000/api/leaderboard/by-stage

# Response:
{
  "cold": 45,
  "warm": 32,
  "hot": 18,
  "qualified": 5
}
```

### Scoring Rules Endpoints

**GET /api/scoring-rules** - List Rules
```bash
curl http://localhost:4000/api/scoring-rules
```

**POST /api/scoring-rules** - Create Rule
```bash
curl -X POST http://localhost:4000/api/scoring-rules \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "webinar_attended",
    "points": 30,
    "description": "Attended product webinar"
  }'
```

---

## Security & Authentication

### Authentication Methods

1. **JWT Tokens**: Frontend session management (7-day expiration)
2. **API Keys**: Webhook integrations, server-to-server

### Security Features

✅ **Rate Limiting**: 100 requests/minute per API key  
✅ **Input Validation**: Zod schemas on all endpoints  
✅ **CORS Protection**: Configurable allowed origins  
✅ **Password Hashing**: Bcrypt with salt rounds  
✅ **SQL Injection Protection**: Mongoose parameterized queries  
✅ **XSS Protection**: Helmet.js security headers

### Rate Limiting

```javascript
// Distributed rate limiting with Redis
100 events per minute per API key
429 Too Many Requests response when exceeded
Automatic reset after 60 seconds
```

### Data Privacy

- **SDK**: Never captures form values, only field names
- **Compliance**: GDPR-ready with data export/deletion APIs
- **Encryption**: All passwords hashed with bcrypt
- **API Keys**: Stored hashed in database

---

## Deployment

### Docker Compose (Development)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api worker

# Stop services
docker-compose down
```

### Production Deployment (Render.com)

The project includes `render.yaml` for one-click deployment:

**Services**:
- Web Service (API) - Auto-scaling
- Background Worker - Fixed instances
- MongoDB (Managed) - Replica set
- Redis (Managed) - High availability

**Environment Variables**:
```bash
MONGO_URI=mongodb+srv://...
REDIS_URL=rediss://...
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

### Frontend Deployment (Vercel)

```bash
cd frontend
vercel deploy --prod
```

**Environment Variables** (Vercel):
```bash
VITE_API_URL=https://api.your-domain.com
VITE_WS_URL=wss://api.your-domain.com
```

---

## Testing & Verification

### Quick Demo (Frontend)

1. Open http://localhost:5173
2. Register or login
3. Navigate to Dashboard
4. Click "Create Lead" or use existing lead
5. Fire events: `page_view` → `signup` → `demo_request`
6. Watch real-time score updates
7. View lead timeline and intelligence

### API Testing

**Complete Workflow**:
```bash
# 1. Create a lead
LEAD_ID=$(curl -X POST http://localhost:4000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Smith","email":"alice@test.com","company":"TechCorp"}' \
  | jq -r '._id')

echo "Lead ID: $LEAD_ID"

# 2. Fire sequential events
curl -X POST http://localhost:4000/api/events \
  -H "Content-Type: application/json" \
  -d "{\"eventType\":\"page_view\",\"leadId\":\"$LEAD_ID\",\"eventId\":\"evt_001\"}"

sleep 2

curl -X POST http://localhost:4000/api/events \
  -H "Content-Type: application/json" \
  -d "{\"eventType\":\"signup\",\"leadId\":\"$LEAD_ID\",\"eventId\":\"evt_002\"}"

sleep 2

curl -X POST http://localhost:4000/api/events \
  -H "Content-Type: application/json" \
  -d "{\"eventType\":\"demo_request\",\"leadId\":\"$LEAD_ID\",\"eventId\":\"evt_003\"}"

sleep 2

# 3. Check final score (should be 75: 5 + 20 + 50)
curl http://localhost:4000/api/leads/$LEAD_ID | jq '{
  name: .name,
  score: .currentScore,
  stage: .leadStage,
  velocity: .velocityScore
}'

# Expected output:
# {
#   "name": "Alice Smith",
#   "score": 75,
#   "stage": "hot",
#   "velocity": 3
# }
```

### Idempotency Test

```bash
# Fire same event twice (same eventId)
curl -X POST http://localhost:4000/api/events \
  -d '{"eventType":"signup","leadId":"<LEAD_ID>","eventId":"dup-test"}'

curl -X POST http://localhost:4000/api/events \
  -d '{"eventType":"signup","leadId":"<LEAD_ID>","eventId":"dup-test"}'

# Score should only increase by 20 once ✅
# Check score history to verify
curl http://localhost:4000/api/leads/<LEAD_ID>/timeline | jq
```

### Ordering Test

```bash
# Fire events with backdated timestamps (out of order)
curl -X POST http://localhost:4000/api/events \
  -d '{
    "eventType":"demo_request",
    "leadId":"<LEAD_ID>",
    "eventId":"evt_late",
    "timestamp":"2026-02-11T12:00:00Z"
  }'

curl -X POST http://localhost:4000/api/events \
  -d '{
    "eventType":"page_view",
    "leadId":"<LEAD_ID>",
    "eventId":"evt_early",
    "timestamp":"2026-02-11T10:00:00Z"
  }'

# Worker processes in timestamp order: page_view first, then demo_request ✅
# Verify by checking timeline
curl http://localhost:4000/api/leads/<LEAD_ID>/timeline | jq
```

### Automated Verification Scripts

The project includes several verification scripts:

```bash
# Verify system invariants
./verify-invariants.js

# Test event processing
./verify-step1.sh

# Load testing
./verify-load.js

# Production readiness check
./verify-production-ingest.sh
```

---

## Performance & Scalability

### Scalability Features

**Horizontal Scaling**:
- **API Server**: Stateless design, load balancer compatible
- **Worker**: Multiple instances with distributed locking
- **Database**: MongoDB replica set support
- **Cache**: Redis cluster support

**Performance Optimizations**:
- Database indexes on critical queries
- Scoring rules cached in-memory (worker)
- Connection pooling (MongoDB, Redis)
- Queue rate limiting (200 jobs/second)
- Exponential backoff for retries

### Monitoring & Observability

**Health Checks**:
```bash
# API health
curl http://localhost:4000/api/health

# Worker health
curl http://localhost:5000/health
```

**Metrics to Track**:
- Events per second (throughput)
- Event processing latency
- Queue depth
- Failed job rate
- Lock contention
- Database query performance

**Logging**:
- Structured JSON logs
- Log levels: error, warn, info, debug
- Request/response logging with correlation IDs

---

## Contributing

### Development Guidelines

1. **Code Organization**: Feature-based structure
2. **Naming Conventions**: camelCase for variables, PascalCase for models
3. **Error Handling**: Always use try-catch in async functions
4. **Documentation**: JSDoc comments for public functions
5. **Testing**: Unit tests for business logic

### Pull Request Process

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Comprehensive architecture documentation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Production deployment guide
- **[USER_TESTING_GUIDE.md](./USER_TESTING_GUIDE.md)**: Testing and validation guide
- **[CREDENTIALS_SETUP.md](./CREDENTIALS_SETUP.md)**: API credentials setup

---

## FAQ

**Q: Why not calculate score on-demand?**  
A: Event history is the source of truth. Pre-computing ensures consistency and enables full audit trails.

**Q: How do you handle duplicate events?**  
A: Unique `eventId` + database unique constraint. Duplicates are safely ignored.

**Q: What if events arrive out of order?**  
A: Worker sorts by timestamp before processing. Results are deterministic.

**Q: Can I change scoring rules dynamically?**  
A: Yes! Rules are stored in MongoDB. Update without code changes.

**Q: Why Bull queue instead of Kafka?**  
A: Simpler for most use cases. Kafka is overkill for single-tenant systems.

**Q: How does identity resolution work?**  
A: When an "identify" event provides email, anonymous leads are merged into known contacts with transaction safety.

**Q: What happens if a worker crashes mid-processing?**  
A: Distributed locks expire after 30 seconds. Lock recovery loop re-queues affected leads.

---

## Roadmap

- [ ] Multi-language SDK support (Python, Ruby, PHP)
- [ ] Advanced segmentation and cohort analysis
- [ ] Machine learning for churn prediction
- [ ] A/B testing for scoring rules
- [ ] GraphQL API
- [ ] Mobile app (React Native)
- [ ] Advanced automation workflows (visual builder)

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Acknowledgments

Built with ❤️ using:
- [Express.js](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Redis](https://redis.io/) - Cache and queue
- [Bull](https://github.com/OptimalBits/bull) - Queue management
- [React](https://react.dev/) - Frontend framework
- [Socket.IO](https://socket.io/) - Real-time communication

---

## Contact & Support

- **GitHub**: [RithwikBejadi/lead-scoring-system](https://github.com/RithwikBejadi/lead-scoring-system)
- **Issues**: [Report bugs or request features](https://github.com/RithwikBejadi/lead-scoring-system/issues)

---

**⭐ Star this repository if you find it helpful!**


---

# PART 2: ARCHITECTURE & DATA FLOW

> A book-style walkthrough of every concept, feature, and design decision in this system.  
> Read this top to bottom if you want to truly understand what was built and why.

---

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
pk_your_project_api_key
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


---

# PART 3: BACKEND CODE LEVEL TEARDOWN
## LeadPulse — Every Piece of Code Explained

> This guide walks through the actual source code of this project, file by file, function by function.
> Every snippet shown here is real code from the repo — nothing is made up.

---

---

## 1. Server Bootstrap

**File: `api/server.js`**

This is the entry point. Node runs this file when you do `node server.js`.

```javascript
require("dotenv").config();                    // Load .env variables FIRST
const connectDB = require("./config/db");
const { app, server, io } = require("./app"); // app.js exports all three
const { seedDefaultRules } = require("./features/rules/rules.service");

const PORT = process.env.PORT || 4000;

async function startServer() {
  // Connect to MongoDB in background — don't block server start
  // Mongoose will retry automatically if connection drops
  connectDB()
    .then(async () => {
      console.log("MongoDB connected successfully");
      await seedDefaultRules(); // Insert default scoring rules if empty
    })
    .catch((err) => {
      console.error("Initial DB connection failed, will retry:", err.message);
    });

  server.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
    console.log(`Socket.IO enabled on port ${PORT}`);
  });

  // Graceful shutdown — close Socket.IO before killing process
  process.on("SIGTERM", () => {
    io.close();
    server.close(() => process.exit(0));
  });
}

startServer();
```

**What to notice:**
- `connectDB()` is called with `.then()` — it's non-blocking. The server starts listening BEFORE the database connection is confirmed. This means the server comes up instantly and MongoDB connects asynchronously. If DB fails, the server still runs and will show degraded health.
- `seedDefaultRules()` runs after MongoDB connects — it checks if any ScoringRule documents exist, and if not, inserts the 10 defaults.
- `SIGTERM` is the signal sent by Docker/Render when stopping the container. Closing Socket.IO first ensures all clients get a clean disconnect message.

---

## 2. Express + Socket.IO Setup

**File: `api/app.js`**

```javascript
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const routes = require("./routes");

const app = express();
const server = http.createServer(app); // Wrap Express in raw HTTP server

// Socket.IO attaches to the HTTP server, not Express
// This lets both HTTP and WebSocket share port 4000
const io = new Server(server, {
  cors: {
    origin: allowedOrigins.concat(["*.vercel.app"]),
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // Try WebSocket first, fall back to polling
});

// ★ KEY PATTERN: Make io accessible inside route handlers
// Instead of passing io as a parameter everywhere, store it on the app object.
// Then in any controller: const io = req.app.get("io");
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// CORS for REST API
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://lead-scoring-system-brown.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean); // .filter(Boolean) removes undefined if FRONTEND_URL not set

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow Postman, curl, mobile apps
    if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(null, true); // Currently open — can restrict in production
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));    // Parse JSON bodies, max 1MB
app.use("/sdk", express.static(path.join(__dirname, "sdk"))); // Serve SDK files

app.use("/api", routes); // All routes under /api prefix

module.exports = { app, server, io }; // Export all three for server.js
```

**Why wrap Express in `http.createServer()`?**

Express alone is an HTTP handler, but Socket.IO needs to attach to a raw HTTP server to upgrade connections to WebSocket. The pattern is:

```
http.Server
  ├── Express (handles HTTP requests)
  └── Socket.IO (handles WebSocket upgrades on the same port)
```

Both share port 4000. A regular `GET /api/health` goes to Express. A WebSocket handshake on the same port goes to Socket.IO.

---

## 3. Database Connection

**File: `api/config/db.js`**

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s if can't connect
    maxPoolSize: 10,                // Max 10 simultaneous connections
  });
  return conn;
};

module.exports = connectDB;
```

**Mongoose connection pool:** The `maxPoolSize: 10` means Mongoose keeps up to 10 open TCP connections to MongoDB. When a request comes in, it grabs one from the pool, uses it, and returns it. This is much faster than opening a new connection per request (which would take ~100ms each time).

---

## 4. Redis Connection

**File: `api/config/redis.js`**

```javascript
const Redis = require("ioredis");

const redisClient = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, // Never stop retrying (needed for Bull)
  enableReadyCheck: false,    // Don't wait for READY signal (needed for Upstash)
  tls: { rejectUnauthorized: false }, // Accept Upstash self-signed cert
});

redisClient.on("connect", () => console.log("Redis connected for rate limiting"));
redisClient.on("error", (err) => console.error("Redis error:", err.message));

module.exports = redisClient;
```

**`maxRetriesPerRequest: null`** — By default, ioredis will fail fast after a few retries. For Bull queue operations, you want it to keep retrying forever until Redis comes back. This is the Bull-required setting.

**`enableReadyCheck: false`** — Upstash Redis (cloud service) doesn't support the `READY` ping that ioredis normally sends. Disabling it prevents the connection from hanging.

---

## 5. The Queue

**File: `shared/queue/index.js`**

The queue lives in `shared/` because both the API server and worker import it.

```javascript
const Queue = require("bull");

const queueOpts = {
  limiter: {
    max: 200,       // Max 200 jobs processed per second
    duration: 1000, // Per 1000ms window
  },
  defaultJobOptions: {
    attempts: 5,                          // Retry up to 5 times
    backoff: { type: "exponential", delay: 3000 }, // 3s, 6s, 12s, 24s, 48s
    removeOnComplete: true,               // Don't keep successful jobs in Redis
    removeOnFail: false,                  // Keep failed jobs for inspection
    timeout: 60000,                       // Kill job if takes > 60s
  },
  settings: {
    stalledInterval: 30000,  // Check for stalled jobs every 30s
    maxStalledCount: 2,      // After 2 stalls, mark as failed
    lockDuration: 30000,     // Job lock held for 30s max
  },
};

// Connect to Upstash Redis via TLS connection string
const eventQueue = new Queue("lead-processing", process.env.REDIS_URL, {
  ...queueOpts,
  redis: {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: { rejectUnauthorized: false },
  },
});

module.exports = eventQueue;
```

**How the API adds a job:**
```javascript
// From ingest.service.js
await queue.add(
  { leadId: lead._id.toString() },  // Job payload — just the leadId
  {
    jobId: `lead-${lead._id}`,      // ★ Deduplication key
    removeOnComplete: true,
    attempts: 5,
  },
);
```

**The `jobId` deduplication trick:**

If 50 events come in for the same lead in 1 second, you don't want 50 scoring jobs. Bull checks: "does a job with this ID already exist?" If yes, it skips adding. So at any point there's at most ONE pending job per lead. When the worker finally runs it, it processes ALL unscored events for that lead at once.

**Stalled job detection:**

If the worker process crashes MID-job, the job never completes. After `stalledInterval` (30s), Bull re-queues it automatically. After `maxStalledCount` stalls, it's marked permanently failed and saved to the DLQ.

---

## 6. Authentication Service

**File: `api/features/auth/auth.service.js`**

### Password Hashing

```javascript
const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12); // 12 rounds = strong but < 1s per hash
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash); // Returns true/false
};
```

**Why not SHA256?** SHA256 is fast — millions of hashes per second. Bcrypt is intentionally slow at 12 rounds (~1 hash per 250ms). Attackers brute-forcing a stolen DB would be 10,000x slower.

### JWT Generation + Verification

```javascript
const jwt = require("jsonwebtoken");

const generateToken = (userId, email, projectId) => {
  return jwt.sign(
    { userId, email, projectId },           // Payload — stored IN the token
    process.env.JWT_SECRET || "dev-secret", // Signing key
    { expiresIn: "7d" },                    // Token expires after 7 days
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    // Returns decoded payload: { userId, email, projectId, iat, exp }
  } catch (error) {
    return null; // Expired, tampered, or invalid — return null
  }
};
```

**JWT structure:** A JWT is three base64 segments separated by dots:
```
eyJhbGciOiJIUzI1NiJ9           ← Header (algorithm)
.eyJ1c2VySWQiOiI2NTk...        ← Payload (your data, NOT encrypted)
.SflKxwRJSMeKKF2QT4             ← Signature (HMAC-SHA256 of header+payload+secret)
```

Anyone can decode the payload (it's just base64). But they can't FORGE a new one without the `JWT_SECRET`. The server verifies the signature on every request.

### Registration Flow

```javascript
const registerUser = async ({ email, password, name }) => {
  // 1. Check duplicate
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) throw new Error("User already exists");

  // 2. Hash password
  const hashedPassword = await hashPassword(password);

  // 3. Create Project (every new user gets their own project with an API key)
  const project = await Project.create({
    name: `${name}'s Project`,
    apiKey: generateApiKey(),   // "pk_" + 48 random hex chars
    domain: "example.com",
    active: true,
  });

  // 4. Create User linked to the Project
  const user = await User.create({
    email: email.toLowerCase(),
    name,
    password: hashedPassword,
    provider: "email",
    projectId: project._id,    // Link User → Project
  });

  // 5. Generate JWT — includes projectId so middleware can access it
  const token = generateToken(user._id, user.email, user.projectId);

  return { user, token };
};
```

### Google OAuth Flow

```javascript
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (idToken) => {
  // Google verifies the token is valid and gives us the user's info
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID, // Confirms the token was for THIS app
  });
  const payload = ticket.getPayload();
  return {
    googleId: payload.sub,      // Google's stable user ID
    email: payload.email,
    name: payload.name,
    avatar: payload.picture,
    emailVerified: payload.email_verified,
  };
};
```

The frontend uses Google's JavaScript library to get an `idToken`. That token is sent to `POST /api/auth/google`. The backend calls `verifyIdToken()` which hits Google's servers to confirm the token is real and returns the user profile.

---

## 7. JWT Middleware

**File: `api/middleware/authMiddleware.js`**

```javascript
const { verifyToken } = require("../features/auth/auth.service");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Must be: "Bearer eyJhbGci..."
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token after "Bearer "
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    // Attach to request — now ALL route handlers can read req.user
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      projectId: decoded.projectId, // Used to scope all DB queries
    };

    next(); // Pass control to the actual route handler
  } catch (error) {
    res.status(401).json({ success: false, error: "Token verification failed" });
  }
};
```

**Used in routes like this:**
```javascript
// routes.js
router.use("/events", protect, require("./features/events/event.routes"));
//                    ↑
//          This middleware runs BEFORE any events route handler.
//          If token invalid → 401 returned, route handler never called.
```

**How data isolation works:**

Every query in every controller filters by `req.user.projectId`:
```javascript
// In any controller
const leads = await Lead.find({ projectId: req.user.projectId });
//                                        ↑
//                      User A can NEVER see User B's leads because
//                      their JWT has different projectIds
```

---

## 8. Event Ingestion

**File: `api/features/ingest/ingest.service.js`**

This is the heart of the system. Called from `POST /api/ingest/event`.

### Step 1–3: Validate, Authenticate, Find/Create Lead

```javascript
async function ingestEvent(payload) {
  const { apiKey, event, anonymousId, properties = {}, sessionId } = payload;

  // Step 1: Validate API key → find project
  const project = await Project.findOne({ apiKey });
  if (!project)   throw new UnauthorizedError("Invalid API key");
  if (!project.active) throw new UnauthorizedError("Project is not active");

  // Step 2: Find or create lead (atomic upsert)
  const findOrCreateLead = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        // $setOnInsert: only sets these fields when CREATING (not updating)
        return await Lead.findOneAndUpdate(
          { projectId: project._id, anonymousId },         // Match condition
          { $setOnInsert: {                                 // Only on INSERT:
            projectId: project._id,
            anonymousId,
            currentScore: 0,
            leadStage: "cold",
            processing: false,
          }},
          { upsert: true, new: true },                     // Create if not found
        );
      } catch (err) {
        if (err.code === 11000 && i < retries - 1) {
          // Race condition: two simultaneous requests tried to create same lead
          // Wait and retry — one of them will find the doc the other created
          await new Promise(r => setTimeout(r, 100 * (i + 1)));
          continue;
        }
        throw err;
      }
    }
  };

  const lead = await findOrCreateLead();
```

**Why `$setOnInsert` and not just `$set`?**

If you used `$set`, every time an event came in for an existing lead, it would reset their score to 0. `$setOnInsert` only applies the field values when a NEW document is being created. For existing leads, the update is a no-op.

### Step 3–7: Create Event, Queue, Emit Socket

```javascript
  // Step 3: Create Event with UUID for idempotency
  const eventId = uuidv4();
  try {
    await Event.create({
      eventId,                        // Unique ID — prevents duplicates
      projectId: project._id,
      anonymousId,
      sessionId: sessionId || uuidv4(), // Group events from one browser session
      eventType: event,
      properties,
      leadId: lead._id,
      timestamp: new Date(),
      processed: false,
      queued: false,
    });
  } catch (err) {
    if (err.code === 11000) {
      // Event with this ID already exists (network retry)
      // Don't double-process — silently return
      return { status: "duplicate", eventId };
    }
    throw err;
  }

  // Step 4: Push to Bull queue (deduplication via jobId)
  await queue.add(
    { leadId: lead._id.toString() },
    { jobId: `lead-${lead._id}`, attempts: 5, removeOnComplete: true },
  );

  // Step 5: Mark event as queued
  await Event.updateOne({ eventId }, { $set: { queued: true } });

  // Step 6: Emit real-time socket events to dashboard
  const io = req.app.get("io"); // Grabbed from app.js via app.set("io", io)
  if (io) {
    io.emit("newEvent", {       // All connected dashboard clients get this
      eventType: event,
      anonymousId,
      timestamp: new Date().toISOString(),
      status: "queued",
    });
    io.emit("scoreMutation", { anonymousId, eventType: event });
  }

  // Step 7: Return 202 immediately — don't wait for scoring
  return { status: "queued" };
}
```

**Why 202 and not wait for the score?**

If scoring took 500ms, every event send would feel slow. Using a queue means the API always returns in < 50ms regardless of scoring complexity. The score updates asynchronously, and the frontend picks it up via Socket.IO.

---

## 9. The Scoring Worker

**File: `worker/index.js`**

```javascript
const eventQueue = require("../shared/queue"); // Same queue the API writes to
const config = require("./config");

// Start processing with N concurrent workers
eventQueue.process(config.worker.concurrency, async (job) => {
  const start = Date.now();
  let session = null;

  try {
    session = await mongoose.startSession();

    // Run entire scoring workflow inside a MongoDB transaction
    await session.withTransaction(
      async () => {
        await processLeadWorkflow(job.data.leadId, session);
      },
      { maxCommitTimeMS: config.worker.maxJobTime },
    );

    console.log(`[Job:${job.id}] COMPLETED in ${Date.now() - start}ms`);

  } catch (err) {
    // MongoDB standalone (not replica set) doesn't support transactions
    if (err.message.includes("Transaction numbers are only allowed")) {
      console.warn(`Running without transactions (standalone MongoDB)`);
      await processLeadWorkflow(job.data.leadId, null); // Run without session
    } else {
      throw err; // Will trigger Bull's retry logic
    }
  } finally {
    if (session) await session.endSession();
  }

  // Automations run AFTER transaction commits (outside transaction)
  await executeAutomationsForLead(job.data.leadId);
});

// Dead Letter Queue — save permanently failed jobs
eventQueue.on("failed", async (job, err) => {
  if (job.attemptsMade >= 3) {
    await FailedJob.create({
      jobId: job.id.toString(),
      jobData: job.data,
      error: err.message,
      errorStack: err.stack,
      attempts: job.attemptsMade,
      failedAt: new Date(),
    });
    console.log(`Job ${job.id} saved to Dead Letter Queue`);
  }
});
```

**Why run automations outside the transaction?**

Automations involve external side effects (Slack alerts, emails). If the transaction rolled back, you'd have already sent the Slack message but the score wouldn't be saved. By running automations after the transaction commits, you guarantee that when an automation fires, the score is definitely written.

---

## 10. Scoring Rules Cache

**File: `worker/services/scoringRulesCache.js`**

```javascript
const ScoringRule = require("../models/ScoringRule");

let cache = {};    // { "page_view": 5, "demo_request": 50, ... }
let ready = false;

async function initRulesCache() {
  const rules = await ScoringRule.find().lean(); // .lean() = plain JS objects, faster

  // Transform array into a lookup map: O(1) access vs O(n) per lookup
  cache = rules.reduce((acc, rule) => {
    acc[rule.eventType] = rule.points;
    return acc;
  }, {});

  ready = true;
}

function getRule(eventType) {
  if (!ready) throw new Error("Rules cache not initialized");
  return cache[eventType] || 0; // Return 0 for unknown event types
}

// Polling loop — waits until at least one rule exists in DB before starting
async function waitForRules() {
  while (true) {
    const rules = await ScoringRule.find().lean();
    if (rules.length > 0) {
      await initRulesCache();
      return;
    }
    await new Promise(r => setTimeout(r, 2000)); // Retry every 2s
  }
}

module.exports = { initRulesCache, getRule, getAllRules, waitForRules };
```

**In `worker/index.js`:**
```javascript
await waitForRules(); // Block worker startup until rules are loaded
console.log("Scoring rules loaded - ready to process events");
```

**Why cache instead of querying DB per event?**

If a lead has 20 unprocessed events, calling `ScoringRule.findOne({ eventType })` 20 times would be 20 MongoDB round trips (~20ms each = 400ms just for rule lookups). With the in-memory cache, 20 lookups = 20 Map reads ≈ 0.001ms. Production systems always cache read-heavy, rarely-changing data like this.

---

## 11. The Lead Workflow

**File: `worker/workflows/processLeadWorkflow.js`**

This is the most sophisticated code in the project. The full scoring algorithm.

### Per-Lead Lock

```javascript
async function processLeadWorkflow(leadId, session) {
  // Atomic: find lead where processing=false, set processing=true
  // If lead is already being processed, findOneAndUpdate returns null → abort
  const lead = await Lead.findOneAndUpdate(
    { _id: leadId, processing: false }, // Condition
    { $set: { processing: true } },     // Update
    { new: true, session },             // Return the updated doc
  );

  if (!lead) {
    // Either: lead doesn't exist, OR another worker is already processing it
    // Both cases: abort gracefully, don't crash
    return;
  }
```

**Why a lock?** The worker has configurable concurrency (can run multiple jobs simultaneously). Without locking, two workers could both pick up scoring jobs for the same lead and create a race condition on the score. The atomic `findOneAndUpdate` ensures only one worker can "own" a lead at a time.

### Score History as Source of Truth

```javascript
  // Instead of reading lead.currentScore (might be stale), recalculate from history
  const last = await ScoreHistory.findOne({ leadId })
    .sort({ timestamp: -1 }) // Most recent entry
    .select({ newScore: 1 }); // Only fetch the score field

  let score = last ? last.newScore : 0;
```

**Why not just use `lead.currentScore`?**

Consider: Worker A is scoring lead X. Worker B also picks up a job for lead X (bug scenario). Worker A commits score 50. Worker B read `currentScore: 0` before A committed, then overwrites with 30 (its own calculation). Lead X now has score 30 instead of 80. By using `ScoreHistory` (append-only log) as the source of truth, you always get the latest confirmed score.

### Event Processing Loop

```javascript
  // Load all unscored events, oldest first (order matters for score history)
  const events = await Event.find({
    leadId,
    processed: false,
    queued: true,
    processing: false,
  }).sort({ timestamp: 1 }).session(session);

  if (!events.length) {
    await Lead.updateOne({ _id: leadId }, { $set: { processing: false } });
    return; // Nothing to do
  }

  // Lock all events being processed (prevent reprocessing)
  const ids = events.map(e => e._id);
  await Event.updateMany({ _id: { $in: ids } }, { $set: { processing: true } });

  // Score each event
  const history = [];
  for (const ev of events) {
    let delta = 0;
    try {
      delta = getRule(ev.eventType) || 0; // In-memory lookup
    } catch (err) {
      delta = 0; // Unknown event type → 0 points, don't crash
    }

    const newScore = Math.max(0, score + delta); // Never go below 0

    history.push({
      leadId,
      eventId: ev.eventId, // ← unique index prevents duplicates
      oldScore: score,
      newScore,
      delta,
      timestamp: new Date(),
    });

    score = newScore;
  }

  score = Math.min(10000, score); // MAX_SCORE cap (prevent overflow)
```

### Idempotent Score History Write

```javascript
  // ordered: false → don't stop on first duplicate, try all inserts
  try {
    await ScoreHistory.insertMany(history, { session, ordered: false });
  } catch (err) {
    // Only rethrow if NOT a duplicate key error
    if (!(err.code === 11000 || err.name === "BulkWriteError")) {
      throw err;
    }
    // Duplicate eventIds silently skipped — idempotency preserved
    // Example: if worker retries this job after a crash, same events won't
    // be double-counted because ScoreHistory has unique index on (leadId, eventId)
  }
```

### Final Lead Update

```javascript
  // Mark events done
  await Event.updateMany(
    { _id: { $in: ids } },
    { $set: { processed: true, queued: false, processing: false } },
  );

  // Recalculate velocity (events in last 24h)
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const eventsLast24h = await Event.countDocuments({
    leadId, processed: true, timestamp: { $gte: cutoff },
  });

  // Derive stage
  const stage = calculateStage(score);

  // Single atomic update on Lead
  await Lead.updateOne(
    { _id: leadId },
    { $set: {
      currentScore: score,
      leadStage: stage,
      eventsLast24h,
      lastEventAt: new Date(),
      processing: false,  // Unlock
    }},
  );
}
```

### Error Recovery

```javascript
  } catch (err) {
    // ALWAYS unlock the lead, even on error
    // Otherwise the lead is stuck in processing=true forever
    await Lead.updateOne(
      { _id: leadId },
      { $set: { processing: false } },
    ).catch(e => console.error("Failed to unlock lead:", e));

    // Log but DON'T rethrow — let the job complete
    // If we throw, Bull marks it failed and retries, which could
    // cause infinite loops for bugs that aren't transient
    console.error("Lead workflow failed:", err.message);
  }
```

**The design choice here:** The workflow catches its own errors and doesn't rethrow. The worker stays alive and processes the next job. Failed scoring for a single lead doesn't crash the worker or affect other leads.

---

## 12. Stage Engine

**File: `worker/domain/stageEngine.js`**

```javascript
function calculateStage(score) {
  if (score >= 60) return "qualified";
  if (score >= 31) return "hot";
  if (score >= 11) return "warm";
  return "cold";
}

module.exports = { calculateStage };
```

Simple, pure function. No database access. Given a number, returns a string. Called from both the worker (after scoring) and the frontend intelligence endpoint.

---

## 13. Lead Intelligence

**File: `worker/domain/leadIntelligence.js`**

```javascript
const { calculateStage } = require("./stageEngine");

function calculateVelocity(eventsLast24h) {
  return eventsLast24h * 3; // Multiplier makes it meaningful relative to score
}

function calculateRisk(lastEventAt) {
  const days = Math.floor((Date.now() - lastEventAt.getTime()) / 86400000);
  if (days > 14) return "high";
  if (days > 7)  return "medium";
  return "low";
}

function getNextAction(stage, velocity, risk) {
  if (stage === "qualified" && velocity >= 3) return "immediate_sales_contact";
  if (stage === "hot" && risk === "low")       return "schedule_demo";
  if (stage === "warm")                        return "nurture_campaign";
  if (risk === "high")                         return "re_engagement_required";
  return "monitor";
}

// Combines all three into one object
function computeIntelligence(lead) {
  const stage      = calculateStage(lead.currentScore);
  const velocity   = calculateVelocity(lead.eventsLast24h || 0);
  const risk       = calculateRisk(lead.lastEventAt || lead.createdAt);
  const nextAction = getNextAction(stage, velocity, risk);
  return { stage, velocity, risk, nextAction };
}

module.exports = { calculateVelocity, calculateRisk, getNextAction, computeIntelligence };
```

These are all pure functions — no side effects, no database calls, deterministic. Given the same inputs, always return the same outputs. Easy to unit test.

---

## 14. Automation Engine

**File: `worker/domain/automationEngine.js`**

```javascript
let rulesCache = [];
let cacheReady = false;

async function initAutomationRules() {
  rulesCache = await AutomationRule.find().lean();
  cacheReady = true;
}

async function executeAutomationsForLead(leadId) {
  if (!cacheReady) return;

  const lead = await Lead.findById(leadId);
  if (!lead) return;

  const stage    = calculateStage(lead.currentScore);
  const velocity = calculateVelocity(lead.eventsLast24h);

  // Filter rules that match this lead's current state
  const matchingRules = rulesCache.filter(rule => {
    if (rule.whenStage && rule.whenStage !== stage) return false;
    if (rule.minVelocity && velocity < rule.minVelocity) return false;
    return true;
  });

  const dateBucket = new Date().toISOString().split("T")[0]; // "2026-02-21"

  for (const rule of matchingRules) {
    try {
      // Unique index on (leadId, ruleId, dateBucket) = fires at most once/day/lead
      await AutomationExecution.create({
        leadId: lead._id,
        ruleId: rule._id,
        dateBucket,
        payload: { action: rule.action, stage, velocity },
        status: "executed",
      });

      console.log(`Automation triggered: ${rule.action} for lead ${lead._id}`);

    } catch (err) {
      if (err.code === 11000) {
        // Already fired today — silently skip (idempotency)
      } else {
        console.error("Automation failed:", err.message);
      }
    }
  }
}
```

**The once-per-day-per-lead idempotency trick:**

```javascript
// AutomationExecution schema has this index:
{ leadId: 1, ruleId: 1, dateBucket: 1 }  // unique: true

// Effect: The SECOND time this runs for the same leadId + ruleId on the same day:
// → MongoDB throws error code 11000 (duplicate key)
// → The catch block sees 11000 and does nothing
// → The automation is not double-fired
```

This is a database-enforced rate limit — no application-level counter needed.

---

## 15. Lead Routes + Handlers

**File: `api/features/leads/lead.routes.js`**

```javascript
const router = require("express").Router();
const { protect } = require("../../middleware/authMiddleware");

// GET /api/leads — paginated list sorted by score
async function getAllLeads(req, res, next) {
  try {
    const projectId = req.user.projectId; // From JWT via protect middleware
    const limit = parseInt(req.query.limit) || 100;
    const skip  = parseInt(req.query.skip) || 0;

    const leads = await Lead.find({ projectId })
      .sort({ currentScore: -1 }) // Highest score first
      .limit(limit)
      .skip(skip);

    const total = await Lead.countDocuments({ projectId });

    res.json({ success: true, data: { leads, total, limit, skip } });
  } catch (err) {
    next(err); // Pass to errorHandler middleware
  }
}

// GET /api/leads/export — CSV download
async function exportLeads(req, res, next) {
  const leads = await Lead.find({ projectId: req.user.projectId })
    .sort({ createdAt: -1 });

  const headers = ["Name", "Email", "Company", "Score", "Stage", "Created At"];
  const csvRows = [headers.join(",")];

  leads.forEach(lead => {
    const row = [
      `"${(lead.name || "").replace(/"/g, '""')}"`,  // Escape quotes in CSV
      `"${(lead.email || "")}"`,
      `"${(lead.company || "")}"`,
      lead.currentScore || 0,
      `"${lead.leadStage || "cold"}"`,
      `"${lead.createdAt?.toISOString() || ""}"`,
    ];
    csvRows.push(row.join(","));
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="leads-export.csv"');
  res.send(csvRows.join("\n")); // Send as plain text, browser downloads it
}

// Route registration
router.get("/",          protect, getAllLeads);
router.get("/export",    protect, exportLeads);
router.get("/leaderboard", protect, getLeaderboard);
router.post("/",         controller.createNewLead);         // No protect — public
router.get("/:id",       controller.fetchLead);
router.get("/:id/history",    controller.fetchLeadHistory);
router.get("/:id/intelligence", intelligenceController.getLeadIntelligence);
```

**`next(err)` pattern:**

Every `catch` block calls `next(err)` instead of writing the error response directly. This passes the error to the centralized error handler middleware. Consistent error format across all routes without duplicating code.

---

## 16. API Routes Map

**File: `api/routes.js`**

```javascript
const router = require("express").Router();
const { protect } = require("./middleware/authMiddleware");

// Public — no auth
router.get("/health", healthHandler);
router.use("/auth",    require("./features/auth/auth.routes"));
router.use("/ingest",  require("./features/ingest/ingest.routes")); // API key auth

// Protected — JWT required (protect runs before all handlers in these groups)
router.use("/events",     protect, require("./features/events/event.routes"));
router.use("/leads",      protect, require("./features/leads/lead.routes"));
router.use("/rules",      protect, require("./features/rules/rules.routes"));
router.use("/analytics",  protect, require("./features/analytics/analytics.routes"));
router.use("/projects",   protect, require("./features/projects/project.routes"));
router.use("/leaderboard",protect, require("./features/leaderboard/leaderboard.routes"));
router.use("/admin",             require("./features/admin/admin.routes")); // Has own auth
router.use("/webhooks",          require("./features/webhooks/webhook.routes")); // Public
```

`app.use("/api", routes)` in `app.js` means all of these become `/api/health`, `/api/auth/login`, etc.

---

## 17. Frontend: Axios Config + 401 Handling

**File: `frontend/src/api/axios.config.js`**

```javascript
import axios from "axios";
import { API_URL } from "../config";

// Create a reusable axios instance with defaults
const api = axios.create({
  baseURL: API_URL,      // e.g. "http://localhost:4000/api"
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// ── Request Interceptor ─────────────────────────────────────────────────────
// Runs BEFORE every request is sent
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach JWT to every call
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ────────────────────────────────────────────────────
// Runs AFTER every response is received
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes("/auth/");
      if (!isAuthEndpoint) {
        // Don't intercept login/register failures — those are expected 401s
        localStorage.removeItem("authToken");
        // ★ Dispatch custom event instead of window.location.href = '/login'
        // This keeps navigation inside React Router (no full page reload)
        // Full reload would destroy Socket.IO connection + React state
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    }
    if (error.response?.status === 429) {
      console.error("Rate limit exceeded. Please try again later.");
    }
    return Promise.reject(error);
  },
);

export default api;
```

**Why `CustomEvent` instead of `window.location.href = '/login'`?**

`window.location.href = '/login'` causes a full browser navigation. This:
1. Destroys the Socket.IO connection (has to reconnect from scratch)
2. Destroys all React state (stores, context, hooks reset)
3. Can cause infinite loops if the login page itself makes an API call that 401s

The `CustomEvent` approach fires a JavaScript event that `AuthContext` is listening for, and it calls React Router's `navigate('/login')` — which navigates without a page reload.

---

## 18. Frontend: AuthContext

**File: `frontend/src/contexts/AuthContext.jsx`**

```jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { reconnectSocket, disconnectSocket } from "../sockets/socket";

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);
  const navigate = useNavigate();

  // ── Session Restore ─────────────────────────────────────────────────────
  // On every page load, check if there's a saved token and validate it
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await authApi.getMe(); // GET /api/auth/me
          if (response.success) setUser(response.data.user);
        } catch {
          localStorage.removeItem("authToken"); // Token expired/invalid
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // ── Auth:Logout Event Listener ──────────────────────────────────────────
  // Responds to the CustomEvent dispatched by axios interceptor on 401
  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      setError(null);
      disconnectSocket();              // Clean up WebSocket connection
      navigate("/login");              // React Router navigation (no reload)
    };
    window.addEventListener("auth:logout", handleAuthLogout);
    return () => window.removeEventListener("auth:logout", handleAuthLogout);
  }, [navigate]);

  // ── Login ───────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      if (response.success) {
        localStorage.setItem("authToken", response.data.token);
        setUser(response.data.user);
        reconnectSocket(); // ★ Re-init socket with fresh token after login
        return { success: true };
      }
      throw new Error(response.error || "Login failed");
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    setUser(null);
    setError(null);
    // No need to call disconnectSocket here — auth:logout event handles it
  }, []);

  const value = {
    user, isLoading,
    isAuthenticated: !!user, // Converts user object → boolean
    error, login, logout, clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook — every component calls useAuth() instead of useContext(AuthContext)
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
```

---

## 19. Frontend: Socket Client

**File: `frontend/src/sockets/socket.js`**

```javascript
import { io } from "socket.io-client";
import { WS_URL } from "../config"; // e.g. "http://localhost:4000"

let socket = null;

// Creates a new socket connection, reading fresh token from localStorage
function createSocket() {
  const token = localStorage.getItem("authToken");
  return io(WS_URL, {
    transports: ["websocket", "polling"], // Try WS first, fall back to long-poll
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    auth: token ? { token } : undefined,  // Send JWT with socket handshake
  });
}

export const initSocket = () => {
  if (socket) return socket; // Don't create duplicate connections
  socket = createSocket();
  socket.on("connect",       () => console.log("✅ Socket.IO connected"));
  socket.on("disconnect",    () => console.log("❌ Socket.IO disconnected"));
  socket.on("connect_error", (err) => console.error("Socket error:", err));
  return socket;
};

export const getSocket = () => socket || initSocket();

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};

// ★ Called after login to re-authenticate socket with new token
// The old socket's auth header has the OLD (or missing) token.
// We must disconnect and create a fresh socket for new token to take effect.
export const reconnectSocket = () => {
  disconnectSocket();
  return initSocket(); // Creates new socket → reads fresh token from localStorage
};

// Convenience subscription helpers used by components
export const subscribeToLeadUpdates = (callback) => {
  const sock = getSocket();
  sock.on("leadUpdated", callback);
  return () => sock.off("leadUpdated", callback); // Unsubscribe cleanup function
};
```

**Why `reconnectSocket()` after login?**

The socket reads `localStorage.getItem("authToken")` only when `createSocket()` is called. After login, the token is saved to localStorage, but the OLD socket still has the old (empty) token in its auth headers. `reconnectSocket()` tears down the old socket and creates a new one that reads the fresh token.

---

## 20. Frontend: Integrations + WebhookTester

**File: `frontend/src/pages/integrations/components/WebhookTester.jsx`**

The Send Test Event button — this is where the Bug 1 fix was applied.

```jsx
import axios from "axios";              // ★ Top-level axios, not the api instance
import { API_URL } from "../../../config";

const BASE_URL = API_URL.replace("/api", ""); // "http://localhost:4000"

// Build payload dynamically — includes the real apiKey prop
const buildPayload = (apiKey) => ({
  event: "page_view",
  anonymousId: "anon_test_001",
  apiKey: apiKey || undefined,          // undefined = field omitted from JSON
  properties: { page: "/pricing", source: "devtools_test" },
});

export default function WebhookTester({ apiKey }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    try {
      const start = Date.now();
      // ★ Direct axios.post to absolute URL (not the /api-prefixed instance)
      // /api/ingest/event is PUBLIC — no JWT needed, uses apiKey in body
      const res = await axios.post(`${BASE_URL}/api/ingest/event`, buildPayload(apiKey));
      setResult({ ok: true, status: res.status, ms: Date.now() - start });
    } catch (e) {
      setResult({ ok: false, status: e.response?.status, msg: e.message });
    } finally {
      setLoading(false);
    }
  };
  // ...
}
```

**Why `axios.post` directly and not `api.post`?**

`api` (the axios instance) has `baseURL: "http://localhost:4000/api"` set. If you call `api.post("/ingest/event", ...)`, axios resolves it to `.../api/ingest/event` — correct. But if you then pass an object like `{ baseURL: "/" }` as the third argument (old bug), axios ignores it on pre-configured instances.

More importantly, the ingest endpoint is **public** — it uses an API key in the body, not a JWT in headers. Using `api.post` would attach the user's JWT unnecessarily. Using raw `axios.post` with the full URL is explicit and correct.

---

## 21. Error Handler Middleware

**File: `api/middleware/errorHandler.js`**

```javascript
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
  });
};

const errorHandler = (err, req, res, next) => {
  // Custom error classes with statusCode
  const statusCode = err.statusCode || err.status || 500;

  console.error(`[Error] ${err.message}`, {
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal server error",
    // Don't expose stack traces in production
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = { notFoundHandler, errorHandler };
```

This is registered LAST in `app.js`:
```javascript
app.use(notFoundHandler); // Catches any route that wasn't matched
app.use(errorHandler);    // Catches any error passed via next(err)
```

Express identifies error-handling middleware by its 4-parameter signature `(err, req, res, next)`. Any `next(err)` call anywhere in the app skips to this function.

---

## 22. Data Flow: One Event, Start to Finish

This is the complete journey of a single `demo_request` event with exact function calls:

```
Browser on your site:
  fetch("https://api.com/api/ingest/event", {
    body: JSON.stringify({ apiKey: "pk_abc", event: "demo_request",
                           anonymousId: "user@email.com" })
  })
  │
  ▼
api/middleware/rateLimiter.js
  ingestRateLimiter → check Redis: has this IP exceeded 200/min?
  If yes → 429 Too Many Requests
  If no  → continue
  │
  ▼
api/features/ingest/ingest.controller.js → handleIngestEvent()
  validateEventPayload(req.body) → check schema with Zod
  sanitizeProperties(properties)  → strip deep/large objects
  ingestEvent(validatedData)      → call the service
  │
  ▼
api/features/ingest/ingest.service.js → ingestEvent()
  Project.findOne({ apiKey: "pk_abc" })    → find project in MongoDB  [~5ms]
  Lead.findOneAndUpdate({ anonymousId })   → find/create lead          [~5ms]
  Event.create({ eventId: uuid() })        → save event                [~5ms]
  queue.add({ leadId }, { jobId: ... })    → push to Redis Bull queue   [~2ms]
  Event.updateOne({ queued: true })        → mark queued               [~2ms]
  io.emit("newEvent", payload)             → broadcast to all dashboards [<1ms]
  return { status: "queued" }
  │
  ▼
HTTP Response: 202 Accepted { status: "queued" }  [total ~20ms]

════════════════════════════════════════════════════
  (Asynchronous — happens in worker process)
════════════════════════════════════════════════════
  │
  ▼
worker/index.js → eventQueue.process()
  picks up job: { leadId: "abc123" }
  mongoose.startSession() → start MongoDB transaction
  │
  ▼
worker/workflows/processLeadWorkflow.js → processLeadWorkflow()
  Lead.findOneAndUpdate({ processing: false }, { processing: true })  ← acquire lock
  resolveIdentity(lead, session)  ← handle identify events if any
  ScoreHistory.findOne({ sort: -timestamp })  ← get current score = 0
  Event.find({ processed: false, queued: true })  ← find: [demo_request]
  Event.updateMany({ processing: true })  ← lock events
  │
  For "demo_request":
    getRule("demo_request") → 50  ← in-memory cache lookup
    newScore = max(0, 0 + 50) = 50
    history.push({ oldScore: 0, newScore: 50, delta: 50 })
  │
  score = min(10000, 50) = 50
  ScoreHistory.insertMany([{ eventId, newScore: 50 }])  ← unique index ensures idempotency
  Event.updateMany({ processed: true })  ← mark done
  Event.countDocuments({ timestamp >= cutoff })  ← eventsLast24h = 1
  calculateStage(50)  → "warm"  ← 31 <= 50 < 60
  Lead.updateOne({ currentScore: 50, leadStage: "warm", processing: false })
  │
  session.commitTransaction()  ← all or nothing
  │
  ▼
worker/domain/automationEngine.js → executeAutomationsForLead()
  load matching automation rules (stage="warm", velocity=3)
  AutomationExecution.create({ dateBucket: "2026-02-21" })  ← fires once/day max
  │
  ▼
  Done. Lead "user@email.com" now has score=50, stage="warm"
```

**Total time:**
- API response: ~20ms
- Scoring (async): ~50-200ms depending on event count
- User sees score update on dashboard via Socket.IO before they even notice the delay

---

## Key Patterns Used in This Codebase

| Pattern | Where Used | Why |
|---------|------------|-----|
| Optimistic upsert with retry | `ingest.service.js` | Handle race conditions on lead creation |
| In-memory cache with polling | `scoringRulesCache.js` | Fast rule lookups without DB round trips |
| Per-document pessimistic lock | `processLeadWorkflow.js` | Prevent concurrent scoring of same lead |
| Append-only audit log | `ScoreHistory` model | Source of truth, enables replay |
| Unique index as idempotency | `Event.eventId`, `ScoreHistory.(leadId,eventId)` | No double-processing |
| CustomEvent for auth signals | `axios.config.js` → `AuthContext.jsx` | Decouple axios from React Router |
| Module-level singleton | `socket.js`, `scoringRulesCache.js` | One instance shared across the app |
| `next(err)` error forwarding | All route handlers | Centralized error formatting |
| `app.set("io", io)` | `app.js` → controllers | Inject Socket.IO without import cycle |
| `$setOnInsert` upsert | `ingest.service.js` | Don't overwrite existing data on upsert |


---

# PART 4: FRONTEND REACT ARCHITECTURE

This document provides a highly technical, granular, property-by-property, state-by-state teardown of the entire frontend architecture (LeadPulse OS / `UI/` folder). It covers the exact hooks, API interactions, props, conditional logic branches, tailwind styling, and real-time socket communication for every single file.

---

---

## 1. Application Shell & Routing Layer

### `src/main.jsx`

**Purpose**: The absolute entry point that bootstraps React DOM and injects the Context Provider stack.
**Logic Flow**:

- Mounts `<StrictMode>` to root.
- Injects `<BrowserRouter>` for HTML5 History API routing.
- Injects `<ToastProvider>` — manages globally accessible toast notifications (must encapsulate AuthProvider so signin/out errors can fire toasts).
- Injects `<AuthProvider>` — fetches `/auth/me` on mount to rehydrate session.
- Invokes `<App />`.

### `src/config.js`

**Purpose**: Multi-environment variable fallback module.
**State/Variables**:

- `API_URL`: Pulls `import.meta.env.VITE_API_URL`. Falls back dynamically. If `window.location.hostname === "localhost"`, defaults to `http://localhost:4000/api`, else `https://lead-scoring-api-f8x4.onrender.com/api`.
- `WS_URL`: Pulls `VITE_WS_URL`. Falls back similarly for Socket.IO targets.
- `GOOGLE_CLIENT_ID`: Pulls `VITE_GOOGLE_CLIENT_ID` natively (needed for `react-google-login` or native script injections).

### `src/App.jsx`

**Purpose**: Central routing map. Comprises conditional rendering logic, shells, layout definitions, and wrapper components.

#### `<ProtectedRoute />`

**Props**: `children` (React Node).
**Hook Imports**:

- `const { isAuthenticated, isLoading } = useAuth();`
  **Logic**:
- **Condition 1**: `if (isLoading)`: returns a full-screen loading spinner (spinning `sync` material icon) with `bg-background-light`.
- **Condition 2**: `if (!isAuthenticated)`: returns `<Navigate to="/login" replace />`.
- **Fallthrough**: Returns `children`.

#### `<Dashboard />` (Component Function)

**Props**: `onNavigateLeads` (function callback passed down).
**State**:

- `dashboardStats` (Object | null): stores the aggregate 4 metrics fetched from API.
  **Hooks**:
- `loadStats = useCallback(async () => {...})`: fetches `analyticsApi.getDashboardStats()` and executes `setDashboardStats(r.data)`.
- `useEffect(() => {...}, [loadStats])`: calls `loadStats()` immediately, sets interval timer to call it every 30000ms. Cleans up interval on unmount.
  **Data Modeling (`buildMetrics()`)**:
- Parses `totalEvents, identityResolutions, avgLatency, qualifiedLeads` out of `dashboardStats`.
- **Mathematical Formatter**: `totalEvents >= 1000 ? (events/1000).toFixed(1)+'k' : totalEvents`. Identical logic applied to resolutions.
- Array generation: Returns an array of 4 objects mapped to `<MetricCard>`:
  - Metric 1: Processing Velocity. Compares `avgLatency > 200` to inject `warning` vs `success` classes. Custom CSS array of bar charts (static visualizer).
  - Metric 4: Active Qualified Leads. Maps if `qualifiedLeads > 0` conditionally sets `success`/`warning`.
    **Render Hierarchy**:
- Responsive Grid 1: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` for iterating `buildMetrics()`.
- Responsive Grid 2: `grid-cols-12`, `<ThroughputChart />` and `<QueueHealth />`.
- Responsive Grid 3: `<ScoreMutations />` and `<AutomationLog />`.

#### `<LeadsWrapper />` (Component Function)

**Purpose**: High-Order wrapper to abstract data fetching from the purely visual `Leads.jsx` page.
**State**:

- `leads` (Array, defaults `[]`): stores exact DB array of leads.
- `leadsLoading` (Boolean, defaults `true`).
  **Hooks**:
- `loadLeads = useCallback()`: `leadsApi.getAll({ limit: 200 })`. Maps `setLeads(r.data.leads)`. Error catch resets to `[]`.
- `useEffect()`: calls `loadLeads` once on mount.
  **Render**: passes state down to `<Leads leads={leads} leadsLoading={leadsLoading} onRefresh={loadLeads} />`.

#### `<AppShell />` (Component Function)

**Purpose**: Renders the persistent Layout shell surrounding authenticated routes.
**Constants**:

- CSS String: `bg-background-light dark:bg-background-dark text-text-primary-light ... h-screen flex overflow-hidden`.
  **Route Table**:
- `Route /`: -> `<Dashboard />`
- `Route /dashboard`: -> `<Dashboard />`
- `Route /leads`: -> `<LeadsWrapper />`
- `Route /events`: -> `<ComingSoon icon="bolt" label="Events Stream" />` (Placeholder)
- `Route /automation`: -> `<ComingSoon icon="auto_fix_high" label="Automation Engine" />`
- `Route /scoring`: -> `<ComingSoon />`
- `Route /simulator`: -> `<Simulator />`
- `Route /settings`: -> `<Settings />`
- `Route *`: -> `<Navigate to="/" replace />` (Catch-all redirect).

#### `<App />` (Root Logic Component)

**Hooks**:

- pulls `isAuthenticated, isLoading` from `useAuth()`.
  **Route Table**:
- `Route /landing`: `<Landing />`
- `Route /login`: Terneray - `isAuthenticated ? <Navigate to="/" /> : <SignIn />`
- `Route /signup`: Terneray - `isAuthenticated ? <Navigate to="/" /> : <SignUp />`
- `Route /*`: Protects the entire `<AppShell />` tree.

---

## 2. Global State Providers

### `src/contexts/AuthContext.jsx`

**Purpose**: Central nervous system for JWT, user objects, persisting auth rules across refreshes.
**Exports**: `AuthContext, AuthProvider, useAuth()`.
**State Variables**:

- `user`: Object | null. `name, email, role, _id`.
- `isAuthenticated`: Boolean. derived essentially from `!!user`.
- `isLoading`: Boolean. Default `true` because it must await `/auth/me`.
  **Lifecycle Mount `useEffect`**:
- Reads `localStorage.getItem("authToken")`. If false, `isLoading(false), isAuthenticated(false)`.
- If true, calls `authApi.getMe()`.
- Yields `success => setUser(user)`, `error => logout()`.
  **Auth Actions**:
- `login(email, password)`: -> `authApi.login()`. If success, grabs `r.token, r.user`. Persists token to `localStorage`, populates user.
- `register(name, company, email, password)`: -> `authApi.register()`. Persists token, populates user.
- `googleLogin(token)`: handles OAuth callback.
- `logout()`: rips out `localStorage.removeItem("authToken")`, zeroes out user and auth objects.

### `src/contexts/ToastContext.jsx`

**State Variables**:

- `toasts`: Array of objects { `id, type, message` }.
  **Core methods**:
- `addToast(type, message)`: generates UUID, maps object to `setToasts(prev => [...prev, newToast])`.
- Auto-dismisser: sets `setTimeout` dynamically for 3000ms (unless user manually clears it) which triggers `removeToast(id)`.
- Reusable export hooks: `success(msg), error(msg), warning(msg), info(msg)` wrappers for `<ToastProvider>`.
  **Visual Representation**:
- Fixed container at `bottom-4 right-4 z-50 flex-col-reverse space-y-reverse space-y-2`.
- Conditional Background Classes:
  - `success`: `bg-success text-white border-none shadow-lg`
  - `error`: `bg-error text-white`
  - Material icons mapped: `check_circle` (success), `error_outline` (error), `warning_amber`.

---

## 3. API Layer

### Axios Instance (`src/api/axios.config.js`)

**Setup**: BaseURL derived from `config.js` -> `API_URL`.
**Request Interceptor**:

- `config.headers.Authorization = 'Bearer ${token}'`. Injected blindly if `localStorage` has token.
  **Response Interceptor**:
- Success bypasses logic.
- Error code `401 Unauthorized`:
  - Ejects user! Automatically executes `localStorage.removeItem("authToken")` and hard-navigates `window.location.href = "/login"`.
- Error code `429 Too Many Requests`: Trigger console error warnings (Redis rate limiter kicked off).

### Modules

- **`analytics.api.js`**:
  - `getDashboardStats()`: `GET /analytics/dashboard`.
  - `getThroughputData(hours)`: `GET /analytics/throughput?hours=24`.
  - `getQueueHealth()`: `GET /analytics/queue-health`.
  - `getScoreMutations(limit)`: `GET /analytics/score-mutations?limit=10`.
  - `getAutomationLogs(limit)`: `GET /analytics/automation-logs?limit=20`.
- **`leads.api.js`**:
  - `getAll()`: paginated leads list from Mongo.
  - `getTimeline(leadId)`: `GET /leads/:id/timeline`. Aggregates all web events mapped to score changes.
  - `exportCSV()`: `GET /leads/export` => Parses `responseType: "blob"`. DOM manipulation: Creates generic `document.createElement("a")` element, attaches `window.URL.createObjectURL([blob])`, fires `.click()`, unbinds URL to clear memory.
- **`events.api.js`**: `POST /events/ingest`. Fires arbitrary payloads testing the Redis scoring pipeline.

---

## 4. Real-time Communication

### `src/sockets/socket.js`

**Architecture**: Singleton implementation wrapping `socket.io-client`.
**Constants/Variables**: `let socket = null;`.
**Lifecycle `initSocket()`**:

- Extracts JWT from local storage.
- Re-constructs Socket client aiming at `WS_URL` with `{ auth: { token: token } }` for handshake validation.
- Configures retry logic: `reconnectionDelay: 1000`, `reconnectionAttempts: 5`.
  **Event Listeners/Hooks** (_all return cleanup unbind functions_):
- `subscribeToLeadUpdates(cb)`: Binds `socket.on("leadUpdated", cb)`.
- `subscribeToScoreMutations(cb)`: Binds `socket.on("scoreMutation", cb)`.
- `subscribeToAutomations(cb)`: Binds `socket.on("automationExecuted", cb)`. Handles triggered notifications when queue jobs finish.

---

## 5. Dashboard Components

### `<MetricCard />`

**Props**: `{ title, value, change, changeType, subtext, bars }`.
**Visual Engine**:

- Renders mini-bar chart visuals passed down as `<div style={{ height: item.h }} className={item.color}>`.
- Displays dynamic numeric formats for main `value` block (e.g. `12.5k` or `< 1ms`).

### `<ThroughputChart />`

**Props**: none. (Encapsulated component).
**State**:

- `data`: array mapping `{ events: Number, mutations: Number }` representing epochs.
- `loading`: boolean.
  **Lifecycle**:
- Loads data on mount via `analyticsApi.getThroughputData()`. Sets interval 30s polling loop (no websocket dependency as it aggregates temporal windows).
  **DOM Structure**:
- Normalizes data: `maxValue = Math.max(maxEvents, Math.maxMutations)`. Height calculation relies on converting bounds `(item.events/maxValue)*250px`.
- Draws overlay visual: two background spans. One overlaps the other based on normalized ratio, generating layered histogram appearance via pure CSS divs instead of `<canvas>` Recharts. Allows high-performance rendering.

### `<QueueHealth />`

**Data Fetching**: Pulls via `analyticsApi.getQueueHealth()`, polling loop every 10,000ms.
**Data Model (`queueData`)**:

- `{ waiting, active, completed, failed, workers, maxWorkers }`
  **Compute Logic**:
- `workerPercentage = (workers/maxWorkers) * 100` -> applied to width of inline CSS bar.
- `waitingPercentage = min((waiting/5000)*100, 100)`. Caps max visual fill to 5k jobs, normalizing the progression bar.
- Logic trigger: `if (failed > 10)` -> unhides the red "Dead Letter Queue" alert node. Mounts severe warning text (`bg-red-50 text-error`).

### `<ScoreMutations />`

**Props**: `onNavigateLeads`.
**Data Fetching**: Pulls `analyticsApi.getScoreMutations(10)` every 15,000ms loop.
**Table Columns**: `Lead Entity`, `Event Type`, `Delta`, `Score`.
**Logic Formatting**:

- Map parses `mutation.delta`. `delta >= 0 ? "+X" : "-X"`. Assigns color conditionals `text-success` vs `text-error`.
- Renders `eventType` inside tiny stylized badges. Empty state fallback injected cleanly.

### `<AutomationLog />`

**State**: `logs` Array.
**Feature Design**: This presents a scrolling terminal-like display of webhook triggers, slack notification outputs etc.
**Hooks**:

- Pulls initialization data from `getAutomationLogs(15)`.
- _Note: the architecture assumes pooling here, though sockets could stream._ Polling every 10s.
  **Formatter**:
- `<span font-mono>` with timestamp parsed via `date.toLocaleTimeString("en-US", { hour12: false })` giving 24H military output format e.g. `[14:32:01] email_sent: ...`

---

## 6. Leads Management Pages & Components

### `src/pages/Leads.jsx`

**Role**: Holds complex filtering/search state memory.
**Props**: `{ leads, leadsLoading, onRefresh }`.
**State**:

- `selectedLead` (Object | null): Identifies the DOM target triggering the drawer opening.
- `searchQuery` (String): Raw string tracking search input typing.
- `stageFilter` (Enum String): 'all', 'qualified', 'hot', 'warm', 'cold'.
  **Data Compute Pipeline (`useMemo(filteredLeads)`)**:
- First iterates `searchQuery`. Maps query against `name`, `email`, `anonymousId` with standard `.toLowerCase()` string matching.
- Second iterates `stageFilter`. Takes the filtered array and filters again against `<lead.currentScore>`:
  - `qualified`: >= 85
  - `hot`: 70 to 84
  - `warm`: 40 to 69
  - `cold`: < 40.
    **Prop Drilling**: Yields filtered array into `<FilterBar>`, `<LeadsTable>`, `<PaginationFooter>`.

### `<FilterBar />`

**Props**: `{ stageFilter, onStageChange, totalCount, filteredCount }`.
**Constants**:
`STAGES = [{ key: "qualified", label: "Qualified (85+)" }, ...etc]`
**DOM UI**:

- Renders pills. Selected pill gets `bg-primary/10 border-primary/30`. Unselected remains gray stringly typed fallback.
- Adds an embedded `x` clear button to custom pills triggering `onStageChange("all")`.

### `<LeadsHeader />`

**UX Features**:

- Sticky header (`sticky top-0 z-30`).
- Debounced search visualizer text input (`pl-10 pr-4`). Controlled input bound securely to `searchQuery`.
- Button: `Export CSV`. Function triggers Async -> sets `isExporting`, `await leadsApi.exportCSV()`, clears state. Handles the `disabled={isExporting}` CSS hook preventing double spam.

### `<LeadsTable />`

**Pure View Component** - No explicit internal state, just maps prop lists mapping.
**Helper Functions** (`outside component closure for performance`):

- `getStageConfig(score)`: returns `{ stage: 'Hot', stageBg: 'bg-primary' }`. Same brackets mapped as standard.
- `getVelocityConfig(velocityScore, eventsLast24h)`:
  - math: `min(velocityScore/10, 10)` normalizes. Applies fractional logic generating `%` CSS width block for velocity progress bar indicator.
- `getRiskConfig(velocityScore, lastEventAt, currentScore)`:
  - Computes `daysSinceLastEvent = (Date.now() - new Date(lastEventAt)) / 86400000ms`.
  - Determines risk band based on inactivity or low recent threshold signals. Assigns "High Risk (Churn)" (red badge) or "Low Risk" (green badge).
- `formatTimestamp()`: Custom relative time library logic, avoiding moment.js bloat. Computes diffs returning `Just now`, `xm ago`, etc.
  **Avatar Mapping**:
- Tries extracting `.image`. Else parses initials by splitting `.name` spaces, checking lengths, fallback to `email` sub string. Fallback `??`. Appends DOM badge indicator floating absolute positioned icon showing identity link resolution.

### `<IntelligenceDrawer />`

**Props**: `{ open, lead, onClose }`.
**State**:

- `timeline` (Array bounds): fetched via `leadsApi.getTimeline`.
- `timelineLoading` (Bool): prevents hydration flashing.
- `recalculating` (Bool): button state locker.
  **Lifecycle**:
- Triggers inside `useEffect()` solely when `open` and `lead?._id` properties pivot to truthy bindings. Unmount cleans pending variables (`cancelled = true` concurrency control to stop promise execution conflicts on quick clicks).
  **Drawer Visuals Structure**:
- `<aside>` positioned `fixed right-0 inset-y-0 w-[420px]`.
- Top header details basic generic stats.
- Map iterates `timeline?.sessions.flatMap()`, sorts backwards timestamp mapping descending chronological display line.
  **Event Mapping Dictionary**:
- `EVENT_ICONS`: "page_view" -> "visibility", "click" -> "ads_click", "login" -> "login".
- Activity line visual builds an absolute-positioned border CSS line connecting icons generating a vertical "flight path" visual of event histories. Appends `+X pts` score delta badge directly associated with event itemization.

---

## 7. Navigation & Layout Models

### `<Sidebar />`

**Props**: none. (Gets current route out of `useLocation().pathname`).
**Behavior**: Left nav layout `w-64 bg-surface...`. Hidden under `md:` media query breakpoints (`hidden md:flex`).
**Routes Mapping Elements**:

- Monitor Category: Dashboard, Leads, Events.
- Orchestration Category: Automation, Scoring Rules.
- Developer Category: Simulator, Settings.
- User Box: Sticky at `bottom-0`, bounds with `border-t`. Unwraps `user.name` string extracting `[0].toUpperCase()` avatar logic inline. Mounts `handleLogout()` trigger executing `AuthContext` rip operation.

### `<Header />`

**Props**: none.
**Role**: Provides live infrastructure monitoring overview and Project scoping.
**State Engine**:

- `health` Object: tracks `api, db, redis` connection statuses.
- `project` String: grabs exact namespace string.
  **Networking/Polling**:
- `useEffect`: Creates internal polling async func looping at 15000ms polling `/health`. Expects MongoDB and Upstash Redis pings. Updates dots from red `bg-error` -> green `animate-pulse bg-success` if response `200 ok`.
- Renders mobile responsive hamburger triggers to expose hidden mobile overlay nav (implementation pending/injected via DOM manipulation conditionally based on CSS).

---

## 8. Marketing Pages

### `src/components/landing/`

This entire subfolder compiles into the unauthenticated entry `/landing`.

- **`Hero.jsx`**: "Identify the 10%...". Has `<form>` for quick email CTA (non-functional mock hook, visually robust). Renders mocked `<MetricsCard/>` floating elements in visual box mapping to 3d-effect rotations.
- **`Features.jsx`**: Grid `grid-cols-1 md:grid-cols-2` layout mapping Core capabilities (Real-time scoring mapping to Redis, Intent Recognition, Deep integrations etc.).
- **`TechStack.jsx`**: Visually maps MongoDB, Redis, Node logos displaying infra scale capability claims (Events/sec, Latency logic bounds).
- **`SocialProof.jsx`**: Mocks 5-star validation blocks.
- **`CTA.jsx`**: Dark mode background gradient call to action linking `/signup`.
- **`Navbar.jsx`**: Simplified unauthenticated variant navigation hiding dashboard, providing links exclusively for `/login` and `/signup`.

## Summary Architectural Axioms

1. **Data Segregation**: Context strictly owns Auth/State identity logic. Page level wraps generic array fetch routines. Child components map visual UI properties off exact prop drilling formats safely decoupled from DOM state bounds.
2. **Polling over Sockets (Gracefulness Strategy)**: Charts execute 15-30s temporal polling loops explicitly tracking `setTimeout`. Sockets are strictly restricted to event-based stream inputs (Automation triggers) preventing extreme UI repaints over 120hz frame allocations.
3. **Optimistic Loading States**: Components guarantee safe array `[]` or null instantiation to gracefully load skeletal frames globally, mapping against Tailwind `animate-spin` nodes.
4. **Tailwind Abstractions**: The design strictly avoids arbitrary pixel sizing (`p-[124px]`). Relying explicitly on native tokens and customized configurations for theming `text-text-primary-light` resolving `window.matchMedia(dark scheme)` properties dynamically via system queries.

