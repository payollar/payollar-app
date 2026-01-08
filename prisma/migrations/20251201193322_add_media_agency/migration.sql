-- CreateEnum
CREATE TYPE "public"."MediaAgencyStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('TV', 'RADIO', 'BILLBOARD', 'DIGITAL', 'INFLUENCER_MARKETING', 'VIDEO_CLIPPING');

-- CreateEnum
CREATE TYPE "public"."ListingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."MediaAgency" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "agencyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Ghana',
    "description" TEXT,
    "logoUrl" TEXT,
    "verificationStatus" "public"."MediaAgencyStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAgency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MediaListing" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "listingType" "public"."MediaType" NOT NULL,
    "name" TEXT NOT NULL,
    "network" TEXT,
    "location" TEXT NOT NULL,
    "frequency" TEXT,
    "description" TEXT,
    "reach" TEXT,
    "demographics" TEXT[],
    "imageUrl" TEXT,
    "priceRange" TEXT,
    "timeSlots" TEXT[],
    "rating" DOUBLE PRECISION DEFAULT 0,
    "status" "public"."ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MediaBooking" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT,
    "packageName" TEXT,
    "packagePrice" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "duration" TEXT,
    "slots" INTEGER,
    "totalAmount" DOUBLE PRECISION,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaAgency_userId_key" ON "public"."MediaAgency"("userId");

-- CreateIndex
CREATE INDEX "MediaAgency_verificationStatus_createdAt_idx" ON "public"."MediaAgency"("verificationStatus", "createdAt");

-- CreateIndex
CREATE INDEX "MediaListing_agencyId_status_idx" ON "public"."MediaListing"("agencyId", "status");

-- CreateIndex
CREATE INDEX "MediaListing_listingType_status_location_idx" ON "public"."MediaListing"("listingType", "status", "location");

-- CreateIndex
CREATE INDEX "MediaListing_status_createdAt_idx" ON "public"."MediaListing"("status", "createdAt");

-- CreateIndex
CREATE INDEX "MediaBooking_listingId_status_idx" ON "public"."MediaBooking"("listingId", "status");

-- CreateIndex
CREATE INDEX "MediaBooking_agencyId_status_createdAt_idx" ON "public"."MediaBooking"("agencyId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "MediaBooking_status_createdAt_idx" ON "public"."MediaBooking"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."MediaAgency" ADD CONSTRAINT "MediaAgency_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaListing" ADD CONSTRAINT "MediaListing_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."MediaAgency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaBooking" ADD CONSTRAINT "MediaBooking_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."MediaListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaBooking" ADD CONSTRAINT "MediaBooking_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."MediaAgency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
