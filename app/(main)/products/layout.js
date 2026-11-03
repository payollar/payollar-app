import { LandingNavbar } from "@/components/landing/landing-navbar";

export const metadata = {
  title: "Media services - Payollar",
  description:
    "Browse TV, radio, digital, billboard, and creator advertising services.",
};

export default function ProductsLayout({ children }) {
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
