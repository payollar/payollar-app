import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { getMediaNegotiation } from "@/actions/media-negotiate";
import { MediaNegotiateWorkspace } from "../../../_components/media-negotiate";

export const dynamic = "force-dynamic";

export default async function ClientMediaNegotiatePage({ params }) {
  const user = await getCurrentUser();
  if (user?.role !== "CLIENT") redirect("/onboarding");

  const { id } = await params;
  const data = await getMediaNegotiation(id).catch(() => null);
  if (!data?.negotiation || data.perspective !== "CLIENT") notFound();

  return (
    <MediaNegotiateWorkspace
      negotiation={data.negotiation}
      perspective="CLIENT"
      backHref="/client/media"
      backLabel="Media bookings"
    />
  );
}
