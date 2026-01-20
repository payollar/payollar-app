"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { signIn, signInWithGoogle } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, Lock, Eye, EyeOff, Building2 } from "lucide-react";
import Link from "next/link";

function MediaAgencySignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
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
        {
          email,
          password,
        },
        {
          onSuccess: async () => {
            toast.success("Signed in successfully!");
            await new Promise(resolve => setTimeout(resolve, 800));
            
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event('storage'));
              window.dispatchEvent(new CustomEvent('auth:session-update'));
            }
            
            // Check user role and redirect appropriately
            try {
              const response = await fetch("/api/user/check-role", {
                credentials: "include",
              });
              
              if (response.ok) {
                const data = await response.json();
                if (data.role === "MEDIA_AGENCY") {
                  window.location.href = "/media-agency";
                  return;
                } else if (data.role) {
                  // User has a different role, redirect to their dashboard
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
                  // No role, redirect to media agency sign-up
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
            
            if (errorMessage.toLowerCase().includes("invalid") || 
                errorMessage.toLowerCase().includes("credential") ||
                errorMessage.toLowerCase().includes("password") ||
                errorMessage.toLowerCase().includes("incorrect")) {
              errorMessage = "Invalid email or password. Please check your credentials and try again.";
            } else if (errorMessage.toLowerCase().includes("not found") ||
                       errorMessage.toLowerCase().includes("user") ||
                       errorMessage.toLowerCase().includes("does not exist")) {
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
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/banner2.jpeg"
          alt="Media agency sign in background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-blue-700/70"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
          <div className="text-white max-w-md space-y-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-bold leading-tight">Media Agency Portal</h1>
              <div className="w-20 h-1 bg-blue-400 rounded-full"></div>
            </div>
            <p className="text-xl text-blue-50 leading-relaxed">
              Sign in to manage your media listings, bookings, and reporting.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h2 className="text-4xl font-bold text-gray-900">Sign In</h2>
            </div>
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link href="/media-agency/sign-up" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Register your agency
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="agency@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 focus:outline-none transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 h-12 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-2 border-gray-300 hover:border-gray-400 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700 transition-all h-12 text-base font-semibold"
            onClick={async () => {
              try {
                setIsLoading(true);
                // Redirect to verify-email which will check role and redirect MEDIA_AGENCY to dashboard
                await signInWithGoogle("/verify-email?source=google&media_agency=true");
              } catch (error) {
                console.error("Google sign-in error:", error);
                toast.error("Failed to sign in with Google. Please try again.");
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
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

          <div className="text-center text-xs text-gray-500 leading-relaxed">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MediaAgencySignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <MediaAgencySignInForm />
    </Suspense>
  );
}
