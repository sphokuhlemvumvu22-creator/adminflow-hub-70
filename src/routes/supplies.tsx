import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Boxes, Minus, Package, Plus, Search, Trash2, TriangleAlert } from "lucide-react";
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
import { EmptyState, PageHeader, Pill, StatCard } from "@/components/adminflow/ui";
import { iso } from "@/lib/adminflow/data";
import { id, useStore } from "@/lib/adminflow/store";
import type { Supply } from "@/lib/adminflow/types";

export const Route = createFileRoute("/supplies")({
  head: () => ({
    meta: [
      { title: "Office supplies — AdminFlow" },
      {
        name: "description",
        content:
          "Track office stock levels, suppliers and minimum quantities with automatic low-stock alerts.",
      },
      { property: "og:title", content: "Office supplies — AdminFlow" },
      {
        property: "og:description",
        content: "Know what to reorder before the office runs out.",
      },
    ],
  }),
  component: SuppliesPage,
});

function SupplyForm({ item, trigger }: { item?: Supply; trigger: React.ReactNode }) {
  const { saveSupply } = useStore();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Supply>(
    item ?? {
      id: id("sup"),
      name: "",
      category: "Stationery",
      quantity: 0,
      minimum: 5,
      supplier: "",
      lastOrder: iso(0),
      unit: "units",
    },
  );

  const set = <K extends keyof Supply>(key: K, value: Supply[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Edit supply item" : "Add supply item"}</DialogTitle>
          <DialogDescription>
            Set a minimum level and AdminFlow will alert you when stock runs low.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="sup-name">Item name</Label>
            <Input
              id="sup-name"
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="A4 printer paper"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sup-cat">Category</Label>
            <Input
              id="sup-cat"
              value={draft.category}
              onChange={(e) => set("category", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sup-unit">Unit</Label>
            <Input
              id="sup-unit"
              value={draft.unit}
              onChange={(e) => set("unit", e.target.value)}
              placeholder="boxes"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sup-qty">Current quantity</Label>
            <Input
              id="sup-qty"
              type="number"
              min={0}
              value={draft.quantity}
              onChange={(e) => set("quantity", Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sup-min">Minimum stock level</Label>
            <Input
              id="sup-min"
              type="number"
              min={0}
              value={draft.minimum}
              onChange={(e) => set("minimum", Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sup-supplier">Supplier</Label>
            <Input
              id="sup-supplier"
              value={draft.supplier}
              onChange={(e) => set("supplier", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sup-order">Last order date</Label>
            <Input
              id="sup-order"
              type="date"
              value={draft.lastOrder}
              onChange={(e) => set("lastOrder", e.target.value)}
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
              saveSupply(draft);
              setOpen(false);
            }}
          >
            Save item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SuppliesPage() {
  const { supplies, adjustSupply, deleteSupply, can } = useStore();
  const [query, setQuery] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const editable = can("manage.supplies");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return supplies
      .filter((s) =>
        q
          ? `${s.name} ${s.category} ${s.supplier}`.toLowerCase().includes(q)
          : true,
      )
      .filter((s) => (lowOnly ? s.quantity <= s.minimum : true))
      .sort((a, b) => a.quantity / (a.minimum || 1) - b.quantity / (b.minimum || 1));
  }, [supplies, query, lowOnly]);

  const low = supplies.filter((s) => s.quantity <= s.minimum);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Office supplies"
        description="Monitor stock levels, suppliers and reorder points across the office."
        actions={
          editable ? (
            <SupplyForm
              trigger={
                <Button>
                  <Plus className="size-4" /> Add supply
                </Button>
              }
            />
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tracked items" value={supplies.length} icon={<Boxes className="size-5" />} />
        <StatCard
          label="Low stock alerts"
          value={low.length}
          tone="danger"
          hint={low.length ? "Reorder needed" : "All levels healthy"}
          icon={<TriangleAlert className="size-5" />}
        />
        <StatCard
          label="Suppliers"
          value={new Set(supplies.map((s) => s.supplier)).size}
          icon={<Package className="size-5" />}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items, categories or suppliers"
            className="pl-9"
          />
        </div>
        <Button variant={lowOnly ? "default" : "outline"} onClick={() => setLowOnly((v) => !v)}>
          Low stock only
        </Button>
      </div>

      {list.length === 0 ? (
        <EmptyState title="No supply items found" hint="Adjust your search or add a new item." />
      ) : (
        <div className="grid gap-3">
          {list.map((s) => {
            const isLow = s.quantity <= s.minimum;
            return (
              <div key={s.id} className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{s.name}</p>
                    <Pill tone="neutral">{s.category}</Pill>
                    {isLow ? <Pill tone="danger">Low stock</Pill> : <Pill tone="ok">In stock</Pill>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {s.supplier} · minimum {s.minimum} {s.unit} · last ordered {s.lastOrder}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="min-w-24 text-right text-lg font-bold tabular-nums">
                    {s.quantity} <span className="text-xs font-medium text-muted-foreground">{s.unit}</span>
                  </span>
                  {editable ? (
                    <>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label={`Decrease ${s.name}`}
                        onClick={() => adjustSupply(s.id, -1)}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label={`Increase ${s.name}`}
                        onClick={() => adjustSupply(s.id, 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                      <SupplyForm
                        item={s}
                        trigger={
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        }
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Delete ${s.name}`}
                        onClick={() => deleteSupply(s.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
