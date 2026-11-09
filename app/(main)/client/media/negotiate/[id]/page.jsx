import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { getMediaNegotiation } from "@/actions/media-negotiate";
import { MediaNegotiateWorkspace } from "../../../_components/media-negotiate";

export const dynamic = "force-dynamic";

export default async function ClientMediaNegotiatePage({ params, searchParams }) {
  const user = await getCurrentUser();
  if (user?.role !== "CLIENT") redirect("/onboarding");

  const { id } = await params;
  const query = await searchParams;
  const fromCart = query?.from === "cart";
  const cartItemId = typeof query?.cartItemId === "string" ? query.cartItemId : "";

  const data = await getMediaNegotiation(id).catch(() => null);
  if (!data?.negotiation || data.perspective !== "CLIENT") notFound();

  return (
    <MediaNegotiateWorkspace
      negotiation={data.negotiation}
      perspective="CLIENT"
      backHref={fromCart ? "/products/media-cart" : "/client/media"}
      backLabel={fromCart ? "Back to cart" : "Media bookings"}
      cartItemId={fromCart ? cartItemId : ""}
      fromCart={fromCart}
    />
  );
}
