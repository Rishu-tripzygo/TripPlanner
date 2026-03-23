import { auth } from "@/auth";
import AssistantPanel from "@/components/assistant-panel";
import { prisma } from "@/lib/prisma";

export default async function AssistantPage() {
  const session = await auth();

  const trips = session?.user?.id
    ? await prisma.trip.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
        },
      })
    : [];

  return <AssistantPanel trips={trips} />;
}
