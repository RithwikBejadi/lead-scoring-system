/**
 * IdentityMap — visualizes anonymous → identified identity resolution chain.
 */

export default function IdentityMap({ lead }) {
  const aliases = lead?.aliases || lead?.anonymousIds || [];
  const email = lead?.email;

  if (!email && aliases.length === 0) {
    return (
      <p className="text-xs font-mono text-neutral-700 py-2">No identity data</p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
      {aliases.map((a, i) => (
        <span key={i} className="flex items-center gap-2">
          <code className="px-2 py-1 bg-[#0d0d0d] border border-white/5 rounded text-neutral-500">
            {typeof a === "string" ? `anon_${a.slice(-6)}` : a}
          </code>
          <span className="text-neutral-700">→</span>
        </span>
      ))}
      {email && (
        <code className="px-2 py-1 bg-emerald-950 border border-emerald-800 rounded text-emerald-400">
          {email}
        </code>
      )}
      {!email && (
        <code className="px-2 py-1 bg-neutral-900 border border-white/5 rounded text-neutral-600">
          unidentified
        </code>
      )}
    </div>
  );
}
