export const metadata = {
  title: "Media agency portal - Payollar",
  description:
    "Sign in or register your TV, radio, or digital media agency on Payollar.",
};

/** Media agency auth always uses the white/light shell. */
export default function MediaAgencyAuthLayout({ children }) {
  return (
    <div
      data-theme="light"
      data-media-agency-auth="true"
      className="relative min-h-0 w-full flex-1 bg-transparent text-slate-900"
    >
      {children}
    </div>
  );
}
