# LeadPulse OS — Production Deployment Guide

This guide covers everything needed to take the newly rebuilt Developer Tool frontend and the robust API backend to production.

---

## 🏗 Infrastructure Checklist

You will need accounts on the following platforms:

1. **Frontend Hosting**: Vercel (Recommended) or Render (Static Site)
2. **Backend Hosting**: Render (Web Service) or Railway
3. **Database**: MongoDB Atlas (already in use)
4. **Queue & Rate Limiting**: Upstash Redis (Serverless Redis)
5. **Authentication**: Google Cloud Console (OAuth)

---

## 1️⃣ Backend Setup (Render Web Service)

### A. Environment Variables

In your Render dashboard for the API service, configure the following:

```env
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://your-production-domain.vercel.app

# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/leadpulse
REDIS_URL=rediss://default:<password>@<upstash-endpoint>.upstash.io:31280

# Authentication
JWT_SECRET=generate_a_random_64_char_string_here
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### B. Deployment Settings

- **Build Command**: `npm install`
- **Start Command**: `npm start` (Make sure your `package.json` has `"start": "node server.js"`)

### C. Bull Queue / Redis Warning

Make sure `upstash-redis` or `ioredis` is correctly configured in `api/config/redis.js` to connect securely using `rediss://` (the extra 's' denotes TLS).

---

## 2️⃣ Frontend Setup (Vercel)

### A. Environment Variables

In your Vercel project settings, set these variables:

```env
VITE_API_URL=https://lead-scoring-api-f8x4.onrender.com/api
VITE_WS_URL=https://lead-scoring-api-f8x4.onrender.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### B. Deployment Settings

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### C. Handling Client-Side Routing

If deploying on Vercel, client-side routing is handled automatically.
If deploying on a generic static sever, you must configure rewrites (e.g. `vercel.json` or `_redirects`) to redirect all traffic to `index.html`.

---

## 3️⃣ Google Cloud Console (OAuth Security)

Google will block logins if your production URL is not explicitly allowed.

1. Go to [Google Cloud Console](https://console.cloud.google.com/) -> APIs & Services -> Credentials.
2. Edit your **OAuth 2.0 Web Client ID**.
3. Under **Authorized JavaScript origins**, add your Vercel URL:
   - `https://your-production-domain.vercel.app`
4. _(Don't forget to keep `http://localhost:5173` if you want local auth to keep working!)_

---

## 4️⃣ Testing Your Production Pipeline

Once both services are green, run these manual tests to verify the rollout:

1. **Auth Test**: Go to your production frontend, open the Network tab, and log in with Google. Ensure the `authToken` is saved in `localStorage` and you are redirected to `/overview`.
2. **Infrastructure Test**: Go to the `/system` page. Verify that:
   - MongoDB indicator is Green (Connected).
   - Redis indicator is Green (Connected).
   - API Server is Green.
3. **Queue Test**: Send a dummy event (via the Integrations page or via `cURL`). Verify that the "Active" and "Completed" counts tick up in the Bull Queue panel on the System page.
4. **Socket Test**: Open two tabs. In one tab, go to `/events`. In the other, go to `/integrations` and click "Send test event". Verify the event appears instantly in the first tab without refreshing.

---

## 5️⃣ Daily Operations & Debugging

- **Dead Letter Jobs**: Keep an eye on the System page. If the red "Failed jobs" banner appears, it usually means your Redis connection timed out or a worker crashed while processing a lead score.
- **Rate Limits**: The backend is configured to rate limit abusive IPs. If you suddenly stop receiving events, check your Render backend logs for `429 Too Many Requests`.
- **Rotations**: If your `.env` is ever leaked, immediately regenerate your `JWT_SECRET` and `REDIS_URL` passwords. All existing users will instantly be logged out because their JWTs will fail validation, acting as a global kill-switch.
