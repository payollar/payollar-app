import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { ensureMediaNegotiation } from "@/actions/media-negotiate";

export const dynamic = "force-dynamic";

export default async function StartAgencyMediaNegotiatePage({ params }) {
  const user = await getCurrentUser();
  if (user?.role !== "MEDIA_AGENCY") redirect("/onboarding");

  const { sourceType, sourceId } = await params;
  const type =
    sourceType === "RATE_CARD_BOOKING" ? "RATE_CARD_BOOKING" : "MEDIA_BOOKING";

  const result = await ensureMediaNegotiation(type, sourceId).catch(() => null);
  if (!result?.negotiation?.id) redirect("/media-agency/requests");
  redirect(`/media-agency/negotiations/${result.negotiation.id}`);
}
