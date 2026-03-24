import { AITripPlannerRequest, AITripPlannerResponse } from "@/lib/ai-trip-types";
import {
  ItineraryCostEstimate,
  ItineraryVersionRecord,
  PersistedItinerary,
} from "@/lib/phase-one-types";
import {
  buildSeasonBadge,
  estimateTripWeatherContext,
  parseTravelDateRange,
} from "@/lib/weather-utils";

export function estimateDayCost(
  request: AITripPlannerRequest,
  dayIndex: number
): ItineraryCostEstimate {
  const dailyBase =
    request.travelStyle === "Luxury"
      ? 13500
      : request.travelStyle === "Budget"
        ? 4800
        : 8200;

  const accommodation = Math.round(dailyBase * 0.35);
  const food = Math.round(dailyBase * 0.2);
  const transport = Math.round(dailyBase * 0.15);
  const activities = Math.round(dailyBase * 0.22);
  const misc = Math.round(dailyBase * 0.08 + dayIndex * 150);
  const total = accommodation + food + transport + activities + misc;

  return {
    accommodation,
    food,
    transport,
    activities,
    misc,
    total,
    currency: "INR",
  };
}

export function normalizeItineraryForStorage(
  itinerary: AITripPlannerResponse,
  request: AITripPlannerRequest
): PersistedItinerary {
  const weather = estimateTripWeatherContext(request.days, request.travelDates);

  const days = itinerary.days.map((day, index) => ({
    ...day,
    dateLabel: weather[index]?.date,
    weather: weather[index],
    destinationSeason: buildSeasonBadge(
      new Date(weather[index]?.date || new Date().toISOString()).getMonth(),
      weather[index]?.weatherCode
    ),
    estimatedCost: estimateDayCost(request, index),
  }));

  const total_estimated_cost = days.reduce(
    (sum, day) => {
      if (!day.estimatedCost) return sum;

      return {
        ...sum,
        accommodation: sum.accommodation + day.estimatedCost.accommodation,
        food: sum.food + day.estimatedCost.food,
        transport: sum.transport + day.estimatedCost.transport,
        activities: sum.activities + day.estimatedCost.activities,
        misc: sum.misc + day.estimatedCost.misc,
        total: sum.total + day.estimatedCost.total,
      };
    },
    {
      accommodation: 0,
      food: 0,
      transport: 0,
      activities: 0,
      misc: 0,
      total: 0,
      currency: "INR" as const,
    }
  );

  return {
    ...itinerary,
    days,
    total_estimated_cost,
    generated_for_month: weather[0]?.date,
  };
}

export function serializeVersionRecord(record: {
  id: string;
  tripId: string;
  versionNumber: number;
  sourceProvider: string;
  sourcePrompt: string | null;
  title: string | null;
  isActive: boolean;
  createdAt: Date;
  itineraryData: unknown;
}): ItineraryVersionRecord {
  return {
    id: record.id,
    tripId: record.tripId,
    versionNumber: record.versionNumber,
    sourceProvider: record.sourceProvider,
    sourcePrompt: record.sourcePrompt,
    title: record.title,
    isActive: record.isActive,
    createdAt: record.createdAt.toISOString(),
    itineraryData: record.itineraryData as PersistedItinerary,
  };
}

export function buildTripSeedFromPlanner(
  request: AITripPlannerRequest,
  itinerary: PersistedItinerary
) {
  const { start, end } = parseTravelDateRange(request.travelDates, request.days);
  const titleBase = itinerary.trip_summary.destination || request.destination;
  const purposeLabel = request.purpose.toLowerCase();
  const title =
    request.purpose === "Honeymoon"
      ? `${titleBase} Honeymoon`
      : request.purpose === "Business"
        ? `${titleBase} Business Trip`
        : `${titleBase} ${purposeLabel === "vacation" ? "Escape" : "Trip"}`;

  return {
    title,
    description:
      itinerary.trip_overview ||
      `A ${request.travelStyle.toLowerCase()} ${request.purpose.toLowerCase()} planned for ${request.destination}.`,
    imageUrl: null as string | null,
    startDate: start,
    endDate: end,
  };
}
