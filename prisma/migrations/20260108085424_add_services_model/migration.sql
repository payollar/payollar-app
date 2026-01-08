-- CreateEnum
CREATE TYPE "RateType" AS ENUM ('PER_HOUR', 'PER_SESSION', 'FIXED');

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "rate" DOUBLE PRECISION NOT NULL,
    "rateType" "RateType" NOT NULL DEFAULT 'PER_HOUR',
    "duration" INTEGER,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Service_creatorId_isActive_idx" ON "Service"("creatorId", "isActive");

-- CreateIndex
CREATE INDEX "Service_creatorId_createdAt_idx" ON "Service"("creatorId", "createdAt");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
