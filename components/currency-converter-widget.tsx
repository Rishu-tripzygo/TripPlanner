"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CURRENCY_META, SUPPORTED_CURRENCIES, formatCurrency } from "@/lib/currency";
import { CurrencyConversionRecord, SupportedCurrency } from "@/lib/phase-one-types";

interface CurrencyConverterWidgetProps {
  destinations: string[];
  defaultFrom?: SupportedCurrency;
  suggestedAmount?: number;
  title?: string;
  compact?: boolean;
}

export default function CurrencyConverterWidget({
  destinations,
  defaultFrom = "INR",
  suggestedAmount = 10000,
  title = "Currency Converter",
  compact = false,
}: CurrencyConverterWidgetProps) {
  const [amount, setAmount] = useState(String(suggestedAmount || 1));
  const [from, setFrom] = useState<SupportedCurrency>(defaultFrom);
  const [to, setTo] = useState<SupportedCurrency>("USD");
  const [result, setResult] = useState<CurrencyConversionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const destinationLabel = useMemo(
    () => destinations.filter(Boolean).slice(0, 2).join(", "),
    [destinations]
  );

  useEffect(() => {
    let cancelled = false;

    async function runConversion() {
      const numericAmount = Number(amount || 0);

      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        setResult(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          amount: numericAmount.toString(),
          from,
          to,
        });

        for (const destination of destinations) {
          params.append("destination", destination);
        }

        const response = await fetch(`/api/currency?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to convert currency.");
        }

        if (!cancelled) {
          setResult(data);
          setTo(data.to);
        }
      } catch (conversionError) {
        if (!cancelled) {
          setError(
            conversionError instanceof Error
              ? conversionError.message
              : "Unable to convert currency."
          );
          setResult(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void runConversion();

    return () => {
      cancelled = true;
    };
  }, [amount, from, to, destinations]);

  function swapCurrencies() {
    setFrom(to);
    setTo(from);
  }

  return (
    <Card
      className={`border-[rgba(2,71,133,0.08)] bg-white/96 shadow-[0_16px_40px_rgba(26,28,27,0.05)] ${
        compact ? "gap-4" : ""
      }`}
    >
      <CardHeader className={compact ? "px-5 pt-5" : undefined}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-label">Currency</p>
            <CardTitle className="text-2xl text-[#024785]">{title}</CardTitle>
            <p className="mt-2 text-sm leading-7 text-[#61738C]">
              {destinationLabel
                ? `Auto-detecting the likely local currency for ${destinationLabel}.`
                : "Compare your trip budget with the likely local currency."}
            </p>
          </div>
          <div className="rounded-2xl border border-[rgba(2,71,133,0.08)] bg-[#EEF7FD] p-3 text-[#14518b]">
            <Coins className="size-5" />
          </div>
        </div>
      </CardHeader>

      <CardContent className={`space-y-5 ${compact ? "px-5 pb-5" : ""}`}>
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
          <label className="space-y-2">
            <span className="text-sm text-[#46617c]">From</span>
            <select
              value={from}
              onChange={(event) => setFrom(event.target.value as SupportedCurrency)}
              className="w-full rounded-[12px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] px-4 py-3 text-sm text-[#1A1C1B]"
            >
              {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency} value={currency} className="bg-white">
                  {currency} · {CURRENCY_META[currency].label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end justify-center">
            <Button type="button" variant="outline" size="icon" onClick={swapCurrencies}>
              <ArrowRightLeft className="size-4" />
            </Button>
          </div>

          <label className="space-y-2">
            <span className="text-sm text-[#46617c]">To</span>
            <select
              value={to}
              onChange={(event) => setTo(event.target.value as SupportedCurrency)}
              className="w-full rounded-[12px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] px-4 py-3 text-sm text-[#1A1C1B]"
            >
              {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency} value={currency} className="bg-white">
                  {currency} · {CURRENCY_META[currency].label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-sm text-[#46617c]">Amount</span>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            min="1"
            className="w-full rounded-[12px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] px-4 py-3 text-sm text-[#1A1C1B]"
          />
        </label>

        <div className="rounded-[18px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-5">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-32 animate-pulse rounded bg-[#E5EBF3]" />
              <div className="h-8 w-56 animate-pulse rounded bg-[#E5EBF3]" />
              <div className="h-4 w-40 animate-pulse rounded bg-[#E5EBF3]" />
            </div>
          ) : error ? (
            <p className="text-sm text-[#B42318]">{error}</p>
          ) : result ? (
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#14518b]/12 bg-[#EEF7FD] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#14518b]">
                <Sparkles className="size-3.5" />
                {result.source === "live"
                  ? "Live rate"
                  : result.source === "fallback"
                    ? "Fallback estimate"
                    : "Same currency"}
              </div>
              <div>
                <p className="text-sm text-[#61738C]">
                  {formatCurrency(result.amount, result.from)} is about
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#024785]">
                  {formatCurrency(result.convertedAmount, result.to)}
                </p>
              </div>
              <p className="text-sm text-[#61738C]">
                1 {result.from} = {result.rate.toFixed(3)} {result.to}
              </p>
            </div>
          ) : (
            <p className="text-sm text-[#61738C]">Enter an amount to see the local value.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
