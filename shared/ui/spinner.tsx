export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-slate-200 border-t-cyan-600 ${className}`}
      aria-label="Loading"
      role="status"
    />
  );
}
