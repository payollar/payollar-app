import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import {
  getDisputeEligibleBookings,
  getMyDisputes,
} from "@/actions/disputes";
import { DisputesWorkspace } from "@/components/disputes/disputes-workspace";

export const dynamic = "force-dynamic";

export default async function ClientDisputesPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CLIENT") {
    redirect("/onboarding");
  }

  const [disputesData, bookingsData] = await Promise.all([
    getMyDisputes().catch(() => ({ disputes: [] })),
    getDisputeEligibleBookings().catch(() => ({ bookings: [] })),
  ]);

  return (
    <DisputesWorkspace
      role="CLIENT"
      disputes={disputesData.disputes || []}
      bookings={bookingsData.bookings || []}
      basePath="/client/disputes"
    />
  );
}
