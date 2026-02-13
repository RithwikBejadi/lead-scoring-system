# 🧪 MANUAL TESTING GUIDE (No Code Required)

This guide explains how to test the **Lead Scoring System** using just your browser and the application UI.

---

## 🎯 Prerequisite: System Check

1.  **Backend Services**: Ensure the API and Worker are running (Agent has started them via Docker).
    - API: `http://localhost:4000`
    - Worker: (Runs in background)
2.  **Frontend**: Ensure your frontend is running at `http://localhost:5173`.
3.  **Database**: Connected to **Production MongoDB Atlas**.

---

## 🟢 Test 1: Sign In & Dashboard Load

1.  Open [http://localhost:5173](http://localhost:5173).
2.  Click **"Sign in with Google"**.
3.  Wait for the dashboard to load.
4.  **Verification**:
    - Do you see your name/profile picture?
    - Do you see a "Leads" table? (It might be empty initially).
    - ✅ **Pass**: Authentication and DB connection are working.

---

## 🟢 Test 2: Create a Lead (via Simulation)

Since the system is event-driven, we need to simulate an event. We can do this using the simple HTML simulator provided in the repo, or by using the Swagger UI if available.

**Easier Method (Browser Console Simulation)**:

1.  On the Dashboard, right-click -> **Inspect** -> **Console**.
2.  Paste this code to simulate a `page_view` event (mimicking the SDK):
    ```javascript
    fetch("http://localhost:4000/api/ingest/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: "pk_test_123", // Default test key
        event: "page_view",
        anonymousId: "anon_tester_001",
        sessionId: "sess_001",
        properties: { url: window.location.href, title: document.title },
      }),
    })
      .then((r) => r.json())
      .then(console.log);
    ```
3.  **Verification**:
    - Console should print: `{status: "queued"}`.
    - Wait 5-10 seconds.
    - Refresh the Dashboard.
    - **✅ Pass**: You should see a new Lead (or updated Lead) with `anonymousId: anon_tester_001` and a score change (e.g., +5 points for page_view).

---

## 🟢 Test 3: High Value Event (Scoring Logic)

1.  In the same **Console**, simulate a "pricing_page_visit":
    ```javascript
    fetch("http://localhost:4000/api/ingest/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: "pk_test_123",
        event: "pricing_view",
        anonymousId: "anon_tester_001",
        sessionId: "sess_001",
        properties: { plan: "pro" },
      }),
    })
      .then((r) => r.json())
      .then(console.log);
    ```
2.  **Verification**:
    - Refresh Dashboard.
    - **✅ Pass**: The score should increase significantly (e.g., +10 or +20 depending on rules).

---

## 🟢 Test 4: Rate Limiting (Safety Check)

1.  Try to spam the button or run a loop in console:
    ```javascript
    for (let i = 0; i < 120; i++) {
      fetch("http://localhost:4000/api/ingest/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: "pk_test_123",
          event: "spam",
          anonymousId: "anon_spammer",
        }),
      });
    }
    ```
2.  **Verification**:
    - Check the API/Network tab.
    - **✅ Pass**: After ~100 requests, you should see `429 Too Many Requests` errors.

---

## 🔴 Troubleshooting

- **No new leads?**
  - The Worker might be stuck or failed to connect to Redis.
  - Ask the agent to check `docker logs lead-scoring-worker`.
- **Login fails?**
  - Google OAuth might be misconfigured for `localhost`.
  - Check the browser console for CORS errors.
