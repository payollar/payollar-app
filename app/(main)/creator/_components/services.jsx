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
  Eye,
  EyeOff,
  MoreVertical,
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
import { deleteService } from "@/actions/services";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreatorServices({ services = [] }) {
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
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Services</h2>
            <p className="text-muted-foreground mt-1">
              Manage your services and set your rates for clients to book
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-white hover:bg-gray-100 text-gray-900"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Statistics Cards */}
        {services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-white/20 bg-transparent backdrop-blur-md">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground/80 mb-1">Total Services</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl"></div>
                    <Briefcase className="h-10 w-10 text-emerald-400 relative z-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/20 bg-transparent backdrop-blur-md">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground/80 mb-1">Active</p>
                    <p className="text-3xl font-bold text-emerald-400 mt-1">
                      {stats.active}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl"></div>
                    <CheckCircle2 className="h-10 w-10 text-emerald-400 relative z-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/20 bg-transparent backdrop-blur-md">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground/80 mb-1">Inactive</p>
                    <p className="text-3xl font-bold text-gray-400 mt-1">
                      {stats.inactive}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gray-400/20 rounded-full blur-xl"></div>
                    <XCircle className="h-10 w-10 text-gray-400 relative z-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/20 bg-gradient-to-br from-blue-900/20 via-blue-900/10 to-transparent backdrop-blur-md">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground/80 mb-1">Avg. Rate</p>
                    <p className="text-3xl font-bold text-blue-400 mt-1">
                      ₵{stats.avgRate.toFixed(0)}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl"></div>
                    <TrendingUp className="h-10 w-10 text-blue-400 relative z-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      {services.length > 0 && (
        <Card className="border-emerald-900/20">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-emerald-900/30"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-background border-emerald-900/30">
                  <Filter className="h-4 w-4 mr-2" />
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
                  <SelectTrigger className="w-full md:w-[180px] bg-background border-emerald-900/30">
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
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              Active Services ({activeServices.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
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
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <XCircle className="h-5 w-5 text-gray-400" />
              Inactive Services ({inactiveServices.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
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
        <Card className="border-emerald-900/20">
          <CardContent className="p-12 text-center">
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No services found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {services.length === 0 && (
        <Card className="border-emerald-900/20">
          <CardContent className="p-12 text-center">
            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No services yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first service to let clients know what you offer and at what rate.
              You can set hourly rates, per-session rates, or fixed prices.
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Service
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
  );
}

function ServiceCard({ service, getRateDisplay, onEdit, onDelete }) {
  return (
    <Card
      className={`group border-emerald-900/20 hover:border-emerald-700/40 transition-all ${
        !service.isActive ? "opacity-60" : ""
      } hover:shadow-lg hover:shadow-emerald-900/10`}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg font-bold text-white line-clamp-2 flex-1 pr-2">
            {service.title}
          </CardTitle>
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
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-400">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            className={
              service.isActive
                ? "bg-emerald-900/20 border-emerald-900/30 text-emerald-400"
                : "bg-gray-900/20 border-gray-900/30 text-gray-400"
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

        <div className="space-y-3 pt-3 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              <p className="text-2xl font-bold text-white">{getRateDisplay(service)}</p>
            </div>
          </div>
          {service.duration && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{service.duration} minutes</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-gray-800">
          <span>Created {format(new Date(service.createdAt), "MMM d, yyyy")}</span>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-emerald-900/30 hover:bg-emerald-900/10"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-900/30 text-red-400 hover:bg-red-900/20"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
