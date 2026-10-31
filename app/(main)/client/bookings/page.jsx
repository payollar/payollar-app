import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { listMyOrders } from "@/actions/booking-orders";
import { OrderList } from "@/components/orders/order-list";

export const dynamic = "force-dynamic";

export default async function ClientBookingsPage({ searchParams }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "CLIENT") {
    redirect("/onboarding");
  }

  const params = searchParams ? await searchParams : {};
  const orders = await listMyOrders();

  return (
    <OrderList
      orders={orders}
      basePath="/client/bookings"
      paymentSuccess={params?.success}
      paymentError={params?.error}
    />
  );
}
