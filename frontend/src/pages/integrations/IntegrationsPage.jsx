import React, { useState, useEffect } from "react";
import { Panel, PanelHeader } from "../../shared/ui/Panel.jsx";
import Badge from "../../shared/ui/Badge.jsx";
import api from "../../shared/api/axios.js";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded border border-google-border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-text-secondary-light dark:text-text-secondary-dark"
    >
      <span className="material-icons text-[14px]">
        {copied ? "check" : "content_copy"}
      </span>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBlock({ code, language = "html" }) {
  return (
    <div className="relative rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-white/10">
        <span className="text-[10px] font-mono text-white/30">{language}</span>
        <CopyButton text={code} />
      </div>
      <pre className="bg-slate-950 text-emerald-400 font-mono text-[12px] p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap break-all">
        {code}
      </pre>
    </div>
  );
}

export default function IntegrationsPage() {
  const [project, setProject] = useState(null);
  const [keyVisible, setKeyVisible] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // null | "sending" | "ok" | "error"

  useEffect(() => {
    api
      .get("/auth/project")
      .then((r) => {
        if (r.data?.success) setProject(r.data.data.project);
      })
      .catch(() => {});
  }, []);

  const apiKey = project?.apiKey || "pk_xxxxxxxxxxxxxxxxxxxxxxxx";

  const sdkSnippet = `<!-- LeadPulse tracking snippet -->
<script>
  (function(w,d,s,n){
    w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
    var t=d.createElement(s);t.async=1;
    t.src="https://cdn.leadpulse.io/ls.min.js";
    d.head.appendChild(t);
  })(window,document,'script','lp');
  lp('init', '${apiKey}');
</script>`;

  const curlSnippet = `curl -X POST https://lead-scoring-api-f8x4.onrender.com/api/events/ingest \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "page_view",
    "anonymousId": "anon_test_123",
    "properties": { "page": "/pricing" }
  }'`;

  const nodeSnippet = `const { LeadPulse } = require('@leadpulse/sdk');

const lp = new LeadPulse('${apiKey}');

await lp.track({
  event: 'demo_request',
  email: 'user@company.com',
  properties: { plan: 'enterprise', source: 'pricing' }
});`;

  const testSend = async () => {
    setTestStatus("sending");
    try {
      await api.post("/events/ingest", {
        event: "page_view",
        anonymousId: `test_${Date.now()}`,
        properties: {
          source: "integrations_page",
          test: true,
          path: "/test-validation",
        },
      });
      setTestStatus("ok");
    } catch {
      setTestStatus("error");
    }
    setTimeout(() => setTestStatus(null), 4000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="h-14 flex items-center px-6 border-b border-google-border bg-surface-light dark:bg-surface-dark shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
            Integrations
          </h1>
          <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
            Install the SDK and connect your data sources
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Install SDK */}
          <div className="xl:col-span-2">
            <Panel noPad>
              <PanelHeader
                title="1. Install Tracking Snippet"
                subtitle="Add this to your site's <head> — events start flowing immediately"
                actions={
                  <div className="flex items-center gap-2">
                    {project?.lastEventAt && (
                      <Badge variant="success" dot="bg-emerald-500">
                        Last seen{" "}
                        {new Date(project.lastEventAt).toLocaleTimeString()}
                      </Badge>
                    )}
                    <button
                      onClick={testSend}
                      disabled={testStatus === "sending"}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded transition-colors
                        ${testStatus === "ok" ? "bg-emerald-100 text-emerald-700" : testStatus === "error" ? "bg-red-100 text-red-700" : "bg-primary text-white hover:bg-blue-600"}`}
                    >
                      <span
                        className={`material-icons text-[14px] ${testStatus === "sending" ? "animate-spin" : ""}`}
                      >
                        {testStatus === "ok"
                          ? "check_circle"
                          : testStatus === "error"
                            ? "error"
                            : testStatus === "sending"
                              ? "sync"
                              : "send"}
                      </span>
                      {testStatus === "sending"
                        ? "Sending..."
                        : testStatus === "ok"
                          ? "Event received!"
                          : testStatus === "error"
                            ? "Failed"
                            : "Send test event"}
                    </button>
                  </div>
                }
              />
              <div className="p-4">
                <CodeBlock code={sdkSnippet} language="html" />
              </div>
            </Panel>
          </div>

          {/* API Key */}
          <Panel noPad>
            <PanelHeader
              title="API Key"
              subtitle="Use this key in all SDK and API calls"
            />
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-3">
                <span className="material-icons text-[16px] text-text-secondary-light dark:text-text-secondary-dark">
                  key
                </span>
                <span className="font-mono text-sm flex-1 text-text-primary-light dark:text-text-primary-dark">
                  {keyVisible ? apiKey : "pk_" + "•".repeat(20)}
                </span>
                <button
                  onClick={() => setKeyVisible(!keyVisible)}
                  className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary"
                >
                  <span className="material-icons text-[16px]">
                    {keyVisible ? "visibility_off" : "visibility"}
                  </span>
                </button>
                <CopyButton text={apiKey} />
              </div>
              <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                Keep this key secret. Rotate it from this panel if compromised.
              </p>
            </div>
          </Panel>

          {/* cURL */}
          <Panel noPad>
            <PanelHeader
              title="REST API"
              subtitle="Ingest events via HTTP from any backend"
            />
            <div className="p-4">
              <CodeBlock code={curlSnippet} language="bash" />
            </div>
          </Panel>

          {/* Node.js */}
          <Panel noPad>
            <PanelHeader
              title="Node.js SDK"
              subtitle="Official npm package (@leadpulse/sdk)"
            />
            <div className="p-4">
              <CodeBlock code={nodeSnippet} language="javascript" />
            </div>
          </Panel>

          {/* Webhook setup */}
          <Panel noPad>
            <PanelHeader
              title="Webhook Endpoint"
              subtitle="Receive automation triggers at your URL"
            />
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://your-server.com/hooks/lead"
                  className="flex-1 px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded border-none focus:ring-2 focus:ring-primary/50"
                />
                <button className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-blue-600 transition-colors">
                  Save
                </button>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 font-mono text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                <p className="text-primary font-bold mb-1">
                  POST https://your-server.com/hooks/lead
                </p>
                <p>{`{ "event": "lead.qualified", "leadId": "...", "score": 92 }`}</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
