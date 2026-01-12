import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Default from email - should be a verified domain in Resend
// Using info.payollar.com as the verified domain
// NOTE: Gmail addresses (like infopayollar@gmail.com) will NOT work with Resend
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@info.payollar.com";
const SUPPORT_EMAIL = process.env.RESEND_SUPPORT_EMAIL || "support@info.payollar.com";

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
  console.log("📧 Attempting to send verification email to:", userEmail);
  console.log("📧 Verification URL:", verificationUrl);
  console.log("📧 From email:", FROM_EMAIL);
  console.log("📧 Resend API Key set:", !!process.env.RESEND_API_KEY);
  
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
    
    console.log("✅ Verification email sent successfully:", result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    console.error("❌ Error details:", JSON.stringify(error, null, 2));
    
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
  console.log("📧 Attempting to send welcome email to:", userEmail);
  
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
    
    console.log("✅ Welcome email sent successfully:", result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    console.error("❌ Error details:", JSON.stringify(error, null, 2));
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
