# Lead Scoring System

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
