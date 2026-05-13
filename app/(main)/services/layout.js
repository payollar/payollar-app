import LandingBackground from "@/components/landing/landing-background";
import { LandingNavbar } from "@/components/landing/landing-navbar";

export const metadata = {
  title: "Book creator services — Payollar",
  description:
    "Browse bookable services from verified creators. View rates, then open a profile to check availability and schedule.",
};

export default function ServicesMarketplaceLayout({ children }) {
  return (
    <div className="relative min-h-dvh w-full bg-background text-foreground">
      <LandingBackground />
      <LandingNavbar />
      <div className="relative z-10 w-full pt-[5.25rem] md:pt-28">{children}</div>
    </div>
  );
}
