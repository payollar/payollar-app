-- CreateEnum
CREATE TYPE "DeliveryReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REVISION_REQUESTED');

-- CreateTable
CREATE TABLE "DeliveryReport" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT,
    "appointmentId" TEXT,
    "creatorId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "DeliveryReportStatus" NOT NULL DEFAULT 'DRAFT',
    "checklist" JSONB NOT NULL,
    "proofLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "proofNotes" TEXT,
    "metrics" JSONB,
    "clientFeedback" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryReport_applicationId_key" ON "DeliveryReport"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryReport_appointmentId_key" ON "DeliveryReport"("appointmentId");

-- CreateIndex
CREATE INDEX "DeliveryReport_creatorId_status_updatedAt_idx" ON "DeliveryReport"("creatorId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "DeliveryReport_clientId_status_updatedAt_idx" ON "DeliveryReport"("clientId", "status", "updatedAt");

-- AddForeignKey
ALTER TABLE "DeliveryReport" ADD CONSTRAINT "DeliveryReport_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "CampaignApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryReport" ADD CONSTRAINT "DeliveryReport_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryReport" ADD CONSTRAINT "DeliveryReport_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryReport" ADD CONSTRAINT "DeliveryReport_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
