import LandingBackground from "@/components/landing/landing-background";
import { LandingNavbar } from "@/components/landing/landing-navbar";

export const metadata = {
  title: "Payollar AI - Payollar",
  description:
    "Ask Payollar AI about media planning, campaigns, creators, and marketing strategy.",
};

export default function ChatLayout({ children }) {
  return (
    <div className="relative min-h-dvh w-full bg-black">
      <LandingBackground />
      <LandingNavbar />
      <div className="relative z-10 w-full pt-[5.25rem] md:pt-28">{children}</div>
    </div>
  );
}
