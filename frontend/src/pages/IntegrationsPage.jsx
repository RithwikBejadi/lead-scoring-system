import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios.config";
import { API_URL } from "../config";

// ── Copy Button ───────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
    >
      <span className="material-icons text-sm">
        {copied ? "check" : "content_copy"}
      </span>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ── Code Block ────────────────────────────────────────────────────────────────
function CodeBlock({ code }) {
  return (
    <div className="relative">
      <pre className="bg-black text-green-400 text-[11px] font-mono p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
        {code}
      </pre>
      <div className="absolute top-2 right-2">
        <CopyButton text={code} />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function IntegrationsPage() {
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("html");
  const [testStatus, setTestStatus] = useState(null);
  const [testing, setTesting] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);

  const baseUrl = API_URL?.replace(/\/api$/, "") || "http://localhost:4000";

  const loadApiKey = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get("/auth/project");
      const key = res.data?.data?.project?.apiKey;
      if (!key) throw new Error("No API key found");
      setApiKey(key);
    } catch (err) {
      if (err.response?.status === 401)
        setError("Unauthorized — please log in.");
      else if (!err.response)
        setError("Cannot reach backend. Is the API running?");
      else setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLastEvent = useCallback(async () => {
    try {
      const res = await api.get("/analytics/dashboard");
      setLastEvent(res.data?.data?.lastEventAt || null);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    loadApiKey();
    loadLastEvent();
  }, [loadApiKey, loadLastEvent]);

  const sendTestEvent = async () => {
    if (!apiKey) return;
    setTesting(true);
    setTestStatus(null);
    try {
      const res = await fetch(`${baseUrl}/api/ingest/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          event: "PAGE_VIEW",
          anonymousId: `integration-test-${Date.now()}@test.com`,
          properties: {
            url: window.location.href,
            source: "integrations-test-btn",
          },
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTestStatus("success");
      loadLastEvent();
    } catch (e) {
      setTestStatus("error");
    } finally {
      setTesting(false);
    }
  };

  const snippets = {
    html: apiKey
      ? `<!-- Add before </body> -->
<script>
  (function(w, d, s, o, f, js, fjs) {
    w['LeadPulse'] = o;
    w[o] = w[o] || function() { (w[o].q = w[o].q || []).push(arguments) };
    js = d.createElement(s); fjs = d.getElementsByTagName(s)[0];
    js.id = o; js.src = f; js.async = 1;
    fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'lp', '${baseUrl}/sdk/leadpulse.js'));

  lp('init', '${apiKey}');
  lp('track', 'PAGE_VIEW', { url: window.location.href });
</script>`
      : "Loading…",

    npm: apiKey
      ? `npm install @leadpulse/sdk

// In your app
import { LeadPulse } from '@leadpulse/sdk';

const lp = new LeadPulse({ apiKey: '${apiKey}', baseUrl: '${baseUrl}' });
lp.track('PAGE_VIEW', { url: window.location.href });`
      : "Loading…",

    curl: apiKey
      ? `curl -X POST ${baseUrl}/api/ingest/event \\
  -H "Content-Type: application/json" \\
  -d '{
    "apiKey": "${apiKey}",
    "event": "PAGE_VIEW",
    "anonymousId": "user@example.com",
    "properties": { "url": "https://yoursite.com/pricing" }
  }'`
      : "Loading…",
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-google-border bg-surface-light dark:bg-surface-dark flex-shrink-0">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <span className="material-icons text-primary text-xl">
            integration_instructions
          </span>
          Integrations & SDK
        </h1>
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
          Connect your website or app to start tracking leads
        </p>
      </div>

      <div className="p-6 space-y-6 max-w-3xl">
        {/* API Key Card */}
        <section className="border border-google-border rounded-xl p-5 bg-surface-light dark:bg-surface-dark">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="material-icons text-base text-primary">key</span>
            Your API Key
          </h2>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
              <span className="material-icons animate-spin text-base">
                sync
              </span>
              Loading…
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
              {error}
              <button onClick={loadApiKey} className="ml-2 underline">
                Retry
              </button>
            </div>
          )}
          {apiKey && (
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-background-light dark:bg-background-dark border border-google-border rounded-md px-3 py-2 text-sm font-mono truncate">
                {apiKey}
              </code>
              <CopyButton text={apiKey} />
            </div>
          )}
        </section>

        {/* SDK Snippet */}
        <section className="border border-google-border rounded-xl p-5 bg-surface-light dark:bg-surface-dark">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="material-icons text-base text-primary">code</span>
            Install SDK
          </h2>
          <div className="flex gap-2 mb-4">
            {["html", "npm", "curl"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                  tab === t
                    ? "bg-primary text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
          <CodeBlock code={snippets[tab]} />
        </section>

        {/* Test Ingestion */}
        <section className="border border-google-border rounded-xl p-5 bg-surface-light dark:bg-surface-dark">
          <h2 className="text-sm font-semibold mb-1 flex items-center gap-2">
            <span className="material-icons text-base text-primary">send</span>
            Test Ingestion
          </h2>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-4">
            Sends a real <code className="font-mono">PAGE_VIEW</code> event
            using your API key. Check the Events page after.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={sendTestEvent}
              disabled={testing || !apiKey}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {testing ? (
                <>
                  <span className="material-icons animate-spin text-sm">
                    sync
                  </span>{" "}
                  Sending…
                </>
              ) : (
                <>
                  <span className="material-icons text-sm">play_arrow</span>{" "}
                  Send Test Event
                </>
              )}
            </button>
            {testStatus === "success" && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <span className="material-icons text-sm">check_circle</span>{" "}
                Event accepted! Check Events page.
              </span>
            )}
            {testStatus === "error" && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <span className="material-icons text-sm">error</span> Test
                failed — is the backend running?
              </span>
            )}
          </div>
          {lastEvent && (
            <p className="mt-3 text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Last event received: {new Date(lastEvent).toLocaleString()}
            </p>
          )}
        </section>

        {/* API Reference */}
        <section className="border border-google-border rounded-xl p-5 bg-surface-light dark:bg-surface-dark">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="material-icons text-base text-primary">
              menu_book
            </span>
            API Reference
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3 bg-background-light dark:bg-background-dark rounded-lg">
              <span className="bg-green-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                POST
              </span>
              <div>
                <code className="font-mono">{baseUrl}/api/ingest/event</code>
                <p className="text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                  Ingest a single event. Requires apiKey, event, anonymousId.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-background-light dark:bg-background-dark rounded-lg">
              <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                GET
              </span>
              <div>
                <code className="font-mono">{baseUrl}/api/health</code>
                <p className="text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                  Check system health (MongoDB + Redis status).
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
