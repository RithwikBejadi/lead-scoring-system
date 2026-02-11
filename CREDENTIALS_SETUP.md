# 🔐 PRODUCTION CREDENTIALS SETUP GUIDE

Follow this guide **exactly** to get the keys needed for your `.env` file.

---

## 1. MongoDB (Database)

**Goal**: Get the `MONGO_URI`.

1.  **Go to**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign up.
2.  **Create Cluster**: Select **Shared (Free)** -> **AWS** -> **Create Cluster**.
3.  **Database Access**:
    - Go to **Security** -> **Database Access** on the left.
    - Click **Add New Database User**.
    - **Username**: `admin`
    - **Password**: Click "Autogenerate Secure Password" -> **COPY THIS PASSWORD**.
    - Click **Add User**.
4.  **Network Access** (Crucial):
    - Go to **Security** -> **Network Access**.
    - Click **Add IP Address**.
    - Click **Allow Access From Anywhere** (`0.0.0.0/0`). (Required for Render/Cloud hosting).
    - Click **Confirm**.
5.  **Get Connection String**:
    - Click **Database** on the left -> **Connect**.
    - Select **Drivers** (Node.js).
    - **COPY** the connection string. It looks like:
      `mongodb+srv://admin:<password>@cluster0.xyz.mongodb.net/?retryWrites=true&w=majority`
    - **ACTION**: Replace `<password>` with the password you copied in Step 3.
    - **RESULT**: This is your `MONGO_URI`.

---

## 2. Redis (Queue)

**Goal**: Get `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`.

**Option A: Upstash (Recommended - Easiest)**

1.  **Go to**: [Upstash Console](https://console.upstash.com/login).
2.  **Create Database**: Click **Create Database** -> Name: `lead-scoring` -> Region: `US-East-1` (or closest to you).
3.  **Get Details**:
    - Scroll uniquely to the **REST API** / **Connect** section.
    - Look for the **Node.js (ioredis)** tab or just the **Endpoint** details.
    - **Endpoint**: `Global-xxxxx.upstash.io` -> This is your `REDIS_HOST`.
    - **Port**: `6379` -> This is your `REDIS_PORT`.
    - **Password**: Copy the long string. -> This is your `REDIS_PASSWORD`.
    - **TLS**: Set `REDIS_TLS=true` in your env.

**Option B: Render Redis (Internal)**

- If you deploy Redis directly on Render, they give you an "Internal Connection URL". Use that as `REDIS_HOST` (e.g., `redis://red-xxxxx:6379`).

---

## 3. Security (JWT)

**Goal**: Get `JWT_SECRET`.

1.  Open your local terminal.
2.  Run this command:
    ```bash
    openssl rand -hex 32
    ```
3.  **COPY** the output. This is your `JWT_SECRET`.

---

## 4. Final Checklist

You should now have these values ready to paste into Render/Railway:

```bash
NODE_ENV=production
MONGO_URI=mongodb+srv://admin:PASSWORD@cluster0.xyz.mongodb.net/?retryWrites=true&w=majority
REDIS_HOST=Global-xxxxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=YourUpstashPassword...
REDIS_TLS=true
JWT_SECRET=YourGeneratedHexCode...
WORKER_CONCURRENCY=5
```
