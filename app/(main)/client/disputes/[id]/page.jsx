import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { getMyDispute } from "@/actions/disputes";
import { DisputeDetailView } from "@/components/disputes/dispute-detail-view";

export const dynamic = "force-dynamic";

export default async function ClientDisputeDetailPage({ params }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "CLIENT") {
    redirect("/onboarding");
  }

  const { id } = await params;
  const result = await getMyDispute(id);

  if (result?.error === "Dispute not found") notFound();
  if (result?.error) redirect("/client/disputes");

  return (
    <DisputeDetailView
      dispute={result.dispute}
      backHref="/client/disputes"
    />
  );
}
