import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "./prisma";

// Validate Google OAuth credentials
const getGoogleProviderConfig = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.warn("⚠️  Google OAuth credentials not found. Google sign-in will be disabled.");
    return {};
  }
  
  if (clientId.trim() === "" || clientSecret.trim() === "") {
    console.warn("⚠️  Google OAuth credentials are empty. Google sign-in will be disabled.");
    return {};
  }
  
  return {
    google: {
      clientId: clientId.trim(),
      clientSecret: clientSecret.trim(),
      scope: ["email", "profile"],
    },
  };
};

// Get allowed origins from environment or use defaults
const getAllowedOrigins = () => {
  const origins = [];
  
  // Add production origins
  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL);
  }
  if (process.env.BETTER_AUTH_URL) {
    origins.push(process.env.BETTER_AUTH_URL);
  }
  
  // Always add both www and non-www for payollar.com
  origins.push("https://payollar.com");
  origins.push("https://www.payollar.com");
  
  // Add localhost for development
  origins.push("http://localhost:3000");
  
  // Remove duplicates
  return [...new Set(origins)];
};

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
    sendResetPassword: async ({ user, url, token }, request) => {
      // Import email function dynamically to avoid circular dependencies
      const { sendPasswordResetEmail } = await import("./email");
      await sendPasswordResetEmail(user.email, user.name || "User", url);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      if (process.env.NODE_ENV === "development") {
        console.log("📧 Sending verification email to:", user.email);
      }
      
      try {
        // Import email function dynamically to avoid circular dependencies
        const { sendVerificationEmail } = await import("./email");
        const result = await sendVerificationEmail(user.email, user.name || "User", url, token);
        
        if (process.env.NODE_ENV === "development") {
          console.log("✅ Verification email sent:", result?.id);
        }
        
        return result;
      } catch (error) {
        console.error("❌ Failed to send verification email:", error.message);
        // Don't throw - allow sign-up to continue
        // The user can resend from the verification page
        return { error: error.message };
      }
    },
    sendOnSignUp: true, // Automatically send verification email after sign-up
    autoSignInAfterVerification: false, // Don't auto sign-in, let them complete onboarding first
    expiresIn: 60 * 60 * 24, // 24 hours
    afterEmailVerification: async (user, request) => {
      // Send welcome/onboarding email after email is verified
      try {
        const { sendWelcomeEmail } = await import("./email");
        await sendWelcomeEmail(user.email, user.name || "User");
        
        if (process.env.NODE_ENV === "development") {
          console.log("✅ Welcome email sent to:", user.email);
        }
      } catch (error) {
        console.error("❌ Failed to send welcome email:", error.message);
        // Don't throw - email failure shouldn't block verification
      }
    },
  },
  socialProviders: getGoogleProviderConfig(),
  hooks: {
    afterSignIn: async ({ user, account }, request) => {
      // Check if this is a social sign-in (Google OAuth)
      if (account?.provider === "google") {
        // Check if this is a new user (first time signing up with Google)
        try {
          // Check if user was just created (within last 60 seconds)
          // This is a heuristic - Better Auth creates the account right before this hook
          const userRecord = await db.user.findUnique({
            where: { email: user.email },
          });

          if (!userRecord) {
            if (process.env.NODE_ENV === "development") {
              console.warn("⚠️ User record not found in database for:", user.email);
            }
            return;
          }

          // Check if user was created very recently (within last 60 seconds)
          const userCreatedAt = userRecord.createdAt ? new Date(userRecord.createdAt) : null;
          const now = new Date();
          const timeDiff = userCreatedAt ? (now - userCreatedAt) : Infinity;
          const isNewUser = timeDiff < 60000; // 60 seconds

          if (isNewUser) {
            try {
              const { sendWelcomeEmail } = await import("./email");
              await sendWelcomeEmail(user.email, user.name || "User");
              
              if (process.env.NODE_ENV === "development") {
                console.log("✅ Welcome email sent to new Google user:", user.email);
              }
            } catch (error) {
              console.error("❌ Failed to send welcome email to new Google user:", error.message);
              // Don't throw - email failure shouldn't block sign-in
            }
          }
        } catch (error) {
          console.error("❌ Error checking if user is new:", error.message);
          // Don't throw - continue with sign-in
        }
      }
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  // Use the canonical domain (without www) for server-side
  // The client will use window.location.origin to match the current origin
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  basePath: "/api/auth",
  // Configure trusted origins to allow both www and non-www
  trustedOrigins: getAllowedOrigins(),
  plugins: [
    nextCookies(), // Enable automatic cookie handling for Next.js server actions
  ],
});
