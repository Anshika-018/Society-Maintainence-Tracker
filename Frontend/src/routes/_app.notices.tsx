import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { useApp } from "@/lib/store";
import { NoticeCard } from "@/components/notice-card";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/_app/notices")({
  head: () => ({ meta: [{ title: "Notice board — Society Maintainence Tracker" }] }),
  component: NoticesPage,
});

function NoticesPage() {
  const { notices } = useApp();
  const ordered = [
    ...notices.filter((n) => n.important),
    ...notices
      .filter((n) => !n.important)
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Notice board
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Society-wide announcements. Important notices stay pinned at the top.
        </p>
      </header>

      {ordered.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="size-5" />}
          title="No notices yet"
          description="When the admin posts an update, it'll appear here."
        />
      ) : (
        <div className="space-y-3">
          {ordered.map((n) => (
            <NoticeCard key={n.id} notice={n} />
          ))}
        </div>
      )}
    </div>
  );
}
