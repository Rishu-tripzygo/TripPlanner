import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await params;
  const target = await prisma.user.findFirst({
    where: { username },
    select: { id: true },
  });

  if (!target) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  if (target.id === session.user.id) {
    return NextResponse.json({ error: "You cannot follow yourself." }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: target.id,
      },
    },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: target.id,
      },
    });
  }

  const total = await prisma.follow.count({ where: { followingId: target.id } });
  return NextResponse.json({ following: !existing, total });
}
