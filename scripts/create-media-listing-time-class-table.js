const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Creating MediaListingTimeClass table if it doesn't exist...");

  try {
    // Create MediaListingTimeClass table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."MediaListingTimeClass" (
        "id" TEXT NOT NULL,
        "listingId" TEXT NOT NULL,
        "label" TEXT NOT NULL,
        "timeRange" TEXT NOT NULL,
        "ratePer30Sec" DOUBLE PRECISION NOT NULL,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "MediaListingTimeClass_pkey" PRIMARY KEY ("id")
      );
    `);

    // Create index
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "MediaListingTimeClass_listingId_idx" 
      ON "public"."MediaListingTimeClass"("listingId");
    `);

    // Add foreign key constraint
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'MediaListingTimeClass_listingId_fkey'
        ) THEN
          ALTER TABLE "public"."MediaListingTimeClass" 
          ADD CONSTRAINT "MediaListingTimeClass_listingId_fkey" 
          FOREIGN KEY ("listingId") 
          REFERENCES "public"."MediaListing"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    console.log("✅ Successfully created MediaListingTimeClass table");
  } catch (error) {
    console.error("❌ Error creating table:", error);
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
