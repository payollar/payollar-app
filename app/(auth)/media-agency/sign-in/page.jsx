"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, signInWithGoogle } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import {
  authInputClass,
  authInputPasswordClass,
  authLabelClass,
  authLinkClass,
} from "@/components/auth/auth-ui";
import { cn } from "@/lib/utils";

function safeReturnPath(value) {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.startsWith("/sign-in") || value.startsWith("/sign-up")) return null;
  if (value.startsWith("/media-agency/sign-in") || value.startsWith("/media-agency/sign-up")) {
    return null;
  }
  return value;
}

function MediaAgencySignInForm() {
  const searchParams = useSearchParams();
  const returnPath = useMemo(
    () => safeReturnPath(searchParams.get("redirect_url")),
    [searchParams]
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const goToDashboard = (path = "/media-agency") => {
    const target =
      returnPath && (returnPath === "/media-agency" || returnPath.startsWith("/media-agency/"))
        ? returnPath
        : path;
    window.location.href = target;
  };

  const routeByRole = (data) => {
    if (data?.role === "MEDIA_AGENCY") {
      toast.success(
        data.hasMediaAgency === false
          ? "Welcome — finish your agency setup"
          : "Welcome back"
      );
      goToDashboard("/media-agency");
      return;
    }

    if (data?.role === "CLIENT") {
      toast.message("This portal is for media agencies", {
        description: "Taking you to the main app.",
      });
      window.location.href =
        returnPath && !returnPath.startsWith("/media-agency") ? returnPath : "/";
      return;
    }

    if (data?.role === "CREATOR") {
      toast.message("This portal is for media agencies", {
        description: "Taking you to the creator dashboard.",
      });
      window.location.href =
        data.verificationStatus === "VERIFIED" ? "/creator" : "/creator/verification";
      return;
    }

    if (data?.role === "ADMIN") {
      window.location.href = "/admin";
      return;
    }

    toast.message("Finish setting up your agency");
    window.location.href = "/media-agency/sign-up";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError("Enter your email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFormError("Enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      await signIn.email(
        { email: email.trim(), password },
        {
          onSuccess: async () => {
            await new Promise((resolve) => setTimeout(resolve, 500));

            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("storage"));
              window.dispatchEvent(new CustomEvent("auth:session-update"));
            }

            try {
              const response = await fetch("/api/user/check-role", {
                credentials: "include",
              });

              if (response.ok) {
                routeByRole(await response.json());
                return;
              }

              window.location.href = "/media-agency/sign-up";
            } catch (error) {
              console.error("Error checking user role:", error);
              window.location.href = "/media-agency/sign-up";
            }
          },
          onError: (ctx) => {
            let errorMessage =
              ctx.error?.message || "Failed to sign in. Please check your credentials.";
            const lower = errorMessage.toLowerCase();

            if (
              lower.includes("invalid") ||
              lower.includes("credential") ||
              lower.includes("password") ||
              lower.includes("incorrect")
            ) {
              errorMessage = "Invalid email or password.";
            } else if (
              lower.includes("not found") ||
              lower.includes("does not exist") ||
              (lower.includes("user") && lower.includes("exist"))
            ) {
              errorMessage = "No agency account found. Register first.";
            } else if (lower.includes("rate limit") || lower.includes("too many")) {
              errorMessage = "Too many attempts. Try again shortly.";
            }

            setFormError(errorMessage);
            toast.error(errorMessage);
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      console.error("Sign in error:", error);
      const message = "Something went wrong. Please try again.";
      setFormError(message);
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout theme="light" size="md">
      <div className="space-y-7">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
            <Building2 className="h-3.5 w-3.5" />
            Media agency
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Sign in
            </h1>
            <p className="text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/media-agency/sign-up" className={authLinkClass}>
                Register your agency
              </Link>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {formError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
            >
              {formError}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email" className={authLabelClass}>
              Work email
            </Label>
            <div className="group relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@station.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formError) setFormError("");
                }}
                className={cn(authInputClass, "h-11 bg-white")}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="password" className={authLabelClass}>
                Password
              </Label>
              <Link href="/forgot-password" className={cn(authLinkClass, "text-sm")}>
                Forgot password?
              </Link>
            </div>
            <div className="group relative">
              <Lock className="absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formError) setFormError("");
                }}
                className={cn(authInputPasswordClass, "h-11 bg-white")}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-primary"
                disabled={isLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="marketing"
            className="mt-1 h-11 w-full rounded-full text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-slate-500">Or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="marketingOutline"
          className="h-11 w-full rounded-full text-base font-semibold"
          onClick={async () => {
            try {
              setIsLoading(true);
              setFormError("");
              await signInWithGoogle("/verify-email?source=google&media_agency=true");
            } catch (error) {
              console.error("Google sign-in error:", error);
              const message = "Google sign-in failed. Try again.";
              setFormError(message);
              toast.error(message);
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
        >
          <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <p className="text-center text-xs text-slate-500">
          Brand or creator?{" "}
          <Link href="/sign-in" className={authLinkClass}>
            Main sign in
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}

export default function MediaAgencySignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh flex-col items-center justify-center bg-[#f4f6fb] text-slate-900">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <MediaAgencySignInForm />
    </Suspense>
  );
}
