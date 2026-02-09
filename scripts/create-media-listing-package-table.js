const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Creating MediaListingPackage table if it doesn't exist...");

  try {
    // Create MediaListingPackage table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."MediaListingPackage" (
        "id" TEXT NOT NULL,
        "listingId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "duration" TEXT,
        "spots" INTEGER,
        "estimatedViewers" TEXT,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "MediaListingPackage_pkey" PRIMARY KEY ("id")
      );
    `);

    // Create index
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "MediaListingPackage_listingId_idx" 
      ON "public"."MediaListingPackage"("listingId");
    `);

    // Add foreign key constraint
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'MediaListingPackage_listingId_fkey'
        ) THEN
          ALTER TABLE "public"."MediaListingPackage" 
          ADD CONSTRAINT "MediaListingPackage_listingId_fkey" 
          FOREIGN KEY ("listingId") 
          REFERENCES "public"."MediaListing"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    console.log("✅ Successfully created MediaListingPackage table");
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
