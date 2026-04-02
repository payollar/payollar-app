import LandingBackground from "@/components/landing/landing-background";
import { LandingNavbar } from "@/components/landing/landing-navbar";

export const metadata = {
  title: "Media services - Payollar",
  description:
    "Browse TV, radio, digital, billboard, and creator advertising services.",
};

export default function ProductsLayout({ children }) {
  return (
    <div className="relative min-h-dvh w-full bg-background text-foreground">
      <LandingBackground />
      <LandingNavbar />
      <div className="relative z-10 w-full pt-[5.25rem] md:pt-28">{children}</div>
    </div>
  );
}
