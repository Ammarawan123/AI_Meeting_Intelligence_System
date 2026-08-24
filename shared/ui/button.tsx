import * as React from "react";
import { cn } from "@/shared/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const variantClasses = {
    primary: "bg-cyan-600 text-white hover:bg-cyan-500",
    secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
