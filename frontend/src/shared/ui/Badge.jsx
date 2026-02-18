/**
 * Badge — status/type badge.
 * variant: "default" | "success" | "warning" | "danger" | "info" | "neutral"
 */
const variants = {
  default: "bg-neutral-800 text-neutral-300 border-neutral-700",
  success: "bg-emerald-950 text-emerald-400 border-emerald-800",
  warning: "bg-amber-950 text-amber-400 border-amber-800",
  danger: "bg-red-950 text-red-400 border-red-800",
  info: "bg-blue-950 text-blue-400 border-blue-800",
  neutral: "bg-neutral-800 text-neutral-400 border-neutral-700",
  purple: "bg-purple-950 text-purple-400 border-purple-800",
};

export function Badge({ children, variant = "default", className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono font-medium rounded border ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
}

/** Map common event names to badge variants */
export function EventTypeBadge({ type }) {
  const map = {
    page_view: "default",
    identify: "success",
    click: "info",
    form_submit: "purple",
    signup: "success",
    purchase: "warning",
    error: "danger",
  };
  const variant = map[type] || "neutral";
  return <Badge variant={variant}>{type}</Badge>;
}
