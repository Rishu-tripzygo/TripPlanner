-- AlterTable
ALTER TABLE "User"
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "isPublicProfile" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "username" TEXT;

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripBookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tripShareId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripReaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tripShareId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "Follow_followingId_createdAt_idx" ON "Follow"("followingId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TripBookmark_userId_tripShareId_key" ON "TripBookmark"("userId", "tripShareId");

-- CreateIndex
CREATE INDEX "TripBookmark_tripShareId_createdAt_idx" ON "TripBookmark"("tripShareId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TripReaction_userId_tripShareId_key" ON "TripReaction"("userId", "tripShareId");

-- CreateIndex
CREATE INDEX "TripReaction_tripShareId_createdAt_idx" ON "TripReaction"("tripShareId", "createdAt");

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripBookmark" ADD CONSTRAINT "TripBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripBookmark" ADD CONSTRAINT "TripBookmark_tripShareId_fkey" FOREIGN KEY ("tripShareId") REFERENCES "TripShare"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripReaction" ADD CONSTRAINT "TripReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripReaction" ADD CONSTRAINT "TripReaction_tripShareId_fkey" FOREIGN KEY ("tripShareId") REFERENCES "TripShare"("id") ON DELETE CASCADE ON UPDATE CASCADE;
