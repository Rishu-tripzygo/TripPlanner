import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SearchResultRecord } from "@/lib/phase-one-types";
import { getPublicTripCards } from "@/lib/public-travel";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json([] satisfies SearchResultRecord[]);
  }

  const results: SearchResultRecord[] = [];

  if (session?.user?.id) {
    const [trips, notes, journals] = await Promise.all([
      prisma.trip.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            {
              locations: {
                some: { locationTitle: { contains: query, mode: "insensitive" } },
              },
            },
          ],
        },
        take: 5,
      }),
      prisma.note.findMany({
        where: {
          location: { trip: { userId: session.user.id } },
          content: { contains: query, mode: "insensitive" },
        },
        include: {
          location: true,
        },
        take: 4,
      }),
      prisma.journalEntry.findMany({
        where: {
          trip: { userId: session.user.id },
          content: { contains: query, mode: "insensitive" },
        },
        include: { trip: true },
        take: 4,
      }),
    ]);

    results.push(
      ...trips.map((trip) => ({
        id: trip.id,
        title: trip.title,
        subtitle: trip.description,
        href: `/trips/${trip.id}`,
        category: "trip" as const,
      })),
      ...notes.map((note) => ({
        id: note.id,
        title: note.location.locationTitle,
        subtitle: note.content.slice(0, 90),
        href: `/trips/${note.location.tripId}`,
        category: "note" as const,
      })),
      ...journals.map((entry) => ({
        id: entry.id,
        title: `${entry.trip.title} · Day ${entry.day}`,
        subtitle: entry.content.slice(0, 90),
        href: `/journal/${entry.tripId}`,
        category: "journal" as const,
      }))
    );
  }

  const publicTrips = await getPublicTripCards(session?.user?.id, query);
  results.push(
    ...publicTrips.slice(0, 4).map((trip) => ({
      id: trip.shareId,
      title: trip.title,
      subtitle: `${trip.destination || "Public trip"} · ${trip.author.name}`,
      href: `/shared/${trip.token}`,
      category: "public-trip" as const,
    }))
  );

  return NextResponse.json(results.slice(0, 12));
}
