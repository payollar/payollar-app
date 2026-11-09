import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { getMyDispute } from "@/actions/disputes";
import { DisputeDetailView } from "@/components/disputes/dispute-detail-view";

export const dynamic = "force-dynamic";

export default async function CreatorDisputeDetailPage({ params }) {
  const user = await getCurrentUser();

  if (user?.role !== "CREATOR") {
    redirect("/onboarding");
  }
  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  const { id } = await params;
  const result = await getMyDispute(id);

  if (result?.error === "Dispute not found") notFound();
  if (result?.error) redirect("/creator/disputes");

  return (
    <DisputeDetailView
      dispute={result.dispute}
      chat={result.chat}
      backHref="/creator/disputes"
    />
  );
}
