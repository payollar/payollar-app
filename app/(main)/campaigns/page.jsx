import {
  getActiveCampaigns,
  getCreatorApplicationProfile,
} from "@/actions/campaigns";
import { CampaignsClient } from "./campaigns-client";

export default async function CampaignsPage() {
  const [campaignsData, creatorProfile] = await Promise.all([
    getActiveCampaigns().catch(() => ({ campaigns: [] })),
    getCreatorApplicationProfile().catch(() => null),
  ]);

  return (
    <CampaignsClient
      initialCampaigns={campaignsData.campaigns || []}
      creatorProfile={creatorProfile}
    />
  );
}
