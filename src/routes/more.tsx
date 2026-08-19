import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  BookUser,
  FileText,
  History,
  Package,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EmptyState, PageHeader, Pill, SectionCard } from "@/components/adminflow/ui";
import { useStore } from "@/lib/adminflow/store";
import type { NotificationPrefs } from "@/lib/adminflow/types";

export const Route = createFileRoute("/more")({
  head: () => ({
    meta: [
      { title: "Settings & audit trail — AdminFlow" },
      {
        name: "description",
        content:
          "Manage notification preferences, review your access level and inspect the workplace audit trail.",
      },
      { property: "og:title", content: "Settings & audit trail — AdminFlow" },
      { property: "og:description", content: "Preferences, permissions and activity history." },
    ],
  }),
  component: MorePage,
});

const PREF_LABELS: { key: keyof NotificationPrefs; label: string; hint: string }[] = [
  { key: "meetings", label: "Upcoming meetings", hint: "Reminders before a meeting starts" },
  { key: "overdueTasks", label: "Overdue tasks", hint: "Alert when a task passes its deadline" },
  { key: "documents", label: "Expiring documents", hint: "Warnings at 30 and 7 days" },
  { key: "leave", label: "Pending leave requests", hint: "New requests awaiting approval" },
  { key: "supplies", label: "Low office supplies", hint: "When stock hits the minimum level" },
  { key: "deadlines", label: "Important deadlines", hint: "Daily digest of key dates" },
];

const SHORTCUTS = [
  { to: "/supplies", label: "Office supplies", icon: Package },
  { to: "/contacts", label: "Contact directory", icon: BookUser },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

function MorePage() {
  const { user, prefs, setPrefs, audit, can, documents } = useStore();

  return (
    <div className="space-y-6">
      <PageHeader
        title="More"
        description="Your profile, notification preferences, security and activity history."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Your profile" description="Access level determines what you can see and change.">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
              {user.initials}
            </span>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.department}</p>
              <Pill tone="primary" className="mt-1">
                <UserRound className="size-3.5" /> {user.role}
              </Pill>
            </div>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-success" /> Session secured, automatic sign-out after
              inactivity
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-success" /> Role-based permissions applied to every module
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-success" /> {documents.length} documents stored with
              restricted access
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Notification preferences" description="Choose what AdminFlow reminds you about.">
          <div className="grid gap-4">
            {PREF_LABELS.map((p) => (
              <div key={p.key} className="flex items-start justify-between gap-4">
                <div>
                  <Label htmlFor={`pref-${p.key}`} className="font-medium">
                    {p.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{p.hint}</p>
                </div>
                <Switch
                  id={`pref-${p.key}`}
                  checked={prefs[p.key]}
                  onCheckedChange={(checked) => setPrefs({ ...prefs, [p.key]: checked })}
                />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Quick links" description="Jump to the rest of the workspace.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SHORTCUTS.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-accent"
            >
              <s.icon className="size-5 text-primary" />
              <span className="font-medium">{s.label}</span>
            </Link>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Audit trail"
        description="A record of important changes made in the workspace."
        action={
          <Pill tone="neutral">
            <History className="size-3.5" /> {audit.length} entries
          </Pill>
        }
      >
        {!can("view.audit") ? (
          <EmptyState
            title="Audit trail is restricted"
            hint="Only administrators can review the full change history."
          />
        ) : audit.length === 0 ? (
          <EmptyState title="No activity recorded yet" />
        ) : (
          <ul className="divide-y">
            {audit.slice(0, 20).map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <span>
                  <span className="font-medium">{entry.actor}</span> · {entry.action}{" "}
                  <span className="text-muted-foreground">{entry.target}</span>
                </span>
                <span className="text-xs text-muted-foreground">{entry.at.replace("T", " ")}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
