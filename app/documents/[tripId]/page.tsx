import { auth } from "@/auth";
import DocumentVault from "@/components/document-vault";
import { prisma } from "@/lib/prisma";
import { getTripAccess } from "@/lib/trip-access";
import { DocumentRecord } from "@/lib/phase-one-types";

export default async function DocumentVaultPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const session = await auth();
  const { tripId } = await params;

  if (!session?.user?.id) {
    return <div className="app-shell px-4 py-20 text-white">Please sign in.</div>;
  }

  const access = await getTripAccess(tripId, session.user.id);

  if (!access) {
    return <div className="app-shell px-4 py-20 text-white">Trip not found.</div>;
  }

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
    },
    include: {
      documents: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!trip) {
    return <div className="app-shell px-4 py-20 text-white">Trip not found.</div>;
  }

  const initialDocuments: DocumentRecord[] = trip.documents.map((document) => ({
    id: document.id,
    tripId: document.tripId,
    name: document.name,
    type: document.type,
    url: document.url,
    expiryDate: document.expiryDate?.toISOString() || null,
    createdAt: document.createdAt.toISOString(),
  }));

  return (
    <DocumentVault
      tripId={trip.id}
      tripTitle={trip.title}
      tripStartDate={trip.startDate.toISOString()}
      initialDocuments={initialDocuments}
    />
  );
}
