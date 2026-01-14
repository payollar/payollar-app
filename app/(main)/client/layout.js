import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ClientSidebar } from "./_components/client-sidebar";

export const metadata = {
  title: "Client Dashboard - Payollar",
  description: "Manage your campaigns and talent bookings",
};

export default async function ClientDashboardLayout({ children }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <ClientSidebar />
      <SidebarInset className="bg-background">
        {/* Header bar with sidebar toggle */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
