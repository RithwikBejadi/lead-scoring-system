import React from "react";

export default function Spinner({ size = "md", className = "" }) {
  const s = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" }[size];
  return (
    <div
      className={`${s} ${className} border-2 border-slate-200 dark:border-slate-700 border-t-primary rounded-full animate-spin`}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="h-full flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
