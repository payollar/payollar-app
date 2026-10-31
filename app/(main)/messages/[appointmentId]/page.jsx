import { notFound, redirect } from "next/navigation";
import { getBookingThread, listBookingChats } from "@/actions/booking-chat";
import { getCurrentUser } from "@/actions/onboarding";
import { MessagesWorkspace } from "../_components/booking-thread";

export const dynamic = "force-dynamic";

export default async function BookingMessagePage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect_url=/messages");

  const { appointmentId } = await params;
  const [thread, chats] = await Promise.all([getBookingThread(appointmentId), listBookingChats()]);
  if (thread?.error || !thread?.appointment) notFound();

  return <MessagesWorkspace chats={chats} appointmentId={appointmentId} initialThread={thread} />;
}
