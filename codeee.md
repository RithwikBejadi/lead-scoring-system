# Code-Based Implementation Guide
## LeadPulse — Every Piece of Code Explained

> This guide walks through the actual source code of this project, file by file, function by function.
> Every snippet shown here is real code from the repo — nothing is made up.

---

## Table of Contents

1. [Server Bootstrap — How It All Starts](#1-server-bootstrap)
2. [Express + Socket.IO Setup (`app.js`)](#2-express--socketio-setup)
3. [Database Connection (`config/db.js`)](#3-database-connection)
4. [Redis Connection (`config/redis.js`)](#4-redis-connection)
5. [The Queue (`shared/queue/index.js`)](#5-the-queue)
6. [Authentication Service (`auth.service.js`)](#6-authentication-service)
7. [JWT Middleware (`authMiddleware.js`)](#7-jwt-middleware)
8. [Event Ingestion (`ingest.service.js`)](#8-event-ingestion)
9. [The Scoring Worker (`worker/index.js`)](#9-the-scoring-worker)
10. [The Scoring Rules Cache (`scoringRulesCache.js`)](#10-scoring-rules-cache)
11. [The Lead Workflow (`processLeadWorkflow.js`)](#11-the-lead-workflow)
12. [Stage Engine (`stageEngine.js`)](#12-stage-engine)
13. [Lead Intelligence (`leadIntelligence.js`)](#13-lead-intelligence)
14. [Automation Engine (`automationEngine.js`)](#14-automation-engine)
15. [Lead Routes + Handlers (`lead.routes.js`)](#15-lead-routes--handlers)
16. [API Routes Map (`routes.js`)](#16-api-routes-map)
17. [Frontend: Axios Config + 401 Handling](#17-frontend-axios-config--401-handling)
18. [Frontend: AuthContext](#18-frontend-authcontext)
19. [Frontend: Socket Client (`socket.js`)](#19-frontend-socket-client)
20. [Frontend: IntegrationsPage + WebhookTester](#20-frontend-integrations--webhooktester)
21. [Error Handler Middleware](#21-error-handler-middleware)
22. [Data Flow: One Event, Start to Finish](#22-data-flow-one-event-start-to-finish)

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
