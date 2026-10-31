import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBookingThread } from "@/actions/booking-chat";
import { getCurrentUser } from "@/actions/onboarding";
import { BookingThread } from "../_components/booking-thread";

export const dynamic = "force-dynamic";

export default async function BookingMessagePage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { appointmentId } = await params;
  const thread = await getBookingThread(appointmentId);
  if (thread?.error || !thread?.appointment) notFound();

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] max-w-3xl flex-col px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/messages" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Messages
        </Link>
      </div>
      <BookingThread appointmentId={appointmentId} initialThread={thread} />
    </div>
  );
}
