"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
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
