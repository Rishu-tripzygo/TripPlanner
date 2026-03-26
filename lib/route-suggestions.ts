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

export async function geocodeAddress(address: string, destinationContext?: string | null) {
  return geocodeAddressWithFallbacks(address, destinationContext);
}

function buildGeocodeCandidates(address: string, destinationContext?: string | null) {
  const base = address.trim();
  const candidates = new Set<string>();

  if (!base) {
    return [];
  }

  candidates.add(base);

  const normalizedDestination = destinationContext?.trim();

  for (const segment of base.split("/").map((value) => value.trim()).filter(Boolean)) {
    candidates.add(segment);
    if (normalizedDestination) {
      candidates.add(`${segment}, ${normalizedDestination}`);
    }
  }

  for (const segment of base.split(" - ").map((value) => value.trim()).filter(Boolean)) {
    candidates.add(segment);
    if (normalizedDestination) {
      candidates.add(`${segment}, ${normalizedDestination}`);
    }
  }

  const withoutParens = base.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
  if (withoutParens && withoutParens !== base) {
    candidates.add(withoutParens);
    if (normalizedDestination) {
      candidates.add(`${withoutParens}, ${normalizedDestination}`);
    }
  }

  if (base.includes("/")) {
    const slashParts = base.split("/").map((value) => value.trim()).filter(Boolean);
    if (slashParts.length >= 2) {
      candidates.add(`${slashParts[0]}, ${slashParts[1]}`);
      candidates.add(`${slashParts[1]}, ${slashParts[0]}`);
    }
  }

  const simplified = base
    .replace(/\bbackwaters\b/gi, "")
    .replace(/\blake\b/gi, "Lake")
    .replace(/\s+/g, " ")
    .replace(/\s*\/\s*/g, ", ")
    .trim()
    .replace(/,\s*,/g, ",");

  if (simplified && simplified !== base) {
    candidates.add(simplified);
    if (normalizedDestination) {
      candidates.add(`${simplified}, ${normalizedDestination}`);
    }
  }

  if (normalizedDestination) {
    candidates.add(`${base}, ${normalizedDestination}`);
  }

  return Array.from(candidates);
}

export async function geocodeAddressWithFallbacks(
  address: string,
  destinationContext?: string | null
) {
  const candidates = buildGeocodeCandidates(address, destinationContext);
  const errors: string[] = [];

  for (const candidate of candidates) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
        candidate
      )}`,
      {
        headers: {
          "User-Agent": "travel-planner-app/1.0",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      errors.push(`Unable to geocode ${candidate}.`);
      continue;
    }

    const data: Array<{ lat: string; lon: string }> = await response.json();
    const result = data[0];

    if (result) {
      return { lat: Number(result.lat), lng: Number(result.lon), matchedQuery: candidate };
    }
  }

  if (errors.length > 0) {
    throw new Error(`Address not found: ${address}`);
  }

  throw new Error(`Address not found: ${address}`);
}
