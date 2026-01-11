import { auth as betterAuth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * API route to migrate a user from Clerk to Better Auth
 * This is called when a Clerk user logs in and needs to be migrated
 */
export async function POST(req) {
  try {
    const { userId: clerkUserId } = await clerkAuth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user in database
    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If already migrated, return success
    if (user.betterAuthId) {
      return NextResponse.json({ 
        success: true, 
        message: "User already migrated",
        betterAuthId: user.betterAuthId 
      });
    }

    // Check if Better Auth user already exists with this email
    const existingBetterAuthUser = await db.user.findUnique({
      where: { email: user.email, betterAuthId: { not: null } },
    });

    if (existingBetterAuthUser && existingBetterAuthUser.id !== user.id) {
      // Merge accounts - update existing Better Auth user with Clerk data
      await db.user.update({
        where: { id: existingBetterAuthUser.id },
        data: {
          clerkUserId: user.clerkUserId,
          // Merge other fields if needed
        },
      });
      
      // Delete duplicate user
      await db.user.delete({ where: { id: user.id } });
      
      return NextResponse.json({ 
        success: true,
        betterAuthId: existingBetterAuthUser.betterAuthId,
        message: "Accounts merged successfully"
      });
    }

    // Create Better Auth account
    // Generate a temporary password - user will need to reset it
    const tempPassword = crypto.randomUUID() + "TEMP!@#";
    
    try {
      // Use Better Auth API to create account
      const response = await betterAuth.api.signUpEmail({
        body: {
          email: user.email,
          name: user.name || "User",
          password: tempPassword,
        },
        headers: req.headers,
      });

      // Better Auth returns user data - extract the user ID
      // The response structure may vary, so we check multiple possible paths
      let betterAuthUserId = null;
      
      if (response?.user?.id) {
        betterAuthUserId = response.user.id;
      } else if (response?.data?.user?.id) {
        betterAuthUserId = response.data.user.id;
      } else if (typeof response === 'string') {
        // If response is a string (user ID), use it directly
        betterAuthUserId = response;
      } else {
        // Try to find the user in database by email (Better Auth creates it)
        const betterAuthUserRecord = await db.user.findFirst({
          where: {
            email: user.email,
            betterAuthId: { not: null },
          },
        });
        
        if (betterAuthUserRecord?.betterAuthId) {
          betterAuthUserId = betterAuthUserRecord.betterAuthId;
        }
      }
      
      if (!betterAuthUserId) {
        throw new Error("Failed to get Better Auth user ID from response");
      }

      await db.user.update({
        where: { id: user.id },
        data: {
          betterAuthId: betterAuthUserId,
          // Keep clerkUserId for now during migration period
        },
      });

      // TODO: Send password reset email to user
      // You should implement email sending here
      // await sendPasswordResetEmail(user.email, betterAuthUser.user.id);

      return NextResponse.json({ 
        success: true,
        betterAuthId: betterAuthUserId,
        message: "User migrated successfully. Please set a new password via password reset."
      });
    } catch (betterAuthError) {
      // If Better Auth user already exists, link them
      if (betterAuthError.message?.includes("already exists") || betterAuthError.message?.includes("unique")) {
        // Try to find existing Better Auth user
        const existingUser = await db.user.findFirst({
          where: { 
            email: user.email,
            betterAuthId: { not: null }
          },
        });

        if (existingUser) {
          await db.user.update({
            where: { id: user.id },
            data: { betterAuthId: existingUser.betterAuthId },
          });
          
          return NextResponse.json({ 
            success: true,
            betterAuthId: existingUser.betterAuthId,
            message: "User linked to existing Better Auth account"
          });
        }
      }
      
      throw betterAuthError;
    }
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: error.message },
      { status: 500 }
    );
  }
}
