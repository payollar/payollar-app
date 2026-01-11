import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * API route to clean up orphaned users (users without Account records)
 * This helps fix the issue where users exist but can't sign in
 * 
 * WARNING: This is a utility route. In production, protect it with admin authentication.
 */
export async function POST(req) {
  try {
    // Get all users
    const allUsers = await db.user.findMany({
      include: {
        accounts: true,
      },
    });

    const orphanedUsers = allUsers.filter(user => {
      // A user is orphaned if:
      // 1. They don't have any Account records (no password set)
      // 2. They don't have a clerkUserId (not from Clerk)
      // 3. They don't have a betterAuthId (not properly linked to Better Auth)
      return user.accounts.length === 0 && !user.clerkUserId && !user.betterAuthId;
    });

    // Optionally delete orphaned users
    // For now, we'll just return the count
    // Uncomment the delete code if you want to actually delete them
    /*
    for (const user of orphanedUsers) {
      await db.user.delete({
        where: { id: user.id },
      });
    }
    */

    return NextResponse.json({
      totalUsers: allUsers.length,
      orphanedUsers: orphanedUsers.length,
      orphanedUserEmails: orphanedUsers.map(u => u.email),
      message: "Orphaned users found. To delete them, uncomment the delete code in the route.",
    });
  } catch (error) {
    console.error("Error cleaning up orphaned users:", error);
    return NextResponse.json(
      { error: "Failed to clean up orphaned users", details: error.message },
      { status: 500 }
    );
  }
}
