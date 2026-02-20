/**
 * IntegrationsPage — where adoption happens.
 * SDK install snippet, API key manager, test send, webhook setup.
 */

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios.config";
import InstallSnippet from "./components/InstallSnippet";
import ApiKeyManager from "./components/ApiKeyManager";
import WebhookTester from "./components/WebhookTester";
import { Panel } from "../../shared/ui/Panel";
import { API_URL } from "../../config";

export default function IntegrationsPage() {
  const { user } = useAuth();
  const [project, setProject] = useState(null);

  useEffect(() => {
    api.get("/projects")
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        if (list.length > 0) setProject(list[0]);
      })
      .catch(() => {});
  }, []);

  const apiKey = project?.apiKey || user?.apiKey || null;

  const handleRotate = async () => {
    if (!project) return;
    try {
      const res = await api.post(`/projects/${project._id || project.id}/rotate-key`);
      setProject(prev => ({ ...prev, apiKey: res.data?.apiKey || res.data?.data?.apiKey }));
    } catch (e) {
      alert(e.response?.data?.error || "Rotation failed");
    }
  };

  return (
    <div className="p-6 max-w-[920px] mx-auto flex flex-col gap-6">

      {/* SDK Install */}
      <Panel title="Install SDK">
        <div className="p-4">
          <p className="text-xs text-neutral-600 mb-4">
            Add tracking to your site in under 2 minutes.
          </p>
          <InstallSnippet apiKey={apiKey} />
        </div>
      </Panel>

      {/* API Keys */}
      <Panel title="API Key">
        <div className="p-4">
          <p className="text-xs text-neutral-600 mb-4">
            Use this key to authenticate SDK and API calls.
          </p>
          <ApiKeyManager apiKey={apiKey} onRotate={handleRotate} />
        </div>
      </Panel>

      {/* Test ingestion */}
      <Panel title="Test Ingestion">
        <div className="p-4">
          <p className="text-xs text-neutral-600 mb-4">
            Send a test event to verify your pipeline is working end-to-end.
          </p>
          <WebhookTester apiKey={apiKey} />
        </div>
      </Panel>

      {/* API reference quick links */}
      <Panel title="API Reference">
        <div className="p-4 flex flex-col gap-3 font-mono text-xs">
          {[
            { method: "POST", path: "/api/ingest/event", desc: "Track anonymous event" },
            { method: "POST", path: "/api/events", desc: "Track authenticated event" },
            { method: "GET",  path: "/api/leads",   desc: "List all leads" },
            { method: "GET",  path: "/api/rules",   desc: "List scoring rules" },
            { method: "GET",  path: "/api/health",  desc: "System health check" },
          ].map(r => (
            <div key={r.path} className="flex items-center gap-3">
              <span className={`w-10 text-center text-[10px] font-semibold rounded px-1 py-0.5 ${
                r.method === "POST"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : "bg-blue-950 text-blue-400 border border-blue-800"
              }`}>
                {r.method}
              </span>
              <code className="text-neutral-400">{API_URL.replace("/api", "")}{r.path}</code>
              <span className="text-neutral-700">{r.desc}</span>
            </div>
          ))}
        </div>
      </Panel>

    </div>
  );
}
