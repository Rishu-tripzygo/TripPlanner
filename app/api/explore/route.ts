import { auth } from "@/auth";
import { getPublicTripCards } from "@/lib/public-travel";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || undefined;

  const cards = await getPublicTripCards(session?.user?.id, q);
  return NextResponse.json(cards, {
    headers: session?.user?.id
      ? {
          "Cache-Control": "private, no-store",
        }
      : {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
  });
}
