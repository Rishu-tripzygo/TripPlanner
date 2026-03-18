"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CURRENCY_META,
  SUPPORTED_CURRENCIES,
  formatCurrency,
} from "@/lib/currency";
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
    <Card className={compact ? "gap-4" : undefined}>
      <CardHeader className={compact ? "px-5 pt-5" : undefined}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-label">Currency</p>
            <CardTitle className="text-2xl text-white">{title}</CardTitle>
            <p className="mt-2 text-sm leading-7 text-[#8B9BB4]">
              {destinationLabel
                ? `Auto-detecting the likely local currency for ${destinationLabel}.`
                : "Compare your trip budget with the likely local currency."}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[#00C2FF]">
            <Coins className="size-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className={`space-y-5 ${compact ? "px-5 pb-5" : ""}`}>
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
          <label className="space-y-2">
            <span className="text-sm text-[#D8E2F1]">From</span>
            <select
              value={from}
              onChange={(event) => setFrom(event.target.value as SupportedCurrency)}
              className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
            >
              {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency} value={currency} className="bg-[#0F1117]">
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
            <span className="text-sm text-[#D8E2F1]">To</span>
            <select
              value={to}
              onChange={(event) => setTo(event.target.value as SupportedCurrency)}
              className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
            >
              {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency} value={currency} className="bg-[#0F1117]">
                  {currency} · {CURRENCY_META[currency].label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-sm text-[#D8E2F1]">Amount</span>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            min="1"
            className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
          />
        </label>

        <div className="rounded-[18px] border border-white/8 bg-white/[0.03] p-5">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-32 animate-pulse rounded bg-white/[0.08]" />
              <div className="h-8 w-56 animate-pulse rounded bg-white/[0.08]" />
              <div className="h-4 w-40 animate-pulse rounded bg-white/[0.08]" />
            </div>
          ) : error ? (
            <p className="text-sm text-[#FFB4B4]">{error}</p>
          ) : result ? (
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#00C2FF]/20 bg-[#00C2FF]/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#D8E2F1]">
                <Sparkles className="size-3.5" />
                {result.source === "live"
                  ? "Live rate"
                  : result.source === "fallback"
                    ? "Fallback estimate"
                    : "Same currency"}
              </div>
              <div>
                <p className="text-sm text-[#8B9BB4]">
                  {formatCurrency(result.amount, result.from)} is about
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                  {formatCurrency(result.convertedAmount, result.to)}
                </p>
              </div>
              <p className="text-sm text-[#8B9BB4]">
                1 {result.from} = {result.rate.toFixed(3)} {result.to}
              </p>
            </div>
          ) : (
            <p className="text-sm text-[#8B9BB4]">Enter an amount to see the local value.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
