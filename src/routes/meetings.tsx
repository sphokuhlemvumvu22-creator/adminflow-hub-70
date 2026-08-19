import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, MapPin, Plus, Trash2, Users } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, PageHeader, Pill, SectionCard } from "@/components/adminflow/ui";
import { daysUntil, id, useStore } from "@/lib/adminflow/store";
import { iso } from "@/lib/adminflow/data";
import type { Meeting } from "@/lib/adminflow/types";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meetings & calendar — AdminFlow" },
      {
        name: "description",
        content:
          "Schedule meetings, build agendas, capture minutes and assign action items with follow-up dates.",
      },
      { property: "og:title", content: "Meetings & calendar — AdminFlow" },
      { property: "og:description", content: "Agendas, minutes and action items in one place." },
    ],
  }),
  component: MeetingsPage,
});

function MeetingForm({ meeting, trigger }: { meeting?: Meeting; trigger: React.ReactNode }) {
  const { saveMeeting } = useStore();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Meeting>(
    meeting ?? {
      id: id("m"),
      title: "",
      date: iso(1),
      time: "09:00",
      location: "Boardroom A",
      attendees: [],
      agenda: "",
      notes: "",
      minutes: "",
      actionItems: [],
    },
  );
  const [attendees, setAttendees] = useState(meeting?.attendees.join(", ") ?? "");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{meeting ? "Edit meeting" : "Schedule meeting"}</DialogTitle>
          <DialogDescription>Set the details and circulate the agenda.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="m-title">Meeting title</Label>
            <Input id="m-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="m-date">Date</Label>
              <Input id="m-date" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-time">Time</Label>
              <Input id="m-time" type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-loc">Location</Label>
            <Input id="m-loc" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-att">Attendees (comma separated)</Label>
            <Input id="m-att" value={attendees} onChange={(e) => setAttendees(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-agenda">Agenda</Label>
            <Textarea id="m-agenda" rows={3} value={draft.agenda} onChange={(e) => setDraft({ ...draft, agenda: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-notes">Notes</Label>
            <Textarea id="m-notes" rows={2} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-follow">Follow-up date</Label>
            <Input id="m-follow" type="date" value={draft.followUp ?? ""} onChange={(e) => setDraft({ ...draft, followUp: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            disabled={!draft.title.trim()}
            onClick={() => {
              saveMeeting({
                ...draft,
                attendees: attendees.split(",").map((a) => a.trim()).filter(Boolean),
              });
              setOpen(false);
            }}
          >
            Save meeting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MinutesDialog({ meeting }: { meeting: Meeting }) {
  const { saveMeeting } = useStore();
  const [open, setOpen] = useState(false);
  const [minutes, setMinutes] = useState(meeting.minutes);
  const [what, setWhat] = useState("");
  const [owner, setOwner] = useState("");
  const [due, setDue] = useState(iso(7));
  const [items, setItems] = useState(meeting.actionItems);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">Minutes & actions</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{meeting.title}</DialogTitle>
          <DialogDescription>Record minutes and assign action items.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="minutes">Meeting minutes</Label>
            <Textarea id="minutes" rows={5} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          </div>
          <div className="rounded-lg border p-3">
            <p className="mb-2 text-sm font-semibold">Action items</p>
            <ul className="mb-3 space-y-2">
              {items.map((a) => (
                <li key={a.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={a.done}
                    onChange={() => setItems(items.map((x) => (x.id === a.id ? { ...x, done: !x.done } : x)))}
                  />
                  <span className={a.done ? "line-through opacity-60" : ""}>{a.what}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{a.owner} · {a.dueDate}</span>
                </li>
              ))}
              {items.length === 0 ? <li className="text-sm text-muted-foreground">None yet.</li> : null}
            </ul>
            <div className="grid gap-2 sm:grid-cols-3">
              <Input placeholder="Action" value={what} onChange={(e) => setWhat(e.target.value)} />
              <Input placeholder="Owner" value={owner} onChange={(e) => setOwner(e.target.value)} />
              <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              disabled={!what.trim()}
              onClick={() => {
                setItems([...items, { id: id("a"), what, owner: owner || "Unassigned", dueDate: due, done: false }]);
                setWhat("");
                setOwner("");
              }}
            >
              <Plus /> Add action item
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              saveMeeting({ ...meeting, minutes, actionItems: items });
              setOpen(false);
            }}
          >
            Save minutes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MeetingCard({ meeting }: { meeting: Meeting }) {
  const { deleteMeeting, can } = useStore();
  return (
    <article className="surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold">{meeting.title}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />{meeting.date} · {meeting.time}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{meeting.location}</span>
            <span className="inline-flex items-center gap-1"><Users className="size-3.5" />{meeting.attendees.length} attendees</span>
          </p>
        </div>
        {can("manage.meetings") ? (
          <div className="flex items-center gap-2">
            <MinutesDialog meeting={meeting} />
            <MeetingForm meeting={meeting} trigger={<Button size="sm" variant="ghost">Edit</Button>} />
            <Button size="icon" variant="ghost" aria-label="Delete meeting" onClick={() => deleteMeeting(meeting.id)}>
              <Trash2 className="text-destructive" />
            </Button>
          </div>
        ) : null}
      </div>
      {meeting.agenda ? (
        <p className="mt-3 rounded-lg bg-muted p-3 text-sm whitespace-pre-line">{meeting.agenda}</p>
      ) : null}
      {meeting.minutes ? (
        <div className="mt-3 rounded-lg border-l-4 border-accent bg-accent/5 p-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Minutes</p>
          <p className="text-sm">{meeting.minutes}</p>
        </div>
      ) : null}
      {meeting.actionItems.length > 0 ? (
        <ul className="mt-3 space-y-1">
          {meeting.actionItems.map((a) => (
            <li key={a.id} className="flex items-center gap-2 text-sm">
              <Pill tone={a.done ? "ok" : "warning"}>{a.done ? "Done" : "Open"}</Pill>
              <span>{a.what}</span>
              <span className="ml-auto text-xs text-muted-foreground">{a.owner} · {a.dueDate}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function CalendarGrid({ meetings }: { meetings: Meeting[] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(startOffset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const key = (d: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div>
      <p className="mb-3 font-semibold">
        {first.toLocaleString("en-ZA", { month: "long", year: "numeric" })}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted-foreground">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const dayMeetings = meetings.filter((m) => m.date === key(d));
          const isToday = d === today.getDate();
          return (
            <div
              key={d}
              className={`min-h-16 rounded-lg border p-1 text-left text-xs ${isToday ? "border-primary bg-primary/5" : ""}`}
            >
              <span className={`font-semibold ${isToday ? "text-primary" : ""}`}>{d}</span>
              {dayMeetings.map((m) => (
                <p key={m.id} className="mt-0.5 truncate rounded bg-accent/15 px-1 py-0.5 text-[10px]">
                  {m.time} {m.title}
                </p>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MeetingsPage() {
  const { meetings, can } = useStore();
  const upcoming = meetings
    .filter((m) => daysUntil(m.date) >= 0)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const past = meetings
    .filter((m) => daysUntil(m.date) < 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader
        title="Meetings"
        description="Schedule meetings, capture minutes and track action items to completion."
        actions={
          can("manage.meetings") ? (
            <MeetingForm trigger={<Button><Plus /> Schedule meeting</Button>} />
          ) : null
        }
      />

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {upcoming.map((m) => <MeetingCard key={m.id} meeting={m} />)}
          {upcoming.length === 0 ? <EmptyState title="No upcoming meetings" /> : null}
        </TabsContent>
        <TabsContent value="calendar" className="mt-4">
          <SectionCard title="Month view" description="Meetings scheduled this month">
            <CalendarGrid meetings={meetings} />
          </SectionCard>
        </TabsContent>
        <TabsContent value="past" className="mt-4 space-y-3">
          {past.map((m) => <MeetingCard key={m.id} meeting={m} />)}
          {past.length === 0 ? <EmptyState title="No past meetings" /> : null}
        </TabsContent>
      </Tabs>
    </>
  );
}
