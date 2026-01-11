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
  // Database hooks to sync Better Auth user with our User table
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            // Better Auth creates the User record directly, so we just need to set default role
            // if it's a new user (not migrated from Clerk)
            const dbUser = await db.user.findUnique({
              where: { id: user.id },
            });
            
            if (dbUser && !dbUser.role) {
              await db.user.update({
                where: { id: user.id },
                data: {
                  role: "UNASSIGNED", // User will select role during onboarding
                },
              });
            }
          } catch (error) {
            console.error("Error updating user after Better Auth signup:", error);
          }
        },
      },
    },
  },
});
