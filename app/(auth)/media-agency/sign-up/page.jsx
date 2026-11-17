"use client";

import { useState } from "react";
import { signUp, signInWithGoogle } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Building2,
  Check,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { authLinkClass } from "@/components/auth/auth-ui";
import { AuthLegalAgreementText } from "@/components/legal/legal-document-modal";
import { cn } from "@/lib/utils";

const fieldLabel =
  "text-[13px] font-medium tracking-tight text-slate-700";
const fieldInput =
  "h-11 rounded-xl border-slate-200 bg-slate-50/80 pl-10 text-slate-900 shadow-none transition-[border-color,box-shadow,background-color] placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-primary focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-primary/15";
const fieldInputPassword =
  "h-11 rounded-xl border-slate-200 bg-slate-50/80 pl-10 pr-10 text-slate-900 shadow-none transition-[border-color,box-shadow,background-color] placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-primary focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-primary/15";
const fieldIcon =
  "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary";

export default function MediaAgencySignUpPage() {
  const [agencyName, setAgencyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordMismatch = confirmPassword && password !== confirmPassword;
  const passwordLongEnough = password.length >= 8;

  const clearError = () => {
    if (formError) setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!agencyName.trim() || !contactName.trim() || !email.trim() || !password || !confirmPassword) {
      setFormError("Fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFormError("Enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await signUp.email(
        {
          email: email.trim(),
          password,
          name: contactName.trim(),
        },
        {
          onSuccess: async () => {
            toast.success("Account created — setting up your agency…");

            // Brief pause so the session cookie is available for the register call
            await new Promise((resolve) => setTimeout(resolve, 400));

            try {
              const response = await fetch("/api/media-agency/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  agencyName: agencyName.trim(),
                  contactName: contactName.trim(),
                  email: email.trim(),
                  phone: phone.trim(),
                  website: website.trim(),
                }),
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to create media agency profile");
              }

              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("storage"));
                window.dispatchEvent(new CustomEvent("auth:session-update"));
              }

              toast.success("Agency ready — opening dashboard");
              window.location.href = "/media-agency";
            } catch (error) {
              console.error("Media agency registration error:", error);
              toast.error(
                error.message ||
                  "Account created but agency setup failed. Sign in to finish."
              );
              setIsLoading(false);
              setTimeout(() => {
                window.location.href = "/media-agency/sign-in";
              }, 1500);
            }
          },
          onError: (ctx) => {
            let errorMessage = ctx.error?.message || "Failed to create account.";

            if (
              errorMessage.toLowerCase().includes("already exists") ||
              errorMessage.toLowerCase().includes("unique constraint")
            ) {
              errorMessage = "An account with this email already exists.";
            }

            setFormError(errorMessage);
            toast.error(errorMessage);
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      console.error("Sign up error:", error);
      const message = "Something went wrong. Please try again.";
      setFormError(message);
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout theme="light" size="lg" contentClassName="sm:p-9">
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.07] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
            <Building2 className="h-3.5 w-3.5" />
            Media agency
          </div>
          <div className="space-y-2">
            <h1 className="text-[1.75rem] font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
              Register your agency
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-slate-500">
              List inventory, manage bookings, and get discovered by brands on Payollar.
              Already registered?{" "}
              <Link href="/media-agency/sign-in" className={authLinkClass}>
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {formError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
            >
              {formError}
              {formError.toLowerCase().includes("already exists") ? (
                <>
                  {" "}
                  <Link href="/media-agency/sign-in" className={authLinkClass}>
                    Sign in
                  </Link>
                </>
              ) : null}
            </div>
          ) : null}

          <section className="space-y-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Agency details
              </h2>
              <span className="text-[11px] text-slate-400">* required</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agencyName" className={fieldLabel}>
                Agency name <span className="text-red-500">*</span>
              </Label>
              <div className="group relative">
                <Building2 className={fieldIcon} />
                <Input
                  id="agencyName"
                  type="text"
                  autoComplete="organization"
                  placeholder="Station, network, or platform name"
                  value={agencyName}
                  onChange={(e) => {
                    setAgencyName(e.target.value);
                    clearError();
                  }}
                  className={fieldInput}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactName" className={fieldLabel}>
                  Contact person <span className="text-red-500">*</span>
                </Label>
                <div className="group relative">
                  <User className={fieldIcon} />
                  <Input
                    id="contactName"
                    type="text"
                    autoComplete="name"
                    placeholder="Full name"
                    value={contactName}
                    onChange={(e) => {
                      setContactName(e.target.value);
                      clearError();
                    }}
                    className={fieldInput}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className={fieldLabel}>
                  Phone{" "}
                  <span className="font-normal text-slate-400">optional</span>
                </Label>
                <div className="group relative">
                  <Phone className={fieldIcon} />
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+233…"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      clearError();
                    }}
                    className={fieldInput}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email" className={fieldLabel}>
                  Work email <span className="text-red-500">*</span>
                </Label>
                <div className="group relative">
                  <Mail className={fieldIcon} />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@station.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError();
                    }}
                    className={fieldInput}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className={fieldLabel}>
                  Website{" "}
                  <span className="font-normal text-slate-400">optional</span>
                </Label>
                <div className="group relative">
                  <Globe className={fieldIcon} />
                  <Input
                    id="website"
                    type="url"
                    autoComplete="url"
                    placeholder="https://"
                    value={website}
                    onChange={(e) => {
                      setWebsite(e.target.value);
                      clearError();
                    }}
                    className={fieldInput}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Account security
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password" className={fieldLabel}>
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="group relative">
                  <Lock className={cn(fieldIcon, "z-10")} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError();
                    }}
                    className={fieldInputPassword}
                    required
                    minLength={8}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-primary"
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password ? (
                  <p
                    className={cn(
                      "flex items-center gap-1.5 text-xs",
                      passwordLongEnough ? "text-emerald-600" : "text-slate-400"
                    )}
                  >
                    {passwordLongEnough ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : null}
                    {passwordLongEnough
                      ? "Looks good"
                      : `${8 - password.length} more characters needed`}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className={fieldLabel}>
                  Confirm password <span className="text-red-500">*</span>
                </Label>
                <div className="group relative">
                  <Lock className={cn(fieldIcon, "z-10")} />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearError();
                    }}
                    className={cn(
                      fieldInputPassword,
                      passwordMismatch &&
                        "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-200/60",
                      passwordsMatch &&
                        "border-emerald-300 focus-visible:border-emerald-400 focus-visible:ring-emerald-200/50"
                    )}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-primary"
                    disabled={isLoading}
                    aria-label={
                      showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordMismatch ? (
                  <p className="text-xs text-red-600">Passwords do not match</p>
                ) : passwordsMatch ? (
                  <p className="flex items-center gap-1.5 text-xs text-emerald-600">
                    <Check className="h-3.5 w-3.5" />
                    Passwords match
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <div className="space-y-3 pt-1">
            <Button
              type="submit"
              variant="marketing"
              className="h-12 w-full rounded-xl text-[15px] font-semibold shadow-[0_10px_24px_-12px_rgba(0,85,255,0.65)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create agency account"
              )}
            </Button>

            <AuthLegalAgreementText />
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 font-medium uppercase tracking-[0.14em] text-slate-400">
              Or
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="marketingOutline"
          className="h-11 w-full rounded-xl border-slate-200 bg-white text-[15px] font-semibold text-slate-800 hover:bg-slate-50"
          onClick={async () => {
            try {
              setIsLoading(true);
              setFormError("");
              await signInWithGoogle("/verify-email?source=google&media_agency=true");
            } catch (error) {
              console.error("Google sign-in error:", error);
              const message = "Google sign-up failed. Try again.";
              setFormError(message);
              toast.error(message);
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
        >
          <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>
      </div>
    </AuthSplitLayout>
  );
}
