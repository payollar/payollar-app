"use client";

import { useState } from "react";
import { signUp, signInWithGoogle } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import {
  authInputClass,
  authInputPasswordClass,
  authLabelClass,
  authLinkClass,
} from "@/components/auth/auth-ui";
import { cn } from "@/lib/utils";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength <= 3) return { strength, label: "Fair", color: "bg-amber-500" };
    if (strength <= 4) return { strength, label: "Good", color: "bg-primary" };
    return { strength, label: "Strong", color: "bg-primary" };
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordMismatch = confirmPassword && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters long");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await signUp.email(
        {
          email,
          password,
          name,
        },
        {
          onSuccess: async () => {
            toast.success("Account created successfully!");
            toast.info(
              "Please check your email to verify your account. A verification link has been sent to your inbox.",
              { duration: 5000 }
            );
            await new Promise((resolve) => setTimeout(resolve, 800));

            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("storage"));
              window.dispatchEvent(new CustomEvent("auth:session-update"));
            }

            window.location.href = "/verify-email";
          },
          onError: (ctx) => {
            let errorMessage = ctx.error?.message || "Failed to create account. Please try again.";

            if (
              errorMessage.toLowerCase().includes("already exists") ||
              errorMessage.toLowerCase().includes("unique constraint") ||
              errorMessage.toLowerCase().includes("email") ||
              errorMessage.toLowerCase().includes("duplicate")
            ) {
              errorMessage =
                "An account with this email already exists. Please sign in instead, or use a different email.";
            } else if (
              errorMessage.toLowerCase().includes("password") ||
              errorMessage.toLowerCase().includes("weak")
            ) {
              errorMessage = "Password is too weak. Please use a stronger password.";
            } else if (
              errorMessage.toLowerCase().includes("rate limit") ||
              errorMessage.toLowerCase().includes("too many")
            ) {
              errorMessage = "Too many sign-up attempts. Please wait a moment and try again.";
            } else if (
              errorMessage.toLowerCase().includes("network") ||
              errorMessage.toLowerCase().includes("fetch")
            ) {
              errorMessage = "Network error. Please check your connection and try again.";
            }

            toast.error(errorMessage);
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Create account</h2>
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className={authLinkClass}>
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className={authLabelClass}>
              Full name
            </Label>
            <div className="group relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={authInputClass}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className={authLabelClass}>
              Email
            </Label>
            <div className="group relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={authInputClass}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className={authLabelClass}>
              Password
            </Label>
            <div className="group relative">
              <Lock className="absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={authInputPasswordClass}
                required
                minLength={8}
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
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Password strength</span>
                {password ? (
                  <span
                    className={cn(
                      "font-medium",
                      passwordStrength.strength <= 2 && "text-red-500",
                      passwordStrength.strength === 3 && "text-amber-500",
                      passwordStrength.strength >= 4 && "text-primary"
                    )}
                  >
                    {passwordStrength.label}
                  </span>
                ) : null}
              </div>
              {password ? (
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className={cn("h-1.5 rounded-full transition-all duration-300", passwordStrength.color)}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  />
                </div>
              ) : null}
              <p className="text-xs text-muted-foreground">Use at least 8 characters with mixed case, numbers, or symbols.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className={authLabelClass}>
              Confirm password
            </Label>
            <div className="group relative">
              <Lock className="absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  authInputPasswordClass,
                  passwordMismatch && "border-destructive focus-visible:ring-destructive/25",
                  passwordsMatch && "border-primary/50"
                )}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {passwordMismatch ? (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                Passwords do not match
              </p>
            ) : null}
            {passwordsMatch ? (
              <p className="flex items-center gap-1 text-xs text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Passwords match
              </p>
            ) : null}
          </div>

          <Button type="submit" variant="marketing" className="mt-2 h-12 w-full rounded-full text-base font-semibold" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating account…
              </>
            ) : (
              "Create account"
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
              await signInWithGoogle("/verify-email?source=google");
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
          By creating an account, you agree to our{" "}
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
