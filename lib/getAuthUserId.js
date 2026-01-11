/**
 * Utility function to get the current user ID from either Clerk or Better Auth
 * This allows gradual migration while both systems are active
 * 
 * Better Auth - commented out for now, using Clerk only
 */
import { auth as clerkAuth } from "@clerk/nextjs/server";
// import { auth as betterAuth } from "./auth"; // Better Auth - commented out
// import { headers } from "next/headers"; // Better Auth - commented out
import { db } from "./prisma";

export async function getAuthUserId() {
  // Better Auth check - commented out
  // try {
  //   const headersList = await headers();
  //   const session = await betterAuth.api.getSession({
  //     headers: headersList,
  //   });
  //   
  //   if (session?.user?.id) {
  //     const user = await db.user.findUnique({
  //       where: { betterAuthId: session.user.id },
  //       select: { id: true },
  //     });
  //     if (user) return { userId: user.id, authType: "better-auth" };
  //   }
  // } catch (error) {
  //   // Better Auth not available, continue to Clerk
  // }

  // Use Clerk
  try {
    const { userId: clerkUserId } = await clerkAuth();
    if (clerkUserId) {
      const user = await db.user.findUnique({
        where: { clerkUserId },
        select: { id: true },
      });
      if (user) return { userId: user.id, authType: "clerk" };
    }
  } catch (error) {
    // Failed
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
