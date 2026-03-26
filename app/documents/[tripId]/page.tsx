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
    return (
      <div className="landing-shell px-4 py-20 sm:px-5 lg:px-6">
        <div className="rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,243,237,0.88))] px-6 py-10 text-[#61738C] shadow-[0_20px_44px_rgba(26,28,27,0.07)]">
          Please sign in.
        </div>
      </div>
    );
  }

  const access = await getTripAccess(tripId, session.user.id);

  if (!access) {
    return (
      <div className="landing-shell px-4 py-20 sm:px-5 lg:px-6">
        <div className="rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,243,237,0.88))] px-6 py-10 text-[#61738C] shadow-[0_20px_44px_rgba(26,28,27,0.07)]">
          Trip not found.
        </div>
      </div>
    );
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
    return (
      <div className="landing-shell px-4 py-20 sm:px-5 lg:px-6">
        <div className="rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,243,237,0.88))] px-6 py-10 text-[#61738C] shadow-[0_20px_44px_rgba(26,28,27,0.07)]">
          Trip not found.
        </div>
      </div>
    );
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
