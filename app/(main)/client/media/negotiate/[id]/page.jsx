import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";

export const dynamic = "force-dynamic";

/** Legacy URL — media deals now live in the unified Messages inbox. */
export default async function ClientMediaNegotiatePage({ params, searchParams }) {
  const user = await getCurrentUser();
  if (user?.role !== "CLIENT") redirect("/onboarding");

  const { id } = await params;
  const query = await searchParams;
  const from = query?.from === "cart" ? "cart" : "";
  const cartItemId = typeof query?.cartItemId === "string" ? query.cartItemId : "";

  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (cartItemId) qs.set("cartItemId", cartItemId);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";

  redirect(`/messages/media/${id}${suffix}`);
}
