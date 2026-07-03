import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, ClipboardList, Filter } from "lucide-react";
import { useApp } from "@/lib/store";
import { CATEGORIES, STATUSES, type ComplaintCategory, type ComplaintStatus } from "@/lib/types";
import { ComplaintCard } from "@/components/complaint-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/complaints/")({
  head: () => ({ meta: [{ title: "My complaints — Society Maintainence Tracker" }] }),
  component: MyComplaintsPage,
});

function MyComplaintsPage() {
  const { currentUser, complaints, isOverdue } = useApp();
  const [category, setCategory] = useState<ComplaintCategory | "all">("all");
  const [status, setStatus] = useState<ComplaintStatus | "all">("all");

  const mine = useMemo(
    () =>
      complaints
        .filter((c) => c.residentId === currentUser?.id)
        .filter((c) => category === "all" || c.category === category)
        .filter((c) => status === "all" || c.status === status)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [complaints, currentUser?.id, category, status],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            My complaints
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every issue you've raised and its current status.
          </p>
        </div>
        <Button asChild>
          <Link to="/complaints/new">
            <Plus className="size-4" />
            New complaint
          </Link>
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
        <Filter className="size-4 text-muted-foreground" />
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as ComplaintCategory | "all")}
        >
          <SelectTrigger className="h-9 w-[170px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as ComplaintStatus | "all")}
        >
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">
          {mine.length} {mine.length === 1 ? "complaint" : "complaints"}
        </span>
      </div>

      {mine.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-5" />}
          title="Nothing matches these filters"
          description="Try clearing the filters or raise a new complaint."
          action={
            <Button asChild size="sm">
              <Link to="/complaints/new">Raise a complaint</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {mine.map((c) => (
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
  );
}
