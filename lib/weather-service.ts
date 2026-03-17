import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  DestinationForecast,
  DestinationSeasonBadge,
  WeatherSnapshot,
} from "@/lib/phase-one-types";
import {
  buildSeasonBadge,
  buildWeatherSnapshot,
  estimateTripWeatherContext,
  weatherCodeToSummary,
} from "@/lib/weather-utils";

const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast";
const CACHE_WINDOW_MS = 1000 * 60 * 60 * 6;
const MAX_FORECAST_DAYS = 7;

function toDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function buildTripAlert(
  seasonBadge: DestinationSeasonBadge,
  forecast: WeatherSnapshot[]
) {
  if (seasonBadge.warning) {
    return seasonBadge.warning;
  }

  if (forecast.some((day) => day.weatherCode >= 95)) {
    return "Storm risk is elevated around your selected dates.";
  }

  if (forecast.some((day) => day.temperatureMax >= 37)) {
    return "Expect very hot daytime conditions. Plan slower outdoor blocks.";
  }

  if (forecast.filter((day) => day.summary === "Rain").length >= 3) {
    return "Several rainy days are likely. Keep indoor alternatives ready.";
  }

  return undefined;
}

async function getCachedForecast(destinationName: string, dates: string[]) {
  const cachedRows = await prisma.weatherCache.findMany({
    where: {
      destination: destinationName,
      date: {
        in: dates.map((date) => new Date(`${date}T00:00:00.000Z`)),
      },
      cachedAt: {
        gte: new Date(Date.now() - CACHE_WINDOW_MS),
      },
    },
    orderBy: { date: "asc" },
  });

  if (cachedRows.length !== dates.length) {
    return null;
  }

  return cachedRows.map((row) => row.data as unknown as WeatherSnapshot);
}

async function persistForecast(destinationName: string, forecast: WeatherSnapshot[]) {
  await prisma.$transaction(
    forecast.map((day) =>
      prisma.weatherCache.upsert({
        where: {
          destination_date: {
            destination: destinationName,
            date: new Date(`${day.date}T00:00:00.000Z`),
          },
        },
        update: {
          data: day as unknown as Prisma.InputJsonValue,
          cachedAt: new Date(),
        },
        create: {
          destination: destinationName,
          date: new Date(`${day.date}T00:00:00.000Z`),
          data: day as unknown as Prisma.InputJsonValue,
        },
      })
    )
  );
}

async function fetchOpenMeteoForecast(
  destinationName: string,
  latitude: number,
  longitude: number,
  startDate: Date,
  endDate: Date
) {
  const dateRange = Array.from(
    { length: Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1) },
    (_, index) => {
      const nextDate = new Date(startDate);
      nextDate.setDate(startDate.getDate() + index);
      return toDateOnly(nextDate);
    }
  );

  const cached = await getCachedForecast(destinationName, dateRange);
  if (cached) {
    return cached;
  }

  const url = new URL(OPEN_METEO_BASE_URL);
  url.searchParams.set("latitude", latitude.toString());
  url.searchParams.set("longitude", longitude.toString());
  url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("start_date", toDateOnly(startDate));
  url.searchParams.set("end_date", toDateOnly(endDate));

  const response = await fetch(url.toString(), {
    next: { revalidate: 60 * 30 },
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed: ${await response.text()}`);
  }

  const data = await response.json();
  if (!data?.daily?.time) {
    throw new Error("Open-Meteo response did not include daily forecast data.");
  }

  const forecast = (data.daily.time as string[]).map((date, index) =>
    buildWeatherSnapshot(
      date,
      Number(data.daily.temperature_2m_min[index]),
      Number(data.daily.temperature_2m_max[index]),
      Number(data.daily.weather_code[index])
    )
  );

  await persistForecast(destinationName, forecast);
  return forecast;
}

export async function getTripDestinationForecasts(input: {
  tripStartDate: Date;
  tripEndDate: Date;
  locations: Array<{
    id: string;
    locationTitle: string;
    lat: number;
    lng: number;
  }>;
}): Promise<DestinationForecast[]> {
  const today = new Date();
  const windowStart = new Date(
    Math.max(
      new Date(toDateOnly(today)).getTime(),
      new Date(toDateOnly(input.tripStartDate)).getTime()
    )
  );
  const maxEnd = new Date(windowStart);
  maxEnd.setDate(windowStart.getDate() + (MAX_FORECAST_DAYS - 1));
  const windowEnd = new Date(
    Math.min(maxEnd.getTime(), new Date(toDateOnly(input.tripEndDate)).getTime())
  );

  return Promise.all(
    input.locations.map(async (location) => {
      let forecast: WeatherSnapshot[] = [];

      try {
        if (windowEnd >= windowStart) {
          forecast = await fetchOpenMeteoForecast(
            location.locationTitle,
            location.lat,
            location.lng,
            windowStart,
            windowEnd
          );
        }
      } catch {
        const fallbackStart = toDateOnly(windowStart);
        forecast = estimateTripWeatherContext(
          Math.max(1, Math.min(MAX_FORECAST_DAYS, input.locations.length || MAX_FORECAST_DAYS)),
          fallbackStart
        ).map((day) => ({
          ...day,
          summary: weatherCodeToSummary(day.weatherCode),
        }));
      }

      const anchorMonth =
        forecast[0] !== undefined
          ? new Date(`${forecast[0].date}T00:00:00.000Z`).getMonth()
          : input.tripStartDate.getMonth();
      const averageCode =
        forecast.length > 0
          ? Math.round(
              forecast.reduce((sum, day) => sum + day.weatherCode, 0) / forecast.length
            )
          : undefined;
      const bestTimeToVisit = buildSeasonBadge(anchorMonth, averageCode);

      return {
        destinationId: location.id,
        destinationName: location.locationTitle,
        latitude: location.lat,
        longitude: location.lng,
        forecast,
        bestTimeToVisit,
        alert: buildTripAlert(bestTimeToVisit, forecast),
      };
    })
  );
}
