import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, PageHeader, Pill } from "@/components/adminflow/ui";
import { DEPARTMENTS, iso } from "@/lib/adminflow/data";
import { effectiveStatus, useStore } from "@/lib/adminflow/store";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — AdminFlow" },
      {
        name: "description",
        content:
          "Generate filtered workplace reports for tasks, meetings, visitors, leave, supplies and expiring documents, then export to Excel or PDF.",
      },
      { property: "og:title", content: "Reports — AdminFlow" },
      { property: "og:description", content: "Filter, review and export office reports in seconds." },
    ],
  }),
  component: ReportsPage,
});

type ReportKey = "tasks" | "meetings" | "visitors" | "leave" | "supplies" | "documents";

const REPORTS: { key: ReportKey; label: string }[] = [
  { key: "tasks", label: "Tasks (completed & overdue)" },
  { key: "meetings", label: "Meetings" },
  { key: "visitors", label: "Visitors" },
  { key: "leave", label: "Leave requests" },
  { key: "supplies", label: "Office supplies" },
  { key: "documents", label: "Expiring documents" },
];

interface Table {
  columns: string[];
  rows: string[][];
}

function csvEscape(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function ReportsPage() {
  const store = useStore();
  const [report, setReport] = useState<ReportKey>("tasks");
  const [from, setFrom] = useState(iso(-30));
  const [to, setTo] = useState(iso(60));
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");
  const [person, setPerson] = useState("");

  const inRange = (date: string) => date >= from && date <= to;
  const matchPerson = (name: string) =>
    person.trim() ? name.toLowerCase().includes(person.trim().toLowerCase()) : true;
  const matchDept = (dept: string) => department === "All" || dept === department;
  const matchStatus = (value: string) => status === "All" || value === status;

  const table = useMemo<Table>(() => {
    switch (report) {
      case "tasks": {
        const rows = store.tasks
          .filter(
            (t) =>
              inRange(t.dueDate) &&
              matchDept(t.department) &&
              matchPerson(t.assignee) &&
              matchStatus(effectiveStatus(t)),
          )
          .map((t) => [t.title, t.assignee, t.department, t.dueDate, t.priority, effectiveStatus(t)]);
        return {
          columns: ["Task", "Assignee", "Department", "Due date", "Priority", "Status"],
          rows,
        };
      }
      case "meetings": {
        const rows = store.meetings
          .filter((m) => inRange(m.date) && matchPerson(m.attendees.join(" ")))
          .map((m) => [
            m.title,
            m.date,
            m.time,
            m.location,
            String(m.attendees.length),
            String(m.actionItems.length),
          ]);
        return {
          columns: ["Meeting", "Date", "Time", "Location", "Attendees", "Action items"],
          rows,
        };
      }
      case "visitors": {
        const rows = store.visitors
          .filter(
            (v) => inRange(v.arrival.slice(0, 10)) && matchPerson(v.name) && matchStatus(v.status),
          )
          .map((v) => [
            v.name,
            v.company,
            v.host,
            v.purpose,
            v.arrival.replace("T", " "),
            v.departure ? v.departure.replace("T", " ") : "—",
            v.status,
          ]);
        return {
          columns: ["Visitor", "Company", "Host", "Purpose", "Arrival", "Departure", "Status"],
          rows,
        };
      }
      case "leave": {
        const rows = store.leave
          .filter(
            (l) =>
              inRange(l.start) &&
              matchDept(l.department) &&
              matchPerson(l.employee) &&
              matchStatus(l.status),
          )
          .map((l) => [l.employee, l.department, l.type, l.start, l.end, l.status]);
        return {
          columns: ["Employee", "Department", "Leave type", "Start", "End", "Status"],
          rows,
        };
      }
      case "supplies": {
        const rows = store.supplies
          .filter((s) => matchStatus(s.quantity <= s.minimum ? "Low stock" : "In stock"))
          .map((s) => [
            s.name,
            s.category,
            `${s.quantity} ${s.unit}`,
            String(s.minimum),
            s.supplier,
            s.lastOrder,
            s.quantity <= s.minimum ? "Low stock" : "In stock",
          ]);
        return {
          columns: ["Item", "Category", "Quantity", "Minimum", "Supplier", "Last order", "Status"],
          rows,
        };
      }
      default: {
        const rows = store.documents
          .filter((d) => inRange(d.expiry) && matchDept(d.department) && matchPerson(d.owner))
          .map((d) => [d.name, d.category, d.department, d.owner, d.expiry, d.status]);
        return {
          columns: ["Document", "Category", "Department", "Responsible", "Expiry", "Status"],
          rows,
        };
      }
    }
  }, [report, store, from, to, department, status, person]);

  const statusOptions = useMemo(() => {
    switch (report) {
      case "tasks":
        return ["Not Started", "In Progress", "Completed", "Overdue"];
      case "leave":
        return ["Pending", "Approved", "Rejected", "Info requested"];
      case "visitors":
        return ["Expected", "On site", "Checked out"];
      case "supplies":
        return ["Low stock", "In stock"];
      default:
        return [];
    }
  }, [report]);

  const title = REPORTS.find((r) => r.key === report)?.label ?? "Report";

  const exportCsv = () => {
    const content = [table.columns, ...table.rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `adminflow-${report}-${iso(0)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!store.can("view.reports")) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reports" description="Reporting is available to managers and administrators." />
        <EmptyState
          title="You don't have access to reports"
          hint="Ask your administrator if you need reporting permissions."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Filter workplace activity and export it for meetings, audits or payroll."
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" /> Export PDF
            </Button>
            <Button onClick={exportCsv}>
              <FileSpreadsheet className="size-4" /> Export Excel
            </Button>
          </>
        }
      />

      <div className="surface grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 print:hidden">
        <div className="grid gap-2">
          <Label>Report</Label>
          <Select value={report} onValueChange={(v) => { setReport(v as ReportKey); setStatus("All"); }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORTS.map((r) => (
                <SelectItem key={r.key} value={r.key}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rep-from">From</Label>
          <Input id="rep-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rep-to">To</Label>
          <Input id="rep-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Department</Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All departments</SelectItem>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus} disabled={statusOptions.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All statuses</SelectItem>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rep-person">Employee / person</Label>
          <Input
            id="rep-person"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            placeholder="Any person"
          />
        </div>
      </div>

      <section className="surface p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {from} to {to} · generated by {store.user.name}
            </p>
          </div>
          <Pill tone="primary">
            <Download className="size-3.5" /> {table.rows.length} records
          </Pill>
        </div>
        {table.rows.length === 0 ? (
          <EmptyState title="No records match these filters" hint="Widen the date range or clear filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
                  {table.columns.map((c) => (
                    <th key={c} className="py-2 pr-4 font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    {row.map((cell, j) => (
                      <td key={j} className="py-2.5 pr-4 align-top">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
