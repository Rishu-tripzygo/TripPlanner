import { PersistedItinerary } from "@/lib/phase-one-types";

const PLACE_BLACKLIST = [
  "airport",
  "hotel",
  "restaurant",
  "cafe",
  "bistro",
  "dinner",
  "lunch",
  "breakfast",
  "bar",
  "spa",
  "market",
  "shopping district",
];

export function extractSuggestedStopsFromItinerary(
  itinerary?: PersistedItinerary | null
) {
  if (!itinerary) return [];

  const seen = new Set<string>();
  const suggestions: string[] = [];

  for (const day of itinerary.days) {
    for (const rawPlace of day.places || []) {
      const place = rawPlace.trim();
      if (!place) continue;

      const normalized = place.toLowerCase();
      if (PLACE_BLACKLIST.some((term) => normalized === term || normalized.includes(term))) {
        continue;
      }

      if (!seen.has(normalized)) {
        seen.add(normalized);
        suggestions.push(place);
      }
    }
  }

  return suggestions.slice(0, 10);
}

export async function geocodeAddress(address: string) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
      address
    )}`,
    {
      headers: {
        "User-Agent": "travel-planner-app/1.0",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Unable to geocode ${address}.`);
  }

  const data: Array<{ lat: string; lon: string }> = await response.json();
  const result = data[0];

  if (!result) {
    throw new Error(`Address not found: ${address}`);
  }

  return { lat: Number(result.lat), lng: Number(result.lon) };
}
