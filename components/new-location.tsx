"use client";

import { useTransition } from "react";
import { Button } from "./ui/button";
import { addLocation } from "@/lib/actions/add-location";
import { Compass, MapPinned, Sparkles } from "lucide-react";

export default function NewLocationClient({ tripId }: { tripId: string }) {
  const [isPending, startTransation] = useTransition();

  return (
    <div className="app-shell grid gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div className="space-y-6">
        <p className="section-label">Add Destination</p>
        <h1 className="text-[42px] font-semibold tracking-[-0.05em] text-white sm:text-[58px]">
          Add the next stop to your journey.
        </h1>
        <p className="max-w-xl text-base leading-8 text-[#8B9BB4]">
          Enter a place name or full address. The planner will geocode it and slot
          it into the route so you can reorder it later.
        </p>
        <div className="grid gap-4">
          {[
            {
              icon: <MapPinned className="size-5" />,
              title: "Address aware",
              text: "Works with landmarks, cities, and detailed addresses that Nominatim can resolve.",
            },
            {
              icon: <Compass className="size-5" />,
              title: "Easy to reorder later",
              text: "Once saved, drag it into the best sequence from the itinerary panel.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[24px] border border-white/8 bg-[#0F1117] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_4px_24px_rgba(0,0,0,0.4)]"
            >
              <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-[#00C2FF]">
                {item.icon}
              </div>
              <h2 className="text-lg font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#8B9BB4]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[24px] border border-white/8 bg-[#0F1117] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_40px_rgba(0,0,0,0.6)]">
        <div className="mb-8">
          <p className="section-label">Route Editor</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
            Add New Location
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#8B9BB4]">
            Example: `Shibuya Sky, Tokyo` or `221B Baker Street, London`
          </p>
        </div>
        <form
          className="space-y-6"
          action={(formData: FormData) => {
            startTransation(() => {
              addLocation(formData, tripId);
            });
          }}
        >
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#D8E2F1]">
              <Sparkles className="size-4 text-[#00C2FF]" />
              Address
            </label>
            <input
              name="address"
              type="text"
              required
              className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder:text-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/20"
            />
          </div>
          <Button type="submit" className="w-full">
            {isPending ? "Adding..." : "Add Location"}
          </Button>
        </form>
      </div>
    </div>
  );
}
