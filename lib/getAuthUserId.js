/**
 * Utility function to get the current user ID from Better Auth
 * Better Auth uses User.id directly, so we return the session user ID
 */
import { auth as betterAuth } from "./auth";
import { headers } from "next/headers";
import { db } from "./prisma";

export async function getAuthUserId() {
  try {
    const headersList = await headers();
    const session = await betterAuth.api.getSession({
      headers: headersList,
    });
    
    if (session?.user?.id) {
      // Better Auth uses User.id directly, so session.user.id is the database User.id
      // Verify the user exists in our database
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { id: true },
      });
      
      if (user) return { userId: user.id, authType: "better-auth" };
    }
  } catch (error) {
    // Not authenticated
  }

  return null;
}

/**
 * Get the current user object (uses checkUser internally)
 */
export async function getCurrentAuthUser() {
  const { checkUser } = await import("./checkUser");
  return await checkUser();
}
