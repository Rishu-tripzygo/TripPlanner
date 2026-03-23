import { auth } from "@/auth";
import StatCard from "@/components/stat-card";
import TripCard from "@/components/trip-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNotificationFeed, syncTripReminderNotifications } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight,
  BellRing,
  CalendarClock,
  MapPinned,
  Sparkles,
  TicketsPlane,
  Trees,
  WalletCards,
} from "lucide-react";
import Link from "next/link";

export default async function TripsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="app-shell px-4 py-20 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-2xl text-center">
          <CardHeader>
            <p className="section-label">Travel dashboard</p>
            <CardTitle className="font-[family-name:var(--font-noto-serif)] text-4xl text-[#024785]">
              Sign in to open your trip workspace
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[#61738C]">
            Your AI plans, live trips, budgets, maps, documents, and journals all sit behind
            one calm dashboard.
          </CardContent>
        </Card>
      </div>
    );
  }

  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    include: {
      locations: true,
      itineraryVersions: {
        where: { isActive: true },
        take: 1,
      },
    },
    orderBy: { startDate: "desc" },
  });

  await syncTripReminderNotifications(session.user.id);
  const { notifications, unreadCount } = await getNotificationFeed(session.user.id);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTrips = trips.filter((trip) => new Date(trip.startDate) >= today);
  const completedTrips = trips.filter((trip) => new Date(trip.endDate) < today);
  const totalStops = trips.reduce((sum, trip) => sum + trip.locations.length, 0);
  const draftTrips = trips.filter(
    (trip) => trip.locations.length === 0 && trip.itineraryVersions.length === 0
  );
  const tripsNeedingLocations = trips.filter(
    (trip) => trip.itineraryVersions.length > 0 && trip.locations.length === 0
  );
  const tripsReadyForPrep = trips.filter(
    (trip) => trip.itineraryVersions.length > 0 && trip.locations.length > 0
  );
  const nextTrip = upcomingTrips[0] || null;
  const daysToNextTrip = nextTrip
    ? Math.max(
        0,
        Math.ceil(
          (new Date(nextTrip.startDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
      )
    : null;

  return (
    <div className="app-shell space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr_0.72fr]">
        <div className="paper-soft rounded-[32px] p-8">
          <p className="font-[family-name:var(--font-noto-serif)] text-[40px] font-bold tracking-[-0.05em] text-[#024785]">
            Welcome back
          </p>
          <p className="mt-3 max-w-sm text-base leading-8 text-[#61738C]">
            This dashboard is your control center. Start the trip, shape the route, then move
            into prep.
          </p>

          <nav className="mt-8 space-y-2">
            {[
              { href: "/trips", label: "Dashboard", active: true },
              { href: "/ai-trip-planner", label: "Plan with AI", active: false },
              { href: "/globe", label: "Travel Globe", active: false },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center rounded-[18px] px-4 py-3 text-sm font-medium transition ${
                  item.active
                    ? "bg-white text-[#024785] shadow-[0_12px_24px_rgba(26,28,27,0.06)]"
                    : "text-[#61738C] hover:bg-white/70 hover:text-[#024785]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-10">
            <Link href="/trips/new">
              <Button className="w-full rounded-full">Plan new trip</Button>
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[36px] bg-white shadow-[0_20px_40px_rgba(26,28,27,0.06)]">
          <div className="flex items-center justify-between px-8 pt-8">
            <div>
              <p className="section-label">Control center</p>
              <h1 className="mt-4 font-[family-name:var(--font-noto-serif)] text-[54px] font-bold leading-[0.92] tracking-[-0.05em] text-[#024785]">
                Good morning,
                <br />
                {session.user.name?.split(" ")[0] || "Traveler"}
              </h1>
              <p className="mt-3 text-base text-[#61738C]">
                {today.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="rounded-full bg-[#F4F3F1] p-1">
              <div className="grid grid-cols-3 gap-1">
                {[
                  ["Trips", trips.length],
                  ["Nations", Math.max(1, totalStops)],
                  ["Days", upcomingTrips.length + completedTrips.length],
                ].map(([label, value], index) => (
                  <div
                    key={label as string}
                    className={`rounded-full px-6 py-3 text-center ${
                      index === 0 ? "bg-white shadow-[0_8px_18px_rgba(26,28,27,0.06)]" : ""
                    }`}
                  >
                    <p className="text-3xl font-semibold tracking-[-0.03em] text-[#024785]">
                      {value}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7B8CA3]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            <div
              className="relative overflow-hidden rounded-[34px] bg-cover bg-center p-8 shadow-[0_20px_40px_rgba(26,28,27,0.08)]"
              style={{
                backgroundImage:
                  "linear-gradient(180deg,rgba(2,71,133,0.18),rgba(2,71,133,0.72)),url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')",
              }}
            >
              <div className="max-w-xl text-white">
                <p className="inline-flex rounded-full bg-white/18 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em]">
                  Your next adventure
                </p>
                <h2 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[58px] font-bold leading-[0.92] tracking-[-0.05em]">
                  {nextTrip?.title || "Start your next trip"}
                </h2>
                <p className="mt-4 text-sm leading-8 text-white/85">
                  {nextTrip?.description ||
                    "Use AI first if you want the quickest way to go from idea to a structured plan."}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <div className="rounded-[24px] border border-white/20 bg-white/14 px-5 py-4 text-white backdrop-blur-xl">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">
                    Departing in
                  </p>
                  <p className="mt-2 text-[42px] font-semibold tracking-[-0.04em]">
                    {daysToNextTrip ?? 0}
                    <span className="ml-2 text-base font-normal">days</span>
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/20 bg-white/14 px-5 py-4 text-white backdrop-blur-xl">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">
                    Route status
                  </p>
                  <p className="mt-2 text-[42px] font-semibold tracking-[-0.04em]">
                    {nextTrip?.locations.length || 0}
                    <span className="ml-2 text-base font-normal">stops</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] bg-white p-7 shadow-[0_20px_40px_rgba(26,28,27,0.06)]">
            <h3 className="font-[family-name:var(--font-noto-serif)] text-[32px] font-bold tracking-[-0.04em] text-[#024785]">
              Explore destinations
            </h3>
            <div className="mt-6 space-y-4">
              {[
                [
                  "Paris, France",
                  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=900&q=80",
                ],
                [
                  "Reykjavik, Iceland",
                  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
                ],
              ].map(([title, image]) => (
                <div
                  key={title as string}
                  className="relative h-32 overflow-hidden rounded-[22px] bg-cover bg-center"
                  style={{ backgroundImage: `linear-gradient(180deg,transparent,rgba(0,0,0,0.52)),url(${image})` }}
                >
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="font-semibold text-white">{title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-7 shadow-[0_20px_40px_rgba(26,28,27,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-[family-name:var(--font-noto-serif)] text-[32px] font-bold tracking-[-0.04em] text-[#024785]">
                  Attention
                </h3>
                <p className="mt-2 text-sm text-[#61738C]">{unreadCount} unread reminders</p>
              </div>
              <BellRing className="size-5 text-[#024785]" />
            </div>

            <div className="mt-6 space-y-4">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2F8] text-[#024785]">
                    <BellRing className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm text-[#1A1C1B]">{notification.message}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7B8CA3]">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}

              {notifications.length === 0 ? (
                <p className="text-sm leading-7 text-[#61738C]">
                  No active reminders yet. Once a trip gets close, your prep prompts will show up
                  here.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<TicketsPlane className="size-5" />}
          label="Trips Planned"
          value={trips.length}
          trend="All time"
        />
        <StatCard
          icon={<MapPinned className="size-5" />}
          label="Destinations"
          value={totalStops}
          trend="Mapped stops"
        />
        <StatCard
          icon={<CalendarClock className="size-5" />}
          label="Upcoming"
          value={upcomingTrips.length}
          trend="Ready to fly"
        />
        <StatCard
          icon={<Trees className="size-5" />}
          label="Countries"
          value={Math.max(1, totalStops)}
          trend="Estimated footprint"
        />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <p className="section-label">Recommended flow</p>
            <CardTitle className="font-[family-name:var(--font-noto-serif)] text-4xl text-[#024785]">
              What you should do next
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "1. Start a trip",
                text:
                  draftTrips.length > 0
                    ? `${draftTrips.length} draft trip shell${draftTrips.length === 1 ? "" : "s"} still need an AI itinerary.`
                    : "Create a trip shell when you already know the destination and travel dates.",
                actionHref: draftTrips[0] ? `/ai-trip-planner?tripId=${draftTrips[0].id}` : "/trips/new",
                actionLabel: draftTrips[0] ? "Generate AI plan" : "Create trip",
                icon: <Sparkles className="size-5" />,
              },
              {
                title: "2. Add route stops",
                text:
                  tripsNeedingLocations.length > 0
                    ? `${tripsNeedingLocations.length} trip${tripsNeedingLocations.length === 1 ? "" : "s"} need mapped destinations before the workspace becomes useful.`
                    : "Map destinations so weather, ordering, and local context become meaningful.",
                actionHref: tripsNeedingLocations[0]
                  ? `/trips/${tripsNeedingLocations[0].id}/itinerary/new`
                  : nextTrip
                    ? `/trips/${nextTrip.id}/itinerary/new`
                    : "/trips",
                actionLabel: "Add destinations",
                icon: <MapPinned className="size-5" />,
              },
              {
                title: "3. Operationalize it",
                text:
                  tripsReadyForPrep.length > 0
                    ? `${tripsReadyForPrep.length} trip${tripsReadyForPrep.length === 1 ? "" : "s"} are ready for budget, packing, docs, and journals.`
                    : "Prep modules become much stronger once both itinerary and route are in place.",
                actionHref: tripsReadyForPrep[0] ? `/trips/${tripsReadyForPrep[0].id}` : "/trips",
                actionLabel: "Open workspace",
                icon: <WalletCards className="size-5" />,
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] bg-[#F4F3F1] p-5">
                <div className="mb-4 inline-flex rounded-2xl bg-white p-3 text-[#024785] shadow-[0_10px_18px_rgba(26,28,27,0.04)]">
                  {item.icon}
                </div>
                <h3 className="font-[family-name:var(--font-noto-serif)] text-[28px] font-bold tracking-[-0.03em] text-[#1A1C1B]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-8 text-[#61738C]">{item.text}</p>
                <Link href={item.actionHref} className="mt-5 inline-flex">
                  <Button variant="outline">{item.actionLabel}</Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="section-label">Recent trips</p>
            <CardTitle className="font-[family-name:var(--font-noto-serif)] text-4xl text-[#024785]">
              Open a workspace and keep it moving
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trips.length === 0 ? (
              <div className="rounded-[24px] bg-[#F4F3F1] p-6 text-sm leading-8 text-[#61738C]">
                No trips yet. Start with AI if you want the fastest path from idea to a
                structured travel plan.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {trips.slice(0, 4).map((trip) => {
                  const status =
                    trip.locations.length === 0 && trip.itineraryVersions.length === 0
                      ? "draft"
                      : new Date(trip.endDate) < today
                        ? "done"
                        : new Date(trip.startDate) >= today
                          ? "upcoming"
                          : "planning";

                  return (
                    <TripCard
                      key={trip.id}
                      id={trip.id}
                      title={trip.title}
                      description={trip.description}
                      startDate={trip.startDate}
                      endDate={trip.endDate}
                      imageUrl={trip.imageUrl}
                      stops={trip.locations.length}
                      status={status}
                    />
                  );
                })}
              </div>
            )}

            {trips.length > 4 ? (
              <div className="mt-6">
                <Link href="/trips" className="inline-flex">
                  <Button variant="outline">
                    See all trips
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
