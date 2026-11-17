"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { sendPostVerificationWelcome } from "@/lib/email";

/**
 * Backup trigger after OTP success on /verify-email.
 * Deduped with the Better Auth onEmailVerification hook.
 */
export async function triggerPostVerifyWelcome() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const email = session?.user?.email;
    if (!email) {
      return { success: false, skipped: true, reason: "no-session" };
    }

    return await sendPostVerificationWelcome(
      email,
      session.user.name || "User"
    );
  } catch (error) {
    console.error(
      "triggerPostVerifyWelcome failed:",
      error?.message || error
    );
    return { success: false, error: error?.message || String(error) };
  }
}
