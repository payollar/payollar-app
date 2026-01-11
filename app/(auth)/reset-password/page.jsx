"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  
  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;
    
    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength <= 3) return { strength, label: "Fair", color: "bg-yellow-500" };
    if (strength <= 4) return { strength, label: "Good", color: "bg-blue-500" };
    return { strength, label: "Strong", color: "bg-emerald-500" };
  };
  
  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordMismatch = confirmPassword && password !== confirmPassword;

  useEffect(() => {
    if (error === "INVALID_TOKEN") {
      setTokenError(true);
      toast.error("Invalid or expired reset link. Please request a new one.");
    } else if (token) {
      setTokenError(false);
    } else {
      setTokenError(true);
      toast.error("No reset token provided. Please use the link from your email.");
    }
  }, [error, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Password validation
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    // Additional password strength check (warning only, not blocking)
    if (password.length >= 8 && (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password))) {
      // Just a warning, don't block - let them proceed
      toast.warning("For better security, consider using uppercase, lowercase, and numbers");
    }

    if (!token) {
      toast.error("Invalid reset token. Please request a new password reset link.");
      return;
    }

    setIsLoading(true);

    try {
      await authClient.resetPassword({
        newPassword: password,
        token,
      });

      setIsSuccess(true);
      toast.success("Password reset successfully! Redirecting to sign in...");
      
      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        router.push("/sign-in");
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      let errorMessage = error?.message || "Failed to reset password. The link may have expired.";
      
      // Better error messages
      if (errorMessage.toLowerCase().includes("expired") ||
          errorMessage.toLowerCase().includes("invalid") ||
          errorMessage.toLowerCase().includes("token")) {
        errorMessage = "This password reset link has expired or is invalid. Please request a new one.";
        setTokenError(true);
      } else if (errorMessage.toLowerCase().includes("network") ||
                 errorMessage.toLowerCase().includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Left side - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <Image
            src="/design.jpg"
            alt="Password reset success background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-emerald-800/80 to-emerald-700/70"></div>
        </div>

        {/* Right side - Success Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-gray-900">Password Reset Successful!</h2>
              <div className="w-16 h-1 bg-emerald-500 rounded-full mx-auto"></div>
            </div>
            <p className="text-gray-600 text-lg">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <Button
              onClick={() => router.push("/sign-in")}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg shadow-emerald-500/25 h-12 text-base font-semibold"
            >
              Go to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Left side - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <Image
            src="/design.jpg"
            alt="Error background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-emerald-800/80 to-emerald-700/70"></div>
        </div>

        {/* Right side - Error Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-500/25">
              <Lock className="h-10 w-10 text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-gray-900">Invalid Reset Link</h2>
              <div className="w-16 h-1 bg-red-500 rounded-full mx-auto"></div>
            </div>
            <p className="text-gray-600 text-lg">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/forgot-password")}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg shadow-emerald-500/25 h-12 text-base font-semibold"
              >
                Request New Reset Link
              </Button>
              <Link
                href="/sign-in"
                className="block text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/design.jpg"
          alt="Reset password background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-emerald-800/80 to-emerald-700/70"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
          <div className="text-white max-w-md space-y-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-bold leading-tight">Reset Your Password</h1>
              <div className="w-20 h-1 bg-emerald-400 rounded-full"></div>
            </div>
            <p className="text-xl text-emerald-50 leading-relaxed">
              Enter your new password below. Make sure it's at least 8 characters long.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-gray-900">New Password</h2>
            <p className="text-gray-600">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                New Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors z-10" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white text-gray-900 border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  required
                  minLength={8}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 focus:outline-none transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Password strength</span>
                  {password && (
                    <span className={`font-medium ${
                      passwordStrength.strength <= 2 ? "text-red-500" :
                      passwordStrength.strength <= 3 ? "text-yellow-500" :
                      passwordStrength.strength <= 4 ? "text-blue-500" : "text-emerald-500"
                    }`}>
                      {passwordStrength.label}
                    </span>
                  )}
                </div>
                {password && (
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Must be at least 8 characters long
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                Confirm New Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors z-10" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 pr-10 bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                    passwordMismatch ? "border-red-500 focus:border-red-500" :
                    passwordsMatch ? "border-emerald-500 focus:border-emerald-500" :
                    "focus:border-emerald-500"
                  }`}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 focus:outline-none transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {passwordMismatch && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  Passwords do not match
                </p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Passwords match
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg shadow-emerald-500/25 h-12 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link
              href="/sign-in"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
