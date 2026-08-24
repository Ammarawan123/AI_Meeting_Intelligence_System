import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, ...props },
  ref,
) {
  return (
    <label className="block w-full">
      {label ? <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span> : null}
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100",
          error && "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  );
});
