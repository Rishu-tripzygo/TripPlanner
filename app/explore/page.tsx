import { auth } from "@/auth";
import PublicTripCard from "@/components/public-trip-card";
import { Button } from "@/components/ui/button";
import { demoExploreTrips } from "@/lib/demo-content";
import { getPublicTripCards } from "@/lib/public-travel";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function ExplorePage() {
  const session = await auth();
  const publicTrips = await getPublicTripCards(session?.user?.id);
  const hasPublicTrips = publicTrips.length > 0;

  return (
    <div className="app-shell space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[36px] border border-[rgba(2,71,133,0.08)] bg-white px-8 py-10 shadow-[0_20px_40px_rgba(26,28,27,0.06)]">
        <p className="section-label">Explore</p>
        <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-noto-serif)] text-[58px] font-bold leading-[0.92] tracking-[-0.05em] text-[#024785]">
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
      </section>

      <section>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {[
            [hasPublicTrips ? "Public itineraries" : "Featured demo trips", hasPublicTrips ? publicTrips.length : demoExploreTrips.length],
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
          <div className="space-y-6">
            <div className="rounded-[28px] border border-dashed border-[rgba(2,71,133,0.12)] bg-[linear-gradient(180deg,#ffffff,#f7f4ef)] p-6 shadow-[0_18px_38px_rgba(26,28,27,0.04)]">
              <p className="section-label text-[#14518b]">Featured routes</p>
              <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[2.2rem] font-bold tracking-[-0.04em] text-[#024785]">
                Public community trips are still growing, so start with curated demos.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-8 text-[#61738C]">
                These sample routes show what a polished Wandrly trip looks like before you create
                your own itinerary.
              </p>
            </div>
            <div className="grid gap-6 xl:grid-cols-3">
              {demoExploreTrips.map((trip) => (
                <DemoExploreCard key={trip.title} trip={trip} />
              ))}
            </div>
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
  return (
    <div className="overflow-hidden rounded-[28px] border border-[rgba(2,71,133,0.08)] bg-white shadow-[0_20px_40px_rgba(26,28,27,0.06)]">
      <div
        className="relative h-56 bg-cover bg-center"
        style={{ backgroundImage: `url(${trip.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A6B]/72 via-[#1B3A6B]/16 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
            {trip.destination}
          </p>
          <h3 className="mt-2 font-[family-name:var(--font-noto-serif)] text-[30px] font-bold tracking-[-0.04em]">
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

        <div className="flex flex-wrap gap-3">
          <Link href="/ai-trip-planner">
            <Button>Use this as inspiration</Button>
          </Link>
          <Link href="/assistant">
            <Button variant="outline">See how AI helps</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
