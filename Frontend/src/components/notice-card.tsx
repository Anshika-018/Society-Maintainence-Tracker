import { Pin } from "lucide-react";
import type { Notice } from "@/lib/types";
import { shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function NoticeCard({
  notice,
  actions,
}: {
  notice: Notice;
  actions?: React.ReactNode;
}) {
  return (
    <article
      className={cn(
        "rounded-xl border bg-card p-4",
        notice.important && "border-accent bg-accent/15 shadow-sm",
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {notice.important ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
                <Pin className="size-3" />
                Pinned
              </span>
            ) : null}
            <h3 className="text-base font-semibold text-foreground">{notice.title}</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {notice.authorName} · {shortDate(notice.createdAt)}
          </p>
        </div>
        {actions}
      </header>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
        {notice.body}
      </p>
    </article>
  );
}
