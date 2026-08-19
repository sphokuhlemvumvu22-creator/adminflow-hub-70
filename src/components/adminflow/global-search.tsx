import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useStore } from "@/lib/adminflow/store";

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const { tasks, meetings, documents, visitors, supplies, contacts, leave } = useStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const go = (to: string) => {
    onOpenChange(false);
    void navigate({ to });
  };

  const groups: { heading: string; to: string; items: { id: string; label: string; hint: string }[] }[] = [
    {
      heading: "Tasks",
      to: "/tasks",
      items: tasks.map((t) => ({ id: t.id, label: t.title, hint: `${t.assignee} · ${t.status}` })),
    },
    {
      heading: "Meetings",
      to: "/meetings",
      items: meetings.map((m) => ({ id: m.id, label: m.title, hint: `${m.date} ${m.time}` })),
    },
    {
      heading: "Documents",
      to: "/documents",
      items: documents.map((d) => ({ id: d.id, label: d.name, hint: d.category })),
    },
    {
      heading: "Visitors",
      to: "/visitors",
      items: visitors.map((v) => ({ id: v.id, label: v.name, hint: v.company })),
    },
    {
      heading: "Leave requests",
      to: "/leave",
      items: leave.map((l) => ({ id: l.id, label: `${l.employee} – ${l.type}`, hint: l.status })),
    },
    {
      heading: "Supplies",
      to: "/supplies",
      items: supplies.map((s) => ({ id: s.id, label: s.name, hint: `${s.quantity} ${s.unit}` })),
    },
    {
      heading: "People",
      to: "/contacts",
      items: contacts.map((c) => ({ id: c.id, label: c.name, hint: `${c.position}` })),
    },
  ];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search employees, tasks, meetings, documents…" />
      <CommandList>
        <CommandEmpty>No matches found.</CommandEmpty>
        {groups.map((group) => (
          <CommandGroup key={group.heading} heading={group.heading}>
            {group.items.map((item) => (
              <CommandItem
                key={`${group.heading}-${item.id}`}
                value={`${item.label} ${item.hint} ${group.heading}`}
                onSelect={() => go(group.to)}
              >
                <span className="truncate">{item.label}</span>
                <span className="ml-auto truncate text-xs text-muted-foreground">{item.hint}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
