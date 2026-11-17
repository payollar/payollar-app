import { LandingNavbar } from "@/components/landing/landing-navbar";

export const metadata = {
  title: "Contact Support - Payollar",
  description:
    "Get help with your Payollar account, bookings, media buys, and billing.",
};

export default function ContactSupportLayout({ children }) {
  return (
    <div
      data-theme="light"
      data-landing-page
      className="relative isolate min-h-dvh w-full overflow-x-hidden text-slate-900"
      style={{
        backgroundColor: "#f4f6fb",
        backgroundImage: [
          "radial-gradient(ellipse 90% 55% at 50% -8%, rgba(0, 85, 255, 0.1), transparent 60%)",
          "radial-gradient(ellipse 45% 40% at 100% 18%, rgba(99, 140, 255, 0.08), transparent 55%)",
          "linear-gradient(180deg, #f4f6fb 0%, #f4f6fb 28%, #f7f8fc 100%)",
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
