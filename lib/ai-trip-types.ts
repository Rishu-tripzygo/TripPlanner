export const tripPurposeOptions = [
  "Vacation",
  "Honeymoon",
  "Adventure",
  "Family trip",
  "Business",
  "Solo escape",
  "Wellness retreat",
] as const;

export const travelStyleOptions = [
  "Luxury",
  "Mid-range",
  "Budget",
] as const;

export const hotelCategoryOptions = [
  "3-star",
  "4-star",
  "5-star",
  "Boutique",
  "Hostel",
] as const;

export const interestOptions = [
  "Food",
  "Culture",
  "Adventure",
  "Nature",
  "Shopping",
  "Nightlife",
  "Relaxation",
  "History",
  "Photography",
  "Wellness",
] as const;

export interface AITripPlannerRequest {
  destination: string;
  purpose: string;
  days: number;
  travelers: number;
  budgetRange?: string;
  travelStyle: string;
  interests: string[];
  hotelCategory: string;
  travelDates?: string;
}

export interface HotelRecommendation {
  name: string;
  price_range: string;
  description: string;
  recommendation_reason: string;
}

export interface DayPlan {
  day: number;
  title: string;
  morning: string[];
  afternoon: string[];
  evening: string[];
  places: string[];
  food_recommendations: string[];
  relaxation_suggestions: string[];
  travel_time_notes: string[];
  activity_alternatives: string[];
}

export interface AITripPlannerResponse {
  trip_overview: string;
  trip_summary: {
    destination: string;
    purpose: string;
    duration_days: number;
    travelers: number;
    budget_range: string;
    travel_style: string;
    ideal_area_to_stay: string;
    best_time_windows: string[];
  };
  hotel_recommendations: HotelRecommendation[];
  days: DayPlan[];
  local_foods: string[];
  must_visit_attractions: string[];
  hidden_gems: string[];
  transportation_suggestions: string[];
  travel_tips: string[];
}
