import LandingBackground from "@/components/landing/landing-background";
import { LandingNavbar } from "@/components/landing/landing-navbar";

export const metadata = {
  title: "Find Talents - Payollar",
  description: "Browse and book appointments with top talents ",
};

export default function TalentsLayout({ children }) {
  return (
    <div className="relative min-h-dvh w-full bg-background text-foreground">
      <LandingBackground />
      <LandingNavbar />
      <div className="relative z-10 w-full pt-[5.25rem] md:pt-28">{children}</div>
    </div>
  );
}
