import { getActiveCampaigns } from "@/actions/campaigns";
import { CampaignsClient } from "./campaigns-client";

export default async function CampaignsPage() {
  const campaignsData = await getActiveCampaigns().catch(() => ({ campaigns: [] }));

  return <CampaignsClient initialCampaigns={campaignsData.campaigns || []} />;
}
