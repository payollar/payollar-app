-- CreateTable
CREATE TABLE "public"."MediaListingPackage" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" TEXT,
    "spots" INTEGER,
    "estimatedViewers" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaListingPackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaListingPackage_listingId_idx" ON "public"."MediaListingPackage"("listingId");

-- AddForeignKey
ALTER TABLE "public"."MediaListingPackage" ADD CONSTRAINT "MediaListingPackage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."MediaListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
