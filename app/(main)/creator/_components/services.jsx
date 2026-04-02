"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  TrendingUp,
  MoreVertical,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateServiceModal } from "./create-service-modal";
import { EditServiceModal } from "./edit-service-modal";
import { CreatorPageShell, creatorCardClass } from "./creator-page-shell";
import { deleteService } from "@/actions/services";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreatorServices({
  services = [],
  creator = { imageUrl: null, name: "Creator" },
}) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const handleDelete = async (serviceId) => {
    if (!confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("serviceId", serviceId);

      const result = await deleteService(formData);

      if (result?.success) {
        toast.success("Service deleted successfully");
        router.refresh();
      } else {
        toast.error(result?.error || "Failed to delete service");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete service");
    }
  };

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(services.map((s) => s.category).filter(Boolean))];
  }, [services]);

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && service.isActive) ||
        (statusFilter === "inactive" && !service.isActive);

      const matchesCategory =
        categoryFilter === "all" || service.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [services, searchQuery, statusFilter, categoryFilter]);

  // Separate filtered services by status
  const activeServices = filteredServices.filter((s) => s.isActive);
  const inactiveServices = filteredServices.filter((s) => !s.isActive);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.isActive).length;
    const inactive = total - active;
    const avgRate =
      services.length > 0
        ? services.reduce((sum, s) => sum + (s.rate || 0), 0) / services.length
        : 0;

    return { total, active, inactive, avgRate };
  }, [services]);

  const getRateDisplay = (service) => {
    const rate = service.rate.toFixed(2);
    switch (service.rateType) {
      case "PER_HOUR":
        return `₵${rate}/hour`;
      case "PER_SESSION":
        return `₵${rate}/session`;
      case "FIXED":
        return `₵${rate}`;
      default:
        return `₵${rate}`;
    }
  };

  return (
    <CreatorPageShell
      eyebrow="Offerings"
      title="Services"
      description="Manage your services and set your rates for clients to book."
      actions={
        <Button
          variant="marketing"
          size="lg"
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add service
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        {services.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className={creatorCardClass}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Total services</p>
                    <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
                      {stats.total}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                    <Briefcase className="relative z-10 h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={creatorCardClass}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Active</p>
                    <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
                      {stats.active}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                    <CheckCircle2 className="relative z-10 h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={creatorCardClass}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Inactive</p>
                    <p className="mt-1 text-3xl font-bold tabular-nums text-muted-foreground">
                      {stats.inactive}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 ring-1 ring-border/60">
                    <XCircle className="relative z-10 h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={creatorCardClass}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Avg. rate</p>
                    <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
                      ₵{stats.avgRate.toFixed(0)}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                    <TrendingUp className="relative z-10 h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      {/* Search and Filters */}
      {services.length > 0 && (
        <Card className={creatorCardClass}>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-border/60 bg-background/80 pl-10 backdrop-blur-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full border-border/60 bg-background/80 backdrop-blur-sm md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {categories.length > 0 && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full border-border/60 bg-background/80 backdrop-blur-sm md:w-[180px]">
                    <SelectValue placeholder="Category" />
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
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Services */}
      {activeServices.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Active services ({activeServices.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                creator={creator}
                getRateDisplay={getRateDisplay}
                onEdit={() => setEditingService(service)}
                onDelete={() => handleDelete(service.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Services */}
      {inactiveServices.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <XCircle className="h-5 w-5 text-muted-foreground" />
              Inactive services ({inactiveServices.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                creator={creator}
                getRateDisplay={getRateDisplay}
                onEdit={() => setEditingService(service)}
                onDelete={() => handleDelete(service.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {services.length > 0 && filteredServices.length === 0 && (
        <Card className={creatorCardClass}>
          <CardContent className="p-12 text-center">
            <Search className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-medium text-foreground">No services found</h3>
            <p className="mb-6 text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="glass"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {services.length === 0 && (
        <Card className={creatorCardClass}>
          <CardContent className="p-12 text-center">
            <Briefcase className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-medium text-foreground">No services yet</h3>
            <p className="mx-auto mb-6 max-w-md text-muted-foreground">
              Create your first service to let clients know what you offer and at what rate.
              You can set hourly rates, per-session rates, or fixed prices.
            </p>
            <Button variant="marketing" size="lg" onClick={() => setIsCreateModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create your first service
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Service Modal */}
      <CreateServiceModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {/* Edit Service Modal */}
      {editingService && (
        <EditServiceModal
          open={!!editingService}
          onOpenChange={(open) => !open && setEditingService(null)}
          service={editingService}
        />
      )}
      </div>
    </CreatorPageShell>
  );
}

function ServiceCard({ service, creator, getRateDisplay, onEdit, onDelete }) {
  const creatorName = creator?.name || "Creator";
  const creatorImage = creator?.imageUrl || null;

  return (
    <Card
      className={`group overflow-hidden ${creatorCardClass} transition-all hover:border-primary/25 hover:shadow-md ${
        !service.isActive ? "opacity-60" : ""
      }`}
    >
      {service.imageUrl ? (
        <div className="relative aspect-[2/1] w-full bg-muted">
          <Image
            src={service.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      ) : null}
      <CardHeader className={service.imageUrl ? "pt-4" : undefined}>
        <div className="mb-3 flex items-start gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border/60 bg-primary/10 ring-2 ring-background">
            {creatorImage ? (
              <Image
                src={creatorImage}
                alt={creatorName}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <User className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">{creatorName}</p>
            <CardTitle className="line-clamp-2 text-lg font-semibold leading-snug text-foreground">
              {service.title}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-400">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            className={
              service.isActive
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border/60 bg-muted/50 text-muted-foreground"
            }
          >
            {service.isActive ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Inactive
              </>
            )}
          </Badge>
          {service.category && (
            <Badge variant="outline" className="text-xs">
              {service.category}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {service.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3.75rem]">
            {service.description}
          </p>
        )}

        <div className="space-y-3 border-t border-border/50 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <p className="text-2xl font-bold tabular-nums text-foreground">{getRateDisplay(service)}</p>
            </div>
          </div>
          {service.duration && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{service.duration} minutes</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border/50 pt-2 text-xs text-muted-foreground">
          <span>Created {format(new Date(service.createdAt), "MMM d, yyyy")}</span>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="glass"
            size="sm"
            className="flex-1"
            onClick={onEdit}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
