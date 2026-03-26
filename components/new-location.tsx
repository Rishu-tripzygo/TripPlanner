"use client";

import { useTransition } from "react";
import { Button } from "./ui/button";
import { addLocation } from "@/lib/actions/add-location";
import { Compass, MapPinned, Sparkles } from "lucide-react";

export default function NewLocationClient({ tripId }: { tripId: string }) {
  const [isPending, startTransation] = useTransition();
  const surfaceCard =
    "border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,243,237,0.88))] text-[#1A1C1B] backdrop-blur-[18px]";

  return (
    <div className="landing-shell grid gap-8 px-4 py-8 sm:px-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-6">
      <div className="space-y-6">
        <p className="section-label">Add Destination</p>
        <h1 className="font-[family-name:var(--font-noto-serif)] text-[42px] font-bold tracking-[-0.05em] text-[#024785] sm:text-[58px]">
          Add the next stop to your journey.
        </h1>
        <p className="max-w-xl text-base leading-8 text-[#61738C]">
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
              className={`rounded-[24px] p-5 shadow-[0_18px_38px_rgba(26,28,27,0.05)] ${surfaceCard}`}
            >
              <div className="mb-4 inline-flex rounded-2xl bg-[#EEF2F8] p-3 text-[#14518b]">
                {item.icon}
              </div>
              <h2 className="text-lg font-semibold text-[#024785]">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#61738C]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`rounded-[28px] p-8 shadow-[0_20px_44px_rgba(26,28,27,0.06)] ${surfaceCard}`}>
        <div className="mb-8">
          <p className="section-label">Route Editor</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#024785]">
            Add New Location
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#61738C]">
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
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#415873]">
              <Sparkles className="size-4 text-[#14518b]" />
              Address
            </label>
            <input
              name="address"
              type="text"
              required
              className="w-full rounded-[16px] border border-[rgba(20,81,139,0.1)] bg-white px-4 py-3 text-[#1A1C1B] placeholder:text-[#8A96A8] focus:outline-none focus:ring-2 focus:ring-[#14518b]/15"
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
