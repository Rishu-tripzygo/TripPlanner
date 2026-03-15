-- CreateEnum
CREATE TYPE "ThemePreference" AS ENUM ('SYSTEM', 'LIGHT', 'DARK');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('ACCOMMODATION', 'FOOD', 'TRANSPORT', 'ACTIVITIES', 'MISC');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "themePreference" "ThemePreference" NOT NULL DEFAULT 'SYSTEM';

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "totalBudget" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "accommodation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "food" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transport" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activities" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "misc" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherCache" (
    "id" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeatherCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackingList" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "template" TEXT,
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItineraryVersion" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "sourceProvider" TEXT NOT NULL,
    "sourcePrompt" TEXT,
    "title" TEXT,
    "itineraryData" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItineraryVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tripId" TEXT,
    "itineraryVersionId" TEXT,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "tripId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Budget_tripId_key" ON "Budget"("tripId");

-- CreateIndex
CREATE INDEX "Expense_tripId_expenseDate_idx" ON "Expense"("tripId", "expenseDate");

-- CreateIndex
CREATE UNIQUE INDEX "WeatherCache_destination_date_key" ON "WeatherCache"("destination", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PackingList_tripId_key" ON "PackingList"("tripId");

-- CreateIndex
CREATE INDEX "ItineraryVersion_tripId_isActive_idx" ON "ItineraryVersion"("tripId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ItineraryVersion_tripId_versionNumber_key" ON "ItineraryVersion"("tripId", "versionNumber");

-- CreateIndex
CREATE INDEX "ChatMessage_userId_createdAt_idx" ON "ChatMessage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_tripId_createdAt_idx" ON "ChatMessage"("tripId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt");

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingList" ADD CONSTRAINT "PackingList_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryVersion" ADD CONSTRAINT "ItineraryVersion_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_itineraryVersionId_fkey" FOREIGN KEY ("itineraryVersionId") REFERENCES "ItineraryVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
