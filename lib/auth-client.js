"use client";

import { createAuthClient } from "better-auth/react";

// Always use the current origin to avoid CORS issues (handles www vs non-www)
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // Fallback for SSR (shouldn't happen in client component, but just in case)
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include", // Always include credentials (cookies)
  },
});

export const { signIn, signUp, signOut, useSession, getSession, forgetPassword, resetPassword } = authClient;
