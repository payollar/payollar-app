import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  // Map Better Auth image field to our imageUrl field
  user: {
    fields: {
      image: "imageUrl",
    },
    // Add role as an additional field that Better Auth will manage
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "UNASSIGNED",
        input: false, // Don't allow user to set role during signup
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production if needed
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  basePath: "/api/auth",
  plugins: [
    nextCookies(), // Enable automatic cookie handling for Next.js server actions
  ],
});
