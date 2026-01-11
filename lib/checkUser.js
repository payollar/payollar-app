import { db } from "./prisma";
import { auth as betterAuth } from "./auth";
import { headers } from "next/headers";

export const checkUser = async () => {
  try {
    // Use Better Auth for authentication
    const headersList = await headers();
    const session = await betterAuth.api.getSession({
      headers: headersList,
    });
    
    if (session?.user?.id) {
      // Better Auth uses User.id directly, so we can query by id
      const user = await db.user.findUnique({
        where: { id: session.user.id },
      });
      
      if (user) return user;
    }
    
    // No authenticated session
    return null;
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
