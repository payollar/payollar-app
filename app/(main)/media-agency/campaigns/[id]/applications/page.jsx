import { redirect, notFound } from "next/navigation";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { getClientCampaignById } from "@/actions/campaigns";
import { CampaignApplications } from "@/app/(main)/client/_components/campaign-applications";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const campaign = await getClientCampaignById(id).catch(() => null);
  if (!campaign) return { title: "Applications - Payollar" };
  return { title: `Applications · ${campaign.title} - Payollar` };
}

export default async function MediaAgencyCampaignApplicationsPage({ params }) {
  const user = await checkUser();

  if (!user || user.role !== "MEDIA_AGENCY") {
    redirect("/");
  }

  const mediaAgency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!mediaAgency) {
    redirect("/media-agency/settings");
  }

  const { id } = await params;
  const campaign = await getClientCampaignById(id).catch(() => null);

  if (!campaign) notFound();

  return <CampaignApplications campaign={campaign} variant="media-agency" />;
}
