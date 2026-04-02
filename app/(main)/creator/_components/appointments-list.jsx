"use client";

import { useEffect } from "react";
import { getDoctorAppointments } from "@/actions/doctor";
import { AppointmentCard } from "@/components/appointment-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { CreatorPageShell, creatorCardClass } from "./creator-page-shell";

export default function CreatorAppointmentsList({ appointments: initialAppointments = [] }) {
  const {
    loading,
    data,
    fn: fetchAppointments,
  } = useFetch(getDoctorAppointments);

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only refresh
  }, []);

  const appointments = data?.appointments ?? initialAppointments;

  return (
    <CreatorPageShell
      eyebrow="Calendar"
      title="Bookings"
      description="Upcoming sessions and requests from clients."
    >
      <Card className={creatorCardClass}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && appointments.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">Loading bookings…</p>
            </div>
          ) : appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole="CREATOR"
                  refetchAppointments={fetchAppointments}
                />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              <Calendar className="mx-auto mb-3 h-12 w-12 opacity-40" />
              <h3 className="mb-2 text-lg font-medium text-foreground">No upcoming bookings</h3>
              <p className="mx-auto max-w-md text-sm">
                You don&apos;t have any scheduled bookings yet. Set your availability so clients can
                book sessions with you.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </CreatorPageShell>
  );
}
