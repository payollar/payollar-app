import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const isProtectedRoute = (pathname) => {
  const protectedPaths = [
    "/",
    "/talents",
    "/onboarding",
    "/creator",
    "/client",
    "/admin",
    "/media-agency",
    "/video-call",
    "/appointments",
    "/store",
    "/campaigns",
    "/media",
    "/products",
  ];
  
  return protectedPaths.some(path => pathname.startsWith(path));
};

const isPublicRoute = (pathname) => {
  const publicPaths = [
    "/sign-in",
    "/sign-up",
    "/media-agency/sign-in",
    "/media-agency/sign-up",
    "/forgot-password",
    "/reset-password",
    "/api/webhooks",
    "/api/auth", // All Better Auth routes including /api/auth/check-session
  ];
  
  return publicPaths.some(path => pathname.startsWith(path));
};

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;
  let response;

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    // For API routes, always allow them through without redirects
    if (pathname.startsWith('/api/')) {
      response = NextResponse.next();
      response.headers.set("x-pathname", pathname);
      return response;
    }
    
    // For non-API public routes, check if user is already authenticated
    const sessionCookie = getSessionCookie(req);
    if (sessionCookie) {
      // If user is already signed in, redirect based on their role
      // We'll let the client-side handle the role check for better UX
      // For now, redirect to home - the app will handle role-based routing
      response = NextResponse.redirect(new URL("/", req.url));
      response.headers.set("x-pathname", pathname);
      return response;
    }
    response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  }

  // Check Better Auth session cookie (Edge Runtime compatible)
  // Note: This only checks for cookie existence, not validation
  // Full validation happens in server components/actions
  const sessionCookie = getSessionCookie(req);
  const isAuthenticated = !!sessionCookie;

  // Redirect unauthenticated users to sign-in for protected routes
  if (!isAuthenticated && isProtectedRoute(pathname)) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    response = NextResponse.redirect(signInUrl);
    response.headers.set("x-pathname", pathname);
    return response;
  }

  // Add pathname to headers for layout to check - ALWAYS set it for all responses
  response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
