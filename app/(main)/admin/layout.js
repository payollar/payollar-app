import { Suspense } from "react";
import { verifyAdmin } from "@/actions/admin";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { AdminSidebar } from "./_components/admin-sidebar";

export const metadata = {
  title: "Admin Dashboard - Payollar",
  description: "Manage platform users, analytics, and settings",
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) {
    redirect("/onboarding");
  }

  return (
    <DashboardShell
      railTone="light"
      sidebar={
        <Suspense fallback={null}>
          <AdminSidebar />
        </Suspense>
      }
      panelAttr="data-admin-dashboard-nav"
    >
      {children}
    </DashboardShell>
  );
}
