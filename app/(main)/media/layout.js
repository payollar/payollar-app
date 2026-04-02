import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import LandingBackground from "@/components/landing/landing-background";
import { LandingNavbar } from "@/components/landing/landing-navbar";

export const metadata = {
  title: "Media - Payollar",
  description: "Buy and schedule media advertising",
};

export const dynamic = "force-dynamic";

export default async function MediaLayout({ children }) {
  const user = await checkUser();

  if (user?.role === "CREATOR") {
    redirect("/creator");
  }

  return (
    <div
      className="relative min-h-dvh w-full bg-background text-foreground"
      data-media-landing
    >
      <LandingBackground />
      <LandingNavbar />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
