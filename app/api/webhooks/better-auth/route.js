import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

/**
 * Webhook to handle Better Auth user creation
 * This creates a user record in our database when a user signs up with Better Auth
 */
export async function POST(req) {
  try {
    const body = await req.json();
    
    // Better Auth sends different event types
    // We're interested in user.created events
    if (body.event === "user.created" || body.type === "user.created") {
      const { user } = body;
      
      if (!user || !user.email) {
        return NextResponse.json(
          { error: "Invalid user data" },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email: user.email },
      });

      if (existingUser) {
        // Update existing user with Better Auth ID if not set
        if (!existingUser.betterAuthId && user.id) {
          await db.user.update({
            where: { id: existingUser.id },
            data: {
              betterAuthId: user.id,
              emailVerified: user.emailVerified || false,
              emailVerifiedAt: user.emailVerifiedAt ? new Date(user.emailVerifiedAt) : null,
            },
          });
        }
        return NextResponse.json({ success: true, message: "User updated" });
      }

      // Create new user
      const newUser = await db.user.create({
        data: {
          betterAuthId: user.id,
          email: user.email,
          name: user.name || null,
          imageUrl: user.image || null,
          emailVerified: user.emailVerified || false,
          emailVerifiedAt: user.emailVerifiedAt ? new Date(user.emailVerifiedAt) : null,
          role: "UNASSIGNED", // User will select role during onboarding
        },
      });

      // Send welcome email (don't block on email failure)
      if (newUser.email) {
        try {
          await sendWelcomeEmail(newUser.email, newUser.name || "there");
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
          // Continue even if email fails
        }
      }

      return NextResponse.json({ success: true, user: newUser });
    }

    // Handle other events if needed
    return NextResponse.json({ success: true, message: "Event received" });
  } catch (error) {
    console.error("Better Auth webhook error:", error);
    
    // Handle duplicate user error gracefully
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: true, message: "User already exists" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
