import { NextResponse } from "next/server";
import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Ensure we're using Node.js runtime, not Edge

// Helper to add timeout to async operations
function withTimeout(promise, timeoutMs = 2000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
    )
  ]);
}

export async function GET(request) {
  try {
    const headersList = await headers();
    
    // Add timeout to prevent hanging
    let session;
    try {
      session = await withTimeout(
        betterAuth.api.getSession({
          headers: headersList,
        }),
        2000 // 2 second timeout
      );
    } catch (timeoutError) {
      // Return null session on timeout instead of error
      const response = NextResponse.json({ 
        user: null, 
        session: null
      });
      response.headers.set('Content-Type', 'application/json');
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return response;
    }
    
    // Always return JSON, never HTML
    if (session?.user) {
      // Prefer live DB role so dashboard links stay correct after role changes
      let user = session.user;
      try {
        const dbUser = await db.user.findUnique({
          where: { id: session.user.id },
          select: { role: true, name: true, email: true, imageUrl: true },
        });
        if (dbUser) {
          user = {
            ...session.user,
            role: dbUser.role,
            name: dbUser.name || session.user.name,
            email: dbUser.email || session.user.email,
            image: dbUser.imageUrl || session.user.image,
          };
        }
      } catch {
        /* fall back to session user */
      }

      const response = NextResponse.json({
        user,
        session: session.session,
      });
      response.headers.set('Content-Type', 'application/json');
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return response;
    }
    
    const response = NextResponse.json({ 
      user: null, 
      session: null 
    });
    response.headers.set('Content-Type', 'application/json');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error("Error checking session:", error);
    }
    // Always return JSON even on error
    const response = NextResponse.json(
      { 
        user: null, 
        session: null 
      },
      { status: 200 }
    );
    response.headers.set('Content-Type', 'application/json');
    return response;
  }
}
