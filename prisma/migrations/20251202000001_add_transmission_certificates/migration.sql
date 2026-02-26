-- CreateTable
CREATE TABLE IF NOT EXISTS "TransmissionCertificate" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "bookingId" TEXT,
    "campaignRefId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "airDate" TIMESTAMP(3) NOT NULL,
    "airTime" TEXT,
    "stationName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransmissionCertificate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TransmissionCertificate" ADD CONSTRAINT "TransmissionCertificate_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "MediaAgency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TransmissionCertificate_agencyId_createdAt_idx" ON "TransmissionCertificate"("agencyId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TransmissionCertificate_bookingId_idx" ON "TransmissionCertificate"("bookingId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TransmissionCertificate_campaignRefId_idx" ON "TransmissionCertificate"("campaignRefId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TransmissionCertificate_airDate_idx" ON "TransmissionCertificate"("airDate");
