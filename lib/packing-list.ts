import { PackingItem, PersistedItinerary, WeatherSnapshot } from "@/lib/phase-one-types";

function createItem(
  label: string,
  category: PackingItem["category"],
  quantity = 1,
  options?: Partial<PackingItem>
): PackingItem {
  return {
    id: `${category}-${label}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    label,
    category,
    packed: false,
    quantity,
    essential: true,
    aiSuggested: true,
    sharedItem: false,
    ...options,
  };
}

function hasKeyword(itinerary: PersistedItinerary | null | undefined, keywords: string[]) {
  if (!itinerary) return false;

  const haystack = JSON.stringify(itinerary).toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

function getTemperatureHints(itinerary: PersistedItinerary | null | undefined) {
  const weather: WeatherSnapshot[] =
    itinerary?.days.flatMap((day) => (day.weather ? [day.weather] : [])) || [];

  return {
    hot: weather.some((day) => day.temperatureMax >= 32),
    cool: weather.some((day) => day.temperatureMin <= 15),
    rainy: weather.some((day) => /rain|storm/i.test(day.summary)),
  };
}

export function generatePackingItems(input: {
  tripTitle: string;
  startDate: string;
  endDate: string;
  destinationNames: string[];
  itinerary?: PersistedItinerary | null;
}): PackingItem[] {
  const days = Math.max(
    1,
    Math.ceil(
      (new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) / 86400000
    ) + 1
  );
  const weatherHints = getTemperatureHints(input.itinerary);
  const activeDestinations = input.destinationNames.join(", ");

  const items: PackingItem[] = [
    createItem("Passport / government ID", "Documents", 1, { estimatedWeightGrams: 50 }),
    createItem("Flight and hotel confirmations", "Documents", 1, {
      estimatedWeightGrams: 20,
    }),
    createItem("Wallet and cards", "Documents", 1, { estimatedWeightGrams: 120 }),
    createItem("Phone charger", "Tech", 1, { estimatedWeightGrams: 120 }),
    createItem("Power bank", "Tech", 1, { essential: false, estimatedWeightGrams: 220 }),
    createItem("Toothbrush and toothpaste", "Toiletries", 1, {
      estimatedWeightGrams: 180,
    }),
    createItem("Personal medications", "Medications", 1, {
      estimatedWeightGrams: 80,
    }),
    createItem("T-shirts / tops", "Clothing", Math.min(7, days), {
      estimatedWeightGrams: 180,
    }),
    createItem("Bottoms / trousers", "Clothing", Math.max(2, Math.ceil(days / 2)), {
      estimatedWeightGrams: 350,
    }),
    createItem("Sleepwear", "Clothing", 1, { essential: false, estimatedWeightGrams: 180 }),
    createItem("Undergarments", "Clothing", Math.min(8, days + 1), {
      estimatedWeightGrams: 60,
    }),
    createItem("Socks", "Clothing", Math.min(8, days + 1), { estimatedWeightGrams: 40 }),
  ];

  if (days >= 5) {
    items.push(createItem("Laundry pouch", "Misc", 1, { essential: false, estimatedWeightGrams: 80 }));
    items.push(
      createItem("Extra casual outfit", "Clothing", 1, {
        essential: false,
        estimatedWeightGrams: 350,
      })
    );
  }

  if (weatherHints.hot) {
    items.push(createItem("Sunscreen", "Toiletries", 1, { estimatedWeightGrams: 120 }));
    items.push(createItem("Sunglasses", "Misc", 1, { essential: false, estimatedWeightGrams: 60 }));
    items.push(createItem("Cap / sun hat", "Clothing", 1, { essential: false, estimatedWeightGrams: 90 }));
  }

  if (weatherHints.cool) {
    items.push(createItem("Light jacket", "Clothing", 1, { estimatedWeightGrams: 500 }));
    items.push(createItem("Layering sweater", "Clothing", 1, { essential: false, estimatedWeightGrams: 420 }));
  }

  if (weatherHints.rainy) {
    items.push(createItem("Compact umbrella", "Misc", 1, { essential: false, estimatedWeightGrams: 280 }));
    items.push(createItem("Water-resistant footwear", "Clothing", 1, { essential: false, estimatedWeightGrams: 850 }));
  }

  if (hasKeyword(input.itinerary, ["beach", "island", "pool", "snorkel"])) {
    items.push(createItem("Swimwear", "Clothing", 1, { essential: false, estimatedWeightGrams: 140 }));
    items.push(createItem("Flip-flops", "Clothing", 1, { essential: false, estimatedWeightGrams: 300 }));
    items.push(createItem("Beach tote", "Misc", 1, { essential: false, estimatedWeightGrams: 180 }));
  }

  if (hasKeyword(input.itinerary, ["hike", "trek", "nature trail", "mountain"])) {
    items.push(createItem("Hiking shoes", "Clothing", 1, { essential: false, estimatedWeightGrams: 900 }));
    items.push(createItem("Day backpack", "Misc", 1, { essential: false, estimatedWeightGrams: 350 }));
    items.push(createItem("Reusable water bottle", "Misc", 1, { essential: false, sharedItem: true, estimatedWeightGrams: 250 }));
  }

  if (hasKeyword(input.itinerary, ["business", "meeting", "conference"])) {
    items.push(createItem("Formal outfit", "Clothing", 2, { estimatedWeightGrams: 550 }));
    items.push(createItem("Laptop", "Tech", 1, { essential: false, estimatedWeightGrams: 1400 }));
    items.push(createItem("Notebook and pen", "Misc", 1, { essential: false, estimatedWeightGrams: 240 }));
  }

  if (hasKeyword(input.itinerary, ["restaurant", "fine dining", "nightlife"])) {
    items.push(createItem("Evening outfit", "Clothing", 1, { essential: false, estimatedWeightGrams: 400 }));
  }

  if (activeDestinations) {
    items.push(
      createItem(`Local transport info for ${activeDestinations}`, "Documents", 1, {
        essential: false,
        aiSuggested: true,
        estimatedWeightGrams: 10,
      })
    );
  }

  const deduped = new Map<string, PackingItem>();
  for (const item of items) {
    if (!deduped.has(item.id)) {
      deduped.set(item.id, item);
    }
  }

  return Array.from(deduped.values());
}
