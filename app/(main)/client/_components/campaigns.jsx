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
import { ClientPageShell, clientCardClass } from "./client-page-shell";

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

  const fieldClass = "border-border/60 bg-background text-foreground";

  return (
    <ClientPageShell
      eyebrow="Growth"
      title="Campaigns"
      description="Create and manage campaigns to find talented creators."
      actions={
        <Button variant="marketing" size="lg" className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Create campaign
        </Button>
      }
    >
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className={clientCardClass}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Total campaigns</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{stats.total}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <FileText className="relative z-10 h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={clientCardClass}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Active</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-primary">{stats.active}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <Sparkles className="relative z-10 h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={clientCardClass}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Draft</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{stats.draft}</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-3">
                <Edit className="relative z-10 h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={clientCardClass}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Closed</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-muted-foreground">{stats.closed}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <Archive className="relative z-10 h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={clientCardClass}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Total applications</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{stats.totalApplications}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <Users className="relative z-10 h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 ${fieldClass}`}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className={`w-full sm:w-[180px] ${fieldClass}`}>
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
          <SelectTrigger className={`w-full sm:w-[180px] ${fieldClass}`}>
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
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            Active campaigns ({activeCampaigns.length})
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
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Edit className="h-5 w-5 text-amber-500" />
            Draft campaigns ({draftCampaigns.length})
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
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
            Closed campaigns ({closedCampaigns.length})
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
        <Card className={clientCardClass}>
          <CardContent className="p-12 text-center">
            <Search className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
            <h3 className="mb-2 text-xl font-medium text-foreground">No campaigns found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {campaigns.length === 0 && (
        <Card className={clientCardClass}>
          <CardContent className="p-12 text-center">
            <Sparkles className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
            <h3 className="mb-2 text-xl font-medium text-foreground">No campaigns yet</h3>
            <p className="mb-6 text-muted-foreground">
              Create your first campaign to connect with talented creators and grow your brand.
            </p>
            <Button variant="marketing" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first campaign
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
    </ClientPageShell>
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
    ACTIVE: "border-primary/30 bg-primary/10 text-primary",
    DRAFT: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    CLOSED: "border-border/60 bg-muted/50 text-muted-foreground",
    CANCELLED: "border-destructive/30 bg-destructive/10 text-destructive",
  };

  const applicantsCount = campaign.applicants || campaign._count?.applications || 0;

  return (
    <Card
      className={`${clientCardClass} group overflow-hidden transition-all hover:border-primary/25 hover:shadow-md`}
    >
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
                  <Badge variant="outline" className="text-xs">
                    {campaign.category}
                  </Badge>
                )}
              </div>
              <CardTitle className="mb-1 text-lg font-bold text-foreground">
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
              <DropdownMenuContent align="end">
                {campaign.status === "DRAFT" && (
                  <DropdownMenuItem onClick={() => onStatusUpdate(campaign.id, "ACTIVE")}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Publish campaign
                  </DropdownMenuItem>
                )}
                {campaign.status === "ACTIVE" && (
                  <>
                    <DropdownMenuItem onClick={() => onStatusUpdate(campaign.id, "CLOSED")}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Close campaign
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusUpdate(campaign.id, "CANCELLED")}
                      className="text-destructive"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel campaign
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => onViewApplications(campaign)}
                  disabled={applicantsCount === 0}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View applications ({applicantsCount})
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
            <DollarSign className="mr-2 h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{budgetDisplay}</span>
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
              <Badge variant="outline" className="border-primary/30 text-primary">
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
            variant="glass"
            className="w-full"
            onClick={() => onViewApplications(campaign)}
            disabled={applicantsCount === 0}
          >
            <Eye className="mr-2 h-4 w-4" />
            View applications ({applicantsCount})
          </Button>
          {campaign.status === "DRAFT" && (
            <Button variant="marketing" className="w-full" onClick={() => onStatusUpdate(campaign.id, "ACTIVE")}>
              <Sparkles className="mr-2 h-4 w-4" />
              Publish campaign
            </Button>
          )}
          {campaign.status === "ACTIVE" && (
            <div className="flex gap-2">
              <Button
                variant="glass"
                className="flex-1"
                onClick={() => onStatusUpdate(campaign.id, "CLOSED")}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Close
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => onStatusUpdate(campaign.id, "CANCELLED")}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

