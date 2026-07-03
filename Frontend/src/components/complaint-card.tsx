import { Link } from "@tanstack/react-router";
import { ImageIcon } from "lucide-react";
import type { Complaint } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import { StatusBadge, OverdueBadge } from "./status-badge";
import { PriorityBadge } from "./priority-badge";

export function ComplaintCard({
  complaint,
  overdue,
  href,
  showResident = false,
}: {
  complaint: Complaint;
  overdue: boolean;
  href: string;
  showResident?: boolean;
}) {
  return (
    <Link
      to={href}
      className="group block rounded-xl border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {complaint.category}
            </span>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            {overdue ? <OverdueBadge /> : null}
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-foreground/90">
            {complaint.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>#{complaint.id.slice(2)}</span>
            <span>·</span>
            <span>Raised {timeAgo(complaint.createdAt)}</span>
            {showResident ? (
              <>
                <span>·</span>
                <span>
                  {complaint.residentName} · {complaint.residentFlat}
                </span>
              </>
            ) : null}
          </div>
        </div>
        {complaint.photo ? (
          <img
            src={complaint.photo}
            alt=""
            className="size-16 shrink-0 rounded-md border object-cover"
          />
        ) : (
          <div className="grid size-16 shrink-0 place-items-center rounded-md border bg-muted/50 text-muted-foreground">
            <ImageIcon className="size-5" />
          </div>
        )}
      </div>
    </Link>
  );
}
