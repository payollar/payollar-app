"use client";

import { createAuthClient } from "better-auth/react";

// Get the base URL dynamically from the current origin to handle www vs non-www
// This ensures the client always uses the correct origin (www or non-www)
const getBaseURL = () => {
  // In browser, always use current origin to match www/non-www
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // Fallback for SSR - but this should rarely be used since this is a client component
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

// Create auth client with dynamic baseURL
// The baseURL will be evaluated when the module loads on the client side
export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  basePath: "/api/auth",
});

export const { signIn, signUp, signOut, useSession, getSession, forgetPassword, resetPassword, sendVerificationEmail } = authClient;

// Export Google sign-in helper
export const signInWithGoogle = async (callbackURL = "/onboarding") => {
  try {
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });
    return result;
  } catch (error) {
    console.error("Google sign-in error:", error);
    // Re-throw with more context
    throw new Error(
      error.message || "Failed to initiate Google sign-in. Please check your Google OAuth configuration."
    );
  }
};
