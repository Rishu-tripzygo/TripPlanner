import { NextResponse } from "next/server";
import { convertCurrency } from "@/lib/currency";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const amount = Number(searchParams.get("amount") || "1");
  const from = searchParams.get("from") || "INR";
  const to = searchParams.get("to");
  const destinations = searchParams.getAll("destination");

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "A valid amount is required." }, { status: 400 });
  }

  const conversion = await convertCurrency({
    amount,
    from,
    to,
    destinations,
  });

  return NextResponse.json(conversion);
}
