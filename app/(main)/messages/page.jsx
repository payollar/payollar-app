import { listBookingChats } from "@/actions/booking-chat";
import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { MessagesWorkspace } from "./_components/booking-thread";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect_url=/messages");

  const chats = await listBookingChats();

  return <MessagesWorkspace chats={chats} />;
}
