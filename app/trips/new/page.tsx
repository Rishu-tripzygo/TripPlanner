"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createTrip } from "@/lib/actions/create-trip";
import { cn } from "@/lib/utils";
import { UploadButton } from "@/lib/upload-thing";
import { CalendarRange, ImagePlus, MapPinned, Plane } from "lucide-react";
import { useState, useTransition } from "react";
import Image from "next/image";

export default function NewTrip() {
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <div className="app-shell grid gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8">
      <div className="space-y-6">
        <p className="section-label">New Trip</p>
        <h1 className="text-[42px] font-semibold tracking-[-0.05em] text-white sm:text-[58px]">
          Turn an idea into a route worth saving.
        </h1>
        <p className="max-w-xl text-base leading-8 text-[#8B9BB4]">
          Set the destination, add dates, and attach a cover image. From there,
          we can layer in locations, reorder the journey, and visualize the route.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: <MapPinned className="size-5" />,
              title: "Destination-first structure",
              text: "Build the trip shell, then add destinations in the sequence that makes sense.",
            },
            {
              icon: <CalendarRange className="size-5" />,
              title: "Clear timeline",
              text: "Dates and cover image give every trip a polished memory and planning frame.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-[#00C2FF]">
                  {item.icon}
                </div>
                <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#8B9BB4]">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl text-white">
            <Plane className="size-7 text-[#00C2FF]" />
            Create new trip
          </CardTitle>
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
              <label className="mb-2 block text-sm font-medium text-[#D8E2F1]">
                Title
              </label>
              <input
                type="text"
                name="title"
                placeholder="Japan trip..."
                className={cn(
                  "w-full rounded-[12px] border border-white/10 px-4 py-3",
                  "bg-white/[0.04] text-white placeholder:text-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/20"
                )}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#D8E2F1]">
                Description
              </label>
              <textarea
                name="description"
                placeholder="Trip description..."
                className={cn(
                  "min-h-28 w-full rounded-[12px] border border-white/10 px-4 py-3",
                  "bg-white/[0.04] text-white placeholder:text-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/20"
                )}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#D8E2F1]">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#D8E2F1]">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white"
                />
              </div>
            </div>
            <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-5">
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[#D8E2F1]">
                <ImagePlus className="size-4 text-[#00C2FF]" />
                Trip Image
              </label>

              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt="Trip Preview"
                  className="mb-4 max-h-52 w-full rounded-[16px] object-cover"
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
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Creating..." : "Create Trip"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
