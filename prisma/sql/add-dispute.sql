CREATE TYPE "DisputeType" AS ENUM ('BOOKING', 'CAMPAIGN', 'PAYOUT', 'MARKETPLACE', 'MEDIA', 'OTHER');
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED', 'CLOSED');
CREATE TYPE "DisputePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TABLE "Dispute" (
  "id" TEXT NOT NULL,
  "reporterId" TEXT NOT NULL,
  "againstUserId" TEXT,
  "resolvedById" TEXT,
  "appointmentId" TEXT,
  "campaignId" TEXT,
  "type" "DisputeType" NOT NULL DEFAULT 'OTHER',
  "priority" "DisputePriority" NOT NULL DEFAULT 'MEDIUM',
  "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
  "subject" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "resolution" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "resolvedAt" TIMESTAMP(3),
  CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Dispute_status_createdAt_idx" ON "Dispute"("status", "createdAt");
CREATE INDEX "Dispute_reporterId_createdAt_idx" ON "Dispute"("reporterId", "createdAt");
CREATE INDEX "Dispute_againstUserId_createdAt_idx" ON "Dispute"("againstUserId", "createdAt");
CREATE INDEX "Dispute_priority_status_idx" ON "Dispute"("priority", "status");

ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_againstUserId_fkey" FOREIGN KEY ("againstUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
