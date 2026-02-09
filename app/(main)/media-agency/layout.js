import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { MediaAgencySidebar } from "./_components/media-agency-sidebar";
import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Media Agency Dashboard - Payollar",
  description: "Manage your media listings, bookings, and reporting",
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
    <SidebarProvider defaultOpen={true}>
      <MediaAgencySidebar />
      <SidebarInset className="bg-background">
        {/* Header bar with sidebar toggle - matches other dashboard layouts */}
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
