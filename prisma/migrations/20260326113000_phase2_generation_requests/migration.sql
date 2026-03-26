-- CreateEnum
CREATE TYPE "GenerationRequestType" AS ENUM ('ITINERARY', 'REFINE', 'GUEST_PREVIEW');

-- CreateEnum
CREATE TYPE "GenerationRequestStatus" AS ENUM ('QUEUED', 'GENERATING', 'FORMATTING', 'SAVING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "GenerationRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "tripId" TEXT,
    "requestType" "GenerationRequestType" NOT NULL,
    "status" "GenerationRequestStatus" NOT NULL DEFAULT 'QUEUED',
    "providerOrder" JSONB NOT NULL,
    "attemptLog" JSONB,
    "requestPayload" JSONB NOT NULL,
    "promptSnapshot" TEXT,
    "providerUsed" TEXT,
    "resultMeta" JSONB,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenerationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GenerationRequest_userId_createdAt_idx" ON "GenerationRequest"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "GenerationRequest_tripId_createdAt_idx" ON "GenerationRequest"("tripId", "createdAt");

-- CreateIndex
CREATE INDEX "GenerationRequest_status_createdAt_idx" ON "GenerationRequest"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "GenerationRequest" ADD CONSTRAINT "GenerationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationRequest" ADD CONSTRAINT "GenerationRequest_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;
