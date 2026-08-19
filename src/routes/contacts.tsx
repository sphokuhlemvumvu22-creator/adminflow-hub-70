import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Building2, Mail, Phone, Plus, Search, Trash2, Users } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, PageHeader, Pill, StatCard } from "@/components/adminflow/ui";
import { DEPARTMENTS } from "@/lib/adminflow/data";
import { id, useStore } from "@/lib/adminflow/store";
import type { Contact } from "@/lib/adminflow/types";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Contact directory — AdminFlow" },
      {
        name: "description",
        content:
          "A searchable workplace directory of employees, suppliers and external contacts with departments and extensions.",
      },
      { property: "og:title", content: "Contact directory — AdminFlow" },
      {
        property: "og:description",
        content: "Find any colleague or supplier in seconds.",
      },
    ],
  }),
  component: ContactsPage,
});

const KINDS: Contact["kind"][] = ["Employee", "Supplier", "External"];

function ContactForm({ contact, trigger }: { contact?: Contact; trigger: React.ReactNode }) {
  const { saveContact } = useStore();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Contact>(
    contact ?? {
      id: id("con"),
      name: "",
      kind: "Employee",
      department: DEPARTMENTS[0] ?? "Administration",
      position: "",
      email: "",
      phone: "",
      extension: "",
      location: "",
    },
  );

  const set = <K extends keyof Contact>(key: K, value: Contact[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{contact ? "Edit contact" : "Add contact"}</DialogTitle>
          <DialogDescription>Employees, suppliers and external contacts.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="con-name">Full name / company</Label>
            <Input id="con-name" value={draft.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={draft.kind} onValueChange={(v) => set("kind", v as Contact["kind"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KINDS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Department</Label>
            <Select value={draft.department} onValueChange={(v) => set("department", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="con-pos">Position</Label>
            <Input id="con-pos" value={draft.position} onChange={(e) => set("position", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="con-loc">Office location</Label>
            <Input id="con-loc" value={draft.location} onChange={(e) => set("location", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="con-email">Email</Label>
            <Input
              id="con-email"
              type="email"
              value={draft.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="con-phone">Phone number</Label>
            <Input id="con-phone" value={draft.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="con-ext">Extension</Label>
            <Input
              id="con-ext"
              value={draft.extension ?? ""}
              onChange={(e) => set("extension", e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!draft.name.trim()) return;
              saveContact(draft);
              setOpen(false);
            }}
          >
            Save contact
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ContactsPage() {
  const { contacts, deleteContact, can } = useStore();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"All" | Contact["kind"]>("All");
  const editable = can("manage.contacts");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts
      .filter((c) => (kind === "All" ? true : c.kind === kind))
      .filter((c) =>
        q
          ? `${c.name} ${c.department} ${c.position} ${c.email} ${c.phone} ${c.extension ?? ""}`
              .toLowerCase()
              .includes(q)
          : true,
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, query, kind]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact directory"
        description="Employees, suppliers and external contacts in one searchable place."
        actions={
          editable ? (
            <ContactForm
              trigger={
                <Button>
                  <Plus className="size-4" /> Add contact
                </Button>
              }
            />
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Employees"
          value={contacts.filter((c) => c.kind === "Employee").length}
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="Suppliers"
          value={contacts.filter((c) => c.kind === "Supplier").length}
          tone="info"
          icon={<Building2 className="size-5" />}
        />
        <StatCard
          label="Departments"
          value={new Set(contacts.map((c) => c.department)).size}
          tone="ok"
          icon={<Building2 className="size-5" />}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, department, position or number"
            className="pl-9"
          />
        </div>
        <Select value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All contacts</SelectItem>
            {KINDS.map((k) => (
              <SelectItem key={k} value={k}>
                {k}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {list.length === 0 ? (
        <EmptyState title="No contacts found" hint="Try a different search term." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((c) => (
            <div key={c.id} className="surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{c.name}</p>
                    <Pill tone={c.kind === "Employee" ? "primary" : "info"}>{c.kind}</Pill>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {c.position} · {c.department}
                  </p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <a className="inline-flex items-center gap-1 hover:underline" href={`mailto:${c.email}`}>
                      <Mail className="size-3.5" /> {c.email}
                    </a>
                    <a className="inline-flex items-center gap-1 hover:underline" href={`tel:${c.phone}`}>
                      <Phone className="size-3.5" /> {c.phone}
                    </a>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.extension ? `Ext. ${c.extension} · ` : ""}
                    {c.location}
                  </p>
                </div>
                {editable ? (
                  <div className="flex shrink-0 gap-1">
                    <ContactForm
                      contact={c}
                      trigger={
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${c.name}`}
                      onClick={() => deleteContact(c.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
