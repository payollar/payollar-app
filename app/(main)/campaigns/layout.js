import { LandingNavbar } from "@/components/landing/landing-navbar";

export const metadata = {
  title: "Campaigns - Payollar",
  description:
    "Discover brand campaigns. Apply to collaborate with top brands across media and creators.",
};

export default function CampaignsLayout({ children }) {
  return (
    <div className="relative min-h-dvh w-full bg-[#f5f6fb] text-slate-900">
      <LandingNavbar />
      <div className="relative z-10 w-full pt-[5.25rem] md:pt-28">{children}</div>
    </div>
  );
}
