import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "accent" | "danger" | "success" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 transition-colors",
        tone === "accent" && "bg-status-progress/10 border-status-progress/45 text-status-progress-foreground",
        tone === "danger" && "bg-status-overdue/6 border-status-overdue/35 text-status-overdue",
        tone === "success" && "bg-status-resolved/10 border-status-resolved/45 text-status-resolved-foreground",
        tone === "warning" && "bg-status-open/6 border-status-open/35 text-status-open",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cn(
          "text-xs font-medium uppercase tracking-wider", 
          tone === "default" ? "text-muted-foreground" : "text-current opacity-80"
        )}>
          {label}
        </p>
        {icon ? (
          <div className={tone === "default" ? "text-muted-foreground" : "text-current"}>
            {icon}
          </div>
        ) : null}
      </div>
      <p className={cn(
        "mt-2 font-display text-3xl font-semibold tracking-tight",
        tone === "default" ? "text-foreground" : "text-current"
      )}>
        {value}
      </p>
      {hint ? (
        <p className={cn(
          "mt-1 text-xs", 
          tone === "default" ? "text-muted-foreground" : "text-current opacity-75"
        )}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
