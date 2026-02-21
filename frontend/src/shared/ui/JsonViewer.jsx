import React, { useState } from "react";

function JsonNode({ data, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(depth > 2);

  if (data === null) return <span className="text-slate-400">null</span>;
  if (typeof data === "boolean")
    return <span className="text-amber-400">{String(data)}</span>;
  if (typeof data === "number")
    return <span className="text-blue-400">{data}</span>;
  if (typeof data === "string")
    return <span className="text-emerald-400">"{data}"</span>;

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-slate-400">[]</span>;
    return (
      <span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white"
        >
          {collapsed ? `▶ [${data.length}]` : "▼ ["}
        </button>
        {!collapsed && (
          <>
            {data.map((v, i) => (
              <div key={i} style={{ paddingLeft: 16 }}>
                <JsonNode data={v} depth={depth + 1} />
                {i < data.length - 1 && (
                  <span className="text-slate-600">,</span>
                )}
              </div>
            ))}
            <span className="text-slate-400">]</span>
          </>
        )}
      </span>
    );
  }

  if (typeof data === "object") {
    const keys = Object.keys(data);
    if (keys.length === 0)
      return <span className="text-slate-400">{"{}"}</span>;
    return (
      <span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white"
        >
          {collapsed ? `▶ {${keys.length}}` : "▼ {"}
        </button>
        {!collapsed && (
          <>
            {keys.map((k, i) => (
              <div key={k} style={{ paddingLeft: 16 }}>
                <span className="text-blue-300">"{k}"</span>
                <span className="text-slate-400">: </span>
                <JsonNode data={data[k]} depth={depth + 1} />
                {i < keys.length - 1 && (
                  <span className="text-slate-600">,</span>
                )}
              </div>
            ))}
            <span className="text-slate-400">{"}"}</span>
          </>
        )}
      </span>
    );
  }

  return <span className="text-slate-300">{String(data)}</span>;
}

export default function JsonViewer({ data, className = "" }) {
  return (
    <pre
      className={`bg-slate-950 text-slate-300 text-[11px] font-mono p-4 rounded-lg overflow-auto leading-relaxed ${className}`}
    >
      <JsonNode data={data} depth={0} />
    </pre>
  );
}
