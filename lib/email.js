import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Default from email — verified domain in Resend (payollar.com)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@payollar.com";
// Business email for receiving form submissions and queries
const SUPPORT_EMAIL =
  process.env.RESEND_SUPPORT_EMAIL ||
  process.env.SUPPORT_EMAIL ||
  "support@payollar.com";

/**
 * Send a support request email to the support team
 */
export async function sendSupportRequestEmail(data) {
  const { name, email, category, priority, subject, message } = data;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: SUPPORT_EMAIL,
      replyTo: email,
      subject: `[${priority.toUpperCase()}] Support Request: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
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
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Priority:</td>
                    <td style="padding: 8px 0; color: #111827;">
                      <span style="background: ${
                        priority === "high" ? "#ef4444" : priority === "medium" ? "#f59e0b" : "#10b981"
                      }; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                        ${priority}
                      </span>
                    </td>
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

  // Create plain text version for better deliverability
  const plainText = `Hi ${userName || "there"},

Welcome to Payollar! 🎉 We're thrilled to have you join our platform. You're now part of a vibrant community connecting talented creators with clients across Ghana.

Let's Get You Started:

1. Complete Your Profile
   Choose your role (Creator or Client) and add your details

2. For Creators: Submit your profile for verification to unlock all features

3. Start Exploring
   Browse campaigns, book appointments, or create digital products

What You Can Do on Payollar:
- Connect with media professionals and creators
- Book appointments for consultations and services
- Create and sell digital products
- Apply for campaigns and media opportunities
- Build your professional network

Complete your onboarding: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/onboarding

Need help? Check out our support center or contact us directly.

Best regards,
The Payollar Team`;

  try {
    const result = await resend.emails.send({
      from: `Payollar <${FROM_EMAIL}>`, // Use friendly name for better deliverability
      to: userEmail,
      subject: "Welcome to Payollar! 🎉",
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
              <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Payollar!</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="color: #111827; font-size: 16px;">Hi ${userName || "there"},</p>
              <p style="color: #374151;">
                Welcome to Payollar! 🎉 We're thrilled to have you join our platform. 
                You're now part of a vibrant community connecting talented creators with clients across Ghana.
              </p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #111827; margin-top: 0; font-size: 18px;">Let's Get You Started:</h3>
                <div style="color: #374151; margin: 15px 0;">
                  <div style="margin: 15px 0; padding-left: 30px; position: relative;">
                    <span style="position: absolute; left: 0; top: 0; background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">1</span>
                    <strong style="color: #111827;">Complete Your Profile</strong>
                    <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Choose your role (Creator or Client) and add your details</p>
                  </div>
                  <div style="margin: 15px 0; padding-left: 30px; position: relative;">
                    <span style="position: absolute; left: 0; top: 0; background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">2</span>
                    <strong style="color: #111827;">For Creators:</strong>
                    <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Submit your profile for verification to unlock all features</p>
                  </div>
                  <div style="margin: 15px 0; padding-left: 30px; position: relative;">
                    <span style="position: absolute; left: 0; top: 0; background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">3</span>
                    <strong style="color: #111827;">Start Exploring</strong>
                    <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Browse campaigns, book appointments, or create digital products</p>
                  </div>
                </div>
              </div>
              <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="color: #065f46; margin-top: 0; font-size: 16px;">What You Can Do on Payollar:</h3>
                <ul style="color: #047857; margin: 10px 0; padding-left: 20px;">
                  <li>Connect with media professionals and creators</li>
                  <li>Book appointments for consultations and services</li>
                  <li>Create and sell digital products</li>
                  <li>Apply for campaigns and media opportunities</li>
                  <li>Build your professional network</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/onboarding" 
                   style="background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Complete Your Onboarding
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 20px;">
                Need help? Check out our <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/support" style="color: #10b981; text-decoration: none;">support center</a> or contact us directly.
              </p>
              <p style="color: #374151; margin-top: 30px;">
                If you have any questions, feel free to reach out to our support team.
              </p>
              <p style="color: #374151; margin-top: 30px;">
                Best regards,<br>
                <strong>The Payollar Team</strong>
              </p>
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  This email was sent to ${userEmail}. You're receiving this because you signed up for Payollar.
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
        "X-Entity-Ref-ID": "welcome-email",
      },
      tags: [
        { name: "category", value: "welcome" },
        { name: "type", value: "onboarding" },
      ],
    });
    
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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

  const { formatMediaInvoiceMoney } = await import("@/lib/media-invoice-format");
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000";
  const invoicesUrl = `${appUrl}/client/media`;
  const currency = invoice.currency || "GHS";
  const lineItems = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];
  const paidLabel = formatMediaInvoiceMoney(invoice.amount, currency);
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
    ${
      invoice.subtotal != null
        ? `<tr>
            <td colspan="2" style="padding: 6px 10px; text-align: right; color: #6b7280;">Subtotal</td>
            <td style="padding: 6px 10px; text-align: right; color: #111827;">${escapeHtml(formatMediaInvoiceMoney(invoice.subtotal, currency))}</td>
          </tr>`
        : ""
    }
    ${
      invoice.vat != null && Number(invoice.vat) > 0
        ? `<tr>
            <td colspan="2" style="padding: 6px 10px; text-align: right; color: #6b7280;">VAT</td>
            <td style="padding: 6px 10px; text-align: right; color: #111827;">${escapeHtml(formatMediaInvoiceMoney(invoice.vat, currency))}</td>
          </tr>`
        : ""
    }
    ${
      invoice.nhilGetfund != null && Number(invoice.nhilGetfund) > 0
        ? `<tr>
            <td colspan="2" style="padding: 6px 10px; text-align: right; color: #6b7280;">NHIL / GETFund</td>
            <td style="padding: 6px 10px; text-align: right; color: #111827;">${escapeHtml(formatMediaInvoiceMoney(invoice.nhilGetfund, currency))}</td>
          </tr>`
        : ""
    }
    <tr>
      <td colspan="2" style="padding: 12px 10px; text-align: right; color: #111827; font-weight: 700; border-top: 2px solid #e5e7eb;">Total paid</td>
      <td style="padding: 12px 10px; text-align: right; color: #111827; font-weight: 700; border-top: 2px solid #e5e7eb;">${escapeHtml(paidLabel)}</td>
    </tr>`;

  const logoUrl = `${appUrl.replace(/\/$/, "")}/icons/Payollar-logo.png`;
  const agencyLabel =
    invoice.agency?.agencyName ||
    [...new Set(lineItems.map((item) => item.agencyName).filter(Boolean))].join(
      ", "
    ) ||
    "Media station";

  const plainText = `Hi ${invoice.clientName || "there"},

Your media booking payment was received. Here's your Payollar receipt.

Invoice: ${invoice.invoiceNumber}
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
                              <img src="${logoUrl}" alt="Payollar" width="148" height="40" style="display:block; height:40px; width:auto; border:0;" />
                            </td>
                            <td align="right" style="vertical-align:middle;">
                              <div style="color:#94a3b8; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase;">Invoice</div>
                              <div style="color:#ffffff; font-size:16px; font-weight:700; margin-top:4px;">${escapeHtml(invoice.invoiceNumber)}</div>
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
                          Payment reference: ${escapeHtml(invoice.paymentReference || "")}
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
                                <img src="${logoUrl}" alt="Payollar" width="110" height="30" style="display:block; height:28px; width:auto; border:0; background:#0f172a; border-radius:8px; padding:6px 10px;" />
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
