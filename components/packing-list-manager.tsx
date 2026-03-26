"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackingItem, PackingListRecord } from "@/lib/phase-one-types";
import {
  Briefcase,
  CheckCheck,
  ClipboardList,
  PackageOpen,
  Plus,
  Printer,
  Shirt,
  Users,
} from "lucide-react";

const categoryOrder: PackingItem["category"][] = [
  "Clothing",
  "Documents",
  "Tech",
  "Toiletries",
  "Medications",
  "Misc",
];

export default function PackingListManager({
  tripId,
  tripTitle,
  initialList,
}: {
  tripId: string;
  tripTitle: string;
  initialList: PackingListRecord;
}) {
  const [list, setList] = useState<PackingListRecord>(initialList);
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemCategory, setNewItemCategory] =
    useState<PackingItem["category"]>("Misc");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const packedCount = useMemo(
    () => list.items.filter((item) => item.packed).length,
    [list.items]
  );
  const essentialRemaining = useMemo(
    () => list.items.filter((item) => item.essential && !item.packed).length,
    [list.items]
  );
  const totalEstimatedWeight = useMemo(
    () =>
      list.items.reduce(
        (sum, item) => sum + (item.estimatedWeightGrams || 0) * (item.quantity || 1),
        0
      ),
    [list.items]
  );
  const groupedItems = useMemo(
    () =>
      categoryOrder.map((category) => ({
        category,
        items: list.items.filter((item) => item.category === category),
      })),
    [list.items]
  );

  async function saveList(nextList: PackingListRecord) {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/packing/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: nextList.template,
          items: nextList.items,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save packing list.");
      }

      setList({
        id: data.id,
        tripId: data.tripId,
        template: data.template,
        items: data.items,
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save packing list.");
    } finally {
      setIsSaving(false);
    }
  }

  function togglePacked(itemId: string) {
    const nextList = {
      ...list,
      items: list.items.map((item) =>
        item.id === itemId ? { ...item, packed: !item.packed } : item
      ),
    };

    setList(nextList);
    void saveList(nextList);
  }

  function addItem() {
    const label = newItemLabel.trim();
    if (!label) return;

    const nextList = {
      ...list,
      template: list.template || "Custom",
      items: [
        ...list.items,
        {
          id: `custom-${Date.now()}`,
          label,
          category: newItemCategory,
          packed: false,
        },
      ],
    };

    setList(nextList);
    setNewItemLabel("");
    void saveList(nextList);
  }

  function removeItem(itemId: string) {
    const nextList = {
      ...list,
      items: list.items.filter((item) => item.id !== itemId),
    };

    setList(nextList);
    void saveList(nextList);
  }

  function updateItem(itemId: string, patch: Partial<PackingItem>) {
    const nextList = {
      ...list,
      items: list.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    };

    setList(nextList);
    void saveList(nextList);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="app-shell space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <p className="section-label">Packing List</p>
            <CardTitle className="text-[40px] text-white">{tripTitle}</CardTitle>
            <p className="text-sm leading-7 text-[#8B9BB4]">
              A smart packing checklist generated from your trip duration, destinations, active
              itinerary, and weather signals. Update anything and it stays saved to this trip.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[18px] border border-white/8 bg-white/[0.03] p-5">
              <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[#00C2FF]">
                <ClipboardList className="size-5" />
              </div>
              <p className="text-sm text-[#8B9BB4]">Template</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {list.template || "Custom list"}
              </p>
            </div>
            <div className="rounded-[18px] border border-white/8 bg-white/[0.03] p-5">
              <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[#00C2FF]">
                <CheckCheck className="size-5" />
              </div>
              <p className="text-sm text-[#8B9BB4]">Progress</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {packedCount} of {list.items.length} packed
              </p>
              <div className="mt-4 h-2 rounded-full bg-white/[0.04]">
                <div
                  className="h-2 rounded-full bg-[linear-gradient(135deg,#1B3A6B,#00C2FF)]"
                  style={{
                    width: `${list.items.length ? (packedCount / list.items.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="rounded-[18px] border border-white/8 bg-white/[0.03] p-5">
              <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[#00C2FF]">
                <PackageOpen className="size-5" />
              </div>
              <p className="text-sm text-[#8B9BB4]">Essential items left</p>
              <p className="mt-2 text-2xl font-semibold text-white">{essentialRemaining}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#4A5568]">
                Pack these before departure
              </p>
            </div>
            <div className="rounded-[18px] border border-white/8 bg-white/[0.03] p-5">
              <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[#00C2FF]">
                <Users className="size-5" />
              </div>
              <p className="text-sm text-[#8B9BB4]">Estimated carry weight</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {(totalEstimatedWeight / 1000).toFixed(1)} kg
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#4A5568]">
                Based on checklist quantities
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[#00C2FF]">
                <Plus className="size-5" />
              </div>
              <div>
                <p className="section-label">Custom Item</p>
                <CardTitle className="text-2xl text-white">Add something specific</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              value={newItemLabel}
              onChange={(event) => setNewItemLabel(event.target.value)}
              placeholder="Portable tripod"
              className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
            />
            <select
              value={newItemCategory}
              onChange={(event) =>
                setNewItemCategory(event.target.value as PackingItem["category"])
              }
              className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
            >
              {categoryOrder.map((category) => (
                <option key={category} value={category} className="bg-[#0F1117]">
                  {category}
                </option>
              ))}
            </select>
            {error ? <p className="text-sm text-[#FFB4B4]">{error}</p> : null}
            <Button onClick={addItem} className="w-full">
              <span className="inline-flex items-center gap-2">
                <Plus className="size-4" />
                Add to checklist
              </span>
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={handlePrint} variant="outline" className="w-full">
                <span className="inline-flex items-center gap-2">
                  <Printer className="size-4" />
                  Print checklist
                </span>
              </Button>
              <div className="flex w-full items-center rounded-[16px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-[#8B9BB4]">
                Changes save automatically. {isSaving ? "Saving..." : "Everything is up to date."}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        {groupedItems.map((group) => (
          <Card key={group.category}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[#00C2FF]">
                  {group.category === "Clothing" ? (
                    <Shirt className="size-5" />
                  ) : (
                    <Briefcase className="size-5" />
                  )}
                </div>
                <div>
                  <p className="section-label">{group.category}</p>
                  <CardTitle className="text-2xl text-white">
                    {group.items.length} item{group.items.length === 1 ? "" : "s"}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {group.items.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[16px] border border-white/8 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => togglePacked(item.id)}
                          className="flex flex-1 items-start gap-3 text-left"
                        >
                          <span
                            className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              item.packed
                                ? "border-[#00C2FF]/30 bg-[#00C2FF]/20 text-[#00C2FF]"
                                : "border-white/15 bg-transparent text-transparent"
                            }`}
                          >
                            ?
                          </span>
                          <span>
                            <span
                              className={`block text-sm font-medium ${
                                item.packed ? "text-[#8B9BB4] line-through" : "text-white"
                              }`}
                            >
                              {item.label}
                            </span>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.aiSuggested ? (
                                <span className="rounded-full border border-[#00C2FF]/20 bg-[#00C2FF]/8 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#9DEBFF]">
                                  AI suggested
                                </span>
                              ) : null}
                              {item.essential ? (
                                <span className="rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#F8D7A1]">
                                  Essential
                                </span>
                              ) : null}
                              {item.sharedItem ? (
                                <span className="rounded-full border border-white/12 bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#8B9BB4]">
                                  Shared
                                </span>
                              ) : null}
                            </div>
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-xs uppercase tracking-[0.18em] text-[#8B9BB4] transition hover:text-white"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04]">
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(item.id, {
                                quantity: Math.max(1, (item.quantity || 1) - 1),
                              })
                            }
                            className="px-3 py-2 text-sm text-[#D8E2F1]"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs uppercase tracking-[0.16em] text-[#8B9BB4]">
                            Qty {item.quantity || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(item.id, {
                                quantity: Math.min(12, (item.quantity || 1) + 1),
                              })
                            }
                            className="px-3 py-2 text-sm text-[#D8E2F1]"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateItem(item.id, { sharedItem: !item.sharedItem })}
                          className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.16em] ${
                            item.sharedItem
                              ? "bg-[#eef4fb] text-[#14518b]"
                              : "border border-white/10 bg-white/[0.04] text-[#8B9BB4]"
                          }`}
                        >
                          {item.sharedItem ? "Shared item" : "Mark shared"}
                        </button>
                        {item.estimatedWeightGrams ? (
                          <span className="text-xs uppercase tracking-[0.16em] text-[#4A5568]">
                            {(item.estimatedWeightGrams * (item.quantity || 1) / 1000).toFixed(1)} kg
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[16px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-[#8B9BB4]">
                  Nothing is in this section yet. Add a custom item if you want to tailor the list
                  beyond Wandrly&apos;s automatic packing suggestions.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

