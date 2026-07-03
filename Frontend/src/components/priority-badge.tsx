import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/types";

const STYLES: Record<Priority, string> = {
  Low: "border-priority-low/40 text-priority-low",
  Medium: "border-priority-medium/50 text-priority-medium",
  High: "border-priority-high/60 text-priority-high",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border bg-transparent px-2 py-0.5 text-xs font-medium",
        STYLES[priority],
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-2 rounded-sm",
          priority === "Low" && "bg-priority-low",
          priority === "Medium" && "bg-priority-medium",
          priority === "High" && "bg-priority-high",
        )}
      />
      {priority}
    </span>
  );
}
