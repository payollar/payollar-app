import LandingBackground from "@/components/landing/landing-background";
import { LandingNavbar } from "@/components/landing/landing-navbar";

export const metadata = {
  title: "Payollar AI - Payollar",
  description:
    "Ask Payollar AI about media planning, campaigns, creators, and marketing strategy.",
};

export default function ChatLayout({ children }) {
  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-black">
      <LandingBackground />
      <LandingNavbar />
      <div className="relative z-10 flex h-dvh w-full flex-col pt-[4.75rem] md:pt-[5.5rem]">
        {children}
      </div>
    </div>
  );
}
