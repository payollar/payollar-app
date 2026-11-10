import { notFound, redirect } from "next/navigation";
import { getBookingThread } from "@/actions/booking-chat";
import { getCurrentUser } from "@/actions/onboarding";
import { listUnifiedInboxChats } from "@/lib/unified-inbox";
import { MessagesWorkspace } from "../_components/booking-thread";

export const dynamic = "force-dynamic";

export default async function BookingMessagePage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect_url=/messages");

  const { appointmentId } = await params;

  let thread;
  let chats = [];
  try {
    [thread, chats] = await Promise.all([
      getBookingThread(appointmentId),
      listUnifiedInboxChats(),
    ]);
  } catch (error) {
    console.error("BookingMessagePage failed:", error);
    if (error?.code === "UNAUTHENTICATED" || error?.message === "Unauthorized") {
      redirect(`/sign-in?redirect_url=/messages/${appointmentId}`);
    }
    thread = { error: "Could not load this chat." };
    chats = [];
  }

  if (thread?.code === "UNAUTHENTICATED") {
    redirect(`/sign-in?redirect_url=/messages/${appointmentId}`);
  }
  if (thread?.error || !thread?.appointment) notFound();

  return (
    <MessagesWorkspace
      chats={Array.isArray(chats) ? chats : []}
      appointmentId={appointmentId}
      initialThread={thread}
    />
  );
}
