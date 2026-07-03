import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, MegaphoneIcon, ClipboardList, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useApp } from "@/lib/store";
import { StatCard } from "@/components/stat-card";
import { ComplaintCard } from "@/components/complaint-card";
import { NoticeCard } from "@/components/notice-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Society Maintainence Tracker" }],
  }),
  component: ResidentDashboard,
});

function ResidentDashboard() {
  const { currentUser, complaints, notices, isOverdue } = useApp();
  const mine = complaints.filter((c) => c.residentId === currentUser?.id);

  const open = mine.filter((c) => c.status === "Open").length;
  const inProgress = mine.filter((c) => c.status === "In Progress").length;
  const resolved = mine.filter((c) => c.status === "Resolved").length;
  const overdueCount = mine.filter((c) => isOverdue(c)).length;

  const recent = mine.slice(0, 3);
  const pinned = notices.filter((n) => n.important);
  const latestNotices = [...pinned, ...notices.filter((n) => !n.important)].slice(0, 3);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Welcome back, {currentUser?.name.split(" ")[0]}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Your building at a glance
          </h1>
        </div>
        <Button asChild>
          <Link to="/complaints/new">
            <Plus className="size-4" />
            Raise a complaint
          </Link>
        </Button>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Open" value={open} icon={<AlertCircle className="size-4" />} tone="warning" />
        <StatCard
          label="In progress"
          value={inProgress}
          icon={<Clock className="size-4" />}
          tone="accent"
        />
        <StatCard
          label="Resolved"
          value={resolved}
          icon={<CheckCircle2 className="size-4" />}
          tone="success"
        />
        <StatCard
          label="Overdue"
          value={overdueCount}
          icon={<AlertCircle className="size-4" />}
          tone="danger"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent complaints</h2>
            <Link
              to="/complaints"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="size-5" />}
              title="No complaints yet"
              description="When you raise one, it'll appear here with its status and priority."
              action={
                <Button asChild size="sm">
                  <Link to="/complaints/new">Raise your first complaint</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {recent.map((c) => (
                <ComplaintCard
                  key={c.id}
                  complaint={c}
                  overdue={isOverdue(c)}
                  href={`/complaints/${c.id}`}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Latest notices</h2>
            <Link
              to="/notices"
              className="text-sm font-medium text-primary hover:underline"
            >
              Notice board
            </Link>
          </div>
          {latestNotices.length === 0 ? (
            <EmptyState
              icon={<MegaphoneIcon className="size-5" />}
              title="No notices yet"
              description="Society notices from the admin will show up here."
            />
          ) : (
            <div className="space-y-3">
              {latestNotices.map((n) => (
                <NoticeCard key={n.id} notice={n} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
