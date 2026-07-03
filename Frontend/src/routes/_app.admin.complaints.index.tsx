import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { useApp } from "@/lib/store";
import {
  CATEGORIES,
  STATUSES,
  type ComplaintCategory,
  type ComplaintStatus,
} from "@/lib/types";
import { ComplaintCard } from "@/components/complaint-card";
import { EmptyState } from "@/components/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardList } from "lucide-react";

export const Route = createFileRoute("/_app/admin/complaints/")({
  head: () => ({ meta: [{ title: "All complaints — Admin — Society Maintainence Tracker" }] }),
  component: AdminComplaintsPage,
});

type SortKey = "recent" | "oldest";

function AdminComplaintsPage() {
  const { complaints, isOverdue } = useApp();
  const [category, setCategory] = useState<ComplaintCategory | "all">("all");
  const [status, setStatus] = useState<ComplaintStatus | "all">("all");
  const [sort, setSort] = useState<SortKey>("recent");

  const rows = useMemo(() => {
    const base = complaints
      .filter((c) => category === "all" || c.category === category)
      .filter((c) => status === "all" || c.status === status);

    const withOverdue = base.map((c) => ({ c, overdue: isOverdue(c) }));

    // Overdue always pinned to top, then by chosen sort
    withOverdue.sort((a, b) => {
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      const at = new Date(a.c.createdAt).getTime();
      const bt = new Date(b.c.createdAt).getTime();
      return sort === "recent" ? bt - at : at - bt;
    });
    return withOverdue;
  }, [complaints, category, status, sort, isOverdue]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          All complaints
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overdue complaints stay pinned to the top. Click any row to manage it.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
        <Filter className="size-4 text-muted-foreground" />
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as ComplaintCategory | "all")}
        >
          <SelectTrigger className="h-9 w-[170px]">
            <SelectValue />
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
            <SelectValue />
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
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">
          {rows.length} {rows.length === 1 ? "complaint" : "complaints"}
        </span>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-5" />}
          title="No complaints match"
          description="Adjust the filters to see more results."
        />
      ) : (
        <div className="space-y-3">
          {rows.map(({ c, overdue }) => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              overdue={overdue}
              showResident
              href={`/admin/complaints/${c.id}`}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Need to raise a demo complaint?{" "}
        <Link to="/complaints/new" className="text-primary hover:underline">
          Create one as this account
        </Link>{" "}
        (admins can raise too).
      </p>
    </div>
  );
}
