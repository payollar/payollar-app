import { listBookingChats } from "@/actions/booking-chat";
import { listMediaInboxChats } from "@/actions/media-negotiate";

function sortKey(chat) {
  return (
    chat?.lastMessage?.createdAt ||
    chat?.updatedAt ||
    chat?.startTime ||
    ""
  );
}

/** Booking chats + media deal threads for the Messages inbox. */
export async function listUnifiedInboxChats() {
  const [bookingChats, mediaChats] = await Promise.all([
    listBookingChats().catch((error) => {
      console.error("listBookingChats failed:", error);
      return [];
    }),
    listMediaInboxChats().catch((error) => {
      console.error("listMediaInboxChats failed:", error);
      return [];
    }),
  ]);

  const booking = (Array.isArray(bookingChats) ? bookingChats : []).map((chat) => ({
    ...chat,
    threadType: "BOOKING",
    href: `/messages/${chat.appointmentId}`,
  }));

  const media = Array.isArray(mediaChats) ? mediaChats : [];

  return [...booking, ...media].sort((a, b) => {
    const aKey = sortKey(a);
    const bKey = sortKey(b);
    return String(bKey).localeCompare(String(aKey));
  });
}
