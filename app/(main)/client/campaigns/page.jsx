import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { getClientCampaigns } from "@/actions/campaigns";
import { ClientCampaigns } from "../_components/campaigns";

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function ClientCampaignsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CLIENT") {
    redirect("/onboarding");
  }

  const campaignsData = await getClientCampaigns().catch(() => ({ campaigns: [] }));

  return (
    <ClientCampaigns campaigns={campaignsData.campaigns || []} />
  );
}
