"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useSession,
  sendEmailVerificationOtp,
  verifyEmailWithOtp,
} from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending, refetch } = useSession();
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [formError, setFormError] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const redirectingRef = useRef(false);

  const error = searchParams.get("error");
  const source = searchParams.get("source");
  const isMediaAgency = searchParams.get("media_agency") === "true";

  const redirectAfterVerified = useCallback(async () => {
    if (redirectingRef.current) return;
    redirectingRef.current = true;
    setRedirecting(true);

    try {
      if (isMediaAgency) {
        try {
          const setRoleResponse = await fetch("/api/media-agency/set-role", {
            method: "POST",
            credentials: "include",
          });

          if (setRoleResponse.ok) {
            const setRoleData = await setRoleResponse.json().catch(() => ({}));
            if (
              setRoleData.role === "MEDIA_AGENCY" ||
              setRoleData.hasMediaAgency
            ) {
              toast.success("Email verified — opening your media dashboard");
              router.replace("/media-agency");
              return;
            }
            if (setRoleData.role && setRoleData.role !== "MEDIA_AGENCY") {
              toast.message(
                "This Google account already has a different Payollar role"
              );
              router.replace("/");
              return;
            }
          }
        } catch (err) {
          console.error("Error setting media agency role:", err);
        }
      }

      const response = await fetch("/api/user/check-role", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.role === "MEDIA_AGENCY") {
          router.replace("/media-agency");
          return;
        }
        if (data.role === "CLIENT") {
          router.replace("/");
          return;
        }
        if (data.role === "CREATOR") {
          router.replace(
            data.verificationStatus === "VERIFIED"
              ? "/creator"
              : "/creator/verification"
          );
          return;
        }
        if (data.role === "ADMIN") {
          router.replace("/admin");
          return;
        }
      }
    } catch (err) {
      console.error("Error checking user role:", err);
    }

    if (isMediaAgency) {
      router.replace("/media-agency/sign-up");
      return;
    }

    if (source === "google") {
      toast.success("Welcome to Payollar! Your email is verified.");
      router.replace("/onboarding");
      return;
    }

    router.replace("/onboarding");
  }, [isMediaAgency, router, source]);

  useEffect(() => {
    if (!isPending && session?.user?.emailVerified) {
      redirectAfterVerified();
    }
  }, [session, isPending, redirectAfterVerified]);

  const handleResendCode = async () => {
    const email = session?.user?.email;
    if (!email) {
      toast.error("No email found. Please sign in first.");
      return;
    }

    setIsResending(true);
    setFormError("");
    setEmailSent(false);

    try {
      const { error: sendError } = await sendEmailVerificationOtp(email);
      if (sendError) {
        throw new Error(sendError.message || "Failed to send code");
      }
      setEmailSent(true);
      setOtp("");
      toast.success("New code sent — check your inbox.");
    } catch (err) {
      console.error("Error resending verification OTP:", err);
      toast.error(err.message || "Failed to send verification code.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e?.preventDefault?.();
    const email = session?.user?.email;
    const code = otp.replace(/\D/g, "").slice(0, 6);

    if (!email) {
      toast.error("No email found. Please sign in first.");
      return;
    }
    if (code.length !== 6) {
      setFormError("Enter the 6-digit code from your email.");
      return;
    }

    setIsVerifying(true);
    setFormError("");

    try {
      const result = await verifyEmailWithOtp(email, code);
      if (result?.error) {
        throw new Error(result.error.message || "Invalid or expired code");
      }

      const ok =
        result?.data?.status === true ||
        result?.data?.user?.emailVerified === true ||
        result?.status === true;

      if (!ok && result?.data?.status === false) {
        throw new Error("Invalid or expired code");
      }

      toast.success("Email verified");
      try {
        await refetch?.();
      } catch {
        // ignore — redirect still proceeds
      }
      await redirectAfterVerified();
    } catch (err) {
      console.error("OTP verification failed:", err);
      const message =
        err.message || "Invalid or expired code. Request a new one.";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isPending || redirecting) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-slate-600">
            {redirecting ? "Continuing…" : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>
              Please sign in to verify your email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href={
                isMediaAgency ? "/media-agency/sign-in" : "/sign-in"
              }
            >
              <Button className="w-full rounded-full">Go to Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-200 bg-white">
          <CardHeader>
            <div className="mb-2 flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <CardTitle>Verification failed</CardTitle>
            </div>
            <CardDescription>
              {error === "invalid_token"
                ? "This verification link is invalid or expired. Request a new code below."
                : "There was an error verifying your email. Try a new code."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleResendCode}
              disabled={isResending}
              className="w-full rounded-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Send a new code
                </>
              )}
            </Button>
            <Link href={isMediaAgency ? "/media-agency" : "/onboarding"}>
              <Button variant="outline" className="w-full rounded-full">
                Continue anyway
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session.user.emailVerified) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-200 bg-white">
          <CardHeader>
            <div className="mb-2 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              <CardTitle>Email verified</CardTitle>
            </div>
            <CardDescription>
              {source === "google"
                ? "Your Google email is verified. Continuing…"
                : "Your email has been verified. Continuing…"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full rounded-full"
              onClick={() => redirectAfterVerified()}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 bg-white shadow-[0_24px_64px_-28px_rgba(15,23,42,0.28)]">
        <CardHeader>
          <div className="mb-2 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <CardTitle className="text-xl">Verify your email</CardTitle>
              <CardDescription className="mt-1">
                Enter the 6-digit code sent to{" "}
                <strong className="text-slate-800">{session.user.email}</strong>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="otp"
                className="text-[13px] font-medium text-slate-700"
              >
                Verification code
              </label>
              <Input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const next = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(next);
                  if (formError) setFormError("");
                }}
                className={cn(
                  "h-14 rounded-xl border-slate-200 bg-slate-50/80 text-center text-2xl font-semibold tracking-[0.35em] text-slate-950",
                  formError && "border-red-300"
                )}
                disabled={isVerifying}
                autoFocus
              />
              {formError ? (
                <p className="text-xs text-red-600">{formError}</p>
              ) : (
                <p className="text-xs text-slate-400">
                  Code expires in 10 minutes.
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-full text-[15px] font-semibold"
              disabled={isVerifying || otp.length !== 6}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify email"
              )}
            </Button>
          </form>

          {emailSent ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
              Code sent. Check your inbox (and spam).
            </div>
          ) : null}

          <div className="space-y-2">
            <Button
              type="button"
              onClick={handleResendCode}
              disabled={isResending || isVerifying}
              variant="outline"
              className="h-11 w-full rounded-full border-slate-200"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend code
                </>
              )}
            </Button>

            <Link href={isMediaAgency ? "/media-agency" : "/onboarding"}>
              <Button variant="ghost" className="h-10 w-full rounded-full">
                Continue without verifying
              </Button>
            </Link>
          </div>

          <p className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
            Didn’t get it? Check spam, or resend a new code.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function VerifyEmailLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-slate-600">Loading...</p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
