import { notFound, redirect } from "next/navigation";
import { getMediaNegotiation } from "@/actions/media-negotiate";
import { getCurrentUser } from "@/actions/onboarding";
import { listUnifiedInboxChats } from "@/lib/unified-inbox";
import { MessagesWorkspace } from "../../_components/booking-thread";

export const dynamic = "force-dynamic";

export default async function MediaMessagePage({ params, searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect_url=/messages");

  const { negotiationId } = await params;
  const query = await searchParams;
  const fromCart = query?.from === "cart";
  const cartItemId = typeof query?.cartItemId === "string" ? query.cartItemId : "";

  let data = null;
  let chats = [];
  try {
    [data, chats] = await Promise.all([
      getMediaNegotiation(negotiationId),
      listUnifiedInboxChats(),
    ]);
  } catch (error) {
    console.error("MediaMessagePage failed:", error);
    if (error?.code === "UNAUTHENTICATED" || error?.message === "Unauthorized") {
      redirect(`/sign-in?redirect_url=/messages/media/${negotiationId}`);
    }
  }

  if (!data?.negotiation) notFound();

  return (
    <MessagesWorkspace
      chats={Array.isArray(chats) ? chats : []}
      negotiationId={negotiationId}
      initialNegotiation={data.negotiation}
      negotiationPerspective={data.perspective || "CLIENT"}
      fromCart={fromCart}
      cartItemId={cartItemId}
    />
  );
}
