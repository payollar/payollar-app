import { NextResponse } from "next/server";
import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Ensure we're using Node.js runtime, not Edge

export async function GET(request) {
  try {
    const headersList = await headers();
    const session = await betterAuth.api.getSession({
      headers: headersList,
    });
    
    // Always return JSON, never HTML
    if (session?.user) {
      const response = NextResponse.json({
        user: session.user,
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
    console.error("Error checking session:", error);
    // Always return JSON even on error
    const response = NextResponse.json(
      { 
        error: "Failed to check session", 
        user: null, 
        session: null 
      },
      { status: 500 }
    );
    response.headers.set('Content-Type', 'application/json');
    return response;
  }
}
