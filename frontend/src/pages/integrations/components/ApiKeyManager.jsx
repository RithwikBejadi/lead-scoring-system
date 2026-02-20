/**
 * ApiKeyManager — show API key, rotate, revoke.
 */

import { useState } from "react";
import { CopyButton } from "../../../shared/ui/CopyButton";

export default function ApiKeyManager({ apiKey, onRotate }) {
  const [visible, setVisible] = useState(false);
  const [rotating, setRotating] = useState(false);

  const displayed = visible
    ? (apiKey || "pk_not_configured")
    : "pk_" + "•".repeat(24);

  const doRotate = async () => {
    if (!window.confirm("Rotate API key? Your current key will stop working immediately.")) return;
    setRotating(true);
    try { await onRotate(); } finally { setRotating(false); }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <code className="flex-1 bg-[#0d0d0d] border border-white/5 rounded px-3 py-2 text-xs font-mono text-neutral-400">
          {displayed}
        </code>
        <button
          onClick={() => setVisible(p => !p)}
          className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors px-2 py-2 border border-white/5 rounded bg-[#0d0d0d]"
        >
          {visible ? "hide" : "show"}
        </button>
        {apiKey && <CopyButton text={apiKey} />}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={doRotate}
          disabled={rotating}
          className="text-xs font-mono text-amber-600 hover:text-amber-400 transition-colors disabled:opacity-50"
        >
          {rotating ? "Rotating…" : "↻ Rotate key"}
        </button>
        <span className="text-neutral-800">|</span>
        <span className="text-xs font-mono text-neutral-700">
          Keep this secret. Never expose in client-side code without restrictions.
        </span>
      </div>
    </div>
  );
}
