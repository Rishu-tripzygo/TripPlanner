"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackingItem, PackingListRecord } from "@/lib/phase-one-types";
import {
  Briefcase,
  Check,
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

const surfaceCard =
  "border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,243,237,0.88))] text-[#1A1C1B] backdrop-blur-[18px]";

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
  const [newItemCategory, setNewItemCategory] = useState<PackingItem["category"]>("Misc");
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
    <div className="landing-shell space-y-8 px-4 py-8 sm:px-5 lg:px-6">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className={surfaceCard}>
          <CardHeader>
            <p className="section-label">Packing List</p>
            <CardTitle className="font-[family-name:var(--font-noto-serif)] text-[40px] text-[#024785]">
              {tripTitle}
            </CardTitle>
            <p className="text-sm leading-7 text-[#61738C]">
              A smart packing checklist generated from your trip duration, destinations, active
              itinerary, and weather signals. Update anything and it stays saved to this trip.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[18px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-5">
              <div className="mb-4 inline-flex rounded-2xl bg-[#EEF2F8] p-3 text-[#14518b]">
                <ClipboardList className="size-5" />
              </div>
              <p className="text-sm text-[#61738C]">Template</p>
              <p className="mt-2 text-2xl font-semibold text-[#024785]">
                {list.template || "Custom list"}
              </p>
            </div>
            <div className="rounded-[18px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-5">
              <div className="mb-4 inline-flex rounded-2xl bg-[#EEF2F8] p-3 text-[#14518b]">
                <CheckCheck className="size-5" />
              </div>
              <p className="text-sm text-[#61738C]">Progress</p>
              <p className="mt-2 text-2xl font-semibold text-[#024785]">
                {packedCount} of {list.items.length} packed
              </p>
              <div className="mt-4 h-2 rounded-full bg-[#E8EDF3]">
                <div
                  className="h-2 rounded-full bg-[linear-gradient(135deg,#1B3A6B,#00C2FF)]"
                  style={{
                    width: `${list.items.length ? (packedCount / list.items.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="rounded-[18px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-5">
              <div className="mb-4 inline-flex rounded-2xl bg-[#EEF2F8] p-3 text-[#14518b]">
                <PackageOpen className="size-5" />
              </div>
              <p className="text-sm text-[#61738C]">Essential items left</p>
              <p className="mt-2 text-2xl font-semibold text-[#024785]">{essentialRemaining}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#8A96A8]">
                Pack these before departure
              </p>
            </div>
            <div className="rounded-[18px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-5">
              <div className="mb-4 inline-flex rounded-2xl bg-[#EEF2F8] p-3 text-[#14518b]">
                <Users className="size-5" />
              </div>
              <p className="text-sm text-[#61738C]">Estimated carry weight</p>
              <p className="mt-2 text-2xl font-semibold text-[#024785]">
                {(totalEstimatedWeight / 1000).toFixed(1)} kg
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#8A96A8]">
                Based on checklist quantities
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={surfaceCard}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#EEF2F8] p-3 text-[#14518b]">
                <Plus className="size-5" />
              </div>
              <div>
                <p className="section-label">Custom Item</p>
                <CardTitle className="text-2xl text-[#024785]">Add something specific</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              value={newItemLabel}
              onChange={(event) => setNewItemLabel(event.target.value)}
              placeholder="Portable tripod"
              className="w-full rounded-[16px] border border-[rgba(20,81,139,0.1)] bg-white px-4 py-3 text-sm text-[#1A1C1B] outline-none transition focus:border-[#14518b]/20"
            />
            <select
              value={newItemCategory}
              onChange={(event) => setNewItemCategory(event.target.value as PackingItem["category"])}
              className="w-full rounded-[16px] border border-[rgba(20,81,139,0.1)] bg-white px-4 py-3 text-sm text-[#1A1C1B] outline-none transition focus:border-[#14518b]/20"
            >
              {categoryOrder.map((category) => (
                <option key={category} value={category} className="bg-white text-[#1A1C1B]">
                  {category}
                </option>
              ))}
            </select>
            {error ? <p className="text-sm text-[#B84A43]">{error}</p> : null}
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
              <div className="flex w-full items-center rounded-[16px] border border-[rgba(20,81,139,0.08)] bg-white/72 px-4 py-3 text-sm leading-7 text-[#61738C]">
                Changes save automatically. {isSaving ? "Saving..." : "Everything is up to date."}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        {groupedItems.map((group) => (
          <Card key={group.category} className={surfaceCard}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#EEF2F8] p-3 text-[#14518b]">
                  {group.category === "Clothing" ? (
                    <Shirt className="size-5" />
                  ) : (
                    <Briefcase className="size-5" />
                  )}
                </div>
                <div>
                  <p className="section-label">{group.category}</p>
                  <CardTitle className="text-2xl text-[#024785]">
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
                      className="rounded-[18px] border border-[rgba(20,81,139,0.08)] bg-white/74 p-4"
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
                                ? "border-[#14518b]/20 bg-[#EAF1FB] text-[#14518b]"
                                : "border-[rgba(20,81,139,0.16)] bg-transparent text-transparent"
                            }`}
                          >
                            <Check className="size-3.5" />
                          </span>
                          <span>
                            <span
                              className={`block text-sm font-medium ${
                                item.packed ? "text-[#8A96A8] line-through" : "text-[#024785]"
                              }`}
                            >
                              {item.label}
                            </span>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.aiSuggested ? (
                                <span className="rounded-full border border-[#00C2FF]/20 bg-[#00C2FF]/8 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#14518b]">
                                  AI suggested
                                </span>
                              ) : null}
                              {item.essential ? (
                                <span className="rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#8A4B16]">
                                  Essential
                                </span>
                              ) : null}
                              {item.sharedItem ? (
                                <span className="rounded-full border border-[rgba(20,81,139,0.08)] bg-white px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#61738C]">
                                  Shared
                                </span>
                              ) : null}
                            </div>
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-xs uppercase tracking-[0.18em] text-[#8A96A8] transition hover:text-[#14518b]"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center rounded-full border border-[rgba(20,81,139,0.08)] bg-white">
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(item.id, {
                                quantity: Math.max(1, (item.quantity || 1) - 1),
                              })
                            }
                            className="px-3 py-2 text-sm text-[#415873]"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs uppercase tracking-[0.16em] text-[#8A96A8]">
                            Qty {item.quantity || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(item.id, {
                                quantity: Math.min(12, (item.quantity || 1) + 1),
                              })
                            }
                            className="px-3 py-2 text-sm text-[#415873]"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateItem(item.id, { sharedItem: !item.sharedItem })}
                          className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.16em] ${
                            item.sharedItem
                              ? "bg-[#EEF4FB] text-[#14518b]"
                              : "border border-[rgba(20,81,139,0.08)] bg-white text-[#61738C]"
                          }`}
                        >
                          {item.sharedItem ? "Shared item" : "Mark shared"}
                        </button>
                        {item.estimatedWeightGrams ? (
                          <span className="text-xs uppercase tracking-[0.16em] text-[#8A96A8]">
                            {(item.estimatedWeightGrams * (item.quantity || 1) / 1000).toFixed(1)} kg
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[18px] border border-dashed border-[rgba(20,81,139,0.12)] bg-white/68 p-5 text-sm leading-7 text-[#61738C]">
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
