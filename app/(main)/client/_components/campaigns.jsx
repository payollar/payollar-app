"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Search,
  MoreVertical,
  TrendingUp,
  FileText,
  Archive,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

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

  // Calculate statistics
  const stats = useMemo(() => {
    const total = campaigns.length;
    const active = campaigns.filter((c) => c.status === "ACTIVE").length;
    const draft = campaigns.filter((c) => c.status === "DRAFT").length;
    const closed = campaigns.filter((c) => c.status === "CLOSED").length;
    const totalApplications = campaigns.reduce(
      (acc, c) => acc + (c.applicants || c._count?.applications || 0),
      0
    );
    return { total, active, draft, closed, totalApplications };
  }, [campaigns]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = campaigns
      .map((c) => c.category)
      .filter((cat) => cat)
      .filter((value, index, self) => self.indexOf(value) === index);
    return cats.sort();
  }, [campaigns]);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch =
        searchQuery === "" ||
        campaign.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || campaign.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" || campaign.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [campaigns, searchQuery, statusFilter, categoryFilter]);

  // Separate filtered campaigns by status
  const activeCampaigns = filteredCampaigns.filter((c) => c.status === "ACTIVE");
  const draftCampaigns = filteredCampaigns.filter((c) => c.status === "DRAFT");
  const closedCampaigns = filteredCampaigns.filter((c) => c.status === "CLOSED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Campaigns</h2>
          <p className="text-muted-foreground mt-1">
            Create and manage campaigns to find talented creators
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-white hover:bg-gray-100 text-gray-900"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-white/20 bg-transparent backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground/80 mb-1">Total Campaigns</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl"></div>
                <FileText className="h-10 w-10 text-blue-400 relative z-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/20 bg-transparent backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground/80 mb-1">Active</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.active}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl"></div>
                <Sparkles className="h-10 w-10 text-emerald-400 relative z-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/20 bg-transparent backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground/80 mb-1">Draft</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.draft}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl"></div>
                <Edit className="h-10 w-10 text-amber-400 relative z-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/20 bg-transparent backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground/80 mb-1">Closed</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.closed}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gray-400/20 rounded-full blur-xl"></div>
                <Archive className="h-10 w-10 text-gray-400 relative z-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/20 bg-gradient-to-br from-blue-900/20 via-blue-900/10 to-transparent backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground/80 mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalApplications}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl"></div>
                <Users className="h-10 w-10 text-blue-400 relative z-10" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-800 text-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-gray-900/50 border-gray-800 text-white">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-gray-900/50 border-gray-800 text-white">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {/* No Results State */}
      {filteredCampaigns.length === 0 && campaigns.length > 0 && (
        <Card className="border-gray-800">
          <CardContent className="p-12 text-center">
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-white mb-2">
              No campaigns found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {campaigns.length === 0 && (
        <Card className="border-gray-800">
          <CardContent className="p-12 text-center">
            <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-white mb-2">
              No campaigns yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first campaign to connect with talented creators and grow your brand.
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-white hover:bg-gray-100 text-gray-900"
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

  const applicantsCount = campaign.applicants || campaign._count?.applications || 0;

  return (
    <Card className="border-gray-800 hover:border-gray-700 transition-all overflow-hidden group bg-gray-900/50">
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
                {campaign.category && (
                  <Badge variant="outline" className="text-xs border-gray-700">
                    {campaign.category}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg font-bold text-white mb-1">
                {campaign.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{campaign.brand}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                {campaign.status === "DRAFT" && (
                  <DropdownMenuItem
                    onClick={() => onStatusUpdate(campaign.id, "ACTIVE")}
                    className="text-emerald-400"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Publish Campaign
                  </DropdownMenuItem>
                )}
                {campaign.status === "ACTIVE" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onStatusUpdate(campaign.id, "CLOSED")}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Close Campaign
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusUpdate(campaign.id, "CANCELLED")}
                      className="text-red-400"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Campaign
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => onViewApplications(campaign)}
                  disabled={applicantsCount === 0}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Applications ({applicantsCount})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              <span>{applicantsCount} applicant{applicantsCount !== 1 ? 's' : ''}</span>
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
          <Button
            variant="outline"
            className="w-full border-gray-700 hover:bg-gray-800"
            onClick={() => onViewApplications(campaign)}
            disabled={applicantsCount === 0}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Applications ({applicantsCount})
          </Button>
          {campaign.status === "DRAFT" && (
            <Button
              variant="outline"
              className="w-full border-gray-700 text-white hover:bg-gray-800"
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
                className="flex-1 border-gray-700 hover:bg-gray-800"
                onClick={() => onStatusUpdate(campaign.id, "CLOSED")}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Close
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-red-900/30 text-red-400 hover:bg-red-900/10"
                onClick={() => onStatusUpdate(campaign.id, "CANCELLED")}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

