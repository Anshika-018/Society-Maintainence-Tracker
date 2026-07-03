import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { AlertCircle, ClipboardList, CheckCircle2, Clock } from "lucide-react";

import { useApp } from "@/lib/store";
import { CATEGORIES, STATUSES } from "@/lib/types";
import { StatCard } from "@/components/stat-card";
import { ComplaintCard } from "@/components/complaint-card";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/_app/admin/")({
  head: () => ({ meta: [{ title: "Admin overview — Society Maintainence Tracker" }] }),
  component: AdminOverview,
});

function AdminOverview() {
  const { complaints, isOverdue, settings } = useApp();

  const stats = useMemo(() => {
    const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<
      string,
      number
    >;
    const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<
      string,
      number
    >;
    let overdue = 0;
    for (const c of complaints) {
      byStatus[c.status]++;
      byCategory[c.category]++;
      if (isOverdue(c)) overdue++;
    }
    return { byStatus, byCategory, overdue, total: complaints.length };
  }, [complaints, isOverdue]);

  const overdueList = complaints
    .filter((c) => isOverdue(c))
    .sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .slice(0, 5);

  const chartData = CATEGORIES.map((c) => ({
    category: c,
    count: stats.byCategory[c],
  }));

  const chartColors = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
    "var(--color-primary)",
    "var(--color-status-resolved-foreground)",
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-muted-foreground">Admin overview</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Everything happening in the society
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overdue threshold is currently{" "}
          <span className="font-medium text-foreground">{settings.overdueDays} days</span>.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total"
          value={stats.total}
          icon={<ClipboardList className="size-4" />}
        />
        <StatCard
          label="Open"
          value={stats.byStatus["Open"]}
          icon={<AlertCircle className="size-4" />}
          tone="warning"
        />
        <StatCard
          label="In progress"
          value={stats.byStatus["In Progress"]}
          icon={<Clock className="size-4" />}
          tone="accent"
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          icon={<AlertCircle className="size-4" />}
          tone="danger"
          hint={stats.overdue > 0 ? "Needs attention" : "All within threshold"}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">
                Complaints by category
              </h2>
              <p className="text-xs text-muted-foreground">
                All-time totals across the society.
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              <CheckCircle2 className="mr-1 inline size-3" />
              {stats.byStatus["Resolved"]} resolved
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="category"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "var(--color-border)" }}
                  stroke="var(--color-muted-foreground)"
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  allowDecimals={false}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--color-muted-foreground)"
                />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)" }}
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Overdue queue</h2>
            <Link
              to="/admin/complaints"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {overdueList.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="size-5" />}
              title="No overdue complaints"
              description="Everything is within the configured threshold."
            />
          ) : (
            <div className="space-y-3">
              {overdueList.map((c) => (
                <ComplaintCard
                  key={c.id}
                  complaint={c}
                  overdue
                  showResident
                  href={`/admin/complaints/${c.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
