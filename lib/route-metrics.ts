import { Location } from "@/app/generated/prisma";

export type RoutePoint = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  kind: "origin" | "stop";
};

export type RouteSegment = {
  id: string;
  from: RoutePoint;
  to: RoutePoint;
  distanceKm: number;
};

export function toRoutePoints(args: {
  locations: Pick<Location, "id" | "locationTitle" | "lat" | "lng">[];
  origin?: { label: string; lat: number; lng: number } | null;
  returnToOrigin?: boolean;
}) {
  const stopPoints: RoutePoint[] = args.locations.map((location) => ({
    id: location.id,
    label: location.locationTitle,
    lat: location.lat,
    lng: location.lng,
    kind: "stop",
  }));

  const points: RoutePoint[] = [];

  if (args.origin) {
    points.push({
      id: "origin-start",
      label: args.origin.label,
      lat: args.origin.lat,
      lng: args.origin.lng,
      kind: "origin",
    });
  }

  points.push(...stopPoints);

  if (args.origin && args.returnToOrigin && stopPoints.length > 0) {
    points.push({
      id: "origin-end",
      label: args.origin.label,
      lat: args.origin.lat,
      lng: args.origin.lng,
      kind: "origin",
    });
  }

  return points;
}

export function haversineDistanceKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export function buildRouteSegments(args: {
  locations: Pick<Location, "id" | "locationTitle" | "lat" | "lng">[];
  origin?: { label: string; lat: number; lng: number } | null;
  returnToOrigin?: boolean;
}) {
  const points = toRoutePoints(args);
  const segments: RouteSegment[] = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    const from = points[index];
    const to = points[index + 1];
    segments.push({
      id: `${from.id}-${to.id}-${index}`,
      from,
      to,
      distanceKm: haversineDistanceKm(from, to),
    });
  }

  return segments;
}

export function getRouteSummary(args: {
  locations: Pick<Location, "id" | "locationTitle" | "lat" | "lng">[];
  origin?: { label: string; lat: number; lng: number } | null;
  returnToOrigin?: boolean;
}) {
  const segments = buildRouteSegments(args);
  const totalDistanceKm = segments.reduce((sum, segment) => sum + segment.distanceKm, 0);
  const longestSegmentKm = segments.reduce(
    (largest, segment) => Math.max(largest, segment.distanceKm),
    0
  );

  return {
    segments,
    totalDistanceKm,
    longestSegmentKm,
    averageSegmentKm: segments.length > 0 ? totalDistanceKm / segments.length : 0,
  };
}

export function formatDistanceKm(distanceKm: number) {
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  }

  return `${Math.round(distanceKm)} km`;
}
