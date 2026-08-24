import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "neutral";
}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  const variantClasses = {
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    neutral: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-[0.08em]", variantClasses[variant], className)}
      {...props}
    />
  );
}
