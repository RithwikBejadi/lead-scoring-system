/**
 * WebhookPreview — shows outgoing webhook payload shape + retry status.
 */

import { JsonViewer } from "../../../shared/ui/JsonViewer";
import { Badge } from "../../../shared/ui/Badge";

const SAMPLE_PAYLOAD = {
  event: "lead.score_updated",
  leadId: "lead_abc123",
  email: "john@example.com",
  score: 85,
  scoreDelta: +30,
  timestamp: new Date().toISOString(),
};

export default function WebhookPreview({ webhook }) {
  if (!webhook) {
    return (
      <div className="p-4 text-xs text-neutral-700 font-mono">
        Select a webhook to see payload preview
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600">Endpoint</p>
        <code className="text-xs font-mono text-neutral-400">POST {webhook.url || webhook.endpoint}</code>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-2">Payload Preview</p>
        <JsonViewer data={SAMPLE_PAYLOAD} collapsed={false} />
      </div>

      {webhook.lastError && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-red-700 mb-1">Last Error</p>
          <p className="text-xs font-mono text-red-400">{webhook.lastError}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Badge variant={webhook.active !== false ? "success" : "neutral"}>
          {webhook.active !== false ? "active" : "disabled"}
        </Badge>
        {webhook.retryCount != null && (
          <span className="text-xs font-mono text-neutral-600">
            {webhook.retryCount} retries
          </span>
        )}
      </div>
    </div>
  );
}
