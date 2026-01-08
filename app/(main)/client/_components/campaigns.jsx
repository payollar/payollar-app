"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Sparkles,
  Plus,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Eye,
  Edit,
  Trash2,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CreateCampaignModal } from "./create-campaign-modal";
import { CampaignApplicationsModal } from "./campaign-applications-modal";
import { updateCampaignStatus } from "@/actions/campaigns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ClientCampaigns({ campaigns = [] }) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);

  const handleStatusUpdate = async (campaignId, newStatus) => {
    try {
      const formData = new FormData();
      formData.append("campaignId", campaignId);
      formData.append("status", newStatus);

      const result = await updateCampaignStatus(formData);

      if (result?.success) {
        toast.success(`Campaign ${newStatus.toLowerCase()} successfully`);
        router.refresh();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update campaign status");
    }
  };

  const handleViewApplications = (campaign) => {
    setSelectedCampaign(campaign);
    setIsApplicationsModalOpen(true);
  };

  // Separate campaigns by status
  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE");
  const draftCampaigns = campaigns.filter((c) => c.status === "DRAFT");
  const closedCampaigns = campaigns.filter((c) => c.status === "CLOSED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Campaigns</h2>
          <p className="text-muted-foreground">
            Create and manage campaigns to find talented creators
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Active Campaigns */}
      {activeCampaigns.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            Active Campaigns ({activeCampaigns.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onViewApplications={() => handleViewApplications(campaign)}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Draft Campaigns */}
      {draftCampaigns.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Edit className="h-5 w-5 text-amber-400" />
            Draft Campaigns ({draftCampaigns.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {draftCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onViewApplications={() => handleViewApplications(campaign)}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Closed Campaigns */}
      {closedCampaigns.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-gray-400" />
            Closed Campaigns ({closedCampaigns.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {closedCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onViewApplications={() => handleViewApplications(campaign)}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {campaigns.length === 0 && (
        <Card className="border-emerald-900/20">
          <CardContent className="p-12 text-center">
            <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              No campaigns yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first campaign to connect with talented creators and grow your brand.
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {/* Applications Modal */}
      {selectedCampaign && (
        <CampaignApplicationsModal
          open={isApplicationsModalOpen}
          onOpenChange={setIsApplicationsModalOpen}
          campaign={selectedCampaign}
        />
      )}
    </div>
  );
}

function CampaignCard({ campaign, onViewApplications, onStatusUpdate }) {
  const budgetDisplay = campaign.budgetMin && campaign.budgetMax
    ? `₵${campaign.budgetMin.toLocaleString()} - ₵${campaign.budgetMax.toLocaleString()}`
    : campaign.budgetMin
    ? `₵${campaign.budgetMin.toLocaleString()}+`
    : campaign.budgetMax
    ? `Up to ₵${campaign.budgetMax.toLocaleString()}`
    : "Budget not specified";

  const statusColors = {
    ACTIVE: "bg-emerald-900/20 border-emerald-900/30 text-emerald-400",
    DRAFT: "bg-amber-900/20 border-amber-900/30 text-amber-400",
    CLOSED: "bg-gray-900/20 border-gray-900/30 text-gray-400",
    CANCELLED: "bg-red-900/20 border-red-900/30 text-red-400",
  };

  return (
    <Card className="border-emerald-900/20 hover:border-emerald-700/40 transition-all overflow-hidden">
      {campaign.imageUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={campaign.imageUrl}
            alt={campaign.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={statusColors[campaign.status] || ""}>
                  {campaign.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {campaign.category}
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-white mb-1">
                {campaign.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{campaign.brand}</p>
            </div>
          </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {campaign.description}
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-2 text-emerald-400" />
            <span className="font-medium text-white">{budgetDisplay}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{campaign.location}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>
              Deadline: {format(new Date(campaign.deadline), "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span>{campaign.applicants || 0} applicants</span>
            </div>
            {campaign.pendingApplications > 0 && (
              <Badge variant="outline" className="text-emerald-400 border-emerald-900/30">
                {campaign.pendingApplications} pending
              </Badge>
            )}
          </div>
        </div>

        {campaign.requirements && campaign.requirements.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {campaign.requirements.slice(0, 2).map((req, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {req}
              </Badge>
            ))}
            {campaign.requirements.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{campaign.requirements.length - 2}
              </Badge>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          {campaign.status === "DRAFT" && (
            <Button
              variant="outline"
              className="w-full border-emerald-900/30 text-emerald-400"
              onClick={() => onStatusUpdate(campaign.id, "ACTIVE")}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Publish Campaign
            </Button>
          )}
          {campaign.status === "ACTIVE" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-gray-700"
                onClick={() => onStatusUpdate(campaign.id, "CLOSED")}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Close
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-red-900/30 text-red-400"
                onClick={() => onStatusUpdate(campaign.id, "CANCELLED")}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full border-emerald-900/30"
            onClick={() => onViewApplications(campaign)}
            disabled={!campaign.applicants || campaign.applicants === 0}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Applications ({campaign.applicants || 0})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

