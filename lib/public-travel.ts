import { prisma } from "@/lib/prisma";
import { MemoryYearRecord, PublicProfileRecord, PublicTripCardRecord } from "@/lib/phase-one-types";

function getTripDestination(itineraryData: unknown, fallback?: string | null) {
  if (
    itineraryData &&
    typeof itineraryData === "object" &&
    "trip_summary" in itineraryData &&
    typeof itineraryData.trip_summary === "object" &&
    itineraryData.trip_summary !== null &&
    "destination" in itineraryData.trip_summary &&
    typeof itineraryData.trip_summary.destination === "string"
  ) {
    return itineraryData.trip_summary.destination;
  }

  return fallback || null;
}

function getTripSummaryValue(
  itineraryData: unknown,
  key: "travel_style" | "purpose"
) {
  const summary =
    itineraryData &&
    typeof itineraryData === "object" &&
    "trip_summary" in itineraryData &&
    typeof itineraryData.trip_summary === "object" &&
    itineraryData.trip_summary !== null
      ? (itineraryData.trip_summary as Record<string, unknown>)
      : null;

  if (summary && typeof summary[key] === "string") {
    return summary[key] as string;
  }

  return null;
}

export async function getPublicTripCards(
  viewerId?: string,
  search?: string
): Promise<PublicTripCardRecord[]> {
  const shares = await prisma.tripShare.findMany({
    where: {
      isPublic: true,
      trip: search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              {
                locations: {
                  some: {
                    locationTitle: { contains: search, mode: "insensitive" },
                  },
                },
              },
            ],
          }
        : undefined,
    },
    select: {
      id: true,
      tripId: true,
      token: true,
      updatedAt: true,
      _count: {
        select: {
          bookmarks: true,
          reactions: true,
        },
      },
      ...(viewerId
        ? {
            bookmarks: {
              where: { userId: viewerId },
              select: { id: true },
              take: 1,
            },
            reactions: {
              where: { userId: viewerId },
              select: { id: true },
              take: 1,
            },
          }
        : {}),
      trip: {
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          startDate: true,
          endDate: true,
          locations: {
            select: {
              locationTitle: true,
            },
          },
          itineraryVersions: {
            where: { isActive: true },
            take: 1,
            select: {
              itineraryData: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              location: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return shares.map((share) => {
    const itineraryData = share.trip.itineraryVersions[0]?.itineraryData;
    return {
      shareId: share.id,
      tripId: share.tripId,
      token: share.token,
      title: share.trip.title,
      description: share.trip.description,
      imageUrl: share.trip.imageUrl,
      startDate: share.trip.startDate.toISOString(),
      endDate: share.trip.endDate.toISOString(),
      destination: getTripDestination(
        itineraryData,
        share.trip.locations[0]?.locationTitle || null
      ),
      travelStyle: getTripSummaryValue(itineraryData, "travel_style"),
      purpose: getTripSummaryValue(itineraryData, "purpose"),
      stops: share.trip.locations.length,
      bookmarksCount: share._count.bookmarks,
      reactionsCount: share._count.reactions,
      author: {
        id: share.trip.user.id,
        name: share.trip.user.name || "Traveler",
        username: share.trip.user.username || share.trip.user.id,
        image: share.trip.user.image,
        location: share.trip.user.location,
      },
      isBookmarked: viewerId
        ? "bookmarks" in share && share.bookmarks.length > 0
        : false,
      hasReacted: viewerId
        ? "reactions" in share && share.reactions.length > 0
        : false,
    };
  });
}

export async function getPublicProfile(
  username: string,
  viewerId?: string
): Promise<PublicProfileRecord | null> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { id: username }],
      isPublicProfile: true,
    },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      location: true,
      image: true,
      coverImageUrl: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
      ...(viewerId
        ? {
            followers: {
              where: { followerId: viewerId },
              select: { id: true },
              take: 1,
            },
          }
        : {}),
      trips: {
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          startDate: true,
          endDate: true,
          locations: true,
          share: {
            select: {
              id: true,
              token: true,
              isPublic: true,
              _count: {
                select: {
                  bookmarks: true,
                  reactions: true,
                },
              },
              ...(viewerId
                ? {
                    bookmarks: {
                      where: { userId: viewerId },
                      select: { id: true },
                      take: 1,
                    },
                    reactions: {
                      where: { userId: viewerId },
                      select: { id: true },
                      take: 1,
                    },
                  }
                : {}),
            },
          },
          itineraryVersions: {
            where: { isActive: true },
            take: 1,
            select: {
              itineraryData: true,
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  const publicTrips = user.trips
    .filter((trip) => trip.share?.isPublic)
    .map((trip) => {
      const share = trip.share!;
      const itineraryData = trip.itineraryVersions[0]?.itineraryData;
      return {
        shareId: share.id,
        tripId: trip.id,
        token: share.token,
        title: trip.title,
        description: trip.description,
        imageUrl: trip.imageUrl,
        startDate: trip.startDate.toISOString(),
        endDate: trip.endDate.toISOString(),
        destination: getTripDestination(itineraryData, trip.locations[0]?.locationTitle || null),
        travelStyle: getTripSummaryValue(itineraryData, "travel_style"),
        purpose: getTripSummaryValue(itineraryData, "purpose"),
        stops: trip.locations.length,
        bookmarksCount: share._count.bookmarks,
        reactionsCount: share._count.reactions,
        author: {
          id: user.id,
          name: user.name || "Traveler",
          username: user.username || user.id,
          image: user.image,
          location: user.location,
        },
        isBookmarked: viewerId
          ? "bookmarks" in share && share.bookmarks.length > 0
          : false,
        hasReacted: viewerId
          ? "reactions" in share && share.reactions.length > 0
          : false,
      };
    })
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return {
    id: user.id,
    name: user.name || "Traveler",
    username: user.username || user.id,
    bio: user.bio,
    location: user.location,
    image: user.image,
    coverImageUrl: user.coverImageUrl,
    tripsShared: publicTrips.length,
    destinationsVisited: user.trips.reduce((sum, trip) => sum + trip.locations.length, 0),
    followersCount: user._count.followers,
    followingCount: user._count.following,
    isFollowing: viewerId
      ? "followers" in user && user.followers.length > 0
      : false,
    publicTrips,
  };
}

export async function getMemoriesByYear(userId: string): Promise<MemoryYearRecord[]> {
  const completedTrips = await prisma.trip.findMany({
    where: {
      userId,
      endDate: { lt: new Date() },
    },
    include: {
      locations: true,
      journalEntries: true,
    },
    orderBy: { startDate: "desc" },
  });

  const bucket = new Map<number, MemoryYearRecord>();

  for (const trip of completedTrips) {
    const year = trip.startDate.getFullYear();
    const current = bucket.get(year) || {
      year,
      trips: [],
      photoCount: 0,
      journalEntries: 0,
    };

    current.trips.push({
      id: trip.id,
      title: trip.title,
      imageUrl: trip.imageUrl,
      destination: trip.locations[0]?.locationTitle || null,
      monthLabel: trip.startDate.toLocaleString(undefined, { month: "short" }),
    });
    current.journalEntries += trip.journalEntries.length;
    current.photoCount += trip.journalEntries.reduce((sum, entry) => {
      return sum + (Array.isArray(entry.photos) ? entry.photos.length : 0);
    }, 0);

    bucket.set(year, current);
  }

  return Array.from(bucket.values()).sort((a, b) => b.year - a.year);
}
