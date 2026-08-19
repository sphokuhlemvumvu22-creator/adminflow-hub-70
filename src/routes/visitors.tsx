import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LogIn, LogOut, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState, PageHeader, Pill, StatCard, statusTone } from "@/components/adminflow/ui";
import { id, nowStamp, useStore } from "@/lib/adminflow/store";
import type { Visitor } from "@/lib/adminflow/types";

export const Route = createFileRoute("/visitors")({
  head: () => ({
    meta: [
      { title: "Visitor register — AdminFlow" },
      {
        name: "description",
        content:
          "Digital visitor register with check in, check out and a searchable visitor history for your reception desk.",
      },
      { property: "og:title", content: "Visitor register — AdminFlow" },
      { property: "og:description", content: "Professional reception check in and check out." },
    ],
  }),
  component: VisitorsPage,
});

function VisitorForm() {
  const { saveVisitor } = useStore();
  const [open, setOpen] = useState(false);
  const blank = (): Visitor => ({
    id: id("v"),
    name: "",
    company: "",
    phone: "",
    host: "",
    purpose: "",
    arrival: nowStamp(),
    status: "Expected",
  });
  const [draft, setDraft] = useState<Visitor>(blank());

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setDraft(blank()); }}>
      <DialogTrigger asChild>
        <Button><UserPlus /> Register visitor</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Register visitor</DialogTitle>
          <DialogDescription>Capture the visitor details at reception.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="v-name">Visitor name</Label>
            <Input id="v-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="v-co">Company</Label>
            <Input id="v-co" value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="v-phone">Contact number</Label>
            <Input id="v-phone" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="v-host">Person being visited</Label>
            <Input id="v-host" value={draft.host} onChange={(e) => setDraft({ ...draft, host: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="v-arr">Arrival time</Label>
            <Input id="v-arr" type="datetime-local" value={draft.arrival} onChange={(e) => setDraft({ ...draft, arrival: e.target.value })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="v-purpose">Purpose of visit</Label>
            <Input id="v-purpose" value={draft.purpose} onChange={(e) => setDraft({ ...draft, purpose: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            disabled={!draft.name.trim()}
            onClick={() => {
              saveVisitor({ ...draft, status: "On site" });
              setOpen(false);
            }}
          >
            Register & check in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VisitorsPage() {
  const { visitors, checkIn, checkOut, can } = useStore();
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");

  const visible = visitors
    .filter((v) => `${v.name} ${v.company} ${v.host}`.toLowerCase().includes(query.toLowerCase()))
    .filter((v) => (date ? v.arrival.startsWith(date) : true))
    .sort((a, b) => b.arrival.localeCompare(a.arrival));

  const onSite = visitors.filter((v) => v.status === "On site");

  return (
    <>
      <PageHeader
        title="Visitor register"
        description="Digital reception book with check in, check out and searchable history."
        actions={can("manage.visitors") ? <VisitorForm /> : null}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Currently on site" value={onSite.length} tone="info" />
        <StatCard label="Expected today" value={visitors.filter((v) => v.status === "Expected").length} tone="warning" />
        <StatCard label="Total records" value={visitors.length} tone="ok" />
      </div>

      <div className="surface flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by visitor, company or host…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Input type="date" className="sm:w-48" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="space-y-3">
        {visible.map((v) => (
          <article key={v.id} className="surface flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{v.name}</h3>
                <Pill tone={statusTone(v.status)}>{v.status}</Pill>
              </div>
              <p className="text-xs text-muted-foreground">
                {v.company} · {v.phone} · visiting {v.host}
              </p>
              <p className="mt-1 text-sm">{v.purpose}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Arrived {v.arrival.replace("T", " ")}
                {v.departure ? ` · Departed ${v.departure.replace("T", " ")}` : ""}
              </p>
            </div>
            {can("manage.visitors") ? (
              <div className="flex gap-2">
                {v.status !== "On site" && v.status !== "Checked out" ? (
                  <Button size="sm" onClick={() => checkIn(v.id)}><LogIn /> Check in</Button>
                ) : null}
                {v.status === "On site" ? (
                  <Button size="sm" variant="secondary" onClick={() => checkOut(v.id)}><LogOut /> Check out</Button>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}
        {visible.length === 0 ? <EmptyState title="No visitor records found" /> : null}
      </div>
    </>
  );
}
