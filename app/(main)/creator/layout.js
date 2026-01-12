import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { CreatorSidebar } from "./_components/creator-sidebar";

export const metadata = {
  title: "Creator Dashboard - Payollar",
  description: "Manage your profile, bookings, and grow your creator business",
};

export default async function CreatorDashboardLayout({ children }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <CreatorSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex-1 p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
