-- AlterTable
ALTER TABLE "MediaAgency" ADD COLUMN IF NOT EXISTS "primaryMediaType" "MediaType";

-- Backfill from each agency's most common listing type (if any)
UPDATE "MediaAgency" AS a
SET "primaryMediaType" = sub."listingType"
FROM (
  SELECT DISTINCT ON ("agencyId")
    "agencyId",
    "listingType"
  FROM "MediaListing"
  ORDER BY "agencyId", "createdAt" ASC
) AS sub
WHERE a.id = sub."agencyId"
  AND a."primaryMediaType" IS NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MediaAgency_primaryMediaType_idx" ON "MediaAgency"("primaryMediaType");
