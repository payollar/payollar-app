import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Resend only accepts From addresses on a verified domain.
 * Verified domain is payollar.com — never send from info.payollar.com.
 */
function resolveResendAddress(value, fallback) {
  const raw = String(value || fallback || "")
    .trim()
    .replace(/^["']|["']$/g, "");
  if (!raw) return fallback;
  // Map legacy subdomain → apex verified domain
  return raw.replace(/@info\.payollar\.com\b/gi, "@payollar.com");
}

// Default from email — verified domain in Resend (payollar.com)
const FROM_EMAIL = resolveResendAddress(
  process.env.RESEND_FROM_EMAIL,
  "noreply@payollar.com"
);
// Business email for receiving form submissions and queries
const SUPPORT_EMAIL = resolveResendAddress(
  process.env.RESEND_SUPPORT_EMAIL || process.env.SUPPORT_EMAIL,
  "support@payollar.com"
);

if (process.env.NODE_ENV === "development") {
  console.log("📧 Resend From:", FROM_EMAIL, "| Support:", SUPPORT_EMAIL);
}

/** Resend often returns { error } without throwing — treat that as failure. */
function assertResendResult(result, label) {
  if (result?.error) {
    const message =
      result.error.message ||
      result.error.name ||
      `Resend rejected ${label || "email"}`;
    throw new Error(message);
  }
  return result;
}

const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.BETTER_AUTH_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

/** Live site — email clients cannot load localhost / preview URLs for images. */
const EMAIL_PUBLIC_ORIGIN = "https://www.payollar.com";

/**
 * Absolute base URL for email assets (logo). Never use localhost.
 * Override with EMAIL_ASSET_BASE_URL when needed.
 */
function resolveEmailAssetBaseUrl() {
  const explicit = String(process.env.EMAIL_ASSET_BASE_URL || "")
    .trim()
    .replace(/\/$/, "");
  if (explicit) return explicit;

  const app = APP_URL;
  if (
    !app ||
    /localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]/i.test(app) ||
    app.startsWith("http://")
  ) {
    return EMAIL_PUBLIC_ORIGIN;
  }
  return app;
}

const EMAIL_ASSET_BASE = resolveEmailAssetBaseUrl();
const EMAIL_LOGO_URL = `${EMAIL_ASSET_BASE}/icons/Payollar-logo.png`;

/** Consistent logo markup for all transactional emails. */
function emailLogoImg({ width = 132, height = 32 } = {}) {
  return `<img src="${EMAIL_LOGO_URL}" alt="Payollar" width="${width}" height="${height}" style="display:block;border:0;outline:none;text-decoration:none;height:${height}px;width:auto;max-width:${Math.max(width, 140)}px;" />`;
}

if (process.env.NODE_ENV === "development") {
  console.log("📧 Email logo URL:", EMAIL_LOGO_URL);
}

/** Dedupe post-verify welcome if auth hook + verify page both fire. */
const recentPostVerifyWelcomes = new Set();

/**
 * Send a support request email to the support team
 */
export async function sendSupportRequestEmail(data) {
  const {
    name,
    email,
    category,
    priority,
    subject,
    message,
    attachments = [],
  } = data;

  const attachmentList = Array.isArray(attachments)
    ? attachments.filter((file) => file?.url)
    : [];
  const attachmentsHtml =
    attachmentList.length > 0
      ? `
              <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h3 style="color: #111827; margin-top: 0; font-size: 18px;">Attachments</h3>
                <ul style="margin: 0; padding-left: 18px; color: #374151;">
                  ${attachmentList
                    .map(
                      (file) =>
                        `<li style="margin-bottom: 8px;"><a href="${file.url}" style="color: #0055ff; text-decoration: none;">${
                          file.name || "Attachment"
                        }</a></li>`
                    )
                    .join("")}
                </ul>
              </div>`
      : "";

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: SUPPORT_EMAIL,
      replyTo: email,
      subject: `[${String(priority || "medium").toUpperCase()}] Support Request: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">New Support Request</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Request Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600; width: 120px;">Name:</td>
                    <td style="padding: 8px 0; color: #111827;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Email:</td>
                    <td style="padding: 8px 0; color: #111827;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Category:</td>
                    <td style="padding: 8px 0; color: #111827;">${category}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Subject:</td>
                    <td style="padding: 8px 0; color: #111827;">${subject}</td>
                  </tr>
                </table>
              </div>
              <div style="background: white; padding: 20px; border-radius: 8px;">
                <h3 style="color: #111827; margin-top: 0; font-size: 18px;">Message</h3>
                <div style="color: #374151; white-space: pre-wrap; line-height: 1.8;">${message}</div>
              </div>
              ${attachmentsHtml}
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  You can reply directly to this email to respond to the user.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("Error sending support request email:", error);
    throw error;
  }
}

/**
 * Send confirmation email to user after submitting support request
 */
export async function sendSupportConfirmationEmail(userEmail, userName, subject) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `Support Request Received: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Support Request Received</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="color: #111827; font-size: 16px;">Hi ${userName || "there"},</p>
              <p style="color: #374151;">
                Thank you for contacting Payollar support. We've received your request regarding:
              </p>
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <strong style="color: #111827;">${subject}</strong>
              </div>
              <p style="color: #374151;">
                Our support team will review your request and get back to you as soon as possible. 
                We typically respond within 24 hours, but urgent issues may receive faster responses.
              </p>
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h3 style="color: #1e40af; margin-top: 0; font-size: 16px;">What happens next?</h3>
                <ul style="color: #374151; margin: 0; padding-left: 20px;">
                  <li>Our team will review your request</li>
                  <li>We'll respond via email with a solution or follow-up questions</li>
                  <li>For urgent issues, you may receive a response within a few hours</li>
                </ul>
              </div>
              <p style="color: #374151;">
                If you have any additional information or questions, please reply to this email.
              </p>
              <p style="color: #374151; margin-top: 30px;">
                Best regards,<br>
                <strong>The Payollar Support Team</strong>
              </p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  This is an automated confirmation email. Please do not reply to this message.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Error sending support confirmation email:", error);
    throw error;
  }
}

/**
 * Send verification status email to creator
 */
export async function sendVerificationStatusEmail(userEmail, userName, status, reason = null) {
  const isVerified = status === "VERIFIED";
  const isRejected = status === "REJECTED";

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: isVerified 
        ? "🎉 Your Payollar Account Has Been Verified!" 
        : isRejected 
        ? "Account Verification Update" 
        : "Verification Status Update",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, ${
              isVerified ? "#10b981" : isRejected ? "#ef4444" : "#f59e0b"
            } 0%, ${
              isVerified ? "#059669" : isRejected ? "#dc2626" : "#d97706"
            } 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">
                ${isVerified ? "Account Verified!" : isRejected ? "Verification Declined" : "Verification in Progress"}
              </h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="color: #111827; font-size: 16px;">Hi ${userName || "there"},</p>
              ${
                isVerified
                  ? `
                    <p style="color: #374151;">
                      Great news! Your Payollar creator account has been verified and approved. 
                      You can now start using all the features of the platform.
                    </p>
                    <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                      <h3 style="color: #065f46; margin-top: 0; font-size: 16px;">What's next?</h3>
                      <ul style="color: #047857; margin: 0; padding-left: 20px;">
                        <li>Complete your profile with portfolio links and skills</li>
                        <li>Set your availability for bookings</li>
                        <li>Start receiving booking requests from clients</li>
                        <li>Create and publish your digital products</li>
                      </ul>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/creator" 
                         style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                        Go to Dashboard
                      </a>
                    </div>
                  `
                  : isRejected
                  ? `
                    <p style="color: #374151;">
                      We've reviewed your verification application, and unfortunately, it doesn't meet our current requirements.
                    </p>
                    ${reason ? `
                      <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                        <h3 style="color: #991b1b; margin-top: 0; font-size: 16px;">Reason:</h3>
                        <p style="color: #7f1d1d; margin: 0;">${reason}</p>
                      </div>
                    ` : `
                      <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                        <h3 style="color: #991b1b; margin-top: 0; font-size: 16px;">Common reasons for rejection:</h3>
                        <ul style="color: #7f1d1d; margin: 0; padding-left: 20px;">
                          <li>Insufficient or unclear credential documentation</li>
                          <li>Professional experience requirements not met</li>
                          <li>Incomplete or vague service description</li>
                        </ul>
                      </div>
                    `}
                    <p style="color: #374151;">
                      You can update your profile with more information and resubmit for review.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/creator/profile" 
                         style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                        Update Profile
                      </a>
                    </div>
                  `
                  : `
                    <p style="color: #374151;">
                      Your verification application is currently under review by our administrative team. 
                      This process typically takes 1-2 business days.
                    </p>
                    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                      <p style="color: #92400e; margin: 0;">
                        <strong>What to expect:</strong> You'll receive an email notification once your account is verified. 
                        In the meantime, you can familiarize yourself with our platform.
                      </p>
                    </div>
                  `
              }
              <p style="color: #374151; margin-top: 30px;">
                If you have any questions, please don't hesitate to contact our support team.
              </p>
              <p style="color: #374151; margin-top: 30px;">
                Best regards,<br>
                <strong>The Payollar Team</strong>
              </p>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Error sending verification status email:", error);
    throw error;
  }
}

/**
 * Send email verification email with verification link
 */
export async function sendVerificationEmail(userEmail, userName, verificationUrl, token) {
  if (process.env.NODE_ENV === "development") {
    console.log("📧 Sending verification email to:", userEmail);
  }
  
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is not set!");
    throw new Error("Email service is not configured. Please contact support.");
  }

  // Create plain text version for better deliverability
  const plainText = `Hi ${userName || "there"},

Thank you for signing up for Payollar! To complete your registration and secure your account, please verify your email address by clicking the link below:

${verificationUrl}

This verification link will expire in 24 hours for your security.

If you didn't create a Payollar account, you can safely ignore this email.

Best regards,
The Payollar Team`;

  try {
    const result = await resend.emails.send({
      from: `Payollar <${FROM_EMAIL}>`, // Use friendly name for better deliverability
      to: userEmail,
      subject: "Verify Your Payollar Email Address",
      text: plainText, // Add plain text version
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Verify Your Email</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="color: #111827; font-size: 16px; margin: 0 0 16px 0;">Hi ${userName || "there"},</p>
              <p style="color: #374151; margin: 0 0 16px 0;">
                Thank you for signing up for Payollar! To complete your registration and secure your account, 
                please verify your email address by clicking the button below.
              </p>
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <p style="color: #1e40af; margin: 0;">
                  <strong>Security Note:</strong> This verification link will expire in 24 hours for your security.
                </p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #3b82f6; font-size: 12px; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; margin: 10px 0;">
                ${verificationUrl}
              </p>
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  <strong>Didn't sign up?</strong> If you didn't create a Payollar account, you can safely ignore this email.
                </p>
              </div>
              <p style="color: #374151; margin-top: 30px;">
                Best regards,<br>
                <strong>The Payollar Team</strong>
              </p>
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  This email was sent to ${userEmail}. If you didn't sign up for Payollar, please ignore this email.
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
                  © ${new Date().getFullYear()} Payollar. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      headers: {
        "X-Entity-Ref-ID": token || "verification", // Add tracking header
      },
      tags: [
        { name: "category", value: "verification" },
        { name: "type", value: "email-verification" },
      ],
    });
    
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Verification email sent:", result.data?.id);
    }
    
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("❌ Error sending verification email:", error.message);
    
    // Provide more helpful error messages
    if (error.message?.includes("domain") || error.message?.includes("from")) {
      throw new Error("Email configuration error. Please use a verified domain or Resend test domain.");
    }
    
    throw error;
  }
}

/**
 * Send a 6-digit email verification code (Better Auth email OTP).
 */
export async function sendVerificationOtpEmail(userEmail, userName, otp) {
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is not set!");
    throw new Error("Email service is not configured. Please contact support.");
  }

  if (!userEmail || !otp) {
    throw new Error("Email and OTP are required");
  }

  const appUrl = APP_URL;
  const safeName = String(userName || "there")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const safeOtp = String(otp).replace(/[^\d]/g, "").slice(0, 8);
  const verifyUrl = `${appUrl}/verify-email`;

  const plainText = `Hi ${userName || "there"},

Your Payollar verification code is: ${safeOtp}

Enter this code on the verification page to confirm your email.
It expires in 10 minutes.

Verify here: ${verifyUrl}

If you didn't create a Payollar account, you can ignore this email.

— The Payollar Team`;

  try {
    const result = assertResendResult(
      await resend.emails.send({
      from: `Payollar <${FROM_EMAIL}>`,
      to: userEmail,
      subject: `${safeOtp} is your Payollar verification code`,
      text: plainText,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background:#f4f1ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f1ea;">
    <tr>
      <td align="center" style="padding:28px 16px 40px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;">
          <tr>
            <td style="padding:8px 8px 20px;">
              ${emailLogoImg({ width: 132, height: 32 })}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 8px 24px;">
              <p style="margin:0 0 10px;color:#64748b;font-size:12px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;">Email verification</p>
              <h1 style="margin:0;color:#0f172a;font-size:32px;line-height:1.15;font-weight:700;letter-spacing:-0.03em;">Enter this code</h1>
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 18px 40px rgba(15,23,42,0.06);">
                <tr>
                  <td style="padding:32px 28px;">
                    <p style="margin:0 0 14px;color:#0f172a;font-size:16px;">Hi ${safeName},</p>
                    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.65;">
                      Use the verification code below to confirm your email and finish setting up Payollar.
                    </p>
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:22px 16px;text-align:center;margin:0 0 22px;">
                      <p style="margin:0 0 8px;color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">Your code</p>
                      <p style="margin:0;color:#0f172a;font-size:36px;font-weight:700;letter-spacing:0.28em;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">
                        ${safeOtp}
                      </p>
                    </div>
                    <p style="margin:0 0 22px;color:#64748b;font-size:13px;line-height:1.5;">
                      This code expires in <strong style="color:#0f172a;">10 minutes</strong>. Don’t share it with anyone.
                    </p>
                    <a href="${verifyUrl}" style="display:inline-block;background:#0055ff;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 22px;border-radius:12px;">
                      Open verification page
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 12px 0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
                Didn’t sign up? You can ignore this email.<br />
                © ${new Date().getFullYear()} Payollar
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      tags: [
        { name: "category", value: "verification" },
        { name: "type", value: "email-otp" },
      ],
    }),
      "verification OTP"
    );

    if (process.env.NODE_ENV === "development") {
      console.log("✅ Verification OTP email sent:", result.data?.id);
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("❌ Error sending verification OTP email:", error.message);
    throw error;
  }
}

const ROLE_WELCOME = {
  CLIENT: {
    label: "Client account",
    subject: "Welcome to Payollar — you're ready to book",
    headline: "You're in. Let's get booking.",
    intro:
      "Your client account is ready. Find talent, run campaigns, or buy media whenever you need reach across Ghana.",
    ctaLabel: "Open Payollar",
    ctaPath: "/",
    nextSteps: [
      { title: "Find talent", detail: "Browse creators and book a session." },
      { title: "Launch a campaign", detail: "Post a brief and review applications." },
      { title: "Buy media", detail: "Request packages from TV, radio, digital, and billboard partners." },
    ],
  },
  CREATOR: {
    label: "Creator account",
    subject: "Welcome to Payollar — profile submitted",
    headline: "Welcome — your profile is in review",
    intro:
      "Thanks for joining as a creator. We've received your profile and will review it shortly. You'll get another email when you're verified.",
    ctaLabel: "Check verification status",
    ctaPath: "/creator/verification",
    nextSteps: [
      { title: "Sit tight for review", detail: "We'll email you when you're approved." },
      { title: "Polish your portfolio", detail: "Keep links and work samples up to date." },
      { title: "Get ready to book", detail: "Once verified, set availability and start getting hired." },
    ],
  },
  MEDIA_AGENCY: {
    label: "Media agency",
    subject: "Welcome to Payollar — your agency portal is ready",
    headline: "Welcome to your agency portal",
    intro:
      "Your media agency account is live. Add listings and packages so brands can discover you on the Media marketplace.",
    ctaLabel: "Open agency dashboard",
    ctaPath: "/media-agency",
    nextSteps: [
      { title: "Finish Settings", detail: "Confirm agency name, contact, location, and media type." },
      {
        title: "Publish your rates",
        detail:
          "TV/radio: Smart rate card (Ad Type Sections). Billboard/digital: Custom packages.",
      },
      { title: "Watch Negotiations", detail: "You’ll get an email when a buyer wants to talk price." },
    ],
  },
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Shared Miro-inspired welcome layout: soft canvas, logo, hero, white card, CTA.
 */
function buildBrandedWelcomeHtml({
  eyebrow,
  headline,
  greetingName,
  intro,
  metaLine,
  steps = [],
  ctaLabel,
  ctaUrl,
  recipientEmail,
}) {
  const safeName = escapeHtml(greetingName || "there");
  const safeEyebrow = escapeHtml(eyebrow || "Welcome");
  const safeHeadline = escapeHtml(headline);
  const safeIntro = escapeHtml(intro);
  const safeMeta = metaLine ? escapeHtml(metaLine) : "";
  const safeCta = escapeHtml(ctaLabel);
  const year = new Date().getFullYear();

  const stepsRows = steps
    .map((step, index) => {
      const title = typeof step === "string" ? step : step.title;
      const detail = typeof step === "string" ? "" : step.detail || "";
      return `
        <tr>
          <td style="padding: 0 0 16px 0; vertical-align: top; width: 36px;">
            <div style="width: 28px; height: 28px; border-radius: 999px; background: #eef3ff; color: #0055ff; font-size: 13px; font-weight: 700; line-height: 28px; text-align: center;">
              ${index + 1}
            </div>
          </td>
          <td style="padding: 0 0 16px 8px; vertical-align: top;">
            <p style="margin: 0; color: #0f172a; font-size: 15px; font-weight: 600; line-height: 1.35;">
              ${escapeHtml(title)}
            </p>
            ${
              detail
                ? `<p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.5;">${escapeHtml(detail)}</p>`
                : ""
            }
          </td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeHeadline}</title>
</head>
<body style="margin: 0; padding: 0; background: #f4f1ea; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #f4f1ea;">
    <tr>
      <td align="center" style="padding: 28px 16px 40px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px;">
          <tr>
            <td style="padding: 8px 8px 20px;">
              <a href="${APP_URL}" style="text-decoration: none;">
                ${emailLogoImg({ width: 132, height: 32 })}
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding: 8px 8px 28px;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 12px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;">
                ${safeEyebrow}
              </p>
              <h1 style="margin: 0; color: #0f172a; font-size: 34px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em;">
                ${safeHeadline}
              </h1>
            </td>
          </tr>

          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);">
                <tr>
                  <td style="padding: 32px 28px 12px;">
                    <p style="margin: 0 0 14px; color: #0f172a; font-size: 16px; line-height: 1.5;">
                      Hi ${safeName},
                    </p>
                    <p style="margin: 0 0 14px; color: #475569; font-size: 15px; line-height: 1.65;">
                      ${safeIntro}
                    </p>
                    ${
                      safeMeta
                        ? `<p style="margin: 0 0 8px; color: #475569; font-size: 14px; line-height: 1.5;"><strong style="color:#0f172a;">Agency:</strong> ${safeMeta}</p>`
                        : ""
                    }
                  </td>
                </tr>

                ${
                  steps.length
                    ? `<tr>
                  <td style="padding: 8px 28px 8px;">
                    <p style="margin: 0 0 14px; color: #94a3b8; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;">
                      Next steps
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      ${stepsRows}
                    </table>
                  </td>
                </tr>`
                    : ""
                }

                <tr>
                  <td style="padding: 12px 28px 28px;">
                    <a href="${ctaUrl}" style="display: inline-block; background: #0055ff; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 22px; border-radius: 12px;">
                      ${safeCta}
                    </a>
                    <p style="margin: 18px 0 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">
                      Or paste this link into your browser:<br />
                      <a href="${ctaUrl}" style="color: #0055ff; word-break: break-all;">${escapeHtml(ctaUrl)}</a>
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 0 28px 28px; border-top: 1px solid #f1f5f9;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding-top: 22px;">
                      <tr>
                        <td style="vertical-align: middle; width: 48px;">
                          <div style="width: 44px; height: 44px; border-radius: 999px; background: #0055ff; color: #ffffff; font-size: 16px; font-weight: 700; line-height: 44px; text-align: center;">
                            P
                          </div>
                        </td>
                        <td style="padding-left: 12px; vertical-align: middle;">
                          <p style="margin: 0; color: #0f172a; font-size: 14px; font-weight: 700;">The Payollar Team</p>
                          <p style="margin: 2px 0 0; color: #94a3b8; font-size: 13px;">Talent, campaigns & media buying</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 12px 0; text-align: center;">
              <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px; line-height: 1.6;">
                Questions? <a href="mailto:${SUPPORT_EMAIL}" style="color: #0055ff; text-decoration: none;">${SUPPORT_EMAIL}</a>
                · <a href="${APP_URL}/contact-support" style="color: #0055ff; text-decoration: none;">Contact support</a>
              </p>
              <p style="margin: 0; color: #cbd5e1; font-size: 11px; line-height: 1.6;">
                Sent to ${escapeHtml(recipientEmail || "")}. © ${year} Payollar.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Role-specific welcome after CLIENT / CREATOR / MEDIA_AGENCY signup completes.
 */
export async function sendRoleWelcomeEmail(userEmail, userName, role, extras = {}) {
  const config = ROLE_WELCOME[role];
  if (!config) {
    console.warn("sendRoleWelcomeEmail: unknown role", role);
    return { success: false, skipped: true };
  }

  if (!userEmail) {
    return { success: false, skipped: true };
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is not set!");
    return { success: false, error: "Email not configured" };
  }

  const ctaUrl = `${APP_URL}${config.ctaPath}`;
  const agencyLine = extras.agencyName
    ? `\nAgency: ${extras.agencyName}`
    : "";

  const plainText = `Hi ${userName || "there"},

${config.headline}

${config.intro}${agencyLine}

Next steps:
${config.nextSteps
  .map((step, i) => {
    const title = typeof step === "string" ? step : step.title;
    const detail = typeof step === "string" ? "" : step.detail;
    return `${i + 1}. ${title}${detail ? ` — ${detail}` : ""}`;
  })
  .join("\n")}

${config.ctaLabel}: ${ctaUrl}

Need help? Email ${SUPPORT_EMAIL} or visit ${APP_URL}/contact-support

— The Payollar Team`;

  try {
    const result = assertResendResult(
      await resend.emails.send({
        from: `Payollar <${FROM_EMAIL}>`,
        to: userEmail,
        subject: config.subject,
        text: plainText,
        html: buildBrandedWelcomeHtml({
          eyebrow: config.label,
          headline: config.headline,
          greetingName: userName || "there",
          intro: config.intro,
          metaLine: extras.agencyName || "",
          steps: config.nextSteps,
          ctaLabel: config.ctaLabel,
          ctaUrl,
          recipientEmail: userEmail,
        }),
        tags: [
          { name: "category", value: "welcome" },
          { name: "role", value: String(role).toLowerCase() },
        ],
      }),
      `role welcome (${role})`
    );

    if (process.env.NODE_ENV === "development") {
      console.log(`✅ Role welcome email (${role}) sent:`, result.data?.id);
    }
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error(`❌ Error sending ${role} welcome email:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Notify the Payollar team when a user finishes signup as client, creator, or media agency.
 */
export async function sendNewSignupNotificationEmail({
  name,
  email,
  role,
  agencyName,
  specialty,
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is not set!");
    return { success: false, error: "Email not configured" };
  }

  const roleLabel =
    ROLE_WELCOME[role]?.label || role || "Unknown";
  const subject = `New ${roleLabel.toLowerCase()} signup — ${name || email}`;
  const safeName = escapeHtml(name || "—");
  const safeEmail = escapeHtml(email || "—");
  const safeAgency = agencyName ? escapeHtml(agencyName) : "";
  const safeSpecialty = specialty ? escapeHtml(specialty) : "";

  const extraRows = [
    safeAgency
      ? `<tr><td style="padding:6px 0;color:#6b7280;">Agency</td><td style="padding:6px 0;color:#111827;">${safeAgency}</td></tr>`
      : "",
    safeSpecialty
      ? `<tr><td style="padding:6px 0;color:#6b7280;">Specialty</td><td style="padding:6px 0;color:#111827;">${safeSpecialty}</td></tr>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  try {
    const result = await resend.emails.send({
      from: `Payollar <${FROM_EMAIL}>`,
      to: SUPPORT_EMAIL,
      replyTo: email || undefined,
      subject,
      text: `New signup on Payollar

Role: ${roleLabel}
Name: ${name || "—"}
Email: ${email || "—"}
${agencyName ? `Agency: ${agencyName}\n` : ""}${specialty ? `Specialty: ${specialty}\n` : ""}
Time: ${new Date().toISOString()}
`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; color: #111827; max-width: 560px; margin: 0 auto; padding: 20px;">
            <h2 style="margin: 0 0 8px;">New ${escapeHtml(roleLabel.toLowerCase())} signup</h2>
            <p style="color: #6b7280; margin: 0 0 20px;">Someone just finished registering on Payollar.</p>
            <table style="width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 8px; padding: 16px;">
              <tr><td style="padding:6px 0;color:#6b7280;">Role</td><td style="padding:6px 0;color:#111827;font-weight:600;">${escapeHtml(roleLabel)}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;">Name</td><td style="padding:6px 0;color:#111827;">${safeName}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;color:#111827;"><a href="mailto:${safeEmail}" style="color:#0055ff;">${safeEmail}</a></td></tr>
              ${extraRows}
            </table>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">${escapeHtml(new Date().toLocaleString())}</p>
          </body>
        </html>
      `,
      tags: [
        { name: "category", value: "signup-notification" },
        { name: "role", value: String(role).toLowerCase() },
      ],
    });

    if (process.env.NODE_ENV === "development") {
      console.log("✅ Signup notification sent:", result.data?.id);
    }
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("❌ Error sending signup notification:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Fire-and-forget: welcome the user + notify the team.
 * Safe to call after first-time CLIENT / CREATOR / MEDIA_AGENCY assignment.
 */
export async function notifyRoleSignupEmails({
  email,
  name,
  role,
  specialty,
  agencyName,
}) {
  if (!email || !role) return { success: false, skipped: true };
  try {
    const results = await Promise.allSettled([
      sendRoleWelcomeEmail(email, name || "there", role, {
        agencyName,
        specialty,
      }),
      sendNewSignupNotificationEmail({
        name,
        email,
        role,
        specialty,
        agencyName,
      }),
    ]);
    return { success: true, results };
  } catch (error) {
    console.error(
      "notifyRoleSignupEmails failed:",
      error?.message || error
    );
    return { success: false, error: error?.message || String(error) };
  }
}

/**
 * Send welcome/onboarding email to new users after sign-up
 */
export async function sendWelcomeEmail(userEmail, userName) {
  if (process.env.NODE_ENV === "development") {
    console.log("📧 Sending welcome email to:", userEmail);
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is not set!");
    throw new Error("Email service is not configured. Please contact support.");
  }

  const ctaUrl = `${APP_URL}/onboarding`;
  const steps = [
    {
      title: "Choose your role",
      detail: "Tell us if you’re a client or a creator.",
    },
    {
      title: "Finish your profile",
      detail: "Creators submit details for verification; clients can start browsing right away.",
    },
    {
      title: "Start exploring",
      detail: "Book talent, run campaigns, or buy media when you’re ready.",
    },
  ];

  const plainText = `Hi ${userName || "there"},

Welcome to Payollar

You're now part of a community connecting creators, clients, and media agencies across Ghana.

Next steps:
1. Choose your role — client or creator
2. Finish your profile
3. Start exploring — book talent, run campaigns, or buy media

Complete onboarding: ${ctaUrl}

Need help? Email ${SUPPORT_EMAIL} or visit ${APP_URL}/contact-support

— The Payollar Team`;

  try {
    const result = assertResendResult(
      await resend.emails.send({
        from: `Payollar <${FROM_EMAIL}>`,
        to: userEmail,
        subject: "Welcome to Payollar",
        text: plainText,
        html: buildBrandedWelcomeHtml({
          eyebrow: "Welcome",
          headline: "You're on Payollar now",
          greetingName: userName || "there",
          intro:
            "We're glad you're here. Payollar connects talented creators with clients and media partners across Ghana — finish onboarding and you'll be ready to go.",
          steps,
          ctaLabel: "Complete onboarding",
          ctaUrl,
          recipientEmail: userEmail,
        }),
        headers: {
          "X-Entity-Ref-ID": "welcome-email",
        },
        tags: [
          { name: "category", value: "welcome" },
          { name: "type", value: "onboarding" },
        ],
      }),
      "welcome email"
    );

    if (process.env.NODE_ENV === "development") {
      console.log("✅ Welcome email sent:", result.data?.id);
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("❌ Error sending welcome email:", error.message);
    throw error;
  }
}

/**
 * After email OTP verify: send generic welcome while role is still UNASSIGNED.
 * Safe to call from the auth hook and the verify page (deduped briefly).
 */
export async function sendPostVerificationWelcome(email, name) {
  const normalized = String(email || "")
    .trim()
    .toLowerCase();
  if (!normalized) return { success: false, skipped: true };

  if (recentPostVerifyWelcomes.has(normalized)) {
    return { success: false, skipped: true, reason: "deduped" };
  }
  recentPostVerifyWelcomes.add(normalized);
  setTimeout(() => recentPostVerifyWelcomes.delete(normalized), 20_000);

  try {
    const { db } = await import("./prisma");
    const userRecord = await db.user.findFirst({
      where: { email: { equals: normalized, mode: "insensitive" } },
      select: { role: true, email: true, name: true },
    });

    const role = userRecord?.role;
    if (role && role !== "UNASSIGNED") {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "⏭️ Skipping post-verify welcome — role already set:",
          role
        );
      }
      return { success: false, skipped: true, reason: "role-set" };
    }

    return await sendWelcomeEmail(
      userRecord?.email || normalized,
      userRecord?.name || name || "User"
    );
  } catch (error) {
    console.error(
      "❌ Failed to send post-verify welcome:",
      error?.message || error
    );
    return { success: false, error: error?.message || String(error) };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(userEmail, userName, resetUrl) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: "Reset Your Payollar Password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset Request</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="color: #111827; font-size: 16px;">Hi ${userName || "there"},</p>
              <p style="color: #374151;">
                We received a request to reset your password for your Payollar account. 
                If you didn't make this request, you can safely ignore this email.
              </p>
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <p style="color: #1e40af; margin: 0;">
                  <strong>Security Note:</strong> This link will expire in 1 hour for your security.
                </p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                  Reset Password
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #3b82f6; font-size: 12px; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">
                ${resetUrl}
              </p>
              <p style="color: #374151; margin-top: 30px;">
                If you didn't request a password reset, please contact our support team immediately.
              </p>
              <p style="color: #374151; margin-top: 30px;">
                Best regards,<br>
                <strong>The Payollar Team</strong>
              </p>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

/**
 * Send appointment confirmation email
 */
export async function sendAppointmentConfirmationEmail(
  userEmail,
  userName,
  appointmentDetails
) {
  const { talentName, date, time, duration, type } = appointmentDetails;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `Appointment Confirmed: ${talentName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Appointment Confirmed</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="color: #111827; font-size: 16px;">Hi ${userName || "there"},</p>
              <p style="color: #374151;">
                Your appointment has been confirmed! Here are the details:
              </p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600; width: 120px;">Talent:</td>
                    <td style="padding: 8px 0; color: #111827;">${talentName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Date:</td>
                    <td style="padding: 8px 0; color: #111827;">${date}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Time:</td>
                    <td style="padding: 8px 0; color: #111827;">${time}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Duration:</td>
                    <td style="padding: 8px 0; color: #111827;">${duration} minutes</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Type:</td>
                    <td style="padding: 8px 0; color: #111827;">${type}</td>
                  </tr>
                </table>
              </div>
              <p style="color: #374151;">
                You'll receive a reminder email before your appointment. 
                If you need to reschedule or cancel, please do so at least 24 hours in advance.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/appointments" 
                   style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                  View Appointment
                </a>
              </div>
              <p style="color: #374151; margin-top: 30px;">
                Best regards,<br>
                <strong>The Payollar Team</strong>
              </p>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Error sending appointment confirmation email:", error);
    throw error;
  }
}

/**
 * Email a paid media invoice/receipt to the client after Paystack checkout.
 */
export async function sendMediaInvoiceEmail(invoice) {
  const to = invoice?.clientEmail;
  if (!to) {
    return { success: false, error: "Missing client email" };
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set — skipping media invoice email");
    return { success: false, error: "Email service not configured" };
  }

  const {
    formatMediaInvoiceMoney,
    formatMediaOrderNumber,
    resolveMediaInvoiceTaxes,
  } = await import("@/lib/media-invoice-format");
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000";
  const invoicesUrl = `${appUrl}/client/media`;
  const currency = invoice.currency || "GHS";
  const lineItems = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];
  const taxes = resolveMediaInvoiceTaxes(invoice);
  const orderNumber = formatMediaOrderNumber({
    invoiceId: invoice.id,
    createdAt: invoice.paidAt || invoice.createdAt,
    paymentReference: invoice.paymentReference,
  });
  const paidLabel = formatMediaInvoiceMoney(taxes.amount, currency);
  const paidAt = invoice.paidAt
    ? new Date(invoice.paidAt).toLocaleString("en-GH", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  const rowsHtml = lineItems
    .map((item) => {
      const meta = [item.agencyName, item.rateCardTitle, item.campaignName]
        .filter(Boolean)
        .join(" · ");
      return `
        <tr>
          <td style="padding: 12px 10px; border-top: 1px solid #e5e7eb; vertical-align: top;">
            <div style="color: #111827; font-weight: 600;">${escapeHtml(item.description || "Media airtime")}</div>
            ${
              meta
                ? `<div style="color: #6b7280; font-size: 12px; margin-top: 4px;">${escapeHtml(meta)}</div>`
                : ""
            }
          </td>
          <td style="padding: 12px 10px; border-top: 1px solid #e5e7eb; text-align: right; color: #4b5563;">
            ${escapeHtml(item.quantity || 1)}
          </td>
          <td style="padding: 12px 10px; border-top: 1px solid #e5e7eb; text-align: right; color: #111827; font-weight: 600;">
            ${escapeHtml(formatMediaInvoiceMoney(item.total, currency))}
          </td>
        </tr>`;
    })
    .join("");

  const totalsHtml = `
    <tr>
      <td colspan="2" style="padding: 6px 10px; text-align: right; color: #6b7280;">Subtotal</td>
      <td style="padding: 6px 10px; text-align: right; color: #111827;">${escapeHtml(formatMediaInvoiceMoney(taxes.subtotal, currency))}</td>
    </tr>
    <tr>
      <td colspan="2" style="padding: 6px 10px; text-align: right; color: #6b7280;">VAT (15%)</td>
      <td style="padding: 6px 10px; text-align: right; color: #111827;">${escapeHtml(formatMediaInvoiceMoney(taxes.vat, currency))}</td>
    </tr>
    <tr>
      <td colspan="2" style="padding: 6px 10px; text-align: right; color: #6b7280;">NHIL / GETFund (5%)</td>
      <td style="padding: 6px 10px; text-align: right; color: #111827;">${escapeHtml(formatMediaInvoiceMoney(taxes.nhilGetfund, currency))}</td>
    </tr>
    <tr>
      <td colspan="2" style="padding: 12px 10px; text-align: right; color: #111827; font-weight: 700; border-top: 2px solid #e5e7eb;">Total paid</td>
      <td style="padding: 12px 10px; text-align: right; color: #111827; font-weight: 700; border-top: 2px solid #e5e7eb;">${escapeHtml(paidLabel)}</td>
    </tr>`;

  const agencyLabel =
    invoice.agency?.agencyName ||
    [...new Set(lineItems.map((item) => item.agencyName).filter(Boolean))].join(
      ", "
    ) ||
    "Media station";

  const plainText = `Hi ${invoice.clientName || "there"},

Your media booking payment was received. Here's your Payollar receipt.

Invoice: ${invoice.invoiceNumber}
Order: ${orderNumber}
${invoice.title || "Media booking receipt"}
Amount paid: ${paidLabel}
Station: ${agencyLabel}
Paystack reference: ${invoice.paymentReference}
${paidAt ? `Paid at: ${paidAt}` : ""}

View your invoices: ${invoicesUrl}

Thanks,
The Payollar Team`;

  try {
    if (process.env.NODE_ENV === "development") {
      console.log("📧 Sending media invoice email to:", to, invoice.invoiceNumber);
    }

    const result = await resend.emails.send({
      from: `Payollar <${FROM_EMAIL}>`,
      to,
      subject: `Payollar receipt ${invoice.invoiceNumber} — ${paidLabel}`,
      text: plainText,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payollar invoice ${escapeHtml(invoice.invoiceNumber)}</title>
          </head>
          <body style="margin:0; padding:0; background:#eef1f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color:#0f172a;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef1f6; padding:28px 12px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e2e8f0;">
                    <tr>
                      <td style="background:#0f172a; padding:22px 24px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td align="left" style="vertical-align:middle;">
                              ${emailLogoImg({ width: 148, height: 40 })}
                            </td>
                            <td align="right" style="vertical-align:middle;">
                              <div style="color:#94a3b8; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase;">Invoice</div>
                              <div style="color:#ffffff; font-size:16px; font-weight:700; margin-top:4px;">${escapeHtml(invoice.invoiceNumber)}</div>
                              <div style="color:#94a3b8; font-size:12px; margin-top:4px;">Order · ${escapeHtml(orderNumber)}</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:28px 24px 8px;">
                        <p style="margin:0 0 8px; font-size:16px; color:#0f172a;">Hi ${escapeHtml(invoice.clientName || "there")},</p>
                        <p style="margin:0 0 22px; font-size:14px; line-height:1.6; color:#475569;">
                          Thanks for your payment. Your media booking is confirmed — this is your official Payollar receipt.
                        </p>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0f172a; border-radius:14px; margin-bottom:22px;">
                          <tr>
                            <td style="padding:18px 20px;">
                              <div style="color:#94a3b8; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase;">Amount paid</div>
                              <div style="color:#ffffff; font-size:28px; font-weight:700; margin-top:6px; letter-spacing:-0.02em;">${escapeHtml(paidLabel)}</div>
                              <div style="color:#64748b; font-size:12px; margin-top:8px;">Settled via Paystack${paidAt ? ` · ${escapeHtml(paidAt)}` : ""}</div>
                            </td>
                          </tr>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:22px;">
                          <tr>
                            <td width="50%" valign="top" style="padding-right:10px;">
                              <div style="color:#94a3b8; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">Billed to</div>
                              <div style="color:#0f172a; font-size:14px; font-weight:700; margin-top:6px;">${escapeHtml(invoice.clientName || "Client")}</div>
                              <div style="color:#64748b; font-size:13px; margin-top:2px;">${escapeHtml(invoice.clientEmail || "")}</div>
                            </td>
                            <td width="50%" valign="top" style="padding-left:10px;">
                              <div style="color:#94a3b8; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">Station / agency</div>
                              <div style="color:#0f172a; font-size:14px; font-weight:700; margin-top:6px;">${escapeHtml(agencyLabel)}</div>
                              <div style="color:#64748b; font-size:13px; margin-top:2px;">${escapeHtml(invoice.title || "Media booking receipt")}</div>
                            </td>
                          </tr>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; margin-bottom:8px;">
                          <tr style="background:#f8fafc;">
                            <th align="left" style="padding:10px 12px; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#64748b;">Item</th>
                            <th align="right" style="padding:10px 12px; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#64748b;">Qty</th>
                            <th align="right" style="padding:10px 12px; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#64748b;">Amount</th>
                          </tr>
                          ${rowsHtml || `<tr><td colspan="3" style="padding:12px; color:#64748b; font-size:13px;">Media booking payment</td></tr>`}
                          ${totalsHtml}
                        </table>

                        <p style="margin:14px 0 0; font-size:12px; color:#94a3b8;">
                          Order: ${escapeHtml(orderNumber)} · Payment reference: ${escapeHtml(invoice.paymentReference || "")}
                        </p>

                        <div style="text-align:center; margin:28px 0 8px;">
                          <a href="${invoicesUrl}"
                             style="background:#0055ff; color:#ffffff; padding:12px 28px; text-decoration:none; border-radius:999px; display:inline-block; font-weight:700; font-size:14px;">
                            View invoices in Payollar
                          </a>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 24px 24px;">
                        <div style="border-top:1px solid #e2e8f0; padding-top:18px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td align="left" style="vertical-align:middle;">
                                ${emailLogoImg({ width: 110, height: 28 })}
                              </td>
                              <td align="right" style="vertical-align:middle; color:#94a3b8; font-size:12px;">
                                support@payollar.com
                              </td>
                            </tr>
                          </table>
                          <p style="margin:14px 0 0; color:#94a3b8; font-size:12px; line-height:1.5;">
                            This receipt was issued by Payollar for your media booking. You can also find it anytime under Media → Invoices.
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      tags: [
        { name: "category", value: "media-invoice" },
        { name: "type", value: "payment-receipt" },
      ],
    });

    if (result?.error) {
      const message =
        result.error.message ||
        result.error.name ||
        "Resend rejected the media invoice email";
      console.error("❌ Media invoice email rejected:", message, {
        to,
        from: FROM_EMAIL,
        invoiceNumber: invoice.invoiceNumber,
      });
      return { success: false, error: message };
    }

    if (process.env.NODE_ENV === "development") {
      console.log("✅ Media invoice email sent:", result.data?.id);
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("Error sending media invoice email:", error);
    return { success: false, error: error.message || "Failed to send email" };
  }
}

/**
 * Shared high-impact transactional email (payment, booking, invoice, deals).
 */
async function sendTransactionalEventEmail({
  to,
  toName,
  subject,
  headline,
  intro,
  details = [],
  ctaLabel,
  ctaPath,
  tag = "transactional",
}) {
  if (!to) return { success: false, error: "Missing recipient email" };
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set — skipping", tag);
    return { success: false, error: "Email service not configured" };
  }

  const name = escapeHtml(toName || "there");
  const ctaUrl = `${APP_URL}${ctaPath || "/"}`;
  const detailRows = (Array.isArray(details) ? details : [])
    .filter((row) => row?.label && row?.value != null && row.value !== "")
    .map(
      (row) => `
        <tr>
          <td style="padding:8px 0; color:#64748b; font-size:13px; width:140px; vertical-align:top;">${escapeHtml(row.label)}</td>
          <td style="padding:8px 0; color:#0f172a; font-size:14px; font-weight:600;">${escapeHtml(row.value)}</td>
        </tr>`
    )
    .join("");

  const plainDetails = (Array.isArray(details) ? details : [])
    .filter((row) => row?.label && row?.value != null && row.value !== "")
    .map((row) => `${row.label}: ${row.value}`)
    .join("\n");

  try {
    const result = await resend.emails.send({
      from: `Payollar <${FROM_EMAIL}>`,
      to,
      subject,
      text: `Hi ${toName || "there"},

${intro}

${plainDetails}

${ctaLabel ? `${ctaLabel}: ${ctaUrl}` : ""}

Thanks,
The Payollar Team`,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="margin:0;padding:0;background:#eef1f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#0f172a;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef1f6;padding:28px 12px;">
              <tr><td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
                  <tr>
                    <td style="background:#0f172a;padding:20px 24px;">
                      ${emailLogoImg({ width: 132, height: 32 })}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px 24px 8px;">
                      <p style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Payollar</p>
                      <h1 style="margin:0;color:#0f172a;font-size:22px;line-height:1.3;">${escapeHtml(headline)}</h1>
                      <p style="margin:14px 0 0;color:#334155;font-size:15px;line-height:1.6;">Hi ${name},</p>
                      <p style="margin:8px 0 0;color:#475569;font-size:15px;line-height:1.6;">${escapeHtml(intro)}</p>
                    </td>
                  </tr>
                  ${
                    detailRows
                      ? `<tr><td style="padding:8px 24px 8px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:4px 16px;">
                            ${detailRows}
                          </table>
                        </td></tr>`
                      : ""
                  }
                  ${
                    ctaLabel
                      ? `<tr><td style="padding:20px 24px 28px;" align="center">
                          <a href="${ctaUrl}" style="display:inline-block;background:#0055ff;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:999px;">${escapeHtml(ctaLabel)}</a>
                        </td></tr>`
                      : ""
                  }
                  <tr>
                    <td style="padding:0 24px 24px;color:#94a3b8;font-size:12px;line-height:1.5;">
                      You’re getting this because of activity on your Payollar account.
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>`,
      tags: [{ name: "category", value: String(tag).slice(0, 50) }],
    });
    assertResendResult(result, tag);
    return { success: true, id: result?.data?.id };
  } catch (error) {
    console.error(`Error sending ${tag} email:`, error);
    return { success: false, error: error.message || "Failed to send email" };
  }
}

/** Creator: booking payment received. */
export async function sendBookingPaymentReceivedEmail({
  to,
  toName,
  clientName,
  amountLabel,
  reference,
  href = "/creator/bookings",
}) {
  return sendTransactionalEventEmail({
    to,
    toName,
    subject: `Payment received${amountLabel ? ` · ${amountLabel}` : ""}`,
    headline: "Payment received",
    intro: `${clientName || "A client"} completed payment for your booking.`,
    details: [
      { label: "Client", value: clientName || "Client" },
      { label: "Amount", value: amountLabel },
      { label: "Reference", value: reference },
    ],
    ctaLabel: "Open booking",
    ctaPath: href,
    tag: "booking-payment",
  });
}

/** Media agency: booking payment received. */
export async function sendMediaPaymentReceivedEmail({
  to,
  toName,
  clientName,
  amountLabel,
  reference,
  dealTitle,
  href = "/media-agency",
}) {
  return sendTransactionalEventEmail({
    to,
    toName,
    subject: `Payment received${amountLabel ? ` · ${amountLabel}` : ""}`,
    headline: "Payment received",
    intro: `${clientName || "A client"} completed payment for a media booking.`,
    details: [
      { label: "Client", value: clientName || "Client" },
      { label: "Booking", value: dealTitle },
      { label: "Amount", value: amountLabel },
      { label: "Reference", value: reference },
    ],
    ctaLabel: "Open media portal",
    ctaPath: href,
    tag: "media-payment",
  });
}

/** Creator: new booking / hire chat opened. */
export async function sendCreatorBookedEmail({
  to,
  toName,
  clientName,
  contextLabel,
  href = "/creator/bookings",
}) {
  return sendTransactionalEventEmail({
    to,
    toName,
    subject: `New booking from ${clientName || "a client"}`,
    headline: "You’ve been booked",
    intro: `${clientName || "A client"} started a booking with you on Payollar.`,
    details: [
      { label: "Client", value: clientName || "Client" },
      { label: "Details", value: contextLabel },
    ],
    ctaLabel: "Open messages",
    ctaPath: href,
    tag: "creator-booked",
  });
}

/** Creator: campaign application accepted. */
export async function sendApplicationAcceptedEmail({
  to,
  toName,
  campaignTitle,
  brandName,
  href = "/creator/applications",
}) {
  return sendTransactionalEventEmail({
    to,
    toName,
    subject: `Application accepted${campaignTitle ? ` · ${campaignTitle}` : ""}`,
    headline: "Application accepted",
    intro: `Great news — your application${
      campaignTitle ? ` for “${campaignTitle}”` : ""
    } was accepted.`,
    details: [
      { label: "Campaign", value: campaignTitle },
      { label: "Brand", value: brandName },
    ],
    ctaLabel: "View application",
    ctaPath: href,
    tag: "application-accepted",
  });
}

/** Client: booking invoice issued by creator. */
export async function sendBookingInvoiceIssuedEmail({
  to,
  toName,
  creatorName,
  amountLabel,
  invoiceTitle,
  href = "/client/bookings",
}) {
  return sendTransactionalEventEmail({
    to,
    toName,
    subject: `Invoice from ${creatorName || "your creator"}${
      amountLabel ? ` · ${amountLabel}` : ""
    }`,
    headline: "New invoice to review",
    intro: `${creatorName || "Your creator"} sent an invoice for your booking.`,
    details: [
      { label: "From", value: creatorName || "Creator" },
      { label: "Invoice", value: invoiceTitle },
      { label: "Amount", value: amountLabel },
    ],
    ctaLabel: "Review & pay",
    ctaPath: href,
    tag: "booking-invoice",
  });
}

/** Client or agency: media negotiation deal accepted. */
export async function sendNegotiationAcceptedEmail({
  to,
  toName,
  counterpartName,
  dealTitle,
  amountLabel,
  href = "/messages",
}) {
  return sendTransactionalEventEmail({
    to,
    toName,
    subject: `Deal accepted${amountLabel ? ` · ${amountLabel}` : ""}`,
    headline: "Negotiation deal accepted",
    intro: `${counterpartName || "The other party"} accepted the media deal${
      dealTitle ? ` for “${dealTitle}”` : ""
    }.`,
    details: [
      { label: "Deal", value: dealTitle },
      { label: "Agreed total", value: amountLabel },
      { label: "With", value: counterpartName },
    ],
    ctaLabel: "Open negotiation",
    ctaPath: href,
    tag: "negotiation-accepted",
  });
}

/** Media agency: client opened a new negotiation. */
export async function sendNegotiationOpenedEmail({
  to,
  toName,
  clientName,
  dealTitle,
  amountLabel,
  packageLabel,
  href = "/media-agency/negotiations",
}) {
  return sendTransactionalEventEmail({
    to,
    toName,
    subject: `New negotiation request${
      clientName ? ` · ${clientName}` : ""
    }`,
    headline: "New negotiation request",
    intro: `${clientName || "A client"} wants to negotiate a media booking on Payollar.`,
    details: [
      { label: "Client", value: clientName || "Client" },
      { label: "Booking", value: dealTitle },
      { label: "Package", value: packageLabel },
      { label: "List total", value: amountLabel },
    ],
    ctaLabel: "Open in Payollar",
    ctaPath: href,
    tag: "negotiation-opened",
  });
}
