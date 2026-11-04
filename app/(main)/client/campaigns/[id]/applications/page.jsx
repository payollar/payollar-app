import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { getClientCampaignById } from "@/actions/campaigns";
import { CampaignApplications } from "../../../_components/campaign-applications";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const campaign = await getClientCampaignById(id).catch(() => null);
  if (!campaign) return { title: "Applications - Payollar" };
  return { title: `Applications · ${campaign.title} - Payollar` };
}

export default async function ClientCampaignApplicationsPage({ params }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "CLIENT") {
    redirect("/onboarding");
  }

  const { id } = await params;
  const campaign = await getClientCampaignById(id).catch(() => null);

  if (!campaign) notFound();

  return <CampaignApplications campaign={campaign} variant="client" />;
}
