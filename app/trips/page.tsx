import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { CalendarDays, Compass, MapPinned, Sparkles } from "lucide-react";
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
  const upcomingTrips = sortedTrips.filter(
    (trip) => new Date(trip.startDate) >= today
  );

  if (!session) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <Card className="max-w-xl rounded-[2rem] border-white/70 bg-white/80 p-6 text-center shadow-xl shadow-sky-100/70">
          <CardHeader>
            <CardTitle className="text-3xl text-slate-950">
              Sign in to view your travel dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600">
            Your trips, AI itinerary drafts, maps, and destination timeline live here.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_25%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_40%,_#f8fafc_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden rounded-[2rem] border-white/70 bg-slate-950 text-white shadow-2xl shadow-sky-200/50">
            <div className="h-2 bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400" />
            <CardHeader className="pb-0">
              <p className="text-sm uppercase tracking-[0.25em] text-sky-200">
                Dashboard
              </p>
              <CardTitle className="text-4xl font-semibold tracking-tight text-white">
                Welcome back, {session.user?.name || "traveler"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 text-slate-200">
              <p className="max-w-2xl text-base leading-7">
                {trips.length === 0
                  ? "You have a clean slate. Start shaping your next journey with a new trip or the AI planner."
                  : `You currently have ${trips.length} ${
                      trips.length === 1 ? "trip" : "trips"
                    } planned, with ${upcomingTrips.length} upcoming and ready for refinement.`}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/trips/new">
                  <Button className="rounded-full bg-white px-6 py-6 text-slate-950 hover:bg-sky-50">
                    Create New Trip
                  </Button>
                </Link>
                <Link href="/ai-trip-planner">
                  <Button
                    variant="outline"
                    className="rounded-full border-white/20 bg-white/10 px-6 py-6 text-white hover:bg-white/15 hover:text-white"
                  >
                    Open AI Planner
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                icon: <Compass className="size-5" />,
                label: "Total Trips",
                value: trips.length.toString(),
              },
              {
                icon: <CalendarDays className="size-5" />,
                label: "Upcoming",
                value: upcomingTrips.length.toString(),
              },
              {
                icon: <MapPinned className="size-5" />,
                label: "Visible Stops",
                value: `${sortedTrips.reduce(
                  (sum, trip) => sum + trip.locations.length,
                  0
                )}`,
              },
            ].map((item) => (
              <Card
                key={item.label}
                className="rounded-[1.75rem] border-white/80 bg-white/80 shadow-lg shadow-sky-100/60"
              >
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="text-3xl font-semibold text-slate-950">
                      {item.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700">
              Your Recent Trips
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">
              Keep every route elegant and editable
            </h2>
          </div>
          {trips.length === 0 ? (
            <Card className="rounded-[2rem] border-dashed border-slate-200 bg-white/75 py-10 shadow-lg shadow-sky-100/60">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <div className="mb-5 rounded-full bg-sky-100 p-4 text-sky-700">
                  <Sparkles className="size-7" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-950">No trips yet</h3>
                <p className="mt-3 max-w-md text-slate-600">
                  Start planning your first escape, build the route, and turn scattered ideas into a proper travel flow.
                </p>
                <Link href="/trips/new" className="mt-6">
                  <Button className="rounded-full px-6">Create Trip</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {sortedTrips.slice(0, 6).map((trip) => {
                const isUpcoming = new Date(trip.startDate) >= today;
                return (
                  <Link key={trip.id} href={`/trips/${trip.id}`}>
                    <Card className="h-full rounded-[2rem] border-white/80 bg-white/80 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-100/70">
                      <CardHeader className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-600">
                            {isUpcoming ? "Upcoming" : "Past Trip"}
                          </span>
                          <span className="text-sm text-slate-500">
                            {trip.locations.length} stop{trip.locations.length === 1 ? "" : "s"}
                          </span>
                        </div>
                        <CardTitle className="line-clamp-2 text-2xl text-slate-950">
                          {trip.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="line-clamp-3 text-sm leading-7 text-slate-600">
                          {trip.description}
                        </p>
                        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                          {new Date(trip.startDate).toLocaleDateString()} -{" "}
                          {new Date(trip.endDate).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
