"use client";

import { useTransition } from "react";
import { Button } from "./ui/button";
import { addLocation } from "@/lib/actions/add-location";
import { Compass, MapPinned, Sparkles } from "lucide-react";

export default function NewLocationClient({ tripId }: { tripId: string }) {
  const [isPending, startTransation] = useTransition();

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_20%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_45%,_#f8fafc_100%)] px-4 py-10">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-medium text-sky-900 shadow-sm">
            <Sparkles className="size-4" />
            Expand your route
          </div>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Add the next stop to your journey.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
              Enter a destination or full address. The app will geocode it and
              place it into the itinerary in the next available order slot.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              {
                icon: <MapPinned className="size-5" />,
                title: "Address aware",
                text: "Works with locations, landmarks, and full destination names that Nominatim can resolve.",
              },
              {
                icon: <Compass className="size-5" />,
                title: "Easy to reorder later",
                text: "Once saved, switch back to the itinerary and drag the stop into the best sequence.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-lg shadow-sky-100/60"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-sky-100 p-3 text-sky-700">
                  {item.icon}
                </div>
                <h2 className="text-lg font-semibold text-slate-950">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/80 bg-white/85 p-8 shadow-2xl shadow-sky-100/70">
          <h2 className="text-3xl font-semibold text-slate-950">Add New Location</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Example: `Shibuya Sky, Tokyo` or `221B Baker Street, London`
          </p>
          <form
            className="mt-8 space-y-6"
            action={(formData: FormData) => {
              startTransation(() => {
                addLocation(formData, tripId);
              });
            }}
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Address
              </label>
              <input
                name="address"
                type="text"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <Button type="submit" className="w-full rounded-full py-6 text-base">
              {isPending ? "Adding..." : "Add Location"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
