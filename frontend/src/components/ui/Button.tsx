import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-slate-950 text-white hover:bg-slate-800",
    secondary: "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
    ghost: "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <button
      className={cn("inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50", variants[variant], className)}
      {...props}
    />
  );
}
