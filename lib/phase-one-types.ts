import { AITripPlannerResponse } from "@/lib/ai-trip-types";
import { CurrencyCode } from "@/lib/currency";

export type SupportedCurrency = CurrencyCode;

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

export interface CurrencyConversionRecord {
  from: CurrencyCode;
  to: CurrencyCode;
  amount: number;
  convertedAmount: number;
  rate: number;
  source: "live" | "fallback" | "same-currency";
}

export interface NotificationRecord {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  tripId?: string | null;
  createdAt: string;
}

export interface PublicTripCardRecord {
  shareId: string;
  tripId: string;
  token: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  startDate: string;
  endDate: string;
  destination?: string | null;
  travelStyle?: string | null;
  purpose?: string | null;
  stops: number;
  bookmarksCount: number;
  reactionsCount: number;
  author: {
    id: string;
    name: string;
    username: string;
    image?: string | null;
    location?: string | null;
  };
  isBookmarked?: boolean;
  hasReacted?: boolean;
}

export interface PublicProfileRecord {
  id: string;
  name: string;
  username: string;
  bio?: string | null;
  location?: string | null;
  image?: string | null;
  coverImageUrl?: string | null;
  tripsShared: number;
  destinationsVisited: number;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  publicTrips: PublicTripCardRecord[];
}

export interface SearchResultRecord {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  category: "trip" | "destination" | "journal" | "note" | "public-trip";
}

export interface AssistantMessageRecord {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface MemoryYearRecord {
  year: number;
  trips: Array<{
    id: string;
    title: string;
    imageUrl?: string | null;
    destination?: string | null;
    monthLabel: string;
  }>;
  photoCount: number;
  journalEntries: number;
}
