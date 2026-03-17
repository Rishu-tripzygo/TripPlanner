-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "photos" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Note_locationId_createdAt_idx" ON "Note"("locationId", "createdAt");

-- CreateIndex
CREATE INDEX "JournalEntry_tripId_createdAt_idx" ON "JournalEntry"("tripId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_tripId_day_key" ON "JournalEntry"("tripId", "day");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
