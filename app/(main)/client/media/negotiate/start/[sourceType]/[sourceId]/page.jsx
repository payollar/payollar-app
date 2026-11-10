import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { ensureMediaNegotiation } from "@/actions/media-negotiate";

export const dynamic = "force-dynamic";

export default async function StartClientMediaNegotiatePage({ params }) {
  const user = await getCurrentUser();
  if (user?.role !== "CLIENT") redirect("/onboarding");

  const { sourceType, sourceId } = await params;
  const type =
    sourceType === "RATE_CARD_BOOKING" ? "RATE_CARD_BOOKING" : "MEDIA_BOOKING";

  const result = await ensureMediaNegotiation(type, sourceId).catch((error) => {
    console.error(error);
    return null;
  });

  if (!result?.negotiation?.id) {
    redirect("/client/media");
  }

  redirect(`/messages/media/${result.negotiation.id}`);
}
