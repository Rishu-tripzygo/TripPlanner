import { prisma } from "@/lib/prisma";

const REMINDER_STAGES = [
  {
    daysBefore: 30,
    type: "TRIP_REMINDER_30",
    title: "Start planning checklist",
    buildMessage: (tripTitle: string) =>
      `${tripTitle} starts in 30 days. Start locking in documents, bookings, and your packing list.`,
  },
  {
    daysBefore: 7,
    type: "TRIP_REMINDER_7",
    title: "Final preparations",
    buildMessage: (tripTitle: string) =>
      `${tripTitle} is only a week away. Double-check your itinerary, transport, and hotel confirmations.`,
  },
  {
    daysBefore: 1,
    type: "TRIP_REMINDER_1",
    title: "Trip starts tomorrow",
    buildMessage: (tripTitle: string) =>
      `${tripTitle} starts tomorrow. Keep tickets, essentials, and weather-friendly outfits ready.`,
  },
  {
    daysBefore: 0,
    type: "TRIP_REMINDER_0",
    title: "Bon voyage",
    buildMessage: (tripTitle: string) =>
      `Bon voyage. ${tripTitle} starts today. Have a smooth and memorable journey.`,
  },
] as const;

function startOfLocalDay(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function differenceInCalendarDays(left: Date, right: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((startOfLocalDay(left).getTime() - startOfLocalDay(right).getTime()) / msPerDay);
}

async function sendReminderEmail(input: {
  email: string;
  name?: string | null;
  subject: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.email],
        subject: input.subject,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
            <p>Hi ${input.name || "traveler"},</p>
            <p>${input.message}</p>
            <p>Open your planner to review the latest itinerary, documents, budget, and packing checklist.</p>
            <p>Safe travels,<br/>Voya</p>
          </div>
        `,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function syncTripReminderNotifications(userId: string) {
  const today = new Date();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      trips: {
        where: {
          endDate: {
            gte: startOfLocalDay(today),
          },
        },
        select: {
          id: true,
          title: true,
          startDate: true,
        },
      },
      notifications: {
        select: {
          id: true,
          type: true,
          tripId: true,
        },
      },
    },
  });

  if (!user) {
    return [];
  }

  const existingKeys = new Set(
    user.notifications.map((notification) => `${notification.tripId}:${notification.type}`)
  );

  const createdNotifications: Array<{
    tripId: string;
    type: string;
    message: string;
  }> = [];

  for (const trip of user.trips) {
    const daysUntilStart = differenceInCalendarDays(trip.startDate, today);

    for (const stage of REMINDER_STAGES) {
      if (daysUntilStart > stage.daysBefore) {
        continue;
      }

      const dedupeKey = `${trip.id}:${stage.type}`;
      if (existingKeys.has(dedupeKey)) {
        continue;
      }

      const message = stage.buildMessage(trip.title);

      await prisma.notification.create({
        data: {
          userId,
          tripId: trip.id,
          type: stage.type,
          message,
        },
      });

      existingKeys.add(dedupeKey);
      createdNotifications.push({
        tripId: trip.id,
        type: stage.type,
        message,
      });

      void sendReminderEmail({
        email: user.email,
        name: user.name,
        subject: `${stage.title} · ${trip.title}`,
        message,
      });
    }
  }

  return createdNotifications;
}

export async function getNotificationFeed(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });

  return {
    notifications,
    unreadCount,
  };
}
