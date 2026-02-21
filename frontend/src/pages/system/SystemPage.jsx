/**
 * SystemPage — infrastructure visibility.
 * Makes the product feel production-grade.
 */

import { useState, useEffect, useCallback } from "react";
import { systemApi } from "../../features/system/system.api";
import WorkerHealth from "./components/WorkerHealth";
import MongoRedisStats from "./components/MongoRedisStats";
import FailedJobsTable from "./components/FailedJobsTable";
import { Panel } from "../../shared/ui/Panel";
import { Spinner } from "../../shared/ui/Spinner";

export default function SystemPage() {
  const [health, setHealth] = useState(null);
  const [queueStats, setQueueStats] = useState(null);
  const [failedJobs, setFailedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryMsg, setRetryMsg] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [h, q, f] = await Promise.allSettled([
        systemApi.health(),
        systemApi.getQueueStats(),
        systemApi.getFailedJobs({ limit: 20 }),
      ]);
      if (h.status === "fulfilled") setHealth(h.value);
      if (q.status === "fulfilled") {
        const val = q.value?.data || q.value;
        setQueueStats(val);
      }
      if (f.status === "fulfilled") {
        const arr = Array.isArray(f.value) ? f.value : (f.value?.data || f.value?.jobs || []);
        setFailedJobs(arr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleRetry = async (id) => {
    try {
      await systemApi.retryJob(id);
      setRetryMsg({ ok: true, msg: "Job queued for retry" });
      setFailedJobs(prev => prev.filter(j => (j._id || j.id) !== id));
    } catch (e) {
      setRetryMsg({ ok: false, msg: e.response?.data?.error || "Retry failed" });
    }
    setTimeout(() => setRetryMsg(null), 3000);
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto flex flex-col gap-6">

      {retryMsg && (
        <div className={`fixed bottom-6 right-6 px-4 py-2.5 rounded-lg border text-xs font-mono shadow-xl z-50 ${
          retryMsg.ok
            ? "bg-emerald-950 border-emerald-700 text-emerald-400"
            : "bg-red-950 border-red-700 text-red-400"
        }`}>
          {retryMsg.msg}
        </div>
      )}

      {/* Service status */}
      <Panel
        title="Services"
        action={
          <button
            onClick={fetch}
            className="text-[11px] font-mono text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            ↻ Refresh
          </button>
        }
      >
        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <MongoRedisStats health={health} />
        )}
      </Panel>

      {/* Queue stats */}
      <Panel title="Queue Stats">
        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <WorkerHealth queueStats={queueStats} />
        )}
      </Panel>

      {/* Failed jobs */}
      <Panel
        title={`Dead Letter Queue (${failedJobs.length})`}
        action={
          failedJobs.length > 0 && (
            <span className="text-[10px] font-mono text-red-500">
              {failedJobs.length} failed
            </span>
          )
        }
      >
        <FailedJobsTable jobs={failedJobs} onRetry={handleRetry} />
      </Panel>

      {/* Raw health JSON */}
      {health && (
        <Panel title="Raw Health Response">
          <div className="p-4">
            <pre className="text-xs font-mono text-neutral-500 overflow-auto">
              {JSON.stringify(health, null, 2)}
            </pre>
          </div>
        </Panel>
      )}

    </div>
  );
}
