import React from "react";

const variants = {
  default: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
  primary: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  success:
    "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  warning:
    "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  error: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
  purple:
    "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
  mono: "bg-slate-900 dark:bg-slate-950 text-emerald-400 font-mono",
};

const sizes = {
  xs: "px-1.5 py-0.5 text-[10px]",
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
};

export default function Badge({
  children,
  variant = "default",
  size = "sm",
  className = "",
  dot,
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-medium ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      {children}
    </span>
  );
}
