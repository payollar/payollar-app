import { NextResponse } from "next/server";
import { sendSupportRequestEmail, sendSupportConfirmationEmail } from "@/lib/email";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, category, priority, subject, message, attachments } =
      body;

    // Validation
    if (!name || !email || !category || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (message.length < 20) {
      return NextResponse.json(
        { error: "Message must be at least 20 characters" },
        { status: 400 }
      );
    }

    const safeAttachments = Array.isArray(attachments)
      ? attachments
          .filter((file) => file && typeof file.url === "string" && file.url)
          .slice(0, 4)
          .map((file) => ({
            url: file.url,
            name: file.name || "Attachment",
            type: file.type || null,
            size: file.size || null,
          }))
      : [];

    // Send email to support team
    await sendSupportRequestEmail({
      name,
      email,
      category,
      priority: priority || "medium",
      subject,
      message,
      attachments: safeAttachments,
    });

    // Send confirmation email to user
    await sendSupportConfirmationEmail(email, name, subject);

    return NextResponse.json({
      success: true,
      message: "Support request submitted successfully",
    });
  } catch (error) {
    console.error("Error processing support request:", error);
    return NextResponse.json(
      {
        error: "Failed to submit support request",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
