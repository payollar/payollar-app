import { DashboardShell } from "@/components/dashboard-shell";
import { MediaAgencySidebar } from "./_components/media-agency-sidebar";
import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Payollar — Media agency",
  description: "Manage listings, bookings, rate cards, and campaign reporting",
};

export default async function MediaAgencyDashboardLayout({ children }) {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role !== "MEDIA_AGENCY") {
    redirect("/");
  }

  return (
    <DashboardShell
      sidebar={<MediaAgencySidebar />}
      panelAttr="data-media-agency-dashboard-nav"
    >
      {children}
    </DashboardShell>
  );
}
