import { verifyAdmin } from "@/actions/admin";
import { redirect } from "next/navigation";
import { AdminSettings } from "../_components/admin-settings";

export const metadata = {
  title: "Admin Settings - Payollar",
  description: "Manage platform settings and configuration",
};

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  // Verify the user has admin access
  const isAdmin = await verifyAdmin();

  // Redirect if not an admin
  if (!isAdmin) {
    redirect("/onboarding");
  }

  return <AdminSettings />;
}
