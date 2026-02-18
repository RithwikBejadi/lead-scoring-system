/**
 * CopyButton — inline copy-to-clipboard button.
 */
import { useState } from "react";

export function CopyButton({ text, className = "" }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded border transition-colors ${
        copied
          ? "border-emerald-700 text-emerald-400 bg-emerald-950"
          : "border-white/10 text-neutral-400 hover:text-neutral-200 hover:border-white/20 bg-transparent"
      } ${className}`}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 4V2a1 1 0 00-1-1H2a1 1 0 00-1 1v5a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Copy
        </>
      )}
    </button>
  );
}
