import { LandingNavbar } from "@/components/landing/landing-navbar";

export const metadata = {
  title: "Help Center - Payollar",
  description:
    "Find answers to common questions and learn how to make the most of Payollar.",
};

export default function HelpLayout({ children }) {
  return (
    <div
      data-theme="light"
      className="relative isolate min-h-dvh w-full overflow-x-hidden text-slate-900"
      style={{
        backgroundColor: "#f4f6fb",
        backgroundImage: [
          "radial-gradient(ellipse 90% 55% at 50% -8%, rgba(0, 85, 255, 0.12), transparent 60%)",
          "radial-gradient(ellipse 45% 40% at 100% 18%, rgba(99, 140, 255, 0.1), transparent 55%)",
          "radial-gradient(ellipse 40% 35% at 0% 70%, rgba(0, 85, 255, 0.05), transparent 50%)",
          "linear-gradient(180deg, #eef2fb 0%, #f4f6fb 28%, #f7f8fc 100%)",
        ].join(", "),
      }}
    >
      <LandingNavbar />
      <div className="relative z-10 w-full pt-[5.25rem] md:pt-28">
        {children}
      </div>
    </div>
  );
}
