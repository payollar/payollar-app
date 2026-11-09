import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import {
  getDisputeEligibleBookings,
  getMyDisputes,
} from "@/actions/disputes";
import { DisputesWorkspace } from "@/components/disputes/disputes-workspace";

export const dynamic = "force-dynamic";

export default async function CreatorDisputesPage() {
  const user = await getCurrentUser();

  if (user?.role !== "CREATOR") {
    redirect("/onboarding");
  }
  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  const [disputesData, bookingsData] = await Promise.all([
    getMyDisputes().catch(() => ({ disputes: [] })),
    getDisputeEligibleBookings().catch(() => ({ bookings: [] })),
  ]);

  return (
    <DisputesWorkspace
      role="CREATOR"
      disputes={disputesData.disputes || []}
      bookings={bookingsData.bookings || []}
      basePath="/creator/disputes"
    />
  );
}
