"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
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
          <div className={`${creatorCardClass} grid grid-cols-2 overflow-hidden sm:grid-cols-4`}>
            {[
              { label: "Total", value: stats.total, icon: Briefcase },
              { label: "Active", value: stats.active, icon: CheckCircle2 },
              { label: "Inactive", value: stats.inactive, icon: XCircle },
              { label: "Avg. rate", value: `₵${Math.round(stats.avgRate).toLocaleString("en-GH")}`, icon: TrendingUp },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 border-slate-100 px-4 py-4 sm:border-r sm:last:border-r-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0055ff]/[0.08] text-[#0055ff]">
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="truncate text-xl font-semibold tabular-nums text-slate-950">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Search and Filters */}
      {services.length > 0 && (
        <div className={`${creatorCardClass} flex flex-col gap-3 p-3 sm:flex-row sm:items-center`}>
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by title or category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 rounded-xl border border-slate-300 bg-white pl-10 text-sm text-slate-950 shadow-none"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="!h-11 w-full rounded-xl border border-slate-300 bg-white text-slate-950 sm:w-[150px]">
              <Filter className="mr-2 h-4 w-4 text-slate-400" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 bg-white text-slate-900">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {categories.length > 0 && (
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="!h-11 w-full rounded-xl border border-slate-300 bg-white text-slate-950 sm:w-[170px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="border-slate-200 bg-white text-slate-900">
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
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
          <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
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
          <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
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
    <article
      className={`flex h-full flex-col overflow-hidden ${creatorCardClass} ${
        !service.isActive ? "opacity-70" : ""
      }`}
    >
      {service.imageUrl ? (
        <div className="relative h-36 w-full bg-slate-100">
          <Image
            src={service.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#e8f0ff]">
            {creatorImage ? (
              <Image src={creatorImage} alt="" fill className="object-cover" sizes="40px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[#0055ff]">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-slate-400">{creatorName}</p>
            <h3 className="truncate text-base font-semibold text-slate-950">{service.title}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 flex h-6 items-center gap-2 overflow-hidden">
          <Badge
            className={
              service.isActive
                ? "border-[#0055ff]/20 bg-[#0055ff]/10 text-[#0055ff]"
                : "border-slate-200 bg-slate-100 text-slate-500"
            }
          >
            {service.isActive ? "Active" : "Inactive"}
          </Badge>
          {service.category ? (
            <Badge variant="outline" className="truncate text-xs">
              {service.category}
            </Badge>
          ) : null}
        </div>

        <p className="mt-2 h-10 overflow-hidden text-sm leading-5 text-slate-500">
          <span className="line-clamp-2">{service.description || "No description yet."}</span>
        </p>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <p className="text-lg font-semibold tabular-nums text-slate-950">{getRateDisplay(service)}</p>
          {service.duration ? (
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              {service.duration} min
            </span>
          ) : (
            <span className="text-xs text-slate-400">{format(new Date(service.createdAt), "MMM d, yyyy")}</span>
          )}
        </div>

        <div className="mt-auto flex gap-2 pt-3">
          <Button variant="outline" size="sm" className="h-9 flex-1 rounded-xl border-slate-200" onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
