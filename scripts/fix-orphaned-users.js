/**
 * Script to fix orphaned users (users without Account records)
 * This helps fix the issue where users exist but can't sign in
 * 
 * Usage: node scripts/fix-orphaned-users.js
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function fixOrphanedUsers() {
  console.log("🔍 Checking for orphaned users...\n");

  try {
    // Get all users with their accounts
    const allUsers = await db.user.findMany({
      include: {
        accounts: true,
      },
    });

    // Find users without Account records
    const orphanedUsers = allUsers.filter(user => {
      // A user is orphaned if they don't have any Account records
      // and they're not from Clerk (no clerkUserId)
      return user.accounts.length === 0 && !user.clerkUserId;
    });

    console.log(`📊 Found ${orphanedUsers.length} orphaned users out of ${allUsers.length} total users\n`);

    if (orphanedUsers.length === 0) {
      console.log("✅ No orphaned users found. All users have Account records.");
      return;
    }

    console.log("Orphaned users (users without Account records):");
    orphanedUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (ID: ${user.id})`);
    });

    console.log("\n⚠️  These users cannot sign in because they don't have Account records.");
    console.log("💡 Solution: Delete these users so they can sign up again.");
    console.log("\nTo delete these users, set DELETE_ORPHANED_USERS=true and run the script again.");

    // Delete orphaned users if environment variable is set
    if (process.env.DELETE_ORPHANED_USERS === "true") {
      console.log("\n🗑️  Deleting orphaned users...");
      for (const user of orphanedUsers) {
        await db.user.delete({
          where: { id: user.id },
        });
        console.log(`   ✅ Deleted user: ${user.email}`);
      }
      console.log("\n✅ All orphaned users have been deleted.");
      console.log("💡 These users can now sign up again with the same email.");
    } else {
      console.log("\n💡 To delete these users, run:");
      console.log("   DELETE_ORPHANED_USERS=true node scripts/fix-orphaned-users.js");
    }

  } catch (error) {
    console.error("❌ Error fixing orphaned users:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

fixOrphanedUsers()
  .then(() => {
    console.log("\n✨ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error);
    process.exit(1);
  });
