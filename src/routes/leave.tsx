import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, PageHeader, Pill, statusTone } from "@/components/adminflow/ui";
import { iso } from "@/lib/adminflow/data";
import { id, useStore } from "@/lib/adminflow/store";
import type { LeaveRequest, LeaveType } from "@/lib/adminflow/types";

export const Route = createFileRoute("/leave")({
  head: () => ({
    meta: [
      { title: "Leave requests — AdminFlow" },
      {
        name: "description",
        content:
          "Submit annual, sick, family responsibility and unpaid leave requests and manage approvals with notifications.",
      },
      { property: "og:title", content: "Leave requests — AdminFlow" },
      { property: "og:description", content: "Submit, approve and track workplace leave." },
    ],
  }),
  component: LeavePage,
});

const TYPES: LeaveType[] = [
  "Annual leave",
  "Sick leave",
  "Family responsibility leave",
  "Unpaid leave",
  "Other",
];

function LeaveForm() {
  const { saveLeave, user } = useStore();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<LeaveRequest>({
    id: id("l"),
    employee: user.name,
    department: user.department,
    type: "Annual leave",
    start: iso(7),
    end: iso(10),
    reason: "",
    status: "Pending",
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus /> New leave request</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit leave request</DialogTitle>
          <DialogDescription>Your manager is notified as soon as you submit.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="l-emp">Employee name</Label>
            <Input id="l-emp" value={draft.employee} onChange={(e) => setDraft({ ...draft, employee: e.target.value })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Leave type</Label>
            <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v as LeaveType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="l-start">Start date</Label>
            <Input id="l-start" type="date" value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="l-end">End date</Label>
            <Input id="l-end" type="date" value={draft.end} onChange={(e) => setDraft({ ...draft, end: e.target.value })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="l-reason">Reason</Label>
            <Textarea id="l-reason" rows={3} value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="l-doc">Supporting document (if required)</Label>
            <Input id="l-doc" placeholder="File name" value={draft.document ?? ""} onChange={(e) => setDraft({ ...draft, document: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              saveLeave({ ...draft, id: id("l"), status: "Pending" });
              setOpen(false);
            }}
          >
            Submit request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RequestCard({ request }: { request: LeaveRequest }) {
  const { setLeaveStatus, can } = useStore();
  return (
    <article className="surface p-4">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{request.employee}</h3>
            <Pill tone="primary">{request.type}</Pill>
            <Pill tone={statusTone(request.status)}>{request.status}</Pill>
          </div>
          <p className="text-xs text-muted-foreground">
            {request.department} · {request.start} to {request.end}
          </p>
          <p className="mt-1 text-sm">{request.reason}</p>
          {request.document ? <p className="mt-1 text-xs text-muted-foreground">📎 {request.document}</p> : null}
          {request.note ? (
            <p className="mt-2 rounded-lg bg-muted p-2 text-xs">Manager note: {request.note}</p>
          ) : null}
        </div>
        {can("approve.leave") && request.status === "Pending" ? (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setLeaveStatus(request.id, "Approved")}>Approve</Button>
            <Button size="sm" variant="outline" onClick={() => setLeaveStatus(request.id, "Rejected", "Not approved for this period.")}>
              Reject
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setLeaveStatus(request.id, "Info requested", "Please attach supporting documentation.")}
            >
              Request info
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function LeavePage() {
  const { leave, user, can } = useStore();
  const scope = can("approve.leave") ? leave : leave.filter((l) => l.employee === user.name);
  const pending = scope.filter((l) => l.status === "Pending" || l.status === "Info requested");
  const decided = scope.filter((l) => l.status === "Approved" || l.status === "Rejected");

  return (
    <>
      <PageHeader
        title="Leave requests"
        description={
          can("approve.leave")
            ? "Review, approve or decline leave requests. Employees are notified automatically."
            : "Submit and track your own leave requests."
        }
        actions={<LeaveForm />}
      />

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Awaiting action ({pending.length})</TabsTrigger>
          <TabsTrigger value="decided">Decided ({decided.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4 space-y-3">
          {pending.map((l) => <RequestCard key={l.id} request={l} />)}
          {pending.length === 0 ? <EmptyState title="No requests awaiting action" /> : null}
        </TabsContent>
        <TabsContent value="decided" className="mt-4 space-y-3">
          {decided.map((l) => <RequestCard key={l.id} request={l} />)}
          {decided.length === 0 ? <EmptyState title="Nothing decided yet" /> : null}
        </TabsContent>
      </Tabs>
    </>
  );
}
