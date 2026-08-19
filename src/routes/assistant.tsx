import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Loader2, Plus, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, PageHeader, Pill, SectionCard, priorityTone } from "@/components/adminflow/ui";
import { generateEmail, planTasks, summarizeMinutes } from "@/lib/ai.functions";
import { id, nowStamp, useStore } from "@/lib/adminflow/store";
import type { TaskPriority } from "@/lib/adminflow/types";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI assistant — AdminFlow" },
      {
        name: "description",
        content:
          "Draft workplace emails, turn rough meeting notes into formal minutes and plan tasks automatically with the AdminFlow AI assistant.",
      },
      { property: "og:title", content: "AI assistant — AdminFlow" },
      {
        property: "og:description",
        content: "Smart email generator, meeting notes summariser and AI task planner.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantPage,
});

function errorMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error);
  if (raw.includes("402")) return "AI credits are exhausted — please top up the workspace.";
  if (raw.includes("429")) return "The assistant is busy right now. Try again in a moment.";
  return "The assistant could not complete that request. Please try again.";
}

function Output({ text, label }: { text: string; label: string }) {
  return (
    <div className="rounded-xl border bg-muted/40 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Pill tone="primary">{label}</Pill>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            void navigator.clipboard.writeText(text);
            toast.success("Copied to clipboard");
          }}
        >
          <Copy /> Copy
        </Button>
      </div>
      <pre className="text-sm whitespace-pre-wrap">{text}</pre>
    </div>
  );
}

function EmailTab() {
  const run = useServerFn(generateEmail);
  const { user } = useStore();
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState("Professional");
  const [keyPoints, setKeyPoints] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!purpose.trim()) {
      toast.error("Describe what the email is about");
      return;
    }
    setBusy(true);
    try {
      const res = await run({
        data: { purpose, recipient, tone, keyPoints, sender: user.name },
      });
      setText(res.text);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SectionCard
      title="Smart email generator"
      description="Describe the situation and get a polished workplace email you can send."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="ai-purpose">What is the email about?</Label>
            <Textarea
              id="ai-purpose"
              rows={4}
              placeholder="Remind department heads to submit their monthly budget reports by Friday…"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ai-recipient">Recipient</Label>
              <Input
                id="ai-recipient"
                placeholder="Department heads"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Professional", "Friendly", "Formal", "Firm", "Apologetic"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ai-points">Key points (optional)</Label>
            <Textarea
              id="ai-points"
              rows={3}
              placeholder="Deadline 30 August · attach the signed template · copy finance"
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
            />
          </div>
          <Button onClick={() => void submit()} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Wand2 />} Generate email
          </Button>
        </div>
        <div>
          {text ? (
            <Output text={text} label="Draft email" />
          ) : (
            <EmptyState title="Your draft appears here" hint="Fill in the details and generate." />
          )}
        </div>
      </div>
    </SectionCard>
  );
}

function MinutesTab() {
  const run = useServerFn(summarizeMinutes);
  const { meetings } = useStore();
  const [title, setTitle] = useState("");
  const [attendees, setAttendees] = useState("");
  const [notes, setNotes] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  function loadMeeting(meetingId: string) {
    const m = meetings.find((x) => x.id === meetingId);
    if (!m) return;
    setTitle(m.title);
    setAttendees(m.attendees.join(", "));
    setNotes([m.agenda, m.notes, m.minutes].filter(Boolean).join("\n"));
  }

  async function submit() {
    if (!notes.trim()) {
      toast.error("Paste the meeting notes first");
      return;
    }
    setBusy(true);
    try {
      const res = await run({ data: { title: title || "Meeting", attendees, notes } });
      setText(res.text);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SectionCard
      title="Meeting notes summariser"
      description="Turn rough notes into formal minutes with decisions and action items."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Load from a scheduled meeting (optional)</Label>
            <Select onValueChange={loadMeeting}>
              <SelectTrigger><SelectValue placeholder="Choose a meeting…" /></SelectTrigger>
              <SelectContent>
                {meetings.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.title} · {m.date}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ai-title">Meeting title</Label>
              <Input id="ai-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ai-attendees">Attendees</Label>
              <Input
                id="ai-attendees"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ai-notes">Raw notes</Label>
            <Textarea
              id="ai-notes"
              rows={8}
              placeholder="Naledi said the budget is late, Thabo to chase suppliers, next review 5 Sept…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button onClick={() => void submit()} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Sparkles />} Summarise notes
          </Button>
        </div>
        <div>
          {text ? (
            <Output text={text} label="Minutes" />
          ) : (
            <EmptyState title="Formal minutes appear here" hint="Paste notes and summarise." />
          )}
        </div>
      </div>
    </SectionCard>
  );
}

interface PlannedTask {
  title: string;
  description: string;
  assignee: string;
  department: string;
  dueDate: string;
  priority: string;
}

function PlannerTab() {
  const run = useServerFn(planTasks);
  const { contacts, saveTask, user, can } = useStore();
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [plan, setPlan] = useState<PlannedTask[]>([]);
  const [busy, setBusy] = useState(false);

  const team = contacts
    .filter((c) => c.kind === "Employee")
    .map((c) => `${c.name} (${c.department})`)
    .join(", ");

  async function submit() {
    if (!goal.trim()) {
      toast.error("Describe the goal you want planned");
      return;
    }
    setBusy(true);
    try {
      const res = await run({
        data: { goal, team, deadline, today: nowStamp().slice(0, 10) },
      });
      setPlan(res.tasks);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  function addTask(t: PlannedTask) {
    const priority = (["Low", "Medium", "High", "Urgent"] as const).includes(
      t.priority as TaskPriority,
    )
      ? (t.priority as TaskPriority)
      : "Medium";
    saveTask({
      id: id("tk"),
      title: t.title,
      description: t.description,
      assignee: t.assignee || user.name,
      department: t.department || user.department,
      dueDate: t.dueDate,
      priority,
      status: "Not Started",
    });
  }

  return (
    <SectionCard
      title="AI task planner"
      description="Turn a goal into a scheduled plan and push the tasks straight into task management."
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="ai-goal">Goal or project</Label>
            <Input
              id="ai-goal"
              placeholder="Prepare the office for the annual compliance audit"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ai-deadline">Deadline</Label>
            <Input
              id="ai-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <Button onClick={() => void submit()} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Sparkles />} Build plan
          </Button>
        </div>

        {plan.length === 0 ? (
          <EmptyState title="No plan yet" hint="Describe a goal and the assistant will schedule it." />
        ) : (
          <div className="space-y-3">
            {plan.map((t, i) => (
              <article key={`${t.title}-${i}`} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{t.title}</h3>
                      <Pill tone={priorityTone(t.priority)}>{t.priority}</Pill>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t.assignee} · {t.department} · due {t.dueDate}
                    </p>
                  </div>
                  {can("manage.tasks") ? (
                    <Button size="sm" variant="secondary" onClick={() => addTask(t)}>
                      <Plus /> Add task
                    </Button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function AssistantPage() {
  return (
    <>
      <PageHeader
        title="AI assistant"
        description="Draft emails, summarise meeting notes and plan work — powered by AdminFlow AI."
        actions={<Pill tone="primary"><Sparkles className="size-3" /> AI powered</Pill>}
      />
      <Tabs defaultValue="email" className="space-y-4">
        <TabsList>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="minutes">Minutes</TabsTrigger>
          <TabsTrigger value="planner">Planner</TabsTrigger>
        </TabsList>
        <TabsContent value="email"><EmailTab /></TabsContent>
        <TabsContent value="minutes"><MinutesTab /></TabsContent>
        <TabsContent value="planner"><PlannerTab /></TabsContent>
      </Tabs>
    </>
  );
}
