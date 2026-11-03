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
    "/messages",
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
    "/api/mcp",
    "/.well-known",
  ];
  
  return publicPaths.some(path => pathname.startsWith(path));
};

function withPathname(req, response) {
  const pathname = req.nextUrl.pathname;
  response.headers.set("x-pathname", pathname);
  return response;
}

function nextWithPathname(req) {
  const pathname = req.nextUrl.pathname;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("x-pathname", pathname);
  return response;
}

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;

  // Marketing page: visible signed in or out, without the auth-page redirect.
  if (
    pathname === "/clip" ||
    pathname.startsWith("/clip/") ||
    pathname === "/academy" ||
    pathname.startsWith("/academy/")
  ) {
    return nextWithPathname(req);
  }

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    // For API routes, always allow them through without redirects
    if (pathname.startsWith("/api/")) {
      return nextWithPathname(req);
    }

    // For non-API public routes, check if user is already authenticated
    const sessionCookie = getSessionCookie(req);
    if (sessionCookie) {
      // If user is already signed in, redirect based on their role
      // We'll let the client-side handle the role check for better UX
      // For now, redirect to home - the app will handle role-based routing
      return withPathname(req, NextResponse.redirect(new URL("/", req.url)));
    }
    return nextWithPathname(req);
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
    return withPathname(req, NextResponse.redirect(signInUrl));
  }

  return nextWithPathname(req);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
