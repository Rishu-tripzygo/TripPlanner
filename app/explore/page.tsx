import { auth } from "@/auth";
import PublicTripCard from "@/components/public-trip-card";
import { Button } from "@/components/ui/button";
import { demoExploreTrips } from "@/lib/demo-content";
import { getPublicTripCards } from "@/lib/public-travel";
import { ArrowRight, Compass, Search, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string | string[] }>;
}) {
  const session = await auth();
  const params = (await searchParams) || {};
  const query = Array.isArray(params.q) ? params.q[0] : params.q || "";
  const publicTrips = await getPublicTripCards(session?.user?.id, query);
  const filteredDemoTrips = demoExploreTrips.filter((trip) => {
    if (!query.trim()) return true;
    const haystack = `${trip.title} ${trip.destination} ${trip.summary} ${trip.style}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });
  const hasPublicTrips = publicTrips.length > 0;

  return (
    <div className="app-shell space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[36px] border border-[rgba(2,71,133,0.08)] bg-white px-5 py-8 shadow-[0_20px_40px_rgba(26,28,27,0.06)] sm:px-8 sm:py-10">
        <p className="section-label">Explore</p>
        <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-noto-serif)] text-[2.85rem] font-bold leading-[0.92] tracking-[-0.05em] text-[#024785] sm:text-[3.6rem] lg:text-[58px]">
          Explore public journeys and demo-worthy routes.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-[#61738C]">
          Discover shared itineraries, study polished sample trips, and use public journeys as the
          fastest way to understand how Wandrly turns a brief into a complete trip workspace.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/ai-trip-planner">
            <Button>
              Generate My Itinerary
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/assistant">
            <Button variant="outline">Preview the assistant</Button>
          </Link>
        </div>

        <form
          action="/explore"
          className="mt-6 rounded-[24px] border border-white/55 bg-[#F8F6F2] p-3 shadow-[0_12px_24px_rgba(20,81,139,0.04)]"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-[18px] bg-white px-4 py-3">
              <Search className="size-4 text-[#14518b]" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search Tokyo, romantic, food-led, Bali, luxury..."
                className="w-full bg-transparent text-sm text-[#1A1C1B] outline-none placeholder:text-[#8A96A8]"
              />
            </div>
            <Button type="submit" className="rounded-full px-6">
              Search trips
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-label">Featured demo trips</p>
            <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[2.3rem] font-bold tracking-[-0.04em] text-[#024785]">
              Start from polished examples before you plan your own.
            </h2>
          </div>
          <Link href="/ai-trip-planner">
            <Button variant="outline" className="rounded-full">
              Start from scratch
            </Button>
          </Link>
        </div>

        {filteredDemoTrips.length > 0 ? (
          <div className="grid gap-6 xl:grid-cols-3">
            {filteredDemoTrips.map((trip) => (
              <DemoExploreCard key={trip.title} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[rgba(2,71,133,0.12)] bg-white p-6 text-sm leading-8 text-[#61738C]">
            No demo trips matched your search yet. Try a broader destination, style, or mood.
          </div>
        )}
      </section>

      <section>
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            [
              hasPublicTrips ? "Public itineraries" : "Featured demo trips",
              hasPublicTrips ? publicTrips.length : filteredDemoTrips.length,
            ],
            ["Traveler profiles", new Set(publicTrips.map((trip) => trip.author.id)).size],
            ["Bookmark-ready routes", publicTrips.filter((trip) => trip.bookmarksCount > 0).length],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-[24px] bg-[#F4F3F1] p-5">
              <p className="text-sm text-[#61738C]">{label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#024785]">
                {value}
              </p>
            </div>
          ))}
        </div>

        {hasPublicTrips ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {publicTrips.map((trip) => (
              <PublicTripCard key={trip.shareId} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-[rgba(2,71,133,0.12)] bg-[linear-gradient(180deg,#ffffff,#f7f4ef)] p-6 shadow-[0_18px_38px_rgba(26,28,27,0.04)]">
            <p className="section-label text-[#14518b]">Public community feed</p>
            <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[2.2rem] font-bold tracking-[-0.04em] text-[#024785]">
              Shared community trips are still growing.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-8 text-[#61738C]">
              Start with the curated examples above, or create your first polished itinerary and
              publish it once the trip is ready.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function DemoExploreCard({
  trip,
}: {
  trip: (typeof demoExploreTrips)[number];
}) {
  const href = `/ai-trip-planner?destination=${encodeURIComponent(trip.destination)}&style=${encodeURIComponent(
    trip.style
  )}`;

  return (
      <div className="overflow-hidden rounded-[28px] border border-[rgba(2,71,133,0.08)] bg-white shadow-[0_20px_40px_rgba(26,28,27,0.06)]">
      <div className="relative h-56 bg-cover bg-center" style={{ backgroundImage: `url(${trip.image})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A6B]/72 via-[#1B3A6B]/16 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
            {trip.destination}
          </p>
          <h3 className="mt-2 line-clamp-2 font-[family-name:var(--font-noto-serif)] text-[28px] font-bold tracking-[-0.04em] sm:text-[30px]">
            {trip.title}
          </h3>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <p className="text-sm leading-8 text-[#61738C]">{trip.summary}</p>

        <div className="flex flex-wrap gap-3 text-sm text-[#61738C]">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#F4F3F1] px-3 py-2">
            <Compass className="size-4 text-[#024785]" />
            {trip.length}
          </span>
          <span className="rounded-full bg-[#F4F3F1] px-3 py-2">{trip.budget}</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#F4F3F1] px-3 py-2">
            <Sparkles className="size-4 text-[#024785]" />
            {trip.style}
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href={href}>
            <Button className="w-full sm:w-auto">Use this itinerary</Button>
          </Link>
          <Link href="/assistant">
            <Button variant="outline" className="w-full sm:w-auto">See how AI helps</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
