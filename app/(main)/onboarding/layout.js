import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { Particles } from "@/components/ui/particles";

export const metadata = {
  title: "Onboarding - Payollar",
  description: "Complete your profile to get started with Payollar",
};

export const dynamic = "force-dynamic";

export default async function OnboardingLayout({ children }) {
  try {
    const user = await getCurrentUser();

    if (user) {
      if (user.role === "CLIENT") {
        redirect("/");
      } else if (user.role === "CREATOR") {
        if (user.verificationStatus === "VERIFIED") {
          redirect("/creator");
        } else {
          redirect("/creator/verification");
        }
      } else if (user.role === "ADMIN") {
        redirect("/admin");
      } else if (user.role === "MEDIA_AGENCY") {
        redirect("/media-agency");
      }
    }
  } catch (error) {
    console.error("Error in onboarding layout:", error);
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Particles
          className="absolute inset-0 opacity-[0.45]"
          quantity={72}
          color="#0055ff"
          staticity={40}
          ease={45}
        />
        <div className="absolute inset-0 grid-pattern opacity-[0.06]" />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-10 md:px-6 md:py-14">
        {children}
      </div>
    </div>
  );
}
