import { notFound } from "next/navigation";
import {
  getCreatorApplicationProfile,
  getPublicCampaignById,
} from "@/actions/campaigns";
import { CampaignDetailClient } from "./campaign-detail-client";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const campaign = await getPublicCampaignById(id).catch(() => null);
  if (!campaign) {
    return { title: "Campaign not found - Payollar" };
  }
  return {
    title: `${campaign.title} - Payollar`,
    description: campaign.description?.slice(0, 160) || `Apply to ${campaign.title}`,
  };
}

export default async function CampaignDetailPage({ params }) {
  const { id } = await params;
  const [campaign, creatorProfile] = await Promise.all([
    getPublicCampaignById(id),
    getCreatorApplicationProfile().catch(() => null),
  ]);

  if (!campaign) notFound();

  return (
    <CampaignDetailClient
      campaign={campaign}
      creatorProfile={creatorProfile}
    />
  );
}
