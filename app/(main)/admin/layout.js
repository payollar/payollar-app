import { verifyAdmin } from "@/actions/admin";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./_components/admin-sidebar";

export const metadata = {
  title: "Admin Dashboard - Payollar",
  description: "Manage platform users, analytics, and settings",
};

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }) {
  // Verify the user has admin access
  const isAdmin = await verifyAdmin();

  // Redirect if not an admin
  if (!isAdmin) {
    redirect("/onboarding");
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AdminSidebar />
      <SidebarInset className="bg-background pt-4">
        {/* Header bar with sidebar toggle - pt-4 creates clear separation from main header */}
        <header data-dashboard-header="true" className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
