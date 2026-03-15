import { DestinationSeasonBadge, WeatherSnapshot } from "@/lib/phase-one-types";

const warmWeatherCodes = new Set([0, 1, 2]);
const rainyWeatherCodes = new Set([51, 53, 55, 61, 63, 65, 80, 81, 82]);

export function weatherCodeToSummary(code: number) {
  if (code === 0) return "Clear";
  if (code === 1 || code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (rainyWeatherCodes.has(code)) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 95) return "Storm";
  return "Mixed weather";
}

export function buildSeasonBadge(
  monthIndex: number,
  averageWeatherCode?: number
): DestinationSeasonBadge {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const shoulderMonths = [2, 3, 9, 10];
  const peakMonths = [4, 5, 10, 11];

  let label = "Good seasonal window";
  let confidenceScore = 72;
  let warning: string | undefined;

  if (peakMonths.includes(monthIndex)) {
    label = "Peak travel season";
    confidenceScore = 92;
  } else if (shoulderMonths.includes(monthIndex)) {
    label = "Shoulder season";
    confidenceScore = 82;
  }

  if (averageWeatherCode !== undefined && rainyWeatherCodes.has(averageWeatherCode)) {
    label = "Rain-prone window";
    confidenceScore = 58;
    warning = "Expect wetter conditions during these dates.";
  }

  return {
    label,
    confidenceScore,
    bestMonths: [
      monthNames[(monthIndex + 11) % 12],
      monthNames[monthIndex],
      monthNames[(monthIndex + 1) % 12],
    ],
    warning,
  };
}

export function buildWeatherSnapshot(
  date: string,
  temperatureMin: number,
  temperatureMax: number,
  weatherCode: number
): WeatherSnapshot {
  return {
    date,
    temperatureMin,
    temperatureMax,
    weatherCode,
    summary: weatherCodeToSummary(weatherCode),
  };
}

export function estimateTripWeatherContext(days: number, startDate?: string) {
  const anchor = startDate ? new Date(startDate) : new Date();
  const monthIndex = anchor.getMonth();
  const averageWeatherCode = warmWeatherCodes.has(monthIndex) ? 1 : 3;

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(anchor);
    date.setDate(anchor.getDate() + index);
    return buildWeatherSnapshot(
      date.toISOString(),
      18 + (index % 4),
      27 + (index % 5),
      averageWeatherCode
    );
  });
}
