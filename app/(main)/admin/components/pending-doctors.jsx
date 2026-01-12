"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, User, Medal, FileText, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { updateDoctorStatus } from "@/actions/admin";
import useFetch from "@/hooks/use-fetch";
import { useEffect } from "react";
import { BarLoader } from "react-spinners";

export function PendingDoctors({ doctors }) {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Custom hook for approve/reject server action
  const {
    loading,
    data,
    fn: submitStatusUpdate,
  } = useFetch(updateDoctorStatus);

  // Open doctor details dialog
  const handleViewDetails = (doctor) => {
    setSelectedDoctor(doctor);
  };

  // Close doctor details dialog
  const handleCloseDialog = () => {
    setSelectedDoctor(null);
  };

  // Handle approve or reject doctor
  const handleUpdateStatus = async (doctorId, status) => {
    if (loading) return;

    const formData = new FormData();
    formData.append("doctorId", doctorId);
    formData.append("status", status);

    await submitStatusUpdate(formData);
  };

  useEffect(() => {
    if (data && data?.success) {
      handleCloseDialog();
    }
  }, [data]);

  return (
    <div>
      <Card className="bg-muted/20 border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl font-bold text-white">
            Pending Talent Verifications
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Review and approve talents applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {doctors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending verification requests at this time.
            </div>
          ) : (
            <div className="space-y-4">
              {doctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className="bg-background border-emerald-900/20 hover:border-emerald-700/30 transition-all"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted/20 border-2 border-emerald-900/30 flex-shrink-0">
                          {doctor.imageUrl ? (
                            <Image
                              src={doctor.imageUrl}
                              alt={doctor.name || "Profile"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-900/20 to-purple-900/20">
                              <span className="text-lg text-emerald-400 font-bold">
                                {(doctor.name || "U").charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-white">
                            {doctor.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {doctor.specialty} • {doctor.experience} years
                            experience
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-end md:self-auto">
                        <Badge
                          variant="outline"
                          className="bg-amber-900/20 border-amber-900/30 text-amber-400 w-fit"
                        >
                          Pending
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(doctor)}
                          className="border-emerald-900/30 hover:bg-muted/80 w-full sm:w-auto"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Doctor Details Dialog */}
      {selectedDoctor && (
        <Dialog open={!!selectedDoctor} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Talents Verification Details
              </DialogTitle>
              <DialogDescription>
                Review the creator&apos;s information carefully before making a
                decision
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-6 py-4">
              {/* Profile Image and Basic Info */}
              <div className="flex flex-col items-center sm:items-start gap-4 pb-4 border-b border-emerald-900/20">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-muted/20 border-4 border-emerald-900/30">
                  {selectedDoctor.imageUrl ? (
                    <Image
                      src={selectedDoctor.imageUrl}
                      alt={selectedDoctor.name || "Profile"}
                      fill
                      className="object-cover"
                      sizes="96px"
                      unoptimized={selectedDoctor.imageUrl?.startsWith('http')}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-900/20 to-purple-900/20">
                      <span className="text-2xl sm:text-3xl text-emerald-400 font-bold">
                        {(selectedDoctor.name || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                    {selectedDoctor.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground break-all">
                    {selectedDoctor.email}
                  </p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Application Date
                  </h4>
                  <p className="text-sm sm:text-base font-medium text-white">
                    {format(new Date(selectedDoctor.createdAt), "PPP")}
                  </p>
                </div>
              </div>

              <Separator className="bg-emerald-900/20" />

              {/* Professional Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Medal className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                  <h3 className="text-sm sm:text-base text-white font-medium">
                    Professional Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4 sm:gap-x-6">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Specialty
                    </h4>
                    <p className="text-white">{selectedDoctor.specialty}</p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Years of Experience
                    </h4>
                    <p className="text-white">
                      {selectedDoctor.experience} years
                    </p>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Credentials
                    </h4>
                    <div className="flex items-center">
                      <a
                        href={selectedDoctor.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 flex items-center"
                      >
                        View Credentials
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-emerald-900/20" />

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-white font-medium">
                    Service Description
                  </h3>
                </div>
                <p className="text-muted-foreground whitespace-pre-line">
                  {selectedDoctor.description}
                </p>
              </div>
            </div>

            {loading && <BarLoader width={"100%"} color="#36d7b7" />}

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
              <Button
                variant="destructive"
                onClick={() =>
                  handleUpdateStatus(selectedDoctor.id, "REJECTED")
                }
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button
                onClick={() =>
                  handleUpdateStatus(selectedDoctor.id, "VERIFIED")
                }
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
