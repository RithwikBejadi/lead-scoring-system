# Evaluation Defense Prep

## If Asked: "Why is this production-grade?"

**Answer:**
> "This system demonstrates event-driven architecture with idempotent processing, transactional safety via MongoDB replica sets, and post-commit side-effects isolation. These are the exact patterns used by CRMs like HubSpot and Salesforce to handle concurrency at scale."

**Follow-up evidence:**
- Show `ScoreHistory` with unique index on `eventId`
- Show `AutomationExecution` with `(leadId, ruleId, dateBucket)` index
- Show worker transaction wrapper with automations running post-commit

---

## If Asked: "Why not just update score directly?"

**Answer:**
> "Direct updates create race conditions under concurrency. Event sourcing with history as source of truth gives us auditability, replayability, and ACID guarantees. We can rebuild any lead's score from history if needed."

**Show the code:**
```javascript
// worker/workflows/processLeadWorkflow.js
// 1. Get current score from history (source of truth)
const last = await ScoreHistory.findOne({ leadId })
  .sort({ timestamp: -1 })
  .select({ newScore: 1 });
let score = last ? last.newScore : 0;
```

---

## If Asked: "Why velocity instead of just score?"

**Answer:**
> "Raw score lies. A lead with 50 points from 6 months ago is dead. Velocity detects engagement intent by measuring events in a time window. High velocity + high score = qualified. High score + zero velocity = churned."

**Show the intelligence:**
```javascript
// domain/leadIntelligence.js
velocity = eventsLast24h * 3
risk = lastEventAt > 7 days ? "high" : "low"
```

---

## If Asked: "What happens if a worker crashes mid-job?"

**Answer:**
> "Bull queue marks jobs as 'stalled' after 30 seconds and retries them. Our processing is idempotent via unique indexes on eventId and dateBucket, so duplicate processing is safe. Locks are cleared by recovery loop."

**Show the config:**
```javascript
// shared/queue/index.js
stalledInterval: 30000,
maxStalledCount: 2
```

---

## If Asked: "How do you prevent duplicate automations?"

**Answer:**
> "Automation execution uses a unique compound index on (leadId, ruleId, dateBucket). MongoDB throws duplicate key error (11000) on retry, which we catch and ignore. This makes automation triggers idempotent per day."

**Show the model:**
```javascript
// worker/models/AutomationExecution.js
schema.index({ leadId: 1, ruleId: 1, dateBucket: 1 }, { unique: true });
```

---

## If Asked: "Why MongoDB replica set instead of single instance?"

**Answer:**
> "Transactions require replica sets in MongoDB. We use transactions to ensure atomic lead + events + history updates. Without transactions, a crash mid-process could leave inconsistent state."

**Show the transaction:**
```javascript
// worker/index.js
await session.withTransaction(async () => {
  await processLeadWorkflow(job.data.leadId, session);
});
```

---

## If Asked: "Why separate domain/workflows/jobs?"

**Answer:**
> "Domain engines contain pure business logic - stateless, testable, cacheable. Workflows orchestrate but don't decide. Jobs are standalone scripts, not setTimeout. This follows domain-driven design and prevents spaghetti code."

**Show the structure:**
```
domain/stageEngine.js       → Pure: score → stage
domain/leadIntelligence.js  → Pure: lead → intelligence
workflows/processLeadWorkflow.js → Orchestrates transaction
jobs/scoringDecay.job.js    → Standalone script
```

---

## If Asked: "What's your next action field for?"

**Answer:**
> "It turns data into business intelligence. Instead of showing raw numbers, we compute actionable recommendations: 'immediate_outreach', 'schedule_demo', 'nurture_campaign'. This is what makes it a scoring *engine*, not just a database."

**Show the endpoint:**
```bash
GET /api/leads/:id/intelligence
{
  "stage": "hot",
  "velocity": 12,
  "risk": "low",
  "nextAction": "prioritize_contact"  ← Business value
}
```

---

## If Asked: "How would this scale horizontally?"

**Answer:**
> "Workers are stateless. Just run `docker-compose scale worker=5` and they all pull from the same Redis queue. API can scale separately. MongoDB handles concurrent writes via replica set. No shared state, no bottlenecks."

---

## If Asked: "Why is decay a separate job, not automatic?"

**Answer:**
> "Decay runs independently of event processing. Using setTimeout dies on restart. Running it as a standalone script makes it cron-compatible, testable, and restart-safe. In production, we'd schedule it via Kubernetes CronJob or similar."

**Run it:**
```bash
docker exec lead-scoring-worker node jobs/scoringDecay.job.js
```

---

## 60-Second Pitch

> "This is a production-grade lead scoring engine that demonstrates event-driven architecture, transactional safety, and domain-driven design.
>
> When events come in, they're queued via Redis, processed asynchronously by workers using MongoDB transactions, and scored via event sourcing with full audit trails.
>
> The intelligence layer computes velocity, risk, and next actions in real-time.
>
> Automation rules trigger post-commit with idempotent execution logging.
>
> Everything is built for concurrency, scale, and correctness - just like real CRMs like HubSpot and Salesforce.
>
> The frontend is minimal by design - the value is in the backend architecture."

---

## What NOT to Say

❌ "It's just a CRUD app with a queue"
❌ "I followed a tutorial"
❌ "I could add more features given time"

✅ "I focused on production patterns over features"
✅ "This demonstrates system design, not just coding"
✅ "Every architectural decision has a scalability reason"
