import { useEffect, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTMENTS, iso } from "@/lib/adminflow/data";
import { id, useStore } from "@/lib/adminflow/store";
import type { Task, TaskPriority, TaskStatus } from "@/lib/adminflow/types";

const PRIORITIES: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];
const STATUSES: TaskStatus[] = ["Not Started", "In Progress", "Completed", "Overdue"];

export function TaskDialog({
  task,
  trigger,
}: {
  task?: Task;
  trigger: ReactNode;
}) {
  const { saveTask, contacts } = useStore();
  const [open, setOpen] = useState(false);
  const employees = contacts.filter((c) => c.kind === "Employee");

  const blank = (): Task => ({
    id: id("t"),
    title: "",
    description: "",
    assignee: employees[0]?.name ?? "",
    department: "Administration",
    dueDate: iso(1),
    priority: "Medium",
    status: "Not Started",
  });

  const [draft, setDraft] = useState<Task>(task ?? blank());

  useEffect(() => {
    if (open) setDraft(task ? { ...task } : blank());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            Assign work, set a deadline and track it through to completion.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Task title</Label>
            <Input
              id="task-title"
              value={draft.title}
              placeholder="e.g. Prepare board pack"
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Assign to</Label>
              <Select
                value={draft.assignee}
                onValueChange={(v) => setDraft({ ...draft, assignee: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select
                value={draft.department}
                onValueChange={(v) => setDraft({ ...draft, department: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-due">Deadline</Label>
              <Input
                id="task-due"
                type="date"
                value={draft.dueDate}
                onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={draft.priority}
                onValueChange={(v) => setDraft({ ...draft, priority: v as TaskPriority })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={draft.status}
                onValueChange={(v) => setDraft({ ...draft, status: v as TaskStatus })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-file">Attachment</Label>
              <Input
                id="task-file"
                placeholder="File name"
                value={draft.attachment ?? ""}
                onChange={(e) => setDraft({ ...draft, attachment: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            disabled={!draft.title.trim()}
            onClick={() => {
              saveTask(draft);
              setOpen(false);
            }}
          >
            {task ? "Save changes" : "Create task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
