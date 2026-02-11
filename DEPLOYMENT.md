# 🚀 PRODUCTION DEPLOYMENT GUIDE

## 1. Environment Variables (Required for API & Worker)

Configure these in your hosting platform (Render/Railway/etc).

```bash
# Node Environment
NODE_ENV=production
PORT=4000

# Security
JWT_SECRET=your_super_long_secret_key_here

# Database (Managed MongoDB)
# Must support Replica Sets!
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/lead-scoring?retryWrites=true&w=majority

# Queue (Managed Redis)
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_TLS=true  # Set 'true' for Upstash/managed Redis

# Worker Configuration
WORKER_CONCURRENCY=5
```

## 2. Deployment Instructions (Render.com)

This project includes a `render.yaml` for automatic deployment.

1.  **Push code** to GitHub.
2.  Login to **Render**.
3.  Click **New +** -> **Blueprint**.
4.  Connect your repo.
5.  Render will auto-discover `lead-scoring-api` and `lead-scoring-worker`.
6.  **Update Environment Variables** for both services in the Render Dashboard.
7.  Deploy!

## 3. Verification Steps (Post-Deployment)

Once deployed, you MUST run these tests against your live URL.

### Step 1: Ingestion & Rate Limit Check

Run from your local terminal:

```bash
./verify-production-ingest.sh https://api.yourdomain.com
```

- **Success**: Returns ✅ for single event and idempotency check.
- **Success**: Returns ✅ for rate limit check (429 after 100 reqs).

### Step 2: Load Test (1000 Events)

Run this to ensure the worker doesn't crash under load:

```bash
node verify-load.js https://api.yourdomain.com
```

- **Check logs**: Ensure no "Job stalled" or "Lock timeout" errors in Worker logs.

### Step 3: Invariant Check (DB Consistency)

Connect to your production MongoDB and run:

```bash
# Requires setting MONGO_URI in .env locally first
node verify-invariants.js
```

- **Success**: "✅ SYSTEM HEALTHY - READY FOR FREEZE"

## 4. Troubleshooting

- **Redis Error**: Check `REDIS_TLS`. If using a provider that requires TLS (like Upstash/Azure), ensure `REDIS_TLS=true` is set.
- **Mongo Transaction Error**: Ensure your MongoDB is a **Replica Set**. Standalone Mongo (local default) does not support transactions.
- **Worker Crashing**: Check memory limits. Increase `WORKER_CONCURRENCY` if queue grows too fast, or decrease if OOM kills.
