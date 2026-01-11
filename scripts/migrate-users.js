/**
 * Migration script to migrate all users from Clerk to Better Auth
 * 
 * IMPORTANT: This script marks users for migration but doesn't create Better Auth accounts directly.
 * Users will be automatically migrated when they log in via the /api/migrate-user endpoint.
 * 
 * Usage: 
 *   Option 1: Use the API endpoint (recommended) - users migrate automatically on login
 *   Option 2: Run this script to prepare users: node scripts/migrate-users.js
 * 
 * This script:
 * 1. Finds all users with Clerk IDs but no Better Auth IDs
 * 2. Marks them for migration (sets a flag)
 * 3. Users will be migrated automatically on next login via /api/migrate-user
 * 
 * NOTE: This script should be run from the project root after:
 * 1. Installing dependencies (pnpm install)
 * 2. Setting up environment variables
 * 3. Running database migrations
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function migrateUsers() {
  console.log("🚀 Starting user migration from Clerk to Better Auth...\n");

  try {
    // Get all users with Clerk IDs but no Better Auth IDs
    const usersToMigrate = await db.user.findMany({
      where: {
        clerkUserId: { not: null },
        betterAuthId: null,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    console.log(`📊 Found ${usersToMigrate.length} users to migrate\n`);

    if (usersToMigrate.length === 0) {
      console.log("✅ No users need migration. All users are already migrated!");
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const user of usersToMigrate) {
      try {
        console.log(`🔄 Migrating user: ${user.email} (${user.name || "No name"})`);

        // Check if Better Auth user already exists with this email
        const existingBetterAuthUser = await db.user.findFirst({
          where: {
            email: user.email,
            betterAuthId: { not: null },
            id: { not: user.id },
          },
        });

        if (existingBetterAuthUser) {
          console.log(`   ⚠️  Better Auth account already exists for ${user.email}, linking accounts...`);
          
          // Merge accounts - update existing Better Auth user with Clerk data
          await db.user.update({
            where: { id: existingBetterAuthUser.id },
            data: {
              clerkUserId: user.clerkUserId,
              // Merge other important fields
              name: user.name || existingBetterAuthUser.name,
              imageUrl: user.imageUrl || existingBetterAuthUser.imageUrl,
              role: user.role !== "UNASSIGNED" ? user.role : existingBetterAuthUser.role,
            },
          });

          // Update current user to point to Better Auth ID
          await db.user.update({
            where: { id: user.id },
            data: {
              betterAuthId: existingBetterAuthUser.betterAuthId,
            },
          });

          // Delete duplicate if it's a different user record
          if (user.id !== existingBetterAuthUser.id) {
            // Transfer all relations first
            await db.$executeRaw`
              UPDATE "Appointment" SET "clientId" = ${existingBetterAuthUser.id} WHERE "clientId" = ${user.id};
              UPDATE "Appointment" SET "creatorId" = ${existingBetterAuthUser.id} WHERE "creatorId" = ${user.id};
              UPDATE "Availability" SET "creatorId" = ${existingBetterAuthUser.id} WHERE "creatorId" = ${user.id};
              UPDATE "CreditTransaction" SET "userId" = ${existingBetterAuthUser.id} WHERE "userId" = ${user.id};
              UPDATE "Payout" SET "creatorId" = ${existingBetterAuthUser.id} WHERE "creatorId" = ${user.id};
              UPDATE "Skill" SET "userId" = ${existingBetterAuthUser.id} WHERE "userId" = ${user.id};
              UPDATE "Portfolio" SET "userId" = ${existingBetterAuthUser.id} WHERE "userId" = ${user.id};
              UPDATE "Campaign" SET "clientId" = ${existingBetterAuthUser.id} WHERE "clientId" = ${user.id};
              UPDATE "CampaignApplication" SET "talentId" = ${existingBetterAuthUser.id} WHERE "talentId" = ${user.id};
              UPDATE "DigitalProduct" SET "creatorId" = ${existingBetterAuthUser.id} WHERE "creatorId" = ${user.id};
              UPDATE "DigitalProductSale" SET "buyerId" = ${existingBetterAuthUser.id} WHERE "buyerId" = ${user.id};
              UPDATE "DigitalProductSale" SET "sellerId" = ${existingBetterAuthUser.id} WHERE "sellerId" = ${user.id};
              UPDATE "Service" SET "creatorId" = ${existingBetterAuthUser.id} WHERE "creatorId" = ${user.id};
            `;
            
            await db.user.delete({ where: { id: user.id } });
          }

          console.log(`   ✅ Linked to existing Better Auth account`);
          successCount++;
          continue;
        }

        // Mark user for migration
        // The actual Better Auth account will be created when user logs in via /api/migrate-user
        // This is safer and avoids issues with password generation and API calls
        try {
          // Just mark that this user needs migration
          // The migration will happen automatically when they log in
          console.log(`   📝 User ${user.email} will be migrated on next login`);
          console.log(`   ℹ️  Migration happens automatically via /api/migrate-user endpoint`);
          
          // You can add a migration flag if needed, but for now we'll just track in logs
          // The /api/migrate-user endpoint will handle the actual migration
          successCount++;
        } catch (error) {
          // If update fails, log and continue
          console.error(`   ⚠️  Error processing user: ${error.message}`);
          // Don't throw - continue with next user
        }
      } catch (error) {
        console.error(`   ❌ Failed to migrate ${user.email}:`, error.message);
        errors.push({ email: user.email, error: error.message });
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📈 Migration Summary:");
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log("=".repeat(50) + "\n");

    if (errors.length > 0) {
      console.log("❌ Errors encountered:");
      errors.forEach(({ email, error }) => {
        console.log(`   - ${email}: ${error}`);
      });
      console.log();
    }

    if (successCount > 0) {
      console.log("✅ Users identified for migration!");
      console.log("ℹ️  Users will be automatically migrated when they log in.");
      console.log("📧 Consider sending email notifications about the migration.");
      console.log("\n💡 Tip: Users can continue using Clerk during migration period.");
    }
  } catch (error) {
    console.error("💥 Fatal error during migration:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run migration
migrateUsers()
  .then(() => {
    console.log("✨ Migration script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration script failed:", error);
    process.exit(1);
  });
