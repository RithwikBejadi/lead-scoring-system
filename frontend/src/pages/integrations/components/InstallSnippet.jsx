/**
 * InstallSnippet — SDK installation block with copy button.
 */

import { useState } from "react";
import { CopyButton } from "../../../shared/ui/CopyButton";

export default function InstallSnippet({ apiKey }) {
  const [tab, setTab] = useState("script"); // "script" | "npm" | "api"

  const scriptSnippet = `<script
  src="https://cdn.leadscore.io/ls.js"
  data-api-key="${apiKey || "pk_YOUR_API_KEY"}">
</script>

<script>
  // Identify a user
  ls.identify({ email: "user@example.com" });

  // Track an event
  ls.track("page_view", { page: "/pricing" });
</script>`;

  const npmSnippet = `npm install @leadscore/js

// In your app
import ls from '@leadscore/js';

ls.init('${apiKey || "pk_YOUR_API_KEY"}');
ls.identify({ email: 'user@example.com' });
ls.track('page_view', { page: '/pricing' });`;

  const curlSnippet = `curl -X POST https://api.leadscore.io/api/ingest/event \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey || "pk_YOUR_API_KEY"}" \\
  -d '{
    "type": "page_view",
    "anonymousId": "anon_abc123",
    "properties": { "page": "/pricing" }
  }'`;

  const snippets = { script: scriptSnippet, npm: npmSnippet, api: curlSnippet };
  const current = snippets[tab];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 border-b border-white/5">
        {["script", "npm", "api"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-mono transition-colors ${
              tab === t
                ? "text-white border-b-2 border-emerald-500"
                : "text-neutral-600 hover:text-neutral-400"
            }`}
          >
            {t === "script" ? "HTML Script" : t === "npm" ? "NPM" : "REST API"}
          </button>
        ))}
      </div>

      <div className="relative">
        <pre className="bg-[#0d0d0d] border border-white/5 rounded-lg p-4 text-xs font-mono text-neutral-400 overflow-x-auto leading-relaxed">
          {current}
        </pre>
        <div className="absolute top-3 right-3">
          <CopyButton text={current} />
        </div>
      </div>
    </div>
  );
}
