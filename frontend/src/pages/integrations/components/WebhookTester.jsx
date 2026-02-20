/**
 * WebhookTester — send a test event to verify ingestion is working.
 */

import { useState } from "react";
import api from "../../../api/axios.config";

const SAMPLE_EVENT = {
  type: "page_view",
  anonymousId: "anon_test_001",
  properties: {
    page: "/pricing",
    source: "devtools_test",
  },
};

export default function WebhookTester({ apiKey }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    setResult(null);
    try {
      const start = Date.now();
      const res = await api.post("/ingest/event", SAMPLE_EVENT);
      const ms = Date.now() - start;
      setResult({
        ok: true,
        status: res.status,
        ms,
        data: res.data,
      });
    } catch (e) {
      setResult({
        ok: false,
        status: e.response?.status,
        msg: e.response?.data?.error || e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-2">
          Test Payload
        </p>
        <pre className="bg-[#0d0d0d] border border-white/5 rounded p-3 text-xs font-mono text-neutral-500">
          {JSON.stringify(SAMPLE_EVENT, null, 2)}
        </pre>
      </div>

      <button
        onClick={send}
        disabled={loading}
        className="self-start px-4 py-1.5 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-3 h-3 border border-neutral-600 border-t-neutral-300 rounded-full animate-spin" />
            Sending…
          </>
        ) : (
          "→ Send Test Event"
        )}
      </button>

      {result && (
        <div className={`rounded border p-3 font-mono text-xs ${
          result.ok
            ? "bg-emerald-950 border-emerald-800 text-emerald-400"
            : "bg-red-950 border-red-800 text-red-400"
        }`}>
          {result.ok ? (
            <>
              <span className="font-semibold">✓ {result.status} OK</span>
              <span className="text-emerald-700 ml-2">{result.ms}ms</span>
              {result.data?.eventId && (
                <p className="text-emerald-700 mt-1 text-[10px]">
                  eventId: {result.data.eventId}
                </p>
              )}
            </>
          ) : (
            <>
              <span className="font-semibold">✗ {result.status || "Error"}</span>
              <p className="mt-1">{result.msg}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
