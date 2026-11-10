import { getCurrentUser } from "@/actions/onboarding";
import {
  getActiveCampaigns,
  getCreatorCampaignApplications,
} from "@/actions/campaigns";
import { redirect } from "next/navigation";
import { CreatorApplications } from "../_components/creator-applications";

export const dynamic = "force-dynamic";

export default async function CreatorApplicationsPage() {
  const user = await getCurrentUser();

  if (user?.role !== "CREATOR") {
    redirect("/onboarding");
  }

  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  const [applicationsData, campaignsData] = await Promise.all([
    getCreatorCampaignApplications().catch(() => ({ applications: [] })),
    getActiveCampaigns().catch(() => ({ campaigns: [] })),
  ]);

  return (
    <CreatorApplications
      applications={applicationsData.applications || []}
      openCampaigns={campaignsData.campaigns || []}
    />
  );
}
