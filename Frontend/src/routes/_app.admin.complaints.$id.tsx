import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Flag } from "lucide-react";
import { toast } from "sonner";

import { useApp } from "@/lib/store";
import { PRIORITIES, STATUSES, type ComplaintStatus, type Priority } from "@/lib/types";
import { StatusBadge, OverdueBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { StatusTimeline } from "@/components/status-timeline";
import { fullDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/admin/complaints/$id")({
  head: () => ({ meta: [{ title: "Manage complaint — Society Maintainence Tracker" }] }),
  component: AdminComplaintDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="font-display text-2xl font-semibold">Complaint not found</h1>
      <Link
        to="/admin/complaints"
        className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
      >
        Back to all complaints
      </Link>
    </div>
  ),
});

function AdminComplaintDetail() {
  const { id } = Route.useParams();
  const {
    complaints,
    isOverdue,
    updateStatus,
    setPriority,
    toggleManualOverdue,
  } = useApp();
  const complaint = complaints.find((c) => c.id === id);
  if (!complaint) throw notFound();

  const overdue = isOverdue(complaint);

  const [nextStatus, setNextStatus] = useState<ComplaintStatus>(complaint.status);
  const [note, setNote] = useState("");
  const isResolved = complaint.status === "Resolved";

  const applyStatus = async () => {
    if (isResolved) {
      toast.info("This complaint is already resolved and closed.");
      return;
    }
    if (nextStatus === complaint.status) {
      toast.info("Status is unchanged.");
      return;
    }
    await updateStatus(complaint.id, nextStatus, note);
    setNote("");
    toast.success(`Status updated to ${nextStatus}`);
  };

  const applyPriority = async (p: Priority) => {
    await setPriority(complaint.id, p);
    toast.success(`Priority set to ${p}`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to="/admin/complaints"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to all complaints
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

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold">Status history</h2>
          <div className="mt-5">
            <StatusTimeline history={complaint.history} />
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border bg-card p-5">
            <h3 className="font-display text-base font-semibold">Update status</h3>
            {isResolved ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Resolved complaints are closed. Status cannot be changed.
              </p>
            ) : (
              <>
                <div className="mt-3 space-y-3">
                  <div className="space-y-1.5">
                    <Label>New status</Label>
                    <Select
                      value={nextStatus}
                      onValueChange={(v) => setNextStatus(v as ComplaintStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="note">Note (optional)</Label>
                    <Textarea
                      id="note"
                      rows={3}
                      placeholder="Add context for the resident…"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                  <Button onClick={applyStatus} className="w-full">
                    Apply update
                  </Button>
                </div>
              </>
            )}
          </section>

          <section className="rounded-xl border bg-card p-5">
            <h3 className="font-display text-base font-semibold">Priority</h3>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {PRIORITIES.map((p) => {
                const active = complaint.priority === p;
                return (
                  <button
                    key={p}
                    onClick={() => applyPriority(p)}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5">
            <h3 className="font-display text-base font-semibold">Overdue flag</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Complaints are auto-flagged after the configured threshold. You can also
              flag manually to force it to the top of the admin queue.
            </p>
            <Button
              variant={complaint.manualOverdue ? "secondary" : "outline"}
              className="mt-3 w-full"
              onClick={async () => {
                const message = complaint.manualOverdue
                  ? "Overdue flag removed"
                  : "Complaint flagged as overdue";
                await toggleManualOverdue(complaint.id);
                toast.success(message);
              }}
            >
              <Flag className="size-4" />
              {complaint.manualOverdue ? "Remove overdue flag" : "Flag as overdue"}
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
}
