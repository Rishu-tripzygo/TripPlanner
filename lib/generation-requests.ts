import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { AIProviderAttempt } from "@/lib/ai-trip-service";

type RequestStatus =
  | "QUEUED"
  | "GENERATING"
  | "FORMATTING"
  | "SAVING"
  | "COMPLETED"
  | "FAILED";

type RequestType = "ITINERARY" | "REFINE" | "GUEST_PREVIEW";

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export async function createGenerationRequest(args: {
  userId?: string | null;
  tripId?: string | null;
  requestType: RequestType;
  providerOrder: string[];
  requestPayload: unknown;
  promptSnapshot?: string;
}) {
  return prisma.generationRequest.create({
    data: {
      userId: args.userId || null,
      tripId: args.tripId || null,
      requestType: args.requestType,
      status: "QUEUED",
      providerOrder: toJsonValue(args.providerOrder),
      requestPayload: toJsonValue(args.requestPayload),
      promptSnapshot: args.promptSnapshot,
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function updateGenerationRequest(
  requestId: string,
  args: {
    status?: RequestStatus;
    tripId?: string | null;
    providerUsed?: string | null;
    attemptLog?: AIProviderAttempt[];
    resultMeta?: Record<string, unknown> | null;
    errorMessage?: string | null;
    startedAt?: Date | null;
    completedAt?: Date | null;
  }
) {
  return prisma.generationRequest.update({
    where: { id: requestId },
    data: {
      ...(args.status ? { status: args.status } : {}),
      ...(args.tripId !== undefined ? { tripId: args.tripId } : {}),
      ...(args.providerUsed !== undefined ? { providerUsed: args.providerUsed } : {}),
      ...(args.attemptLog !== undefined
        ? { attemptLog: toJsonValue(args.attemptLog) }
        : {}),
      ...(args.resultMeta !== undefined
        ? { resultMeta: args.resultMeta ? toJsonValue(args.resultMeta) : Prisma.JsonNull }
        : {}),
      ...(args.errorMessage !== undefined ? { errorMessage: args.errorMessage } : {}),
      ...(args.startedAt !== undefined ? { startedAt: args.startedAt } : {}),
      ...(args.completedAt !== undefined ? { completedAt: args.completedAt } : {}),
    },
  });
}
