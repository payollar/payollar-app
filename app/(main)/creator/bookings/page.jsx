import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { listMyOrders } from "@/actions/booking-orders";
import { OrderList } from "@/components/orders/order-list";

export const dynamic = "force-dynamic";

export default async function CreatorBookingsPage() {
  const user = await getCurrentUser();

  if (user?.role !== "CREATOR") {
    redirect("/onboarding");
  }

  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  const orders = await listMyOrders();

  return <OrderList orders={orders} basePath="/creator/bookings" />;
}
