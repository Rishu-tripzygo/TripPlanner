-- CreateTable
CREATE TABLE "GuestPreview" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "publicToken" TEXT NOT NULL,
    "userId" TEXT,
    "destination" TEXT NOT NULL,
    "plannerInput" JSONB NOT NULL,
    "itineraryData" JSONB NOT NULL,
    "sourceProvider" TEXT NOT NULL,
    "title" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "claimedAt" TIMESTAMP(3),
    "convertedTripId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestPreview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestPreview_sessionToken_key" ON "GuestPreview"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "GuestPreview_publicToken_key" ON "GuestPreview"("publicToken");

-- CreateIndex
CREATE INDEX "GuestPreview_expiresAt_idx" ON "GuestPreview"("expiresAt");

-- CreateIndex
CREATE INDEX "GuestPreview_userId_claimedAt_idx" ON "GuestPreview"("userId", "claimedAt");

-- AddForeignKey
ALTER TABLE "GuestPreview" ADD CONSTRAINT "GuestPreview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
