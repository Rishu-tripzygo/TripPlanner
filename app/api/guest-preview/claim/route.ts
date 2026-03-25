import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  claimGuestPreviewToUser,
  getGuestSessionToken,
} from "@/lib/guest-preview";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionToken = await getGuestSessionToken();
  if (!sessionToken) {
    return NextResponse.json({ claimed: false });
  }

  const trip = await claimGuestPreviewToUser(sessionToken, session.user.id);

  const response = NextResponse.json({
    claimed: Boolean(trip),
    tripId: trip?.id ?? null,
  });

  if (trip) {
    response.cookies.delete("wandrly_guest_session");
  }

  return response;
}
