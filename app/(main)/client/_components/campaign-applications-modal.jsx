"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle, XCircle, User, Mail, MapPin, Clock, DollarSign } from "lucide-react";
import Image from "next/image";
import { updateApplicationStatus } from "@/actions/campaigns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CampaignApplicationsModal({ open, onOpenChange, campaign }) {
  const router = useRouter();

  if (!campaign) return null;

  const handleApplicationStatus = async (applicationId, status) => {
    try {
      const formData = new FormData();
      formData.append("applicationId", applicationId);
      formData.append("status", status);

      const result = await updateApplicationStatus(formData);

      if (result?.success) {
        toast.success(`Application ${status.toLowerCase()} successfully`);
        router.refresh();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update application status");
    }
  };

  const applications = campaign.applications || [];
  const pendingApplications = applications.filter((app) => app.status === "PENDING");
  const acceptedApplications = applications.filter((app) => app.status === "ACCEPTED");
  const rejectedApplications = applications.filter((app) => app.status === "REJECTED");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Applications for {campaign.title}
          </DialogTitle>
          <DialogDescription>
            Review and manage applications from talented creators
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted/20 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-white">{pendingApplications.length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="bg-emerald-900/20 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-emerald-400">{acceptedApplications.length}</p>
              <p className="text-sm text-muted-foreground">Accepted</p>
            </div>
            <div className="bg-red-900/20 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-400">{rejectedApplications.length}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </div>

          {/* Applications List */}
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No applications yet</h3>
              <p className="text-muted-foreground">
                Share your campaign to start receiving applications from creators
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onAccept={() => handleApplicationStatus(application.id, "ACCEPTED")}
                  onReject={() => handleApplicationStatus(application.id, "REJECTED")}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ApplicationCard({ application, onAccept, onReject }) {
  const talent = application.talent;
  const statusColors = {
    PENDING: "bg-amber-900/20 border-amber-900/30 text-amber-400",
    ACCEPTED: "bg-emerald-900/20 border-emerald-900/30 text-emerald-400",
    REJECTED: "bg-red-900/20 border-red-900/30 text-red-400",
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-800">
            {talent?.imageUrl ? (
              <Image
                src={talent.imageUrl}
                alt={talent.name || "Talent"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                {talent?.name?.charAt(0) || "T"}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-white text-lg">{application.name}</h4>
            <p className="text-sm text-muted-foreground">{talent?.specialty || "Creator"}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={statusColors[application.status] || ""}>
                {application.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>{format(new Date(application.createdAt), "MMM d, yyyy")}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>{application.email}</span>
        </div>
        {application.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Phone: {application.phone}</span>
          </div>
        )}
        {application.location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{application.location}</span>
          </div>
        )}
        {application.rate && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>Rate: ₵{application.rate.toLocaleString()}</span>
          </div>
        )}
      </div>

      {application.portfolio && (
        <div>
          <p className="text-sm font-medium text-white mb-1">Portfolio/Links</p>
          <p className="text-sm text-muted-foreground">{application.portfolio}</p>
        </div>
      )}

      {application.experience && (
        <div>
          <p className="text-sm font-medium text-white mb-1">Experience</p>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{application.experience}</p>
        </div>
      )}

      {application.availability && (
        <div>
          <p className="text-sm font-medium text-white mb-1">Availability</p>
          <p className="text-sm text-muted-foreground">{application.availability}</p>
        </div>
      )}

      {application.additionalInfo && (
        <div>
          <p className="text-sm font-medium text-white mb-1">Additional Information</p>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{application.additionalInfo}</p>
        </div>
      )}

      {application.status === "PENDING" && (
        <div className="flex gap-2 pt-2 border-t border-gray-800">
          <Button
            onClick={onAccept}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Accept
          </Button>
          <Button
            onClick={onReject}
            variant="outline"
            className="flex-1 border-red-900/30 text-red-400 hover:bg-red-900/20"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}

