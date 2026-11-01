import { listBookingChats } from "@/actions/booking-chat";
import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { MessagesWorkspace } from "./_components/booking-thread";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect_url=/messages");

  let chats = [];
  try {
    chats = await listBookingChats();
  } catch (error) {
    console.error("MessagesPage failed:", error);
    if (error?.code === "UNAUTHENTICATED" || error?.message === "Unauthorized") {
      redirect("/sign-in?redirect_url=/messages");
    }
    throw error;
  }

  return <MessagesWorkspace chats={chats} />;
}
