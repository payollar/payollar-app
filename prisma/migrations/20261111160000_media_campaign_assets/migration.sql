-- CreateEnum
CREATE TYPE "MediaCampaignAssetStatus" AS ENUM ('SUBMITTED', 'ACCEPTED', 'NEEDS_REVISION', 'ARCHIVED');

-- CreateTable
CREATE TABLE "MediaCampaignAsset" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "bookingType" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "campaignName" TEXT,
    "title" TEXT,
    "assetType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "fileKey" TEXT,
    "notes" TEXT,
    "status" "MediaCampaignAssetStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaCampaignAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaCampaignAsset_clientId_createdAt_idx" ON "MediaCampaignAsset"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "MediaCampaignAsset_agencyId_createdAt_idx" ON "MediaCampaignAsset"("agencyId", "createdAt");

-- CreateIndex
CREATE INDEX "MediaCampaignAsset_bookingType_bookingId_idx" ON "MediaCampaignAsset"("bookingType", "bookingId");

-- CreateIndex
CREATE INDEX "MediaCampaignAsset_assetType_createdAt_idx" ON "MediaCampaignAsset"("assetType", "createdAt");

-- AddForeignKey
ALTER TABLE "MediaCampaignAsset" ADD CONSTRAINT "MediaCampaignAsset_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaCampaignAsset" ADD CONSTRAINT "MediaCampaignAsset_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "MediaAgency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
