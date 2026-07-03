import { cn } from "@/lib/utils";
import type { ComplaintStatus } from "@/lib/types";

const STYLES: Record<ComplaintStatus, string> = {
  Open: "bg-status-open text-status-open-foreground",
  "In Progress": "bg-status-progress text-status-progress-foreground",
  Resolved: "bg-status-resolved text-status-resolved-foreground",
};

export function StatusBadge({
  status,
  className,
}: {
  status: ComplaintStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide",
        STYLES[status],
        className,
      )}
    >
      <span
        aria-hidden
        className="size-1.5 rounded-full bg-current opacity-70"
      />
      {status}
    </span>
  );
}

export function OverdueBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-status-overdue px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-status-overdue-foreground",
        className,
      )}
    >
      Overdue
    </span>
  );
}
