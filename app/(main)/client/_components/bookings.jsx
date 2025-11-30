"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentCard } from "@/components/appointment-card";
import { Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ClientBookings({ appointments = [], error }) {
  // Separate appointments by status
  const upcoming = appointments.filter(
    (apt) => apt.status === "SCHEDULED" && new Date(apt.startTime) > new Date()
  );
  const completed = appointments.filter((apt) => apt.status === "COMPLETED");
  const cancelled = appointments.filter((apt) => apt.status === "CANCELLED");

  if (error) {
    return (
      <Card className="border-emerald-900/20">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-3" />
            <p className="text-red-400">Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Appointments */}
      <Card className="border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-emerald-400" />
            Upcoming Bookings ({upcoming.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length > 0 ? (
            <div className="space-y-4">
              {upcoming.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole="PATIENT"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-xl font-medium text-white mb-2">
                No upcoming bookings
              </h3>
              <p className="text-muted-foreground mb-4">
                Browse our talented creators and book your next session.
              </p>
              <Link href="/talents">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Browse Talents
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Appointments */}
      <Card className="border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">
            Completed ({completed.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completed.length > 0 ? (
            <div className="space-y-4">
              {completed.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole="PATIENT"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No completed bookings yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancelled Appointments */}
      {cancelled.length > 0 && (
        <Card className="border-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">
              Cancelled ({cancelled.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cancelled.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole="PATIENT"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State - No appointments at all */}
      {appointments.length === 0 && (
        <Card className="border-emerald-900/20">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-xl font-medium text-white mb-2">
                No appointments scheduled
              </h3>
              <p className="text-muted-foreground mb-4">
                You don't have any appointments scheduled yet. Browse our talented creators
                and book your first consultation.
              </p>
              <Link href="/talents">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Browse Talents
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

