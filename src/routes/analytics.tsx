import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarClock, CheckCircle2, FileWarning, Inbox, TriangleAlert } from "lucide-react";
import { PageHeader, SectionCard, StatCard } from "@/components/adminflow/ui";
import { daysUntil, effectiveStatus, useStore } from "@/lib/adminflow/store";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — AdminFlow" },
      {
        name: "description",
        content:
          "Visual workplace analytics for task completion, overdue work, meetings, pending requests, expiring documents and stock levels.",
      },
      { property: "og:title", content: "Analytics — AdminFlow" },
      { property: "og:description", content: "See how the office is performing at a glance." },
    ],
  }),
  component: AnalyticsPage,
});

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function AnalyticsPage() {
  const { tasks, meetings, leave, documents, supplies } = useStore();

  const statuses = useMemo(() => {
    const counts: Record<string, number> = {
      "Not Started": 0,
      "In Progress": 0,
      Completed: 0,
      Overdue: 0,
    };
    tasks.forEach((t) => {
      const s = effectiveStatus(t);
      counts[s] = (counts[s] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const byDepartment = useMemo(() => {
    const map = new Map<string, { department: string; completed: number; open: number }>();
    tasks.forEach((t) => {
      const row = map.get(t.department) ?? { department: t.department, completed: 0, open: 0 };
      if (effectiveStatus(t) === "Completed") row.completed += 1;
      else row.open += 1;
      map.set(t.department, row);
    });
    return [...map.values()];
  }, [tasks]);

  const supplyLevels = useMemo(
    () =>
      supplies
        .map((s) => ({ name: s.name, quantity: s.quantity, minimum: s.minimum }))
        .slice(0, 8),
    [supplies],
  );

  const meetingTrend = useMemo(() => {
    const map = new Map<string, number>();
    meetings.forEach((m) => map.set(m.date, (map.get(m.date) ?? 0) + 1));
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date: date.slice(5), meetings: count }));
  }, [meetings]);

  const completed = tasks.filter((t) => effectiveStatus(t) === "Completed").length;
  const overdue = tasks.filter((t) => effectiveStatus(t) === "Overdue").length;
  const upcomingMeetings = meetings.filter((m) => daysUntil(m.date) >= 0).length;
  const pending = leave.filter((l) => l.status === "Pending").length;
  const expiring = documents.filter((d) => daysUntil(d.expiry) <= 30).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration analytics"
        description="A visual overview of workload, meetings, approvals and stock across the organisation."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Completed tasks" value={completed} tone="ok" icon={<CheckCircle2 className="size-5" />} />
        <StatCard label="Overdue tasks" value={overdue} tone="danger" icon={<TriangleAlert className="size-5" />} />
        <StatCard
          label="Upcoming meetings"
          value={upcomingMeetings}
          tone="info"
          icon={<CalendarClock className="size-5" />}
        />
        <StatCard label="Pending requests" value={pending} tone="warning" icon={<Inbox className="size-5" />} />
        <StatCard
          label="Expiring documents"
          value={expiring}
          tone="danger"
          icon={<FileWarning className="size-5" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Task status split" description="Where the current workload sits.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statuses} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {statuses.map((entry, i) => (
                    <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Tasks by department" description="Completed versus outstanding work.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDepartment}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} interval={0} angle={-12} height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" name="Completed" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="open" name="Outstanding" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Office supply levels" description="Current quantity against minimum stock level.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplyLevels} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" name="In stock" fill="var(--color-chart-3)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="minimum" name="Minimum" fill="var(--color-chart-4)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Meetings scheduled" description="Meeting volume across the diary.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={meetingTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="meetings"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
