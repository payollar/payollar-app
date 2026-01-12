"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Name validation
    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters long");
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    // Password validation
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
            // Longer delay to ensure user record is created in database and session is fully set
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Trigger events to notify other components (like navbar) about the new session
            if (typeof window !== "undefined") {
              // Trigger storage event for cross-tab sync
              window.dispatchEvent(new Event('storage'));
              // Trigger custom event for same-tab components
              window.dispatchEvent(new CustomEvent('auth:session-update'));
            }
            
            // Navigate to onboarding - new users always need to select a role
            window.location.href = "/onboarding";
          },
          onError: (ctx) => {
            let errorMessage = ctx.error?.message || "Failed to create account. Please try again.";
            
            // Better error messages for common issues
            if (errorMessage.toLowerCase().includes("already exists") || 
                errorMessage.toLowerCase().includes("unique constraint") ||
                errorMessage.toLowerCase().includes("email") ||
                errorMessage.toLowerCase().includes("duplicate")) {
              errorMessage = "An account with this email already exists. Please sign in instead, or use a different email.";
            } else if (errorMessage.toLowerCase().includes("password") ||
                       errorMessage.toLowerCase().includes("weak")) {
              errorMessage = "Password is too weak. Please use a stronger password.";
            } else if (errorMessage.toLowerCase().includes("rate limit") ||
                       errorMessage.toLowerCase().includes("too many")) {
              errorMessage = "Too many sign-up attempts. Please wait a moment and try again.";
            } else if (errorMessage.toLowerCase().includes("network") ||
                       errorMessage.toLowerCase().includes("fetch")) {
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
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/banner2.jpeg"
          alt="Sign up background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-emerald-800/80 to-emerald-700/70"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
          <div className="text-white max-w-md space-y-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-bold leading-tight">Join Payollar</h1>
              <div className="w-20 h-1 bg-emerald-400 rounded-full"></div>
            </div>
            <p className="text-xl text-emerald-50 leading-relaxed">
              Start your journey today. Connect with clients, showcase your talents, and grow your media business.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-300">1K+</div>
                <div className="text-sm text-emerald-200">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-300">500+</div>
                <div className="text-sm text-emerald-200">Creators</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-300">100+</div>
                <div className="text-sm text-emerald-200">Bookings</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Full Name
              </Label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-white text-gray-900 border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white text-gray-900 border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
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
                Confirm Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors z-10" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
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
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg shadow-emerald-500/25 h-12 text-base font-semibold mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-500">
                Secure registration
              </span>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 leading-relaxed">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
