const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('Creating Rate Card system tables...\n');

    // Create RateCard table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."RateCard" (
        "id" TEXT NOT NULL,
        "agencyId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "isPublished" BOOLEAN NOT NULL DEFAULT false,
        "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "RateCard_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✓ Created RateCard table');

    // Create RateCardSection table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."RateCardSection" (
        "id" TEXT NOT NULL,
        "rateCardId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "RateCardSection_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✓ Created RateCardSection table');

    // Create SmartTable table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."SmartTable" (
        "id" TEXT NOT NULL,
        "sectionId" TEXT NOT NULL,
        "title" TEXT,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "SmartTable_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✓ Created SmartTable table');

    // Create ColumnDataType enum
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "public"."ColumnDataType" AS ENUM('TEXT', 'NUMBER', 'CURRENCY', 'DROPDOWN', 'BOOLEAN', 'NOTES');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✓ Created ColumnDataType enum');

    // Create SmartTableColumn table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."SmartTableColumn" (
        "id" TEXT NOT NULL,
        "tableId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "dataType" "public"."ColumnDataType" NOT NULL,
        "displayOrder" INTEGER NOT NULL DEFAULT 0,
        "isVisibleOnFrontend" BOOLEAN NOT NULL DEFAULT true,
        "isRequiredForBooking" BOOLEAN NOT NULL DEFAULT false,
        "config" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "SmartTableColumn_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✓ Created SmartTableColumn table');

    // Create SmartTableRow table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."SmartTableRow" (
        "id" TEXT NOT NULL,
        "tableId" TEXT NOT NULL,
        "isBookable" BOOLEAN NOT NULL DEFAULT true,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "SmartTableRow_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✓ Created SmartTableRow table');

    // Create SmartTableCell table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."SmartTableCell" (
        "id" TEXT NOT NULL,
        "rowId" TEXT NOT NULL,
        "columnId" TEXT NOT NULL,
        "value" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "SmartTableCell_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "SmartTableCell_rowId_columnId_key" UNIQUE ("rowId", "columnId")
      );
    `);
    console.log('✓ Created SmartTableCell table');

    // Create RateCardBookingItem table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."RateCardBookingItem" (
        "id" TEXT NOT NULL,
        "rowId" TEXT NOT NULL,
        "rateCardId" TEXT NOT NULL,
        "agencyId" TEXT NOT NULL,
        "snapshotData" JSONB NOT NULL,
        "snapshotPrice" DOUBLE PRECISION,
        "snapshotUnit" TEXT,
        "snapshotDescription" TEXT,
        "clientName" TEXT NOT NULL,
        "clientEmail" TEXT NOT NULL,
        "clientPhone" TEXT,
        "quantity" INTEGER,
        "startDate" TIMESTAMP(3),
        "endDate" TIMESTAMP(3),
        "totalAmount" DOUBLE PRECISION,
        "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "RateCardBookingItem_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✓ Created RateCardBookingItem table');

    // Create indexes (execute each separately)
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "RateCard_agencyId_idx" ON "public"."RateCard"("agencyId")',
      'CREATE INDEX IF NOT EXISTS "RateCard_agencyId_isPublished_idx" ON "public"."RateCard"("agencyId", "isPublished")',
      'CREATE INDEX IF NOT EXISTS "RateCardSection_rateCardId_sortOrder_idx" ON "public"."RateCardSection"("rateCardId", "sortOrder")',
      'CREATE INDEX IF NOT EXISTS "SmartTable_sectionId_sortOrder_idx" ON "public"."SmartTable"("sectionId", "sortOrder")',
      'CREATE INDEX IF NOT EXISTS "SmartTableColumn_tableId_displayOrder_idx" ON "public"."SmartTableColumn"("tableId", "displayOrder")',
      'CREATE INDEX IF NOT EXISTS "SmartTableRow_tableId_sortOrder_idx" ON "public"."SmartTableRow"("tableId", "sortOrder")',
      'CREATE INDEX IF NOT EXISTS "SmartTableRow_tableId_isBookable_idx" ON "public"."SmartTableRow"("tableId", "isBookable")',
      'CREATE INDEX IF NOT EXISTS "SmartTableCell_rowId_idx" ON "public"."SmartTableCell"("rowId")',
      'CREATE INDEX IF NOT EXISTS "SmartTableCell_columnId_idx" ON "public"."SmartTableCell"("columnId")',
      'CREATE INDEX IF NOT EXISTS "RateCardBookingItem_rowId_idx" ON "public"."RateCardBookingItem"("rowId")',
      'CREATE INDEX IF NOT EXISTS "RateCardBookingItem_rateCardId_idx" ON "public"."RateCardBookingItem"("rateCardId")',
      'CREATE INDEX IF NOT EXISTS "RateCardBookingItem_agencyId_status_idx" ON "public"."RateCardBookingItem"("agencyId", "status")',
      'CREATE INDEX IF NOT EXISTS "RateCardBookingItem_status_createdAt_idx" ON "public"."RateCardBookingItem"("status", "createdAt")',
    ];

    for (const indexSql of indexes) {
      try {
        await prisma.$executeRawUnsafe(indexSql);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.warn('Warning creating index:', error.message);
        }
      }
    }
    console.log('✓ Created indexes');

    // Create foreign keys (execute each separately)
    const foreignKeys = [
      {
        table: 'RateCard',
        constraint: 'RateCard_agencyId_fkey',
        sql: 'ALTER TABLE "public"."RateCard" ADD CONSTRAINT "RateCard_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."MediaAgency"("id") ON DELETE CASCADE ON UPDATE CASCADE',
      },
      {
        table: 'RateCardSection',
        constraint: 'RateCardSection_rateCardId_fkey',
        sql: 'ALTER TABLE "public"."RateCardSection" ADD CONSTRAINT "RateCardSection_rateCardId_fkey" FOREIGN KEY ("rateCardId") REFERENCES "public"."RateCard"("id") ON DELETE CASCADE ON UPDATE CASCADE',
      },
      {
        table: 'SmartTable',
        constraint: 'SmartTable_sectionId_fkey',
        sql: 'ALTER TABLE "public"."SmartTable" ADD CONSTRAINT "SmartTable_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."RateCardSection"("id") ON DELETE CASCADE ON UPDATE CASCADE',
      },
      {
        table: 'SmartTableColumn',
        constraint: 'SmartTableColumn_tableId_fkey',
        sql: 'ALTER TABLE "public"."SmartTableColumn" ADD CONSTRAINT "SmartTableColumn_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "public"."SmartTable"("id") ON DELETE CASCADE ON UPDATE CASCADE',
      },
      {
        table: 'SmartTableRow',
        constraint: 'SmartTableRow_tableId_fkey',
        sql: 'ALTER TABLE "public"."SmartTableRow" ADD CONSTRAINT "SmartTableRow_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "public"."SmartTable"("id") ON DELETE CASCADE ON UPDATE CASCADE',
      },
      {
        table: 'SmartTableCell',
        constraint: 'SmartTableCell_rowId_fkey',
        sql: 'ALTER TABLE "public"."SmartTableCell" ADD CONSTRAINT "SmartTableCell_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "public"."SmartTableRow"("id") ON DELETE CASCADE ON UPDATE CASCADE',
      },
      {
        table: 'SmartTableCell',
        constraint: 'SmartTableCell_columnId_fkey',
        sql: 'ALTER TABLE "public"."SmartTableCell" ADD CONSTRAINT "SmartTableCell_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "public"."SmartTableColumn"("id") ON DELETE CASCADE ON UPDATE CASCADE',
      },
      {
        table: 'RateCardBookingItem',
        constraint: 'RateCardBookingItem_rowId_fkey',
        sql: 'ALTER TABLE "public"."RateCardBookingItem" ADD CONSTRAINT "RateCardBookingItem_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "public"."SmartTableRow"("id") ON DELETE RESTRICT ON UPDATE CASCADE',
      },
      {
        table: 'RateCardBookingItem',
        constraint: 'RateCardBookingItem_rateCardId_fkey',
        sql: 'ALTER TABLE "public"."RateCardBookingItem" ADD CONSTRAINT "RateCardBookingItem_rateCardId_fkey" FOREIGN KEY ("rateCardId") REFERENCES "public"."RateCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE',
      },
      {
        table: 'RateCardBookingItem',
        constraint: 'RateCardBookingItem_agencyId_fkey',
        sql: 'ALTER TABLE "public"."RateCardBookingItem" ADD CONSTRAINT "RateCardBookingItem_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."MediaAgency"("id") ON DELETE RESTRICT ON UPDATE CASCADE',
      },
    ];

    for (const fk of foreignKeys) {
      try {
        await prisma.$executeRawUnsafe(`
          DO $$ BEGIN
            ${fk.sql};
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `);
      } catch (error) {
        if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
          console.warn(`Warning creating foreign key ${fk.constraint}:`, error.message);
        }
      }
    }
    console.log('✓ Created foreign keys');

    // Update RateCard lastUpdated trigger (execute function and trigger separately)
    try {
      await prisma.$executeRawUnsafe(`
        CREATE OR REPLACE FUNCTION update_ratecard_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW."lastUpdated" = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);
    } catch (error) {
      console.warn('Warning creating function:', error.message);
    }

    try {
      await prisma.$executeRawUnsafe(`
        DROP TRIGGER IF EXISTS ratecard_updated_at ON "public"."RateCard";
      `);
    } catch (error) {
      // Ignore errors when dropping trigger
    }

    try {
      await prisma.$executeRawUnsafe(`
        CREATE TRIGGER ratecard_updated_at
          BEFORE UPDATE ON "public"."RateCard"
          FOR EACH ROW
          EXECUTE FUNCTION update_ratecard_updated_at();
      `);
    } catch (error) {
      console.warn('Warning creating trigger:', error.message);
    }
    console.log('✓ Created update trigger for RateCard');

    console.log('\n✅ Rate Card migration applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
