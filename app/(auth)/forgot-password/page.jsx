"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, CheckCircle2, Inbox } from "lucide-react";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import {
  authInputClass,
  authLabelClass,
  authLinkClass,
} from "@/components/auth/auth-ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const baseURL = typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${baseURL}/reset-password`;

      await authClient.forgetPassword({
        email: email.trim(),
        redirectTo,
      });

      setIsSubmitted(true);
      toast.success("Check your inbox for a reset link");
    } catch (error) {
      console.error("Forgot password error:", error);
      // Always show success to avoid email enumeration
      setIsSubmitted(true);
      toast.success("If an account exists, you’ll get a reset link shortly");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthSplitLayout>
        <div className="space-y-8">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Inbox className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Check your email
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                If an account exists for{" "}
                <span className="font-medium text-foreground break-all">
                  {email.trim()}
                </span>
                , we sent a link to reset your password.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/50 px-4 py-3 text-left">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>The link expires in about an hour.</p>
                <p>Don’t see it? Check spam or wait a minute and try again.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              asChild
              variant="marketing"
              className="h-12 w-full rounded-full text-base font-semibold"
            >
              <Link href="/sign-in">Back to sign in</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-full border-border/60 text-sm font-semibold"
              onClick={() => {
                setIsSubmitted(false);
              }}
            >
              Use a different email
            </Button>
          </div>
        </div>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Account recovery
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Forgot password?
          </h1>
          <p className="text-muted-foreground">
            Enter the email on your Payollar account and we&apos;ll send a reset
            link.
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
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={authInputClass}
                required
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="marketing"
            className="h-12 w-full rounded-full text-base font-semibold"
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Sending link…
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/sign-in"
            className={`inline-flex items-center gap-2 text-sm ${authLinkClass}`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
