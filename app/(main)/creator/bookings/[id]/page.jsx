import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { getMyOrder } from "@/actions/booking-orders";
import { OrderDetail } from "@/components/orders/order-detail";

export const dynamic = "force-dynamic";

export default async function CreatorOrderPage({ params }) {
  const user = await getCurrentUser();
  if (user?.role !== "CREATOR") redirect("/onboarding");
  if (user?.verificationStatus !== "VERIFIED") redirect("/creator/verification");

  const { id } = await params;
  const order = await getMyOrder(id);
  if (!order) notFound();

  return <OrderDetail order={order} basePath="/creator/bookings" />;
}
