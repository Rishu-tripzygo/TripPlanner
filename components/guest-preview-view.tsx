import Link from "next/link";
import { PersistedItinerary } from "@/lib/phase-one-types";
import { Button } from "@/components/ui/button";
import { BedDouble, CalendarRange, MapPinned, Sparkles, Users, WalletCards } from "lucide-react";

export default function GuestPreviewView({
  itinerary,
  ctaHref,
}: {
  itinerary: PersistedItinerary;
  ctaHref: string;
}) {
  return (
    <div className="space-y-6">
      <section className="app-shell overflow-hidden rounded-[32px] border border-white/55 bg-white/58 p-6 shadow-[0_20px_44px_rgba(22,40,64,0.08)] backdrop-blur-[24px] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="section-label">Guest preview</p>
            <h2 className="mt-4 font-[family-name:var(--font-noto-serif)] text-[2.4rem] font-bold leading-[0.95] tracking-[-0.04em] text-[#0f3460] sm:text-[3rem]">
              {itinerary.trip_summary.destination}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-[#61738C] sm:text-base">
              {itinerary.trip_overview}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/55 bg-white/72 px-5 py-5 text-sm leading-7 text-[#46617c] shadow-[0_12px_24px_rgba(20,81,139,0.05)]">
            <p className="font-semibold text-[#0f3460]">Want to keep this trip?</p>
            <p className="mt-2">
              Sign in once and we will save this itinerary into your Trips workspace.
            </p>
            <Link href={ctaHref} className="mt-4 inline-flex">
              <Button className="rounded-full">Sign in to save this trip</Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {[
            {
              label: "Duration",
              value: `${itinerary.trip_summary.duration_days} days`,
              Icon: CalendarRange,
            },
            {
              label: "Travelers",
              value: `${itinerary.trip_summary.travelers}`,
              Icon: Users,
            },
            {
              label: "Budget",
              value: itinerary.trip_summary.budget_range || "Flexible",
              Icon: WalletCards,
            },
            {
              label: "Style",
              value: itinerary.trip_summary.travel_style,
              Icon: Sparkles,
            },
            {
              label: "Best area",
              value: itinerary.trip_summary.ideal_area_to_stay,
              Icon: MapPinned,
            },
          ].map(({ label, value, Icon }) => (
            <div
              key={label}
              className="inline-flex items-center gap-3 rounded-full border border-white/55 bg-white/68 px-4 py-3 text-sm text-[#46617c]"
            >
              <Icon className="size-4 text-[#14518b]" />
              <span className="font-medium text-[#0f3460]">{value}</span>
              <span className="text-[#7a8ea8]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {itinerary.days.map((day) => (
            <section
              key={day.day}
              className="app-shell rounded-[30px] border border-white/55 bg-white/56 p-6 shadow-[0_18px_40px_rgba(22,40,64,0.07)] backdrop-blur-[24px]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#14518b]">
                    Day {day.day}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-[#0f3460]">{day.title}</h3>
                  {day.dateLabel ? (
                    <p className="mt-2 text-sm text-[#7a8ea8]">{day.dateLabel}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {day.weather ? (
                    <div className="rounded-full border border-white/55 bg-white/72 px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#61738C]">
                      {day.weather.summary} · {day.weather.temperatureMin}°C to{" "}
                      {day.weather.temperatureMax}°C
                    </div>
                  ) : null}
                  {day.estimatedCost ? (
                    <div className="rounded-full border border-white/55 bg-white/72 px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#61738C]">
                      Est. {day.estimatedCost.currency} {day.estimatedCost.total}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  { label: "Morning", items: day.morning },
                  { label: "Afternoon", items: day.afternoon },
                  { label: "Evening", items: day.evening },
                ].map((block) => (
                  <div
                    key={block.label}
                    className="rounded-[22px] border border-white/55 bg-[#FAF9F7]/88 p-4"
                  >
                    <p className="text-sm font-semibold text-[#0f3460]">{block.label}</p>
                    <div className="mt-3 space-y-3">
                      {block.items.map((item) => (
                        <div
                          key={`${block.label}-${item}`}
                          className="rounded-[16px] bg-white/78 px-4 py-3 text-sm leading-7 text-[#46617c]"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="space-y-5">
          <section className="app-shell rounded-[30px] border border-white/55 bg-white/56 p-6 shadow-[0_18px_40px_rgba(22,40,64,0.07)] backdrop-blur-[24px]">
            <p className="section-label">Stay suggestions</p>
            <div className="mt-4 space-y-3">
              {itinerary.hotel_recommendations.slice(0, 3).map((hotel) => (
                <div key={hotel.name} className="rounded-[20px] bg-[#FAF9F7]/88 p-4">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-white text-[#14518b]">
                      <BedDouble className="size-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0f3460]">{hotel.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#7a8ea8]">
                        {hotel.price_range}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[#61738C]">
                        {hotel.recommendation_reason}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="app-shell rounded-[30px] border border-white/55 bg-white/56 p-6 shadow-[0_18px_40px_rgba(22,40,64,0.07)] backdrop-blur-[24px]">
            <p className="section-label">What you unlock after sign-in</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[#61738C]">
              {[
                "Save this itinerary into a real trip automatically.",
                "Refine it with AI without losing earlier versions.",
                "Confirm route suggestions on the map and start prep.",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#FAF9F7]/88 px-4 py-4">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
