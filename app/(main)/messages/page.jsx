import Link from "next/link";
import { format } from "date-fns";
import { MessageCircle } from "lucide-react";
import { listBookingChats } from "@/actions/booking-chat";
import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect_url=/messages");

  const chats = await listBookingChats();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Chat opens after a booking, between you and the other person on that session.
        </p>
      </div>
      {chats.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center">
          <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No booking chats yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            A conversation appears here once a session is booked.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {chats.map((chat) => (
            <li key={chat.appointmentId}>
              <Link href={`/messages/${chat.appointmentId}`} className="flex items-start gap-3 px-4 py-4 hover:bg-muted/40">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {(chat.other?.name || "?").charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="truncate font-medium">{chat.other?.name || "Booking"}</span>
                    {chat.unread > 0 ? (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                        {chat.unread}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                    {chat.lastMessage
                      ? `${chat.lastMessage.mine ? "You: " : ""}${chat.lastMessage.body}`
                      : "No messages yet"}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Session {format(new Date(chat.startTime), "MMM d, yyyy · h:mm a")}
                    {chat.appointmentStatus === "CANCELLED" ? " · Cancelled" : ""}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
