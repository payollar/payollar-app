import { DashboardShell } from "@/components/dashboard-shell";
import { CreatorSidebar } from "./_components/creator-sidebar";

export const metadata = {
  title: "Payollar — Creator",
  description: "Manage your profile, bookings, and grow your creator business",
};

export default function CreatorDashboardLayout({ children }) {
  return (
    <DashboardShell sidebar={<CreatorSidebar />} panelAttr="data-creator-dashboard-nav">
      {children}
    </DashboardShell>
  );
}
