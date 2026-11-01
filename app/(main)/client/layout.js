import { DashboardShell } from "@/components/dashboard-shell";
import { ClientSidebar } from "./_components/client-sidebar";

export const metadata = {
  title: "Payollar — Client",
  description: "Manage campaigns, bookings, and your talent relationships",
};

export default function ClientDashboardLayout({ children }) {
  return (
    <DashboardShell sidebar={<ClientSidebar />} panelAttr="data-client-dashboard-nav">
      {children}
    </DashboardShell>
  );
}
