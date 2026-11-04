import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { getCreatorCampaignApplications } from "@/actions/campaigns";
import { getCreatorDeliveryReports } from "@/actions/delivery-reports";
import { CreatorDeliveryReports } from "../_components/delivery-reports";

export const dynamic = "force-dynamic";

export default async function CreatorReportsPage() {
  const user = await getCurrentUser();

  if (user?.role !== "CREATOR") {
    redirect("/onboarding");
  }
  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  const [reportsData, applicationsData] = await Promise.all([
    getCreatorDeliveryReports().catch(() => ({ reports: [] })),
    getCreatorCampaignApplications().catch(() => ({ applications: [] })),
  ]);

  const acceptedApplications = (applicationsData.applications || []).filter(
    (app) => app.status === "ACCEPTED"
  );

  return (
    <CreatorDeliveryReports
      reports={reportsData.reports || []}
      acceptedApplications={acceptedApplications}
    />
  );
}
