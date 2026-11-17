import { LandingNavbar } from "@/components/landing/landing-navbar";

export const metadata = {
  title: "Privacy Policy | Payollar",
  description:
    "How Payollar collects, uses, and protects your information across talent, campaigns, and media buying.",
};

export default function PrivacyLayout({ children }) {
  return (
    <div
      data-theme="light"
      data-landing-page
      className="relative isolate min-h-dvh w-full overflow-x-hidden text-slate-900"
      style={{
        backgroundColor: "#f4f6fb",
        backgroundImage: [
          "radial-gradient(ellipse 90% 55% at 50% -8%, rgba(0, 85, 255, 0.08), transparent 60%)",
          "linear-gradient(180deg, #f4f6fb 0%, #f7f8fc 100%)",
        ].join(", "),
      }}
    >
      <LandingNavbar />
      <div className="relative z-10 w-full pt-[5.25rem] md:pt-28">{children}</div>
    </div>
  );
}
