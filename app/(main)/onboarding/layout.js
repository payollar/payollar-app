import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Onboarding - Payollar",
  description: "Complete your profile to get started with Payollar",
};

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function OnboardingLayout({ children }) {
  try {
    // Get complete user profile
    const user = await getCurrentUser();

    // Redirect users who have already completed onboarding
    if (user) {
      if (user.role === "CLIENT") {
        redirect("/talents");
      } else if (user.role === "CREATOR") {
        // Check verification status for creators/talents
        if (user.verificationStatus === "VERIFIED") {
          redirect("/creator");
        } else {
          redirect("/creator/verification");
        }
      } else if (user.role === "ADMIN") {
        redirect("/admin");
      }
      // If role is UNASSIGNED, continue to onboarding
    }
    // If user is null (not found), still show onboarding page
    // This can happen if the user was just created and the database hasn't synced yet
  } catch (error) {
    // Log error but don't break the page
    console.error("Error in onboarding layout:", error);
    // Continue to show onboarding page even if there's an error
    // This allows users to complete onboarding even if there's a temporary issue
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to Payollar
          </h1>
          <p className="text-muted-foreground text-lg">
            Tell us how you want to use the platform
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
