import { PackingItem, PersistedItinerary, WeatherSnapshot } from "@/lib/phase-one-types";

function createItem(
  label: string,
  category: PackingItem["category"],
  quantity = 1
): PackingItem {
  return {
    id: `${category}-${label}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    label,
    category,
    packed: false,
    quantity,
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
    createItem("Passport / government ID", "Documents"),
    createItem("Flight and hotel confirmations", "Documents"),
    createItem("Wallet and cards", "Documents"),
    createItem("Phone charger", "Tech"),
    createItem("Power bank", "Tech"),
    createItem("Toothbrush and toothpaste", "Toiletries"),
    createItem("Personal medications", "Medications"),
    createItem("T-shirts / tops", "Clothing", Math.min(7, days)),
    createItem("Bottoms / trousers", "Clothing", Math.max(2, Math.ceil(days / 2))),
    createItem("Sleepwear", "Clothing", 1),
    createItem("Undergarments", "Clothing", Math.min(8, days + 1)),
    createItem("Socks", "Clothing", Math.min(8, days + 1)),
  ];

  if (days >= 5) {
    items.push(createItem("Laundry pouch", "Misc"));
    items.push(createItem("Extra casual outfit", "Clothing", 1));
  }

  if (weatherHints.hot) {
    items.push(createItem("Sunscreen", "Toiletries"));
    items.push(createItem("Sunglasses", "Misc"));
    items.push(createItem("Cap / sun hat", "Clothing"));
  }

  if (weatherHints.cool) {
    items.push(createItem("Light jacket", "Clothing"));
    items.push(createItem("Layering sweater", "Clothing"));
  }

  if (weatherHints.rainy) {
    items.push(createItem("Compact umbrella", "Misc"));
    items.push(createItem("Water-resistant footwear", "Clothing"));
  }

  if (hasKeyword(input.itinerary, ["beach", "island", "pool", "snorkel"])) {
    items.push(createItem("Swimwear", "Clothing"));
    items.push(createItem("Flip-flops", "Clothing"));
    items.push(createItem("Beach tote", "Misc"));
  }

  if (hasKeyword(input.itinerary, ["hike", "trek", "nature trail", "mountain"])) {
    items.push(createItem("Hiking shoes", "Clothing"));
    items.push(createItem("Day backpack", "Misc"));
    items.push(createItem("Reusable water bottle", "Misc"));
  }

  if (hasKeyword(input.itinerary, ["business", "meeting", "conference"])) {
    items.push(createItem("Formal outfit", "Clothing", 2));
    items.push(createItem("Laptop", "Tech"));
    items.push(createItem("Notebook and pen", "Misc"));
  }

  if (hasKeyword(input.itinerary, ["restaurant", "fine dining", "nightlife"])) {
    items.push(createItem("Evening outfit", "Clothing"));
  }

  if (activeDestinations) {
    items.push(createItem(`Local transport info for ${activeDestinations}`, "Documents"));
  }

  const deduped = new Map<string, PackingItem>();
  for (const item of items) {
    if (!deduped.has(item.id)) {
      deduped.set(item.id, item);
    }
  }

  return Array.from(deduped.values());
}
