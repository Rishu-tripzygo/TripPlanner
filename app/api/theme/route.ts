import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const themePreference = body?.themePreference;

  if (
    themePreference !== "SYSTEM" &&
    themePreference !== "LIGHT" &&
    themePreference !== "DARK"
  ) {
    return NextResponse.json(
      { error: "themePreference must be SYSTEM, LIGHT, or DARK." },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { themePreference },
    select: { themePreference: true },
  });

  return NextResponse.json(user);
}
