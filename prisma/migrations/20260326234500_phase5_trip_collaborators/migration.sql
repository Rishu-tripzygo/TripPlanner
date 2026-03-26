-- Add invite-based trip collaborators for owner, editor, and viewer access.

CREATE TYPE "CollaboratorRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

CREATE TABLE "TripCollaborator" (
  "id" TEXT NOT NULL,
  "tripId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" "CollaboratorRole" NOT NULL DEFAULT 'VIEWER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TripCollaborator_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TripCollaborator_tripId_userId_key"
ON "TripCollaborator"("tripId", "userId");

CREATE INDEX "TripCollaborator_userId_createdAt_idx"
ON "TripCollaborator"("userId", "createdAt");

ALTER TABLE "TripCollaborator"
ADD CONSTRAINT "TripCollaborator_tripId_fkey"
FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TripCollaborator"
ADD CONSTRAINT "TripCollaborator_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
