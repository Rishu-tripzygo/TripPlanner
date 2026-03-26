import { Location } from "@/app/generated/prisma";
import { formatDistanceKm, getRouteSummary } from "@/lib/route-metrics";
import { reorderItinerary } from "@/lib/actions/reorder-itineraty";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MapPin, Route } from "lucide-react";
import { useId, useMemo, useState } from "react";

interface SortableItineraryProps {
  locations: Location[];
  tripId: string;
}

function SortableItem({ item }: { item: Location }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center justify-between rounded-[20px] border border-white/8 bg-white/[0.03] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition hover:border-white/12 hover:bg-white/[0.05]"
    >
      <div className="flex items-center gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-[#8B9BB4]">
          <GripVertical className="size-5" />
        </div>
        <div>
          <h4 className="font-medium text-white">{item.locationTitle}</h4>
          <p className="mt-1 flex items-center gap-2 text-sm text-[#8B9BB4]">
            <MapPin className="size-4 text-[#00C2FF]" />
            {`Latitude: ${item.lat}, Longitude: ${item.lng}`}
          </p>
        </div>
      </div>
      <div className="rounded-full border border-[#00C2FF]/20 bg-[#00C2FF]/10 px-4 py-2 text-sm font-medium text-[#9FE7FF]">
        Stop {item.order + 1}
      </div>
    </div>
  );
}

export default function SortableItinerary({
  locations,
  tripId,
}: SortableItineraryProps) {
  const id = useId();
  const [localLocation, setLocalLocation] = useState(locations);
  const routeSummary = useMemo(
    () =>
      getRouteSummary({
        locations: localLocation,
      }),
    [localLocation]
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = localLocation.findIndex((item) => item.id === active.id);
      const newIndex = localLocation.findIndex((item) => item.id === over!.id);

      const newLocationsOrder = arrayMove(
        localLocation,
        oldIndex,
        newIndex
      ).map((item, index) => ({ ...item, order: index }));

      setLocalLocation(newLocationsOrder);

      await reorderItinerary(
        tripId,
        newLocationsOrder.map((item) => item.id)
      );
    }
  };

  return (
    <DndContext
      id={id}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localLocation.map((loc) => loc.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="rounded-[24px] border border-white/8 bg-[#0A0E1A] p-4">
          <div className="mb-4 flex items-center gap-3 rounded-[18px] border border-white/8 bg-[#161820] px-5 py-4 text-white">
            <Route className="size-5 text-[#00C2FF]" />
            <div>
              <p className="text-sm font-medium">Drag to reorder your stops</p>
              <p className="text-xs text-[#8B9BB4]">
                Adjust the route to match how you want the trip to unfold.
              </p>
            </div>
          </div>
          {routeSummary.segments.length > 0 ? (
            <div className="mb-4 grid gap-3 rounded-[18px] border border-white/8 bg-[#121826] p-4 text-sm text-[#D8E2F1] md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8B9BB4]">Approx. distance</p>
                <p className="mt-2 font-semibold text-white">
                  {formatDistanceKm(routeSummary.totalDistanceKm)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8B9BB4]">Longest leg</p>
                <p className="mt-2 font-semibold text-white">
                  {formatDistanceKm(routeSummary.longestSegmentKm)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8B9BB4]">Legs</p>
                <p className="mt-2 font-semibold text-white">{routeSummary.segments.length}</p>
              </div>
            </div>
          ) : null}
          <div className="space-y-4">
            {localLocation.map((item) => (
              <SortableItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
}
