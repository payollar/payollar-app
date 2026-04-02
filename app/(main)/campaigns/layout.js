import LandingBackground from "@/components/landing/landing-background";
import { LandingNavbar } from "@/components/landing/landing-navbar";

export const metadata = {
  title: "Campaigns - Payollar",
  description:
    "Discover brand campaigns. Apply to collaborate with top brands across media and creators.",
};

export default function CampaignsLayout({ children }) {
  return (
    <div className="relative min-h-dvh w-full bg-background text-foreground">
      <LandingBackground />
      <LandingNavbar />
      <div className="relative z-10 w-full pt-[5.25rem] md:pt-28">{children}</div>
    </div>
  );
}
