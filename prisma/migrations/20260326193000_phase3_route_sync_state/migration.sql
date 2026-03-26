-- Add persistent route sync state to trips so itinerary versions and confirmed stops
-- can stay in sync across generation, refinement, and version restoration.

CREATE TYPE "RouteStatus" AS ENUM ('NOT_STARTED', 'SUGGESTED', 'CONFIRMED', 'STALE');

ALTER TABLE "Trip"
ADD COLUMN "routeStatus" "RouteStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN "routeSourceVersionId" TEXT,
ADD COLUMN "routeUpdatedAt" TIMESTAMP(3);

WITH active_versions AS (
  SELECT DISTINCT ON ("tripId")
    "tripId",
    id AS "versionId"
  FROM "ItineraryVersion"
  WHERE "isActive" = true
  ORDER BY "tripId", "createdAt" DESC
),
location_counts AS (
  SELECT
    "tripId",
    COUNT(*)::INT AS "count"
  FROM "Location"
  GROUP BY "tripId"
)
UPDATE "Trip" t
SET
  "routeStatus" = CASE
    WHEN COALESCE(lc."count", 0) > 0 THEN 'CONFIRMED'::"RouteStatus"
    WHEN av."versionId" IS NOT NULL THEN 'SUGGESTED'::"RouteStatus"
    ELSE 'NOT_STARTED'::"RouteStatus"
  END,
  "routeSourceVersionId" = CASE
    WHEN av."versionId" IS NOT NULL THEN av."versionId"
    ELSE NULL
  END,
  "routeUpdatedAt" = NOW()
FROM active_versions av
FULL OUTER JOIN location_counts lc
  ON av."tripId" = lc."tripId"
WHERE t.id = COALESCE(av."tripId", lc."tripId");

UPDATE "Trip"
SET "routeUpdatedAt" = NOW()
WHERE "routeUpdatedAt" IS NULL;
