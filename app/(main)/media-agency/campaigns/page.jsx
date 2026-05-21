import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { getClientCampaigns } from "@/actions/campaigns";
import { ClientCampaigns } from "@/app/(main)/client/_components/campaigns";

export const dynamic = "force-dynamic";

export default async function MediaAgencyCampaignsPage({ searchParams }) {
  const user = await checkUser();

  if (!user || user.role !== "MEDIA_AGENCY") {
    redirect("/");
  }

  const mediaAgency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
    select: { agencyName: true },
  });

  if (!mediaAgency) {
    redirect("/media-agency/settings");
  }

  const params = searchParams ? await searchParams : {};
  const campaignsData = await getClientCampaigns().catch(() => ({ campaigns: [] }));

  return (
    <ClientCampaigns
      campaigns={campaignsData.campaigns || []}
      variant="media-agency"
      defaultBrand={mediaAgency.agencyName}
      initialCreateOpen={params.create === "true"}
    />
  );
}
