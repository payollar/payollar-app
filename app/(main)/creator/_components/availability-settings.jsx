"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Plus, Loader2, AlertCircle, Edit, Check } from "lucide-react";
import { format } from "date-fns";
import { setAvailabilitySlots } from "@/actions/doctor";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

export function AvailabilitySettings({ slots }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const existingSlot = slots && slots.length > 0 ? slots[0] : null;

  // Custom hook for server action
  const { loading, fn: submitSlots, data } = useFetch(setAvailabilitySlots);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      startTime: existingSlot ? format(new Date(existingSlot.startTime), "HH:mm") : "",
      endTime: existingSlot ? format(new Date(existingSlot.endTime), "HH:mm") : "",
    },
  });

  // Update form when slots change
  useEffect(() => {
    if (existingSlot) {
      reset({
        startTime: format(new Date(existingSlot.startTime), "HH:mm"),
        endTime: format(new Date(existingSlot.endTime), "HH:mm"),
      });
    }
  }, [existingSlot, reset]);

  function createLocalDateFromTime(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const now = new Date();
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );
    return date;
  }

  // Handle slot submission
  const onSubmit = async (data) => {
    if (loading) return;

    const formData = new FormData();

    const today = new Date().toISOString().split("T")[0];

    // Create date objects
    const startDate = createLocalDateFromTime(data.startTime);
    const endDate = createLocalDateFromTime(data.endTime);

    if (startDate >= endDate) {
      toast.error("End time must be after start time");
      return;
    }

    // Add to form data
    formData.append("startTime", startDate.toISOString());
    formData.append("endTime", endDate.toISOString());

    await submitSlots(formData);
  };

  useEffect(() => {
    if (data && data?.success) {
      setShowForm(false);
      toast.success("Availability slots updated successfully");
      router.refresh();
    } else if (data && data?.error) {
      toast.error(data.error || "Failed to update availability");
    }
  }, [data, router]);

  // Format time string for display
  const formatTimeString = (dateString) => {
    try {
      return format(new Date(dateString), "h:mm a");
    } catch (e) {
      return "Invalid time";
    }
  };

  return (
    <Card className="border-emerald-900/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center">
          <Clock className="h-5 w-5 mr-2 text-emerald-400" />
          Availability Settings
        </CardTitle>
        <CardDescription>
          Set your daily availability for client bookings and sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Current Availability Display */}
        {!showForm ? (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3">
                Current Availability
              </h3>

              {slots.length === 0 ? (
                <div className="p-4 rounded-md bg-muted/10 border border-emerald-900/20">
                  <p className="text-muted-foreground mb-2">
                    You haven&apos;t set any availability slots yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Set your daily availability to start accepting appointments from clients.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-4 rounded-md bg-muted/20 border border-emerald-900/20"
                    >
                      <div className="flex items-center">
                        <div className="bg-emerald-900/20 p-2 rounded-full mr-3">
                          <Clock className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {formatTimeString(slot.startTime)} -{" "}
                            {formatTimeString(slot.endTime)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Daily availability • Applies to all days of the week
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-900/20 border border-emerald-700/30">
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-xs text-emerald-400">Active</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => setShowForm(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {slots.length === 0 ? (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Set Availability Time
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Availability
                </>
              )}
            </Button>
          </>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 border border-emerald-900/20 rounded-md p-4"
          >
            <h3 className="text-lg font-medium text-white mb-2">
              Set Daily Availability
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register("startTime", {
                    required: "Start time is required",
                  })}
                  className="bg-background border-emerald-900/20"
                />
                {errors.startTime && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.startTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  {...register("endTime", { required: "End time is required" })}
                  className="bg-background border-emerald-900/20"
                />
                {errors.endTime && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={loading}
                className="border-emerald-900/30"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Availability"
                )}
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 p-4 bg-muted/10 border border-emerald-900/10 rounded-md">
          <h4 className="font-medium text-white mb-2 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-emerald-400" />
            How Availability Works
          </h4>
          <p className="text-muted-foreground text-sm">
            Setting your daily availability allows clients to book sessions
            during those hours. The same availability applies to all days. You
            can update your availability at any time, but existing booked
            sessions will not be affected.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
