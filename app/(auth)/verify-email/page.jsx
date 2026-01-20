"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendVerificationEmail, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const token = searchParams.get("token");
  const error = searchParams.get("error");
  const source = searchParams.get("source"); // Check if coming from Google OAuth
  const isMediaAgency = searchParams.get("media_agency") === "true"; // Check if from media agency sign-up

  // Check if user is already verified
  useEffect(() => {
    if (!isPending && session?.user) {
      if (session.user.emailVerified) {
        // User is already verified (including Google OAuth users)
        // Check user role and redirect appropriately
        const checkRoleAndRedirect = async () => {
          try {
            // If coming from media agency sign-up, set the role first
            if (isMediaAgency) {
              try {
                const setRoleResponse = await fetch("/api/media-agency/set-role", {
                  method: "POST",
                  credentials: "include",
                });
                
                if (setRoleResponse.ok) {
                  // Role set successfully, redirect to media agency dashboard
                  router.push("/media-agency");
                  return;
                }
              } catch (error) {
                console.error("Error setting media agency role:", error);
              }
            }
            
            // Check user role
            const response = await fetch("/api/user/check-role", {
              credentials: "include",
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.role === "MEDIA_AGENCY") {
                // Media agencies skip onboarding and go directly to dashboard
                router.push("/media-agency");
                return;
              } else if (data.role === "CLIENT") {
                router.push("/");
                return;
              } else if (data.role === "CREATOR") {
                if (data.verificationStatus === "VERIFIED") {
                  router.push("/creator");
                } else {
                  router.push("/creator/verification");
                }
                return;
              } else if (data.role === "ADMIN") {
                router.push("/admin");
                return;
              }
            }
          } catch (error) {
            console.error("Error checking user role:", error);
          }
          
          // If coming from media agency sign-up but no role yet, redirect to media agency sign-up
          if (isMediaAgency) {
            router.push("/media-agency/sign-up");
            return;
          }
          
          // Default redirect for Google OAuth or unassigned users
          if (source === "google") {
            toast.success("Welcome to Payollar! Your email is verified.", {
              duration: 3000,
            });
            setTimeout(() => {
              router.push("/onboarding");
            }, 1500);
          } else {
            router.push("/onboarding");
          }
        };
        
        checkRoleAndRedirect();
      }
    }
  }, [session, isPending, router, source]);

  const handleResendVerification = async () => {
    if (!session?.user?.email) {
      toast.error("No email found. Please sign in first.");
      return;
    }

    setIsResending(true);
    setEmailSent(false);

    try {
      await sendVerificationEmail({
        email: session.user.email,
        callbackURL: "/onboarding",
      });
      
      setEmailSent(true);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error) {
      console.error("Error resending verification email:", error);
      toast.error(error.message || "Failed to send verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to verify your email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/sign-in">
              <Button className="w-full">Go to Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if verification failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <CardTitle>Verification Failed</CardTitle>
            </div>
            <CardDescription>
              {error === "invalid_token" 
                ? "This verification link is invalid or has expired. Please request a new one."
                : "There was an error verifying your email. Please try again."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleResendVerification} disabled={isResending} className="w-full">
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>
            <Link href="/onboarding">
              <Button variant="outline" className="w-full">
                Continue to Onboarding
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show success if token is present (verification successful) or if Google OAuth user
  if ((token && !error) || (source === "google" && session?.user?.emailVerified)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              <CardTitle>Email Verified!</CardTitle>
            </div>
            <CardDescription>
              {source === "google" 
                ? "Welcome to Payollar! Your Google email is verified. You can now continue with onboarding."
                : "Your email has been successfully verified. You can now continue with onboarding."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/onboarding">
              <Button className="w-full">Continue to Onboarding</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default: Show verification pending page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Mail className="h-6 w-6 text-emerald-600" />
            <CardTitle>Verify Your Email</CardTitle>
          </div>
          <CardDescription>
            We've sent a verification link to <strong>{session.user.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Next steps:</strong>
            </p>
            <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the verification link in the email</li>
              <li>Your email will be verified automatically</li>
            </ol>
          </div>

          {emailSent && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-sm text-emerald-800">
                ✅ Verification email sent! Please check your inbox.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Button 
              onClick={handleResendVerification} 
              disabled={isResending}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>
            
            <Link href="/onboarding">
              <Button variant="ghost" className="w-full">
                Continue to Onboarding
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading fallback for Suspense
function VerifyEmailLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
