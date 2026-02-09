const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Adding media listing fields to RateCard table...");

  try {
    // Add new columns to RateCard table
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "public"."RateCard" 
      ADD COLUMN IF NOT EXISTS "listingId" TEXT,
      ADD COLUMN IF NOT EXISTS "listingType" "MediaType",
      ADD COLUMN IF NOT EXISTS "location" TEXT,
      ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
    `);

    // Add indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "RateCard_listingType_isPublished_idx" 
      ON "public"."RateCard"("listingType", "isPublished");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "RateCard_listingId_idx" 
      ON "public"."RateCard"("listingId");
    `);

    // Add foreign key constraint if listingId is provided
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'RateCard_listingId_fkey'
        ) THEN
          ALTER TABLE "public"."RateCard" 
          ADD CONSTRAINT "RateCard_listingId_fkey" 
          FOREIGN KEY ("listingId") 
          REFERENCES "public"."MediaListing"("id") 
          ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    console.log("✅ Successfully added media listing fields to RateCard table");
  } catch (error) {
    console.error("❌ Error adding fields:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
