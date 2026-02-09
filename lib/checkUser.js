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
    // Don't log Next.js build-time warnings about dynamic rendering
    // These are expected when using headers() and are not actual errors
    if (error.message?.includes('Dynamic server usage') || 
        error.message?.includes('couldn\'t be rendered statically')) {
      // This is a Next.js build warning, not an actual error - return null silently
      return null;
    }
    
    // Log actual errors in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in checkUser:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
    }
    
    // Return null to prevent breaking the app
    return null;
  }
};
