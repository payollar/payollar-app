"use client";

import { useState } from "react";
import { signIn, signInWithGoogle } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import {
  authInputClass,
  authInputPasswordClass,
  authLabelClass,
  authLinkClass,
} from "@/components/auth/auth-ui";

export default function MediaAgencySignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      await signIn.email(
        { email, password },
        {
          onSuccess: async () => {
            toast.success("Signed in successfully!");
            await new Promise((resolve) => setTimeout(resolve, 800));

            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("storage"));
              window.dispatchEvent(new CustomEvent("auth:session-update"));
            }

            try {
              const response = await fetch("/api/user/check-role", {
                credentials: "include",
              });

              if (response.ok) {
                const data = await response.json();
                if (data.role === "MEDIA_AGENCY") {
                  window.location.href = "/media-agency";
                  return;
                }
                if (data.role) {
                  if (data.role === "CLIENT") {
                    window.location.href = "/";
                  } else if (data.role === "CREATOR") {
                    if (data.verificationStatus === "VERIFIED") {
                      window.location.href = "/creator";
                    } else {
                      window.location.href = "/creator/verification";
                    }
                  } else if (data.role === "ADMIN") {
                    window.location.href = "/admin";
                  } else {
                    window.location.href = "/onboarding";
                  }
                } else {
                  window.location.href = "/media-agency/sign-up";
                }
              } else {
                window.location.href = "/media-agency/sign-up";
              }
            } catch (error) {
              console.error("Error checking user role:", error);
              window.location.href = "/media-agency/sign-up";
            }
          },
          onError: (ctx) => {
            let errorMessage = ctx.error?.message || "Failed to sign in. Please check your credentials.";

            if (
              errorMessage.toLowerCase().includes("invalid") ||
              errorMessage.toLowerCase().includes("credential") ||
              errorMessage.toLowerCase().includes("password") ||
              errorMessage.toLowerCase().includes("incorrect")
            ) {
              errorMessage = "Invalid email or password. Please check your credentials and try again.";
            } else if (
              errorMessage.toLowerCase().includes("not found") ||
              errorMessage.toLowerCase().includes("user") ||
              errorMessage.toLowerCase().includes("does not exist")
            ) {
              errorMessage = "No account found with this email. Please sign up first.";
            }

            toast.error(errorMessage);
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Sign in</h2>
          <p className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/media-agency/sign-up" className={authLinkClass}>
              Register your agency
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className={authLabelClass}>
              Email
            </Label>
            <div className="group relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                id="email"
                type="email"
                placeholder="agency@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={authInputClass}
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
              <Link href="/forgot-password" className={`${authLinkClass} text-sm`}>
                Forgot password?
              </Link>
            </div>
            <div className="group relative">
              <Lock className="absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={authInputPasswordClass}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="marketing"
            className="h-12 w-full rounded-full text-base font-semibold"
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
            <div className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-card/95 px-4 text-muted-foreground backdrop-blur-sm">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="marketingOutline"
          className="h-12 w-full rounded-full text-base font-semibold"
          onClick={async () => {
            try {
              setIsLoading(true);
              await signInWithGoogle("/verify-email?source=google&media_agency=true");
            } catch (error) {
              console.error("Google sign-in error:", error);
              toast.error("Failed to sign in with Google. Please try again.");
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

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          By signing in, you agree to our{" "}
          <Link href="/terms" className={authLinkClass}>
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className={authLinkClass}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </AuthSplitLayout>
  );
}
