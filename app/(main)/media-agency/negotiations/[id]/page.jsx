import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { getMediaNegotiation } from "@/actions/media-negotiate";
import { MediaNegotiateWorkspace } from "@/app/(main)/client/_components/media-negotiate";
import { MediaAgencyPageShell } from "../../_components/media-agency-page-shell";
import { DASHBOARD_CARD_CLASS } from "@/lib/dashboard-theme";

export const dynamic = "force-dynamic";

export default async function AgencyMediaNegotiatePage({ params }) {
  const user = await getCurrentUser();
  if (user?.role !== "MEDIA_AGENCY") redirect("/onboarding");

  const { id } = await params;
  const data = await getMediaNegotiation(id).catch(() => null);
  if (!data?.negotiation || data.perspective !== "AGENCY") notFound();

  return (
    <MediaNegotiateWorkspace
      negotiation={data.negotiation}
      perspective="AGENCY"
      backHref="/media-agency/requests"
      backLabel="Requests"
      PageShell={MediaAgencyPageShell}
      cardClass={DASHBOARD_CARD_CLASS}
    />
  );
}
