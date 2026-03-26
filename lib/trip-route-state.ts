import { PersistedItinerary } from "@/lib/phase-one-types";
import { extractSuggestedStopsFromItinerary } from "@/lib/route-suggestions";

export type TripRouteStatus = "NOT_STARTED" | "SUGGESTED" | "CONFIRMED" | "STALE";

export function buildRouteStateForActiveVersion(args: {
  itinerary?: PersistedItinerary | null;
  activeVersionId?: string | null;
  confirmedLocationCount: number;
  currentRouteSourceVersionId?: string | null;
}) {
  const suggestions = extractSuggestedStopsFromItinerary(args.itinerary);
  const now = new Date();

  if (!args.itinerary || suggestions.length === 0) {
    return {
      routeStatus: (args.confirmedLocationCount > 0
        ? "CONFIRMED"
        : "NOT_STARTED") as TripRouteStatus,
      routeSourceVersionId:
        args.confirmedLocationCount > 0
          ? args.currentRouteSourceVersionId || args.activeVersionId || null
          : null,
      routeUpdatedAt: now,
    };
  }

  if (args.confirmedLocationCount === 0) {
    return {
      routeStatus: "SUGGESTED" as TripRouteStatus,
      routeSourceVersionId: args.activeVersionId || null,
      routeUpdatedAt: now,
    };
  }

  if (
    args.currentRouteSourceVersionId &&
    args.activeVersionId &&
    args.currentRouteSourceVersionId === args.activeVersionId
  ) {
    return {
      routeStatus: "CONFIRMED" as TripRouteStatus,
      routeSourceVersionId: args.currentRouteSourceVersionId,
      routeUpdatedAt: now,
    };
  }

  return {
    routeStatus: "STALE" as TripRouteStatus,
    routeSourceVersionId: args.currentRouteSourceVersionId || null,
    routeUpdatedAt: now,
  };
}

export function buildRouteStateAfterConfirmation(activeVersionId?: string | null) {
  return {
    routeStatus: "CONFIRMED" as TripRouteStatus,
    routeSourceVersionId: activeVersionId || null,
    routeUpdatedAt: new Date(),
  };
}
