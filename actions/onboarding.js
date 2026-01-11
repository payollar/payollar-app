"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";
// import { getAuthUserId } from "@/lib/getAuthUserId"; // Better Auth - commented out


/**
 * Sets the user's role and related information
 */

export async function setUserRole(formData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Find user in our database, or create if doesn't exist
  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  // If user doesn't exist, create them (fallback if webhook didn't fire)
  if (!user) {
    try {
      const { currentUser } = await import("@clerk/nextjs/server");
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        throw new Error("Could not fetch user from Clerk");
      }

      const name = clerkUser.firstName && clerkUser.lastName 
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress || 'User';

      user = await db.user.create({
        data: {
          clerkUserId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name,
          imageUrl: clerkUser.imageUrl || null,
          role: "UNASSIGNED",
        },
      });
    } catch (error) {
      console.error("Error creating user during onboarding:", error);
      throw new Error("User not found in database and could not be created");
    }
  }

  const role = formData.get("role");

  if (!role || !["CLIENT", "CREATOR"].includes(role)) {
    throw new Error("Invalid role selection");
  }

  try {
    // For client role - simple update
    if (role === "CLIENT") {
      await db.user.update({
        where: {
          clerkUserId: userId,
        },
        data: {
          role: "CLIENT",
        },
      });

      revalidatePath("/");
      return { success: true, redirect: "/talents" };
    }

    // For creator role - need additional information
    if (role === "CREATOR") {
      const specialty = formData.get("specialty");
      const experience = parseInt(formData.get("experience"), 10);
      const credentialUrl = formData.get("credentialUrl");
      const description = formData.get("description");
     

      // Validate inputs
      if (!specialty || !experience || !credentialUrl || !description) {
        throw new Error("All fields are required");
      }

      
      await db.user.update({
        where: {
          clerkUserId: userId,
        },
        data: {
          role: "CREATOR",
          specialty,
          experience,
          credentialUrl,
          description,
          verificationStatus: "PENDING",
          imageUrl: formData.get("imageUrl") || null,
        },
      });

      revalidatePath("/");
      return { success: true, redirect: "/creator/verification" };
    }
  } catch (error) {
    console.error("Failed to set user role:", error);
    
    // Provide more specific error messages
    if (error.message?.includes("not found")) {
      throw new Error("User account not found. Please try signing in again.");
    } else if (error.code === "P2002") {
      throw new Error("A user with this information already exists. Please sign in instead.");
    } else {
      throw new Error(`Failed to update profile: ${error.message || "Unknown error"}`);
    }
  }
}

/**
 * Gets the current user's complete profile information
 * Now supports both Clerk and Better Auth
 */
export async function getCurrentUser() {
  try {
    // Use checkUser which supports both Clerk and Better Auth
    const user = await checkUser();
    
    if (user) {
      return user;
    }

    // Fallback to direct Clerk check for backward compatibility
    try {
      const { userId } = await auth();

      if (!userId) {
        return null;
      }

      const dbUser = await db.user.findUnique({
        where: {
          clerkUserId: userId,
        },
      });

      // If user exists, return them
      if (dbUser) {
        return dbUser;
      }

      // If user doesn't exist, try to create them from Clerk data
      // This is a fallback if the webhook didn't fire
      try {
        const { currentUser } = await import("@clerk/nextjs/server");
        const clerkUser = await currentUser();
        
        if (!clerkUser) {
          return null;
        }

        const name = clerkUser.firstName && clerkUser.lastName 
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress || 'User';

        const newUser = await db.user.create({
          data: {
            clerkUserId: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            name,
            imageUrl: clerkUser.imageUrl || null,
            role: "UNASSIGNED",
          },
        });

        return newUser;
      } catch (createError) {
        // If user already exists (race condition), fetch them
        if (createError.code === 'P2002') {
          const existingUser = await db.user.findUnique({
            where: { clerkUserId: userId },
          });
          return existingUser;
        }
        console.error("Failed to create user in getCurrentUser:", createError);
        return null;
      }
    } catch (error) {
      console.error("Failed to get user information:", error);
      return null;
    }
  } catch (error) {
    // Auth error - user not authenticated
    return null;
  }
}
