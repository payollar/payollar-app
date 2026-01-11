import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/design.jpg"
          alt="Login background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
          <div className="text-white max-w-md">
            <h1 className="text-4xl font-bold mb-4">Welcome to Payollar</h1>
            <p className="text-lg text-gray-200">
              Connect with media professionals, book campaigns, and grow your business all in one platform.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-4 sm:p-8">
        <div className="w-full max-w-md">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-white border-gray-200 shadow-xl w-full",
                headerTitle: "text-gray-900 text-2xl font-bold",
                headerSubtitle: "text-gray-600",
                socialButtonsBlockButton: "bg-white text-gray-900 border-gray-300 hover:bg-gray-50 transition-colors",
                formButtonPrimary: "bg-gray-900 text-white hover:bg-gray-800 transition-colors",
                formFieldInput: "bg-white text-gray-900 border-gray-300 focus:border-gray-900",
                formFieldLabel: "text-gray-700",
                dividerLine: "bg-gray-300",
                dividerText: "text-gray-600",
                footerActionLink: "text-gray-900 hover:text-gray-700 transition-colors",
                identityPreviewText: "text-gray-900",
                identityPreviewEditButton: "text-gray-900 hover:text-gray-700",
                formResendCodeLink: "text-gray-900 hover:text-gray-700",
                otpCodeFieldInput: "bg-white text-gray-900 border-gray-300",
                formFieldAction: "text-gray-900 hover:text-gray-700",
                alertText: "text-gray-900",
              },
              variables: {
                colorBackground: "#ffffff",
                colorInputBackground: "#ffffff",
                colorInputText: "#111827",
                colorPrimary: "#111827",
                colorText: "#111827",
                colorTextSecondary: "#4b5563",
                borderRadius: "0.5rem",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Better Auth version - commented out
// "use client";
// import { useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Image from "next/image";
// import { signIn } from "@/lib/auth-client";
// ... (rest of Better Auth implementation)
