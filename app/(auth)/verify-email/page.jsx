"use client";

import {
  useState,
  useEffect,
  Suspense,
  useRef,
  useCallback,
  useId,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useSession,
  sendEmailVerificationOtp,
  verifyEmailWithOtp,
} from "@/lib/auth-client";
import { triggerPostVerifyWelcome } from "@/actions/email";
import { Button } from "@/components/ui/button";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const OTP_LENGTH = 6;

function OtpBoxes({ value, onChange, disabled, hasError, autoFocus }) {
  const inputsRef = useRef([]);
  const id = useId();
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] || "");

  const focusAt = (index) => {
    const el = inputsRef.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const commit = (next) => {
    const cleaned = next.replace(/\D/g, "").slice(0, OTP_LENGTH);
    onChange(cleaned);
  };

  const handleChange = (index, raw) => {
    const onlyDigits = raw.replace(/\D/g, "");
    if (!onlyDigits) {
      const next = digits.slice();
      next[index] = "";
      commit(next.join(""));
      return;
    }

    // Support paste / autofill into one box
    if (onlyDigits.length > 1) {
      commit(onlyDigits);
      focusAt(Math.min(onlyDigits.length, OTP_LENGTH - 1));
      return;
    }

    const next = digits.slice();
    next[index] = onlyDigits;
    commit(next.join(""));
    if (index < OTP_LENGTH - 1) focusAt(index + 1);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        const next = digits.slice();
        next[index] = "";
        commit(next.join(""));
        return;
      }
      if (index > 0) {
        const next = digits.slice();
        next[index - 1] = "";
        commit(next.join(""));
        focusAt(index - 1);
      }
      return;
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusAt(index - 1);
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData?.getData("text") || "")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    commit(pasted);
    focusAt(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  return (
    <div
      className="flex justify-center gap-2 sm:gap-2.5"
      role="group"
      aria-label="6-digit verification code"
      onPaste={handlePaste}
    >
      {digits.map((digit, index) => (
        <input
          key={`${id}-${index}`}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          id={index === 0 ? "otp-0" : undefined}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          aria-label={`Digit ${index + 1}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-12 w-10 rounded-xl border bg-slate-50 text-center text-xl font-semibold text-slate-950 shadow-none outline-none transition-[border-color,box-shadow,background-color] sm:h-14 sm:w-12 sm:text-2xl",
            "placeholder:text-slate-300 focus:border-primary focus:bg-white focus:ring-[3px] focus:ring-primary/15",
            hasError
              ? "border-red-300 focus:border-red-400 focus:ring-red-200/60"
              : "border-slate-200 hover:border-slate-300",
            disabled && "cursor-not-allowed opacity-60"
          )}
        />
      ))}
    </div>
  );
}

function Shell({ children }) {
  return (
    <AuthSplitLayout theme="light" size="md" contentClassName="sm:p-9">
      {children}
    </AuthSplitLayout>
  );
}

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
  const autoSubmitRef = useRef("");

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
          let storedType = null;
          try {
            const { readStoredMediaAgencyType } = await import(
              "@/lib/media-agency-type"
            );
            storedType = readStoredMediaAgencyType();
          } catch {
            // ignore
          }

          const setRoleResponse = await fetch("/api/media-agency/set-role", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              storedType ? { primaryMediaType: storedType } : {}
            ),
          });

          if (setRoleResponse.ok) {
            const setRoleData = await setRoleResponse.json().catch(() => ({}));
            if (
              setRoleData.role === "MEDIA_AGENCY" ||
              setRoleData.hasMediaAgency
            ) {
              try {
                const { clearStoredMediaAgencyType } = await import(
                  "@/lib/media-agency-type"
                );
                // Keep stored type if agency still needs the dashboard gate
                if (setRoleData.primaryMediaType) {
                  clearStoredMediaAgencyType();
                }
              } catch {
                // ignore
              }
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

  // Auto-submit once when all 6 digits are entered
  useEffect(() => {
    if (
      otp.length === OTP_LENGTH &&
      !isVerifying &&
      session?.user?.email &&
      autoSubmitRef.current !== otp
    ) {
      autoSubmitRef.current = otp;
      const form = document.getElementById("verify-otp-form");
      form?.requestSubmit?.();
    }
  }, [otp, isVerifying, session?.user?.email]);

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
    const code = otp.replace(/\D/g, "").slice(0, OTP_LENGTH);

    if (!email) {
      toast.error("No email found. Please sign in first.");
      return;
    }
    if (code.length !== OTP_LENGTH) {
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
        await triggerPostVerifyWelcome();
      } catch {
        // Welcome is best-effort; don't block redirect
      }
      try {
        await refetch?.();
      } catch {
        // ignore
      }
      await redirectAfterVerified();
    } catch (err) {
      console.error("OTP verification failed:", err);
      const message =
        err.message || "Invalid or expired code. Request a new one.";
      setFormError(message);
      toast.error(message);
      setOtp("");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isPending || redirecting) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-slate-600">
            {redirecting ? "Continuing…" : "Loading…"}
          </p>
        </div>
      </Shell>
    );
  }

  if (!session?.user) {
    return (
      <Shell>
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Sign in required
            </h1>
            <p className="text-sm text-slate-500">
              Sign in to verify the email for your Payollar account.
            </p>
          </div>
          <Button asChild className="h-11 w-full rounded-xl font-semibold">
            <Link
              href={isMediaAgency ? "/media-agency/sign-in" : "/sign-in"}
            >
              Go to sign in
            </Link>
          </Button>
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </span>
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight text-slate-950">
                Verification failed
              </h1>
              <p className="text-sm leading-relaxed text-slate-500">
                {error === "invalid_token"
                  ? "This verification link is invalid or expired. Request a new code below."
                  : "There was an error verifying your email. Try a new code."}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Button
              onClick={handleResendCode}
              disabled={isResending}
              className="h-11 w-full rounded-xl font-semibold"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Send a new code
                </>
              )}
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 w-full rounded-xl border-slate-200 bg-white text-slate-700"
            >
              <Link href={isMediaAgency ? "/media-agency" : "/onboarding"}>
                Continue anyway
              </Link>
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  if (session.user.emailVerified) {
    return (
      <Shell>
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Email verified
            </h1>
            <p className="text-sm text-slate-500">
              {source === "google"
                ? "Your Google email is verified. Continuing…"
                : "You’re all set. Continuing…"}
            </p>
          </div>
          <Button
            className="h-11 w-full rounded-xl font-semibold"
            onClick={() => redirectAfterVerified()}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-7">
        <div className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.07] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
            <Mail className="h-3.5 w-3.5" />
            Email verification
          </div>
          <div className="space-y-2">
            <h1 className="text-[1.75rem] font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
              Check your inbox
            </h1>
            <p className="text-sm leading-relaxed text-slate-500">
              Enter the 6-digit code we sent to{" "}
              <span className="font-semibold text-slate-800">
                {session.user.email}
              </span>
              .
            </p>
          </div>
        </div>

        <form
          id="verify-otp-form"
          onSubmit={handleVerifyCode}
          className="space-y-5"
        >
          <div className="space-y-3">
            <p className="text-center text-[13px] font-medium text-slate-700">
              Verification code
            </p>
            <OtpBoxes
              value={otp}
              onChange={(next) => {
                setOtp(next);
                if (formError) setFormError("");
              }}
              disabled={isVerifying}
              hasError={!!formError}
              autoFocus
            />
            {formError ? (
              <p className="text-center text-xs text-red-600">{formError}</p>
            ) : (
              <p className="text-center text-xs text-slate-400">
                Code expires in 10 minutes
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="marketing"
            className="h-12 w-full rounded-xl text-[15px] font-semibold shadow-[0_10px_24px_-12px_rgba(0,85,255,0.65)]"
            disabled={isVerifying || otp.length !== OTP_LENGTH}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying…
              </>
            ) : (
              "Verify email"
            )}
          </Button>
        </form>

        {emailSent ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-center text-sm text-emerald-800">
            New code sent. Check your inbox (and spam).
          </div>
        ) : null}

        <div className="space-y-2">
          <Button
            type="button"
            onClick={handleResendCode}
            disabled={isResending || isVerifying}
            variant="outline"
            className="h-11 w-full rounded-xl border-slate-200 bg-white text-[15px] font-semibold text-slate-800 hover:bg-slate-50"
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

          <Button
            asChild
            variant="ghost"
            className="h-10 w-full rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          >
            <Link href={isMediaAgency ? "/media-agency" : "/onboarding"}>
              Continue without verifying
            </Link>
          </Button>
        </div>

        <p className="border-t border-slate-100 pt-5 text-center text-xs leading-relaxed text-slate-400">
          Didn’t get it? Check spam, or resend a new code.
        </p>
      </div>
    </Shell>
  );
}

function VerifyEmailLoading() {
  return (
    <Shell>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-slate-600">Loading…</p>
      </div>
    </Shell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
