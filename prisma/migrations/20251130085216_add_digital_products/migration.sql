-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."SaleStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "bankAccountName" TEXT,
ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankCountry" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "bankRoutingNumber" TEXT;

-- CreateTable
CREATE TABLE "public"."DigitalProduct" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT,
    "imageUrl" TEXT,
    "fileUrl" TEXT,
    "fileType" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigitalProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DigitalProductSale" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "creatorEarnings" DOUBLE PRECISION NOT NULL,
    "status" "public"."SaleStatus" NOT NULL DEFAULT 'PENDING',
    "downloadUrl" TEXT,
    "downloadExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigitalProductSale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DigitalProduct_creatorId_status_idx" ON "public"."DigitalProduct"("creatorId", "status");

-- CreateIndex
CREATE INDEX "DigitalProduct_status_createdAt_idx" ON "public"."DigitalProduct"("status", "createdAt");

-- CreateIndex
CREATE INDEX "DigitalProductSale_buyerId_createdAt_idx" ON "public"."DigitalProductSale"("buyerId", "createdAt");

-- CreateIndex
CREATE INDEX "DigitalProductSale_sellerId_createdAt_idx" ON "public"."DigitalProductSale"("sellerId", "createdAt");

-- CreateIndex
CREATE INDEX "DigitalProductSale_productId_idx" ON "public"."DigitalProductSale"("productId");

-- CreateIndex
CREATE INDEX "DigitalProductSale_status_idx" ON "public"."DigitalProductSale"("status");

-- AddForeignKey
ALTER TABLE "public"."DigitalProduct" ADD CONSTRAINT "DigitalProduct_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DigitalProductSale" ADD CONSTRAINT "DigitalProductSale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."DigitalProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DigitalProductSale" ADD CONSTRAINT "DigitalProductSale_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DigitalProductSale" ADD CONSTRAINT "DigitalProductSale_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
