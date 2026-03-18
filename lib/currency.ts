export const SUPPORTED_CURRENCIES = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AED",
  "SGD",
  "THB",
  "IDR",
  "TRY",
  "AUD",
  "CAD",
  "CHF",
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_META: Record<
  CurrencyCode,
  { label: string; symbol: string }
> = {
  INR: { label: "Indian Rupee", symbol: "₹" },
  USD: { label: "US Dollar", symbol: "$" },
  EUR: { label: "Euro", symbol: "€" },
  GBP: { label: "British Pound", symbol: "£" },
  JPY: { label: "Japanese Yen", symbol: "¥" },
  AED: { label: "UAE Dirham", symbol: "AED" },
  SGD: { label: "Singapore Dollar", symbol: "S$" },
  THB: { label: "Thai Baht", symbol: "฿" },
  IDR: { label: "Indonesian Rupiah", symbol: "Rp" },
  TRY: { label: "Turkish Lira", symbol: "₺" },
  AUD: { label: "Australian Dollar", symbol: "A$" },
  CAD: { label: "Canadian Dollar", symbol: "C$" },
  CHF: { label: "Swiss Franc", symbol: "CHF" },
};

const STATIC_USD_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  INR: 83.1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.4,
  AED: 3.67,
  SGD: 1.34,
  THB: 35.8,
  IDR: 15650,
  TRY: 32.1,
  AUD: 1.52,
  CAD: 1.35,
  CHF: 0.88,
};

const DESTINATION_CURRENCY_RULES: Array<{
  currency: CurrencyCode;
  keywords: string[];
}> = [
  { currency: "INR", keywords: ["india", "delhi", "mumbai", "goa", "jaipur", "agra", "kerala"] },
  { currency: "JPY", keywords: ["japan", "tokyo", "kyoto", "osaka", "sapporo", "hokkaido"] },
  { currency: "AED", keywords: ["dubai", "abu dhabi", "uae", "united arab emirates"] },
  { currency: "EUR", keywords: ["france", "paris", "italy", "rome", "spain", "barcelona", "germany", "berlin", "amsterdam", "netherlands", "greece", "athens"] },
  { currency: "GBP", keywords: ["london", "uk", "united kingdom", "england", "scotland", "edinburgh"] },
  { currency: "USD", keywords: ["usa", "united states", "new york", "los angeles", "california", "miami"] },
  { currency: "SGD", keywords: ["singapore"] },
  { currency: "THB", keywords: ["thailand", "bangkok", "phuket", "chiang mai", "krabi"] },
  { currency: "IDR", keywords: ["indonesia", "bali", "jakarta", "ubud"] },
  { currency: "TRY", keywords: ["turkey", "istanbul", "cappadocia", "antalya"] },
  { currency: "AUD", keywords: ["australia", "sydney", "melbourne", "brisbane", "perth"] },
  { currency: "CAD", keywords: ["canada", "toronto", "vancouver", "montreal"] },
  { currency: "CHF", keywords: ["switzerland", "zurich", "lucerne", "interlaken", "geneva"] },
];

function normalizeCurrency(value: string | null | undefined): CurrencyCode | null {
  if (!value) return null;

  const code = value.toUpperCase();
  return SUPPORTED_CURRENCIES.includes(code as CurrencyCode) ? (code as CurrencyCode) : null;
}

export function inferCurrencyFromDestinations(
  destinations: string[],
  fallback: CurrencyCode = "USD"
): CurrencyCode {
  const joined = destinations.join(" ").toLowerCase();

  for (const rule of DESTINATION_CURRENCY_RULES) {
    if (rule.keywords.some((keyword) => joined.includes(keyword))) {
      return rule.currency;
    }
  }

  return fallback;
}

export function formatCurrency(amount: number, currency: CurrencyCode) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "JPY" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${CURRENCY_META[currency]?.symbol || currency} ${amount.toFixed(2)}`;
  }
}

function convertUsingStaticRates(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
) {
  const inUsd = amount / STATIC_USD_RATES[from];
  const convertedAmount = inUsd * STATIC_USD_RATES[to];
  const rate = STATIC_USD_RATES[to] / STATIC_USD_RATES[from];

  return { convertedAmount, rate };
}

export async function convertCurrency(input: {
  amount: number;
  from: string;
  to?: string | null;
  destinations?: string[];
}) {
  const from = normalizeCurrency(input.from) || "INR";
  const to =
    normalizeCurrency(input.to) ||
    inferCurrencyFromDestinations(input.destinations || [], from);

  if (from === to) {
    return {
      from,
      to,
      amount: input.amount,
      convertedAmount: input.amount,
      rate: 1,
      source: "same-currency" as const,
    };
  }

  try {
    const url = new URL("https://api.frankfurter.app/latest");
    url.searchParams.set("amount", input.amount.toString());
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);

    const response = await fetch(url.toString(), {
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) {
      throw new Error(`Frankfurter request failed: ${await response.text()}`);
    }

    const data = await response.json();
    const convertedAmount = Number(data?.rates?.[to]);

    if (!Number.isFinite(convertedAmount)) {
      throw new Error("Frankfurter response did not include a valid converted amount.");
    }

    return {
      from,
      to,
      amount: input.amount,
      convertedAmount,
      rate: convertedAmount / input.amount,
      source: "live" as const,
    };
  } catch {
    const fallback = convertUsingStaticRates(input.amount, from, to);

    return {
      from,
      to,
      amount: input.amount,
      convertedAmount: fallback.convertedAmount,
      rate: fallback.rate,
      source: "fallback" as const,
    };
  }
}
