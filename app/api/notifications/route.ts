import { auth } from "@/auth";
import { getNotificationFeed, syncTripReminderNotifications } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await syncTripReminderNotifications(session.user.id);
  const feed = await getNotificationFeed(session.user.id);

  return NextResponse.json(feed);
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const markAll = Boolean(body.markAll);
  const notificationId =
    typeof body.notificationId === "string" ? body.notificationId : null;

  if (markAll) {
    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: { read: true },
    });
  } else if (notificationId) {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
      data: { read: true },
    });
  } else {
    return NextResponse.json(
      { error: "Provide notificationId or markAll." },
      { status: 400 }
    );
  }

  const feed = await getNotificationFeed(session.user.id);
  return NextResponse.json(feed);
}
