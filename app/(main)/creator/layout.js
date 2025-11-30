import { User } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Creator Dashboard - Payollar",
  description: "Manage your profile, bookings, and grow your creator business",
};

export default async function CreatorDashboardLayout({ children }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader icon={<User />} title="Creator Dashboard" />
      {children}
    </div>
  );
}
