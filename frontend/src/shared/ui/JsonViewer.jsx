/**
 * JsonViewer — syntax-highlighted JSON display.
 */
import { useState } from "react";

function colorize(json) {
  if (typeof json !== "string") {
    json = JSON.stringify(json, null, 2);
  }
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "text-blue-400"; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) cls = "text-neutral-300"; // key
          else cls = "text-emerald-400"; // string
        } else if (/true|false/.test(match)) cls = "text-amber-400"; // bool
        else if (/null/.test(match)) cls = "text-red-400"; // null
        return `<span class="${cls}">${match}</span>`;
      }
    );
}

export function JsonViewer({ data, collapsed = false }) {
  const [open, setOpen] = useState(!collapsed);
  const json = JSON.stringify(data, null, 2);

  return (
    <div className="rounded bg-[#0d0d0d] border border-white/5 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5">
        <span className="text-[10px] font-mono text-neutral-500">JSON</span>
        <button
          onClick={() => setOpen(p => !p)}
          className="text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          {open ? "collapse" : "expand"}
        </button>
      </div>
      {open && (
        <pre
          className="text-xs font-mono p-3 overflow-auto max-h-80 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: colorize(json) }}
        />
      )}
    </div>
  );
}
