import { auth } from "@/auth";
import { getNotificationFeed, syncTripReminderNotifications } from "@/lib/notifications";
import StatCard from "@/components/stat-card";
import TripCard from "@/components/trip-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { BellRing, CalendarClock, MapPinned, Sparkles, TicketsPlane, Trees } from "lucide-react";
import Link from "next/link";

export default async function TripsPage() {
  const session = await auth();

  const trips = await prisma.trip.findMany({
    where: { userId: session?.user?.id },
    include: { locations: true },
  });

  const sortedTrips = [...trips].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingTrips = sortedTrips.filter((trip) => new Date(trip.startDate) >= today);
  const completedTrips = sortedTrips.filter((trip) => new Date(trip.endDate) < today);
  const totalStops = sortedTrips.reduce((sum, trip) => sum + trip.locations.length, 0);

  if (!session?.user?.id) {
    return (
      <div className="app-shell px-4 py-20 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-2xl text-center">
          <CardHeader>
            <CardTitle className="text-3xl text-white">
              Sign in to view your travel dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[#8B9BB4]">
            Your saved trips, AI plans, route maps, and travel insights are all waiting here.
          </CardContent>
        </Card>
      </div>
    );
  }

  await syncTripReminderNotifications(session.user.id);
  const { notifications, unreadCount } = await getNotificationFeed(session.user.id);
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
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden">
          <div className="h-1.5 bg-[linear-gradient(135deg,#1B3A6B,#00C2FF)]" />
          <CardContent className="pt-8">
            <p className="section-label">Dashboard</p>
            <h1 className="mt-4 text-[40px] font-semibold tracking-[-0.05em] text-white sm:text-[54px]">
              Good evening, {session.user?.name?.split(" ")[0] || "Rishu"}.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#8B9BB4]">
              You have {upcomingTrips.length} upcoming trip
              {upcomingTrips.length === 1 ? "" : "s"} and {completedTrips.length} completed
              journey{completedTrips.length === 1 ? "" : "s"} in your travel archive.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/trips/new">
                <Button size="lg">Create New Trip</Button>
              </Link>
              <Link href="/ai-trip-planner">
                <Button size="lg" variant="outline">
                  Open AI Planner
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(0,194,255,0.16),transparent_30%),linear-gradient(145deg,#161820,#0F1117)]">
          <CardContent className="pt-8">
            <p className="section-label">Your Next Trip</p>
            {nextTrip ? (
              <>
                <h2 className="mt-4 text-[34px] font-semibold tracking-[-0.04em] text-white">
                  {nextTrip.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#D8E2F1]">{nextTrip.description}</p>
                <div className="mt-6 h-2 rounded-full bg-white/6">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(135deg,#1B3A6B,#00C2FF)]"
                    style={{ width: `${Math.min(100, 40 + nextTrip.locations.length * 10)}%` }}
                  />
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[#8B9BB4]">
                  <span>{daysToNextTrip} days to go</span>
                  <span>·</span>
                  <span>{nextTrip.locations.length} saved destinations</span>
                  <span>·</span>
                  <span>{new Date(nextTrip.startDate).toLocaleDateString()}</span>
                </div>
              </>
            ) : (
              <>
                <h2 className="mt-4 text-[34px] font-semibold tracking-[-0.04em] text-white">
                  No trip is queued up yet
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#D8E2F1]">
                  Build a new itinerary or ask the AI planner to draft your next escape.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<TicketsPlane className="size-5" />}
          label="Trips Planned"
          value={sortedTrips.length}
          trend="All time"
        />
        <StatCard
          icon={<MapPinned className="size-5" />}
          label="Destinations"
          value={totalStops}
          trend="Saved stops"
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

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card>
          <CardHeader>
            <p className="section-label">Countdown</p>
            <CardTitle className="text-3xl text-white">Trip launch monitor</CardTitle>
          </CardHeader>
          <CardContent>
            {nextTrip && daysToNextTrip !== null ? (
              <div className="space-y-5">
                <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-sm text-[#8B9BB4]">Your nearest departure</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{nextTrip.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#D8E2F1]">
                    {daysToNextTrip === 0
                      ? "Your trip starts today. Documents, weather, and essentials should all be ready."
                      : `You have ${daysToNextTrip} day${daysToNextTrip === 1 ? "" : "s"} left to finish planning.`}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    ["Start", new Date(nextTrip.startDate).toLocaleDateString()],
                    ["End", new Date(nextTrip.endDate).toLocaleDateString()],
                    ["Stops", `${nextTrip.locations.length}`],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-[16px] border border-white/8 bg-white/[0.03] p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-[#4A5568]">{label}</p>
                      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[16px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-[#8B9BB4]">
                No active countdown yet. Create an upcoming trip and we’ll start surfacing
                reminder milestones here.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-label">Reminder Center</p>
                <CardTitle className="text-3xl text-white">In-app notifications</CardTitle>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.2em] text-[#D8E2F1]">
                <BellRing className="size-4 text-[#00C2FF]" />
                {unreadCount} unread
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-[16px] border p-4 ${
                    notification.read
                      ? "border-white/8 bg-white/[0.03]"
                      : "border-[#00C2FF]/20 bg-[#00C2FF]/10"
                  }`}
                >
                  <p className="text-sm leading-7 text-white">{notification.message}</p>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#8B9BB4]">
                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                    {notification.tripId ? (
                      <Link
                        href={`/trips/${notification.tripId}`}
                        className="text-[#00C2FF] hover:underline"
                      >
                        Open trip
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[16px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-[#8B9BB4]">
                No reminder notifications yet. Trip milestones at 30, 7, 1, and 0 days will show
                up here automatically.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Recent Trips</p>
            <h2 className="mt-3 text-[36px] font-semibold tracking-[-0.04em] text-white sm:text-[48px]">
              Travel plans that still feel editable
            </h2>
          </div>
        </div>

        {sortedTrips.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 p-4 text-[#00C2FF]">
                <Sparkles className="size-7" />
              </div>
              <h3 className="text-2xl font-semibold text-white">No trips yet</h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-[#8B9BB4]">
                Start with a fresh itinerary shell or let the AI planner shape the first draft for
                you.
              </p>
              <Link href="/trips/new" className="mt-6">
                <Button>Create Trip</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sortedTrips.slice(0, 6).map((trip) => {
              const status =
                new Date(trip.endDate) < today
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
      </section>
    </div>
  );
}
