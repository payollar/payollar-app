import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";
// import { auth as betterAuth } from "./auth"; // Better Auth - commented out
// import { headers } from "next/headers"; // Better Auth - commented out

export const checkUser = async () => {
  try {
    // Better Auth check - commented out
    // try {
    //   const headersList = await headers();
    //   const session = await betterAuth.api.getSession({
    //     headers: headersList,
    //   });
    //   
    //   if (session?.user?.id || session?.data?.user?.id) {
    //     const betterAuthUserId = session.user?.id || session.data?.user?.id;
    //     const user = await db.user.findUnique({
    //       where: { betterAuthId: betterAuthUserId },
    //     });
    //     if (user) return user;
    //   }
    // } catch (betterAuthError) {
    //   // Better Auth not available or not authenticated, continue to Clerk
    // }

    // Use Clerk authentication
    let userId = null;
    let clerkUser = null;

    try {
      const authResult = await clerkAuth();
      userId = authResult.userId;
    } catch (authError) {
      // If auth() fails (middleware not detected), fall back to currentUser()
      if (authError.message?.includes('clerkMiddleware')) {
        try {
          clerkUser = await currentUser();
          userId = clerkUser?.id || null;
        } catch (currentUserError) {
          // Both failed, user is not authenticated
          return null;
        }
      } else {
        throw authError;
      }
    }
    
    if (!userId) {
      return null;
    }

    // Get user from database using Clerk ID
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    // If user doesn't exist in our DB, get details from Clerk to create them
    if (!clerkUser) {
      try {
        clerkUser = await currentUser();
      } catch (currentUserError) {
        // If currentUser() fails, we can't create the user here
        // User creation should happen via webhook or sign-up flow
        return null;
      }
    }
    
    if (!clerkUser) {
      return null;
    }

    const name = clerkUser.firstName && clerkUser.lastName 
      ? `${clerkUser.firstName} ${clerkUser.lastName}`
      : clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress || 'User';

    // Try to create user, but handle case where they might already exist
    try {
      const newUser = await db.user.create({
        data: {
          clerkUserId: clerkUser.id,
          name,
          imageUrl: clerkUser.imageUrl || null,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
        },
      });

      return newUser;
    } catch (createError) {
      // If user already exists (unique constraint), fetch them instead
      if (createError.code === 'P2002') {
        console.log('User already exists, fetching from database');
        const existingUser = await db.user.findUnique({
          where: { clerkUserId: clerkUser.id },
        });
        if (existingUser) {
          return existingUser;
        }
      }
      throw createError;
    }
  } catch (error) {
    // Log errors in production for debugging
    console.error('Error in checkUser:', {
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
    
    // Return null to prevent breaking the app, but log the error
    return null;
  }
};
