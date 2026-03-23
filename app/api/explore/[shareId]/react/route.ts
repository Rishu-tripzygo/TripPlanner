import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { shareId } = await params;
  const existing = await prisma.tripReaction.findUnique({
    where: {
      userId_tripShareId: {
        userId: session.user.id,
        tripShareId: shareId,
      },
    },
  });

  if (existing) {
    await prisma.tripReaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.tripReaction.create({
      data: {
        userId: session.user.id,
        tripShareId: shareId,
      },
    });
  }

  const total = await prisma.tripReaction.count({ where: { tripShareId: shareId } });
  return NextResponse.json({ reacted: !existing, total });
}
