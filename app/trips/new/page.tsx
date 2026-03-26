"use client";

import AuthButton from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createTrip } from "@/lib/actions/create-trip";
import { cn } from "@/lib/utils";
import { UploadButton } from "@/lib/upload-thing";
import { CalendarRange, ImagePlus, MapPinned, Plane } from "lucide-react";
import { useState, useTransition } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

const surfaceCard =
  "border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,243,237,0.88))] text-[#1A1C1B] backdrop-blur-[18px]";

export default function NewTrip() {
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { data: session, status } = useSession();

  if (status !== "loading" && !session?.user) {
    return (
      <div className="landing-shell px-4 py-20 sm:px-5 lg:px-6">
        <Card className={cn(surfaceCard, "mx-auto max-w-3xl text-center")}>
          <CardHeader>
            <p className="section-label">New Trip</p>
            <CardTitle className="font-[family-name:var(--font-noto-serif)] text-4xl text-[#024785]">
              Sign in to create a trip workspace
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-[#61738C]">
            <p className="mx-auto max-w-2xl text-sm leading-8">
              Trips are the base layer for AI planning, route stops, budgets, packing, and docs.
            </p>
            <AuthButton
              isLoggedIn={false}
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#024785,#2B5F9E)] px-6 py-3 text-sm font-semibold text-white"
            >
              Sign in to continue
            </AuthButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="landing-shell grid gap-8 px-4 py-8 sm:px-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-6">
      <div className="space-y-6">
        <p className="section-label">New Trip</p>
        <h1 className="font-[family-name:var(--font-noto-serif)] text-[42px] font-bold tracking-[-0.05em] text-[#024785] sm:text-[58px]">
          Turn an idea into a route worth saving.
        </h1>
        <p className="max-w-xl text-base leading-8 text-[#61738C]">
          Set the destination, add dates, and attach a cover image. From there, we can layer in
          locations, reorder the journey, and visualize the route.
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
            <Card key={item.title} className={surfaceCard}>
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex rounded-2xl bg-[#EEF2F8] p-3 text-[#14518b]">
                  {item.icon}
                </div>
                <h2 className="text-lg font-semibold text-[#024785]">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#61738C]">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className={surfaceCard}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl text-[#024785]">
            <Plane className="size-7 text-[#14518b]" />
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
              <label className="mb-2 block text-sm font-medium text-[#415873]">Title</label>
              <input
                type="text"
                name="title"
                placeholder="Japan trip..."
                className={cn(
                  "w-full rounded-[16px] border border-[rgba(20,81,139,0.1)] px-4 py-3",
                  "bg-white text-[#1A1C1B] placeholder:text-[#8A96A8] focus:outline-none focus:ring-2 focus:ring-[#14518b]/15"
                )}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#415873]">Description</label>
              <textarea
                name="description"
                placeholder="Trip description..."
                className={cn(
                  "min-h-28 w-full rounded-[16px] border border-[rgba(20,81,139,0.1)] px-4 py-3",
                  "bg-white text-[#1A1C1B] placeholder:text-[#8A96A8] focus:outline-none focus:ring-2 focus:ring-[#14518b]/15"
                )}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#415873]">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  className="w-full rounded-[16px] border border-[rgba(20,81,139,0.1)] bg-white px-4 py-3 text-[#1A1C1B]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#415873]">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  className="w-full rounded-[16px] border border-[rgba(20,81,139,0.1)] bg-white px-4 py-3 text-[#1A1C1B]"
                />
              </div>
            </div>
            <div className="rounded-[20px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-5">
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[#415873]">
                <ImagePlus className="size-4 text-[#14518b]" />
                Trip Image
              </label>

              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Trip Preview"
                  className="mb-4 max-h-52 w-full rounded-[16px] object-cover"
                  width={300}
                  height={100}
                />
              ) : null}
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
