-- CreateTable
CREATE TABLE "public"."MediaListingTimeClass" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "timeRange" TEXT NOT NULL,
    "ratePer30Sec" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaListingTimeClass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaListingTimeClass_listingId_idx" ON "public"."MediaListingTimeClass"("listingId");

-- AddForeignKey
ALTER TABLE "public"."MediaListingTimeClass" ADD CONSTRAINT "MediaListingTimeClass_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."MediaListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
