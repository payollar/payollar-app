"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";
import { getAuthUserId } from "@/lib/getAuthUserId";
import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Sets the user's role and related information
 * Uses Better Auth for authentication
 */

export async function setUserRole(formData) {
  // Get user ID from Better Auth
  const authResult = await getAuthUserId();
  
  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  const userId = authResult.userId;

  // Find user in our database
  let user = await db.user.findUnique({
    where: { id: userId },
  });

  // If user doesn't exist, try to create them (fallback if database hook didn't fire)
  if (!user) {
    try {
      // Get Better Auth user info
      const headersList = await headers();
      const session = await betterAuth.api.getSession({
        headers: headersList,
      });
      
      if (session?.user) {
        try {
          user = await db.user.create({
            data: {
              id: session.user.id, // Better Auth uses User.id directly
              betterAuthId: session.user.id,
              email: session.user.email || '',
              name: session.user.name || null,
              imageUrl: session.user.image || null,
              role: "UNASSIGNED",
            },
          });
        } catch (createError) {
          // If user already exists (race condition), fetch them
          if (createError.code === 'P2002') {
            user = await db.user.findUnique({
              where: { id: session.user.id },
            });
            if (!user) {
              // Try finding by email as fallback
              user = await db.user.findUnique({
                where: { email: session.user.email },
              });
            }
          } else {
            throw createError;
          }
        }
      } else {
        throw new Error("Could not fetch user from Better Auth");
      }
    } catch (error) {
      console.error("Error creating user during onboarding:", error);
      // Provide more helpful error message
      if (error.message?.includes("Could not fetch user from Better Auth")) {
        throw new Error("Please sign in again to continue with onboarding");
      }
      throw new Error("User not found in database and could not be created. Please try signing in again.");
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
          id: userId,
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
      
      // Get portfolio URLs (can be multiple)
      const portfolioUrlsArray = formData.getAll("portfolioUrls[]");
      const portfolioUrls = portfolioUrlsArray.filter(url => url && url.trim() !== "");
      
      // Get skills (can be multiple)
      const skillsArray = formData.getAll("skills[]");
      const skills = skillsArray.filter(skill => skill && skill.trim() !== "");

      // Validate inputs
      if (!specialty || experience === undefined || experience < 0 || !credentialUrl || !description) {
        throw new Error("All required fields must be filled");
      }

      if (description.length < 50) {
        throw new Error("Description must be at least 50 characters");
      }

      if (portfolioUrls.length === 0) {
        throw new Error("At least one portfolio link is required");
      }

      if (skills.length === 0) {
        throw new Error("At least one skill is required");
      }

      // Update user with all information
      await db.user.update({
        where: {
          id: userId,
        },
        data: {
          role: "CREATOR",
          specialty,
          experience,
          credentialUrl,
          description,
          portfolioUrls,
          verificationStatus: "PENDING",
          imageUrl: formData.get("imageUrl") || null,
        },
      });

      // Create skills for the user
      if (skills.length > 0) {
        // Delete existing skills first (in case of re-onboarding)
        await db.skill.deleteMany({
          where: { userId },
        });

        // Create new skills
        await db.skill.createMany({
          data: skills.map(skill => ({
            name: skill.trim(),
            userId,
          })),
        });
      }

      revalidatePath("/");
      revalidatePath("/creator");
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
 * Uses Better Auth for authentication
 */
export async function getCurrentUser() {
  try {
    // Use checkUser which uses Better Auth
    const user = await checkUser();
    
    if (user) {
      return user;
    }

    return null;
  } catch (error) {
    console.error("Failed to get user information:", error);
    return null;
  }
}
