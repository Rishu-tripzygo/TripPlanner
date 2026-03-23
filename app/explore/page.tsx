import { auth } from "@/auth";
import PublicTripCard from "@/components/public-trip-card";
import { getPublicTripCards } from "@/lib/public-travel";

export default async function ExplorePage() {
  const session = await auth();
  const publicTrips = await getPublicTripCards(session?.user?.id);

  return (
    <div className="app-shell space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[36px] border border-[rgba(2,71,133,0.08)] bg-white px-8 py-10 shadow-[0_20px_40px_rgba(26,28,27,0.06)]">
        <p className="section-label">Explore</p>
        <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-noto-serif)] text-[58px] font-bold leading-[0.92] tracking-[-0.05em] text-[#024785]">
          Browse public journeys from the Wandrly community.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-[#61738C]">
          Discover shared itineraries, bookmark ideas, follow travelers whose style matches
          yours, and use public journeys as inspiration for your next plan.
        </p>
      </section>

      <section>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {[
            ["Public itineraries", publicTrips.length],
            ["Traveler profiles", new Set(publicTrips.map((trip) => trip.author.id)).size],
            ["Bookmarked-ready routes", publicTrips.filter((trip) => trip.bookmarksCount > 0).length],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-[24px] bg-[#F4F3F1] p-5">
              <p className="text-sm text-[#61738C]">{label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#024785]">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {publicTrips.map((trip) => (
            <PublicTripCard key={trip.shareId} trip={trip} />
          ))}
        </div>
      </section>
    </div>
  );
}
