"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createTrip } from "@/lib/actions/create-trip";
import { cn } from "@/lib/utils";
import { UploadButton } from "@/lib/upload-thing";
import { CalendarRange, ImagePlus, MapPinned, Plane, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import Image from "next/image";

export default function NewTrip() {
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_24%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_42%,_#f8fafc_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-medium text-sky-900 shadow-sm">
            <Sparkles className="size-4" />
            Create a new travel canvas
          </div>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Turn a trip idea into a beautifully organized route.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
              Start with the essentials now. You can layer in destinations,
              reorder the itinerary, and enrich the experience after the trip is created.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: <MapPinned className="size-5" />,
                title: "Destination-first structure",
                text: "Create the trip shell, then add locations in the natural order you want to experience them.",
              },
              {
                icon: <CalendarRange className="size-5" />,
                title: "Clear timeline",
                text: "Dates, cover image, and core description give every trip a polished starting point.",
              },
            ].map((item) => (
              <Card
                key={item.title}
                className="rounded-[1.75rem] border-white/80 bg-white/80 shadow-lg shadow-sky-100/60"
              >
                <CardContent className="pt-6">
                  <div className="mb-4 inline-flex rounded-2xl bg-sky-100 p-3 text-sky-700">
                    {item.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="rounded-[2rem] border-white/80 bg-white/85 shadow-2xl shadow-sky-100/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl text-slate-950">
              <Plane className="size-7 text-sky-700" />
              New Trip
            </CardTitle>
            <CardDescription>
              Add the core details now. You can refine the route and visuals after creation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-6"
              action={(formData: FormData) => {
                if (imageUrl) {
                  formData.append("imageUrl", imageUrl);
                }
                startTransition(() => {
                  createTrip(formData);
                });
              }}
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Japan trip..."
                  className={cn(
                    "w-full rounded-2xl border border-slate-200 px-4 py-3",
                    "bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  )}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Trip description..."
                  className={cn(
                    "min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3",
                    "bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  )}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    className={cn(
                      "w-full rounded-2xl border border-slate-200 px-4 py-3",
                      "bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    )}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    className={cn(
                      "w-full rounded-2xl border border-slate-200 px-4 py-3",
                      "bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    )}
                  />
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <label className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <ImagePlus className="size-4 text-sky-700" />
                  Trip Image
                </label>

                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt="Trip Preview"
                    className="mb-4 max-h-52 w-full rounded-2xl object-cover"
                    width={300}
                    height={100}
                  />
                )}
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res[0].ufsUrl) {
                      setImageUrl(res[0].ufsUrl);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    console.error("Upload error: ", error);
                  }}
                />
              </div>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full rounded-full py-6 text-base"
              >
                {isPending ? "Creating..." : "Create Trip"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
