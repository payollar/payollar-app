import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
// import { getSessionCookie } from "better-auth/cookies"; // Better Auth - commented out

const isProtectedRoute = createRouteMatcher([
  "/",
  "/talents(.*)",
  "/onboarding(.*)",
  "/creator(.*)",
  "/client(.*)",
  "/admin(.*)",
  "/video-call(.*)",
  "/appointments(.*)",
  "/store(.*)",
  "/campaigns(.*)",
  "/media(.*)",
  "/products(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)", // Webhook routes should be public
  // "/api/auth(.*)", // Better Auth routes - commented out
  // "/api/migrate-user(.*)", // Migration route - commented out
]);

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;

  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    const { userId } = await auth();
    if (userId) {
      // If user is already signed in, redirect to landing page
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Better Auth check - commented out
  // let isAuthenticated = false;
  // try {
  //   const betterAuthCookie = getSessionCookie(req);
  //   if (betterAuthCookie) {
  //     isAuthenticated = true;
  //   }
  // } catch (error) {
  //   // Better Auth cookie check failed, will fall back to Clerk
  // }

  // Use Clerk authentication
  const { userId } = await auth();
  const isAuthenticated = !!userId;

  // Redirect unauthenticated users to sign-in for protected routes
  if (!isAuthenticated && isProtectedRoute(req)) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Add pathname to headers for layout to check
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
