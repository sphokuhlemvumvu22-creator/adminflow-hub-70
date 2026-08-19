import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Inbox,
  Package,
  Plus,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Pill, SectionCard, StatCard, EmptyState, priorityTone, statusTone } from "@/components/adminflow/ui";
import { TaskDialog } from "@/components/adminflow/task-dialog";
import { daysUntil, effectiveStatus, useStore } from "@/lib/adminflow/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AdminFlow" },
      {
        name: "description",
        content:
          "See tasks due today, upcoming meetings, pending requests, expiring documents and low stock at a glance.",
      },
      { property: "og:title", content: "AdminFlow dashboard" },
      {
        property: "og:description",
        content: "Everything requiring your attention in one professional workplace dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { user, tasks, meetings, documents, leave, supplies } = useStore();

  const dueToday = tasks.filter((t) => t.dueDate === new Date().toISOString().slice(0, 10) && effectiveStatus(t) !== "Completed");
  const overdue = tasks.filter((t) => effectiveStatus(t) === "Overdue");
  const upcomingMeetings = meetings
    .filter((m) => daysUntil(m.date) >= 0)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const pendingLeave = leave.filter((l) => l.status === "Pending");
  const expiring = documents.filter((d) => daysUntil(d.expiry) <= 30);
  const lowStock = supplies.filter((s) => s.quantity <= s.minimum);

  const priorities = tasks
    .filter((t) => effectiveStatus(t) !== "Completed")
    .sort((a, b) => {
      const order = { Urgent: 0, High: 1, Medium: 2, Low: 3 } as const;
      return order[a.priority] - order[b.priority] || a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 5);

  const activities = [
    ...upcomingMeetings.map((m) => ({
      id: m.id,
      when: `${m.date} · ${m.time}`,
      date: m.date,
      title: m.title,
      detail: m.location,
      kind: "Meeting",
    })),
    ...tasks
      .filter((t) => effectiveStatus(t) !== "Completed" && daysUntil(t.dueDate) >= 0)
      .map((t) => ({
        id: t.id,
        when: t.dueDate,
        date: t.dueDate,
        title: t.title,
        detail: `Deadline · ${t.assignee}`,
        kind: "Deadline",
      })),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  const alerts = [
    ...overdue.map((t) => ({ id: `t${t.id}`, text: `Overdue task: ${t.title}`, meta: `${t.assignee} · due ${t.dueDate}`, to: "/tasks" as const })),
    ...documents
      .filter((d) => daysUntil(d.expiry) <= 7)
      .map((d) => ({
        id: `d${d.id}`,
        text: daysUntil(d.expiry) < 0 ? `Expired: ${d.name}` : `Expires in ${daysUntil(d.expiry)} days: ${d.name}`,
        meta: `${d.department} · ${d.owner}`,
        to: "/documents" as const,
      })),
    ...supplies
      .filter((s) => s.quantity === 0 || s.quantity < s.minimum / 2)
      .map((s) => ({ id: `s${s.id}`, text: `Critically low stock: ${s.name}`, meta: `${s.quantity} ${s.unit} left`, to: "/supplies" as const })),
  ];

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user.name.split(" ")[0]}`}
        description={`${user.role} · ${user.department} — here is everything that needs your attention today.`}
        actions={
          <>
            <TaskDialog
              trigger={
                <Button>
                  <Plus /> New task
                </Button>
              }
            />
            <Button asChild variant="outline">
              <Link to="/meetings"><CalendarDays /> Schedule meeting</Link>
            </Button>
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link to="/visitors"><UserPlus /> Register visitor</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Tasks due today" value={dueToday.length} hint={`${overdue.length} overdue`} icon={<ClipboardList className="size-5" />} />
        <StatCard label="Upcoming meetings" value={upcomingMeetings.length} hint="Next 30 days" icon={<CalendarDays className="size-5" />} tone="info" />
        <StatCard label="Pending requests" value={pendingLeave.length} hint="Leave approvals" icon={<Inbox className="size-5" />} tone="warning" />
        <StatCard label="Documents expiring" value={expiring.length} hint="Within 30 days" icon={<FileText className="size-5" />} tone="danger" />
        <StatCard label="Low-stock supplies" value={lowStock.length} hint="At or below minimum" icon={<Package className="size-5" />} tone="ok" />
      </div>

      {alerts.length > 0 ? (
        <SectionCard
          title="Urgent alerts"
          description="Items requiring immediate attention"
          className="border-destructive/30 bg-destructive/[0.03]"
        >
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-lg border bg-card p-3">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.meta}</p>
                </div>
                <Button asChild size="sm" variant="ghost">
                  <Link to={a.to}>Open</Link>
                </Button>
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Today's priorities"
          description="Most important tasks and deadlines"
          action={
            <Button asChild size="sm" variant="ghost">
              <Link to="/tasks">View all</Link>
            </Button>
          }
        >
          <ul className="space-y-2">
            {priorities.map((t) => (
              <li key={t.id} className="flex items-start gap-3 rounded-lg border p-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.assignee} · due {t.dueDate}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Pill tone={priorityTone(t.priority)}>{t.priority}</Pill>
                  <Pill tone={statusTone(effectiveStatus(t))}>{effectiveStatus(t)}</Pill>
                </div>
              </li>
            ))}
            {priorities.length === 0 ? <EmptyState title="No open tasks. Nice work." /> : null}
          </ul>
        </SectionCard>

        <SectionCard title="Upcoming activities" description="Meetings, appointments and deadlines in order">
          <ol className="relative space-y-4 border-l pl-5">
            {activities.map((a) => (
              <li key={`${a.kind}${a.id}`} className="relative">
                <span className="absolute top-1.5 -left-[1.42rem] size-2.5 rounded-full bg-primary" />
                <p className="text-xs font-semibold text-muted-foreground uppercase">{a.when}</p>
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">
                  {a.kind} · {a.detail}
                </p>
              </li>
            ))}
            {activities.length === 0 ? <EmptyState title="Nothing scheduled" /> : null}
          </ol>
        </SectionCard>
      </div>
    </>
  );
}
