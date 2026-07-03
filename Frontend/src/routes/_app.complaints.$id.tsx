import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/lib/store";
import { StatusBadge, OverdueBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { StatusTimeline } from "@/components/status-timeline";
import { fullDate } from "@/lib/format";

export const Route = createFileRoute("/_app/complaints/$id")({
  head: () => ({ meta: [{ title: "Complaint detail — Society Maintainence Tracker" }] }),
  component: ComplaintDetailPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="font-display text-2xl font-semibold">Complaint not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        It may have been removed. Head back to your list.
      </p>
      <Link
        to="/complaints"
        className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
      >
        Back to my complaints
      </Link>
    </div>
  ),
});

function ComplaintDetailPage() {
  const { id } = Route.useParams();
  const { complaints, isOverdue, currentUser } = useApp();
  const complaint = complaints.find((c) => c.id === id);
  if (!complaint) throw notFound();

  // If a resident views someone else's complaint, block it
  if (currentUser?.role === "resident" && complaint.residentId !== currentUser.id) {
    throw notFound();
  }

  const overdue = isOverdue(complaint);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/complaints"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to my complaints
      </Link>

      <header className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {complaint.category}
          </span>
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
          {overdue ? <OverdueBadge /> : null}
        </div>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">
          Complaint #{complaint.id.slice(2)}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Raised by {complaint.residentName} · Flat {complaint.residentFlat} ·{" "}
          {fullDate(complaint.createdAt)}
        </p>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {complaint.description}
        </p>
        {complaint.photo ? (
          <img
            src={complaint.photo}
            alt="Attached to complaint"
            className="mt-4 max-h-96 w-full rounded-lg border object-cover"
          />
        ) : null}
      </header>

      <section className="rounded-xl border bg-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Status history</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every update on this complaint, most recent first.
        </p>
        <div className="mt-5">
          <StatusTimeline history={complaint.history} />
        </div>
      </section>
    </div>
  );
}
