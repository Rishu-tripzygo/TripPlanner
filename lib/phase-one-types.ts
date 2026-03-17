import { AITripPlannerResponse } from "@/lib/ai-trip-types";

export type SupportedCurrency = "INR" | "USD" | "EUR" | "GBP" | "JPY";

export type ThemePreference = "SYSTEM" | "LIGHT" | "DARK";

export type ExpenseCategory =
  | "ACCOMMODATION"
  | "FOOD"
  | "TRANSPORT"
  | "ACTIVITIES"
  | "MISC";

export type ChatRole = "USER" | "ASSISTANT" | "SYSTEM";

export interface ItineraryCostEstimate {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  misc: number;
  total: number;
  currency: SupportedCurrency;
}

export interface DestinationSeasonBadge {
  label: string;
  confidenceScore: number;
  bestMonths: string[];
  warning?: string;
}

export interface WeatherSnapshot {
  date: string;
  temperatureMin: number;
  temperatureMax: number;
  weatherCode: number;
  summary: string;
}

export interface DestinationForecast {
  destinationId: string;
  destinationName: string;
  latitude: number;
  longitude: number;
  forecast: WeatherSnapshot[];
  bestTimeToVisit: DestinationSeasonBadge;
  alert?: string;
}

export type BaseDayPlan = AITripPlannerResponse["days"][number];

export interface EditableDayPlan extends BaseDayPlan {
  dateLabel?: string;
  destinationSeason?: DestinationSeasonBadge;
  estimatedCost?: ItineraryCostEstimate;
  weather?: WeatherSnapshot;
}

export interface PersistedItinerary extends Omit<AITripPlannerResponse, "days"> {
  days: EditableDayPlan[];
  total_estimated_cost?: ItineraryCostEstimate;
  generated_for_month?: string;
}

export interface ItineraryVersionRecord {
  id: string;
  tripId: string;
  versionNumber: number;
  sourceProvider: string;
  sourcePrompt?: string | null;
  title?: string | null;
  isActive: boolean;
  createdAt: string;
  itineraryData: PersistedItinerary;
}

export interface BudgetBreakdown {
  totalBudget: number;
  currency: SupportedCurrency;
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  misc: number;
}

export interface ExpenseRecord {
  id: string;
  tripId: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
  notes?: string | null;
}

export interface PackingItem {
  id: string;
  label: string;
  category: "Clothing" | "Documents" | "Tech" | "Toiletries" | "Medications" | "Misc";
  packed: boolean;
  quantity?: number;
}

export interface PackingListRecord {
  id: string;
  tripId: string;
  template?: string | null;
  items: PackingItem[];
}

export interface RefinementMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  itineraryVersionId?: string | null;
}

export interface TripShareRecord {
  id: string;
  tripId: string;
  token: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord {
  id: string;
  tripId: string;
  name: string;
  type: string;
  url: string;
  expiryDate?: string | null;
  createdAt: string;
}

export interface NoteRecord {
  id: string;
  locationId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryRecord {
  id: string;
  tripId: string;
  day: number;
  content: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}
