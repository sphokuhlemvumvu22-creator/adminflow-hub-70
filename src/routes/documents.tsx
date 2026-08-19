import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Plus, Search, Trash2 } from "lucide-react";
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
import { EmptyState, PageHeader, Pill, statusTone } from "@/components/adminflow/ui";
import { DEPARTMENTS, iso } from "@/lib/adminflow/data";
import { expiryLabel, id, useStore } from "@/lib/adminflow/store";
import type { DocCategory, DocRecord } from "@/lib/adminflow/types";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Document tracker — AdminFlow" },
      {
        name: "description",
        content:
          "Track contracts, policies, certificates and licences with automatic expiry warnings at 30 and 7 days.",
      },
      { property: "og:title", content: "Document tracker — AdminFlow" },
      { property: "og:description", content: "Never miss a contract or certificate renewal again." },
    ],
  }),
  component: DocumentsPage,
});

const CATEGORIES: DocCategory[] = [
  "Contracts",
  "Policies",
  "Certificates",
  "Licences",
  "Employee documents",
  "Supplier documents",
  "Financial documents",
  "Compliance documents",
];

function DocForm({ doc, trigger }: { doc?: DocRecord; trigger: React.ReactNode }) {
  const { saveDocument } = useStore();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DocRecord>(
    doc ?? {
      id: id("d"),
      name: "",
      category: "Contracts",
      department: "Administration",
      owner: "",
      created: iso(0),
      expiry: iso(365),
      status: "Active",
      notes: "",
    },
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{doc ? "Edit document" : "Add document"}</DialogTitle>
          <DialogDescription>Record the document and its renewal date.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="d-name">Document name</Label>
            <Input id="d-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v as DocCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={draft.department} onValueChange={(v) => setDraft({ ...draft, department: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-owner">Responsible person</Label>
              <Input id="d-owner" value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as DocRecord["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Active", "Under review", "Archived"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-created">Date created</Label>
              <Input id="d-created" type="date" value={draft.created} onChange={(e) => setDraft({ ...draft, created: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-exp">Expiry date</Label>
              <Input id="d-exp" type="date" value={draft.expiry} onChange={(e) => setDraft({ ...draft, expiry: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-file">File attachment</Label>
            <Input id="d-file" placeholder="File name" value={draft.file ?? ""} onChange={(e) => setDraft({ ...draft, file: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-notes">Notes</Label>
            <Textarea id="d-notes" rows={2} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            disabled={!draft.name.trim()}
            onClick={() => {
              saveDocument(draft);
              setOpen(false);
            }}
          >
            Save document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DocumentsPage() {
  const { documents, deleteDocument, can } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const visible = documents
    .filter((d) => `${d.name} ${d.owner} ${d.department}`.toLowerCase().includes(query.toLowerCase()))
    .filter((d) => (category === "All" ? true : d.category === category))
    .sort((a, b) => a.expiry.localeCompare(b.expiry));

  return (
    <>
      <PageHeader
        title="Document tracker"
        description="Central register of contracts, policies, certificates and compliance documents with expiry warnings."
        actions={can("manage.documents") ? <DocForm trigger={<Button><Plus /> Add document</Button>} /> : null}
      />

      <div className="surface flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search documents…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-60"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {visible.map((d) => {
          const exp = expiryLabel(d.expiry);
          return (
            <article key={d.id} className="surface p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{d.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {d.category} · {d.department} · {d.owner}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Pill tone={exp.tone === "danger" ? "danger" : exp.tone === "warning" ? "warning" : "ok"}>
                      {exp.label}
                    </Pill>
                    <Pill tone={statusTone(d.status)}>{d.status}</Pill>
                    {d.file ? <Pill>📎 {d.file}</Pill> : null}
                  </div>
                  {d.notes ? <p className="mt-2 text-sm text-muted-foreground">{d.notes}</p> : null}
                </div>
                {can("manage.documents") ? (
                  <div className="flex flex-col gap-1">
                    <DocForm doc={d} trigger={<Button size="sm" variant="ghost">Edit</Button>} />
                    <Button size="sm" variant="ghost" onClick={() => deleteDocument(d.id)} aria-label="Delete document">
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
        {visible.length === 0 ? <EmptyState title="No documents found" /> : null}
      </div>
    </>
  );
}
