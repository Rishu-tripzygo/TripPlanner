import Map from "@/components/map";
import StatusBadge from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { PersistedItinerary } from "@/lib/phase-one-types";
import { Calendar, Share2, Sparkles } from "lucide-react";
import Image from "next/image";

export default async function SharedTripPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const share = await prisma.tripShare.findFirst({
    where: {
      token,
      isPublic: true,
    },
    include: {
      trip: {
        include: {
          locations: {
            orderBy: { order: "asc" },
          },
          itineraryVersions: {
            where: { isActive: true },
            take: 1,
          },
        },
      },
    },
  });

  if (!share) {
    return (
      <div className="app-shell px-4 py-24 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-2xl text-center">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Shared trip unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-[#8B9BB4]">
            This link is private, expired, or no longer available.
          </CardContent>
        </Card>
      </div>
    );
  }

  const trip = share.trip;
  const itinerary =
    (trip.itineraryVersions[0]?.itineraryData as unknown as PersistedItinerary | undefined) ||
    null;

  return (
    <div className="app-shell space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[32px] border border-white/8 bg-[#0F1117] shadow-[0_0_0_1px_var(--border),0_8px_40px_rgba(0,0,0,0.35)]">
        <div className="relative h-[340px]">
          {trip.imageUrl ? (
            <Image src={trip.imageUrl} alt={trip.title} fill className="object-cover" priority />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,rgba(0,194,255,0.16),transparent_28%),linear-gradient(145deg,#161820,#08090E)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090E] via-[#08090E]/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-[#D8E2F1]">
              <Share2 className="size-4 text-[#00C2FF]" />
              Public trip view
            </div>
            <h1 className="text-[42px] font-semibold tracking-[-0.05em] text-white sm:text-[56px]">
              {trip.title}
            </h1>
            <p className="flex items-center gap-2 text-sm text-[#D8E2F1]">
              <Calendar className="size-4 text-[#00C2FF]" />
              {trip.startDate.toLocaleDateString()} - {trip.endDate.toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[#8B9BB4]">Trip Summary</p>
            <p className="mt-3 text-base leading-8 text-white">{trip.description}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[#8B9BB4]">Destinations</p>
            <p className="mt-3 text-2xl font-semibold text-white">{trip.locations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[#8B9BB4]">Itinerary Status</p>
            <div className="mt-3">
              <StatusBadge status={itinerary ? "upcoming" : "planning"} />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-white">Mapped destinations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trip.locations.length > 0 ? (
              trip.locations.map((location, index) => (
                <div
                  key={location.id}
                  className="rounded-[18px] border border-white/8 bg-white/[0.03] p-4"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[#4A5568]">
                    Stop {index + 1}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {location.locationTitle}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[18px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-[#8B9BB4]">
                No locations have been added to this trip yet.
              </div>
            )}
          </CardContent>
        </Card>
        <div className="h-[460px] overflow-hidden rounded-[24px] border border-white/8">
          <Map itineraries={trip.locations} />
        </div>
      </section>

      {itinerary ? (
        <section className="space-y-6">
          <div>
            <p className="section-label">Shared Itinerary</p>
            <h2 className="mt-3 text-[36px] font-semibold tracking-[-0.04em] text-white">
              AI-planned trip outline
            </h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-white">
                {itinerary.trip_summary.destination}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm leading-8 text-[#D8E2F1]">{itinerary.trip_overview}</p>
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  ["Purpose", itinerary.trip_summary.purpose],
                  ["Style", itinerary.trip_summary.travel_style],
                  ["Budget", itinerary.trip_summary.budget_range],
                  ["Stay zone", itinerary.trip_summary.ideal_area_to_stay],
                ].map(([label, value]) => (
                  <div
                    key={label as string}
                    className="rounded-[16px] border border-white/8 bg-white/[0.03] p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.22em] text-[#4A5568]">{label}</p>
                    <p className="mt-3 text-sm text-white">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
            <div className="space-y-6">
              {itinerary.days.map((day) => (
                <Card key={day.day}>
                  <CardContent className="space-y-4 pt-6">
                    <div>
                      <p className="section-label">Day {day.day}</p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{day.title}</h3>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      {[
                        ["Morning", day.morning],
                        ["Afternoon", day.afternoon],
                        ["Evening", day.evening],
                      ].map(([label, items]) => (
                        <div
                          key={label as string}
                          className="rounded-[16px] border border-white/8 bg-white/[0.03] p-4"
                        >
                          <p className="text-sm font-medium text-white">{label}</p>
                          <ul className="mt-3 space-y-2">
                            {(items as string[]).map((item) => (
                              <li key={item} className="flex gap-3 text-sm text-[#D8E2F1]">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#00C2FF]" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Highlights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    ["Local Foods", itinerary.local_foods],
                    ["Must-Visit Attractions", itinerary.must_visit_attractions],
                    ["Hidden Gems", itinerary.hidden_gems],
                  ].map(([title, items]) => (
                    <div key={title as string} className="rounded-[16px] border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-sm font-medium text-white">{title}</p>
                      <ul className="mt-3 space-y-2">
                        {(items as string[]).map((item) => (
                          <li key={item} className="flex gap-3 text-sm text-[#D8E2F1]">
                            <Sparkles className="mt-0.5 size-4 shrink-0 text-[#00C2FF]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
