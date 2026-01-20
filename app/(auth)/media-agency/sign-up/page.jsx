"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signUp, signInWithGoogle } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, Lock, Building2, Eye, EyeOff, Phone, Globe } from "lucide-react";
import Link from "next/link";

export default function MediaAgencySignUpPage() {
  const router = useRouter();
  
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
    
    if (!agencyName || !contactName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all required fields");
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
          name: contactName,
        },
        {
          onSuccess: async () => {
            toast.success("Account created! Setting up your media agency profile...");
            
            // Wait a bit for the user record to be created
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Create media agency profile
            try {
              const response = await fetch("/api/media-agency/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  agencyName,
                  contactName,
                  email,
                  phone,
                  website,
                }),
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to create media agency profile");
              }

              toast.success("Media agency profile created successfully!");
              
              // Wait for session to update
              await new Promise(resolve => setTimeout(resolve, 800));
              
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new CustomEvent('auth:session-update'));
              }
              
              // Redirect directly to media agency dashboard, skipping onboarding
              window.location.href = "/media-agency";
            } catch (error) {
              console.error("Media agency registration error:", error);
              toast.error(error.message || "Account created but failed to register as media agency. Please sign in and try again.");
              // Still redirect to sign-in so they can try again
              setTimeout(() => {
                window.location.href = "/media-agency/sign-in";
              }, 2000);
            }
          },
          onError: (ctx) => {
            let errorMessage = ctx.error?.message || "Failed to create account. Please try again.";
            
            if (errorMessage.toLowerCase().includes("already exists") || 
                errorMessage.toLowerCase().includes("unique constraint")) {
              errorMessage = "An account with this email already exists. Please sign in instead.";
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
          alt="Media agency sign up background"
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
              Join Payollar as a media agency. Manage your listings, receive bookings, and grow your business.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">50+</div>
                <div className="text-sm text-blue-200">Media Partners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">1000+</div>
                <div className="text-sm text-blue-200">Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">24/7</div>
                <div className="text-sm text-blue-200">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-gray-900">Register Your Agency</h2>
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/media-agency/sign-in" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="agencyName" className="text-sm font-semibold text-gray-700">
                Agency Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  id="agencyName"
                  type="text"
                  placeholder="Your Media Agency Name"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="pl-10 bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-sm font-semibold text-gray-700">
                Contact Person Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  id="contactName"
                  type="text"
                  placeholder="John Doe"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="pl-10 bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email address <span className="text-red-500">*</span>
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
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                Phone Number
              </Label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+233 XX XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-semibold text-gray-700">
                Website
              </Label>
              <div className="relative group">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="pl-10 bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                  minLength={8}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 focus:outline-none transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Password strength</span>
                    <span className={`font-medium ${
                      passwordStrength.strength <= 2 ? "text-red-500" :
                      passwordStrength.strength <= 3 ? "text-yellow-500" :
                      passwordStrength.strength <= 4 ? "text-blue-500" : "text-emerald-500"
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 pr-10 bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    passwordMismatch ? "border-red-500 focus:border-red-500" :
                    passwordsMatch ? "border-blue-500 focus:border-blue-500" :
                    "focus:border-blue-500"
                  }`}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 focus:outline-none transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {passwordMismatch && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 h-12 text-base font-semibold mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Register Agency"
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
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          <div className="text-center text-xs text-gray-500 leading-relaxed">
            By registering, you agree to our{" "}
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
