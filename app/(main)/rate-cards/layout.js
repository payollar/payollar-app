import { LandingNavbar } from "@/components/landing/landing-navbar";

export const metadata = {
  title: "Rate card - Payollar",
  description: "Browse station rates and build your media buy.",
};

export default function RateCardsLayout({ children }) {
  return (
    <div
      data-theme="light"
      className="relative isolate min-h-dvh w-full bg-[#f3f4f6] text-slate-900"
    >
      <LandingNavbar />
      <div className="relative z-10 w-full pt-[5.25rem] md:pt-28">
        {children}
      </div>
    </div>
  );
}
