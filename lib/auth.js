import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins/email-otp";
import { db } from "./prisma";

/** Generic onboarding welcome only while role is still unassigned. */
async function maybeSendPostVerifyWelcome(user) {
  try {
    const email = user?.email;
    if (!email) return;

    const { sendPostVerificationWelcome } = await import("./email");
    const result = await sendPostVerificationWelcome(
      email,
      user.name || "User"
    );

    if (process.env.NODE_ENV === "development" && result?.success) {
      console.log("✅ Welcome email sent to:", email);
    }
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error.message);
  }
}

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

  // Temporary subdomain while primary DNS propagates
  origins.push("https://payollar.skyland-technology.com");
  
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
    // Link-based send is overridden by emailOTP (overrideDefaultEmailVerification).
    // Keep a fallback for any callers that still request a magic link.
    sendVerificationEmail: async ({ user, url, token }, request) => {
      if (process.env.NODE_ENV === "development") {
        console.log("📧 Sending verification email (link fallback) to:", user.email);
      }

      try {
        const { sendVerificationEmail } = await import("./email");
        const result = await sendVerificationEmail(
          user.email,
          user.name || "User",
          url,
          token
        );

        if (process.env.NODE_ENV === "development") {
          console.log("✅ Verification email sent:", result?.id);
        }

        return result;
      } catch (error) {
        console.error("❌ Failed to send verification email:", error.message);
        return { error: error.message };
      }
    },
    // Must be true with emailOTP.overrideDefaultEmailVerification so signup
    // triggers the overridden sendVerificationEmail → OTP email.
    // (The plugin's own signup hook is disabled when override is on.)
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    // OTP verify only calls onEmailVerification; link verify also calls afterEmailVerification.
    onEmailVerification: async (user) => {
      await maybeSendPostVerifyWelcome(user);
    },
    afterEmailVerification: async (user) => {
      await maybeSendPostVerifyWelcome(user);
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
            // Media agency Google signup gets a role-specific welcome from set-role.
            const callbackHint =
              typeof request?.url === "string"
                ? request.url
                : request?.headers?.get?.("referer") || "";
            const isMediaAgencySignup =
              userRecord.role === "MEDIA_AGENCY" ||
              String(callbackHint).includes("media_agency=true") ||
              String(callbackHint).includes("/media-agency/");

            if (isMediaAgencySignup) {
              if (process.env.NODE_ENV === "development") {
                console.log(
                  "⏭️ Skipping generic Google welcome — media agency path"
                );
              }
              return;
            }
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
  // Use the canonical domain for server-side
  // Note: The client will use window.location.origin to match the current origin (www or non-www)
  // For OAuth redirects, Better Auth will use the request's origin to determine the redirect URL
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  basePath: "/api/auth",
  // Configure trusted origins to allow both www and non-www
  trustedOrigins: getAllowedOrigins(),
  plugins: [
    nextCookies(), // Enable automatic cookie handling for Next.js server actions
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 10, // 10 minutes
      allowedAttempts: 5,
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      storeOTP: "hashed",
      sendVerificationOTP: async ({ email, otp, type }) => {
        if (type !== "email-verification") return;

        try {
          const normalized = String(email || "").trim().toLowerCase();
          const user = await db.user.findFirst({
            where: { email: { equals: normalized, mode: "insensitive" } },
            select: { name: true },
          });
          const { sendVerificationOtpEmail } = await import("./email");
          await sendVerificationOtpEmail(
            normalized,
            user?.name || "there",
            otp
          );

          if (process.env.NODE_ENV === "development") {
            console.log("✅ Verification OTP emailed to:", normalized);
          }
        } catch (error) {
          console.error("❌ Failed to send verification OTP:", error.message);
          // Don't throw — signup should continue; user can resend from /verify-email
        }
      },
    }),
  ],
});
