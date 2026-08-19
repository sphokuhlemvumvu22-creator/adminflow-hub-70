import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EmptyState,
  PageHeader,
  Pill,
  priorityTone,
  statusTone,
} from "@/components/adminflow/ui";
import { TaskDialog } from "@/components/adminflow/task-dialog";
import { effectiveStatus, useStore } from "@/lib/adminflow/store";
import type { TaskStatus } from "@/lib/adminflow/types";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Task management — AdminFlow" },
      {
        name: "description",
        content:
          "Create, assign, prioritise and track workplace tasks from not started through to completed.",
      },
      { property: "og:title", content: "Task management — AdminFlow" },
      { property: "og:description", content: "Assign work, set deadlines and track progress." },
    ],
  }),
  component: TasksPage,
});

const NEXT: Record<TaskStatus, TaskStatus> = {
  "Not Started": "In Progress",
  "In Progress": "Completed",
  Completed: "Not Started",
  Overdue: "In Progress",
};

function TasksPage() {
  const { tasks, saveTask, deleteTask, can, user } = useStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [scope, setScope] = useState(can("manage.tasks") ? "All" : "Mine");

  const visible = tasks
    .filter((t) => (scope === "Mine" ? t.assignee === user.name : true))
    .filter((t) =>
      `${t.title} ${t.description} ${t.assignee} ${t.department}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .filter((t) => (status === "All" ? true : effectiveStatus(t) === status))
    .filter((t) => (priority === "All" ? true : t.priority === priority))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Create tasks, assign them to employees and follow progress through to completion."
        actions={
          can("manage.tasks") ? (
            <TaskDialog trigger={<Button><Plus /> New task</Button>} />
          ) : (
            <Pill tone="info">Employee view · your assigned tasks</Pill>
          )
        }
      />

      <div className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search tasks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["All", "Not Started", "In Progress", "Completed", "Overdue"].map((s) => (
              <SelectItem key={s} value={s}>{s === "All" ? "All statuses" : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["All", "Low", "Medium", "High", "Urgent"].map((p) => (
              <SelectItem key={p} value={p}>{p === "All" ? "All priorities" : p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={scope} onValueChange={setScope}>
          <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Everyone</SelectItem>
            <SelectItem value="Mine">Assigned to me</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {visible.map((t) => {
          const st = effectiveStatus(t);
          const mine = t.assignee === user.name;
          return (
            <article key={t.id} className="surface p-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{t.title}</h3>
                    <Pill tone={priorityTone(t.priority)}>{t.priority}</Pill>
                    <Pill tone={statusTone(st)}>{st}</Pill>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t.assignee} · {t.department} · due {t.dueDate}
                    {t.attachment ? ` · 📎 ${t.attachment}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(can("manage.tasks") || mine) && st !== "Completed" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => saveTask({ ...t, status: NEXT[st] })}
                    >
                      Mark {NEXT[st]}
                    </Button>
                  ) : null}
                  {can("manage.tasks") ? (
                    <>
                      <TaskDialog
                        task={t}
                        trigger={
                          <Button size="icon" variant="ghost" aria-label="Edit task">
                            <Pencil />
                          </Button>
                        }
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Delete task"
                        onClick={() => deleteTask(t.id)}
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
        {visible.length === 0 ? (
          <EmptyState title="No tasks match your filters" hint="Try clearing the search or filters." />
        ) : null}
      </div>
    </>
  );
}
