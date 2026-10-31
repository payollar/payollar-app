import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";

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
    <div className="relative min-h-dvh w-full bg-[#f4f5f8] text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,_rgba(109,40,217,0.14),_transparent_68%)]" />
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-12">{children}</div>
    </div>
  );
}
