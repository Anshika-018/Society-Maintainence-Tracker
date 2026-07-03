import type { HistoryEntry } from "@/lib/types";
import { fullDate, timeAgo } from "@/lib/format";

export function StatusTimeline({ history }: { history: HistoryEntry[] }) {
  if (!history.length) return null;
  const items = [...history].reverse();

  return (
    <ol className="relative space-y-6 pl-6">
      <span
        aria-hidden
        className="absolute inset-y-1 left-2 w-px bg-border"
      />
      {items.map((h, i) => (
        <li key={i} className="relative">
          <span
            aria-hidden
            className="absolute -left-[18px] top-1.5 grid size-4 place-items-center rounded-full border border-primary/40 bg-background"
          >
            <span className="size-1.5 rounded-full bg-primary" />
          </span>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <p className="text-sm font-medium text-foreground">{h.action}</p>
            <time
              className="text-xs text-muted-foreground"
              title={fullDate(h.at)}
            >
              {timeAgo(h.at)}
            </time>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">by {h.actorName}</p>
          {h.note ? (
            <p className="mt-2 rounded-md bg-muted/60 px-3 py-2 text-sm text-foreground/90">
              {h.note}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
