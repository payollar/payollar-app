"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
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
            // Small delay to ensure user record is created in database
            await new Promise(resolve => setTimeout(resolve, 500));
            router.push("/onboarding");
            router.refresh();
          },
          onError: (ctx) => {
            let errorMessage = ctx.error?.message || "Failed to create account. Please try again.";
            
            // Better error messages for common issues
            if (errorMessage.toLowerCase().includes("already exists") || 
                errorMessage.toLowerCase().includes("unique constraint") ||
                errorMessage.toLowerCase().includes("email")) {
              errorMessage = "An account with this email already exists. Please sign in instead, or use a different email.";
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
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/design2.jpg"
          alt="Sign up background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
          <div className="text-white max-w-md">
            <h1 className="text-4xl font-bold mb-4">Join Payollar</h1>
            <p className="text-lg text-gray-200">
              Start your journey today. Connect with clients, showcase your talents, and grow your media business.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-4 sm:p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-medium text-gray-900 hover:text-gray-700">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-white text-gray-900 border-gray-300 focus:border-gray-900"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white text-gray-900 border-gray-300 focus:border-gray-900"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white text-gray-900 border-gray-300 focus:border-gray-900"
                  required
                  minLength={8}
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-white text-gray-900 border-gray-300 focus:border-gray-900"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gray-900 text-white hover:bg-gray-800 transition-colors h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-600">
                Or continue with
              </span>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="font-medium text-gray-900 hover:text-gray-700">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-gray-900 hover:text-gray-700">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
