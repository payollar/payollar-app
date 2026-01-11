import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { getDoctorPayouts, getDoctorEarnings } from "@/actions/payout";
import { CreatorPayoutsPage } from "../_components/creator-payouts";

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function CreatorPayoutsPageRoute() {
  const user = await getCurrentUser();

  if (user?.role !== "CREATOR") {
    redirect("/onboarding");
  }

  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  const [payoutsData, earningsData] = await Promise.all([
    getDoctorPayouts().catch(() => ({ payouts: [] })),
    getDoctorEarnings().catch(() => ({ earnings: {} })),
  ]);

  return (
    <CreatorPayoutsPage
      user={user}
      payouts={payoutsData.payouts || []}
      earnings={earningsData.earnings || {}}
    />
  );
}
