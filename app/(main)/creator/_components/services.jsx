"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { CreateServiceModal } from "./create-service-modal";
import { EditServiceModal } from "./edit-service-modal";
import { deleteService } from "@/actions/services";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreatorServices({ services = [] }) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

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

  // Separate services by status
  const activeServices = services.filter((s) => s.isActive);
  const inactiveServices = services.filter((s) => !s.isActive);

  const getRateDisplay = (service) => {
    const rate = service.rate.toFixed(2);
    switch (service.rateType) {
      case "PER_HOUR":
        return `$${rate}/hour`;
      case "PER_SESSION":
        return `$${rate}/session`;
      case "FIXED":
        return `$${rate}`;
      default:
        return `$${rate}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Services</h2>
          <p className="text-muted-foreground">
            Manage your services and set your rates for clients to book
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Active Services */}
      {activeServices.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            Active Services ({activeServices.length})
          </h3>
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
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <XCircle className="h-5 w-5 text-gray-400" />
            Inactive Services ({inactiveServices.length})
          </h3>
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

      {/* Empty State */}
      {services.length === 0 && (
        <Card className="border-emerald-900/20">
          <CardContent className="p-12 text-center">
            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              No services yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first service to let clients know what you offer and at what rate. You can set hourly rates, per-session rates, or fixed prices.
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
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
    <Card className={`border-emerald-900/20 hover:border-emerald-700/40 transition-all ${!service.isActive ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg font-bold text-white line-clamp-2 flex-1">
            {service.title}
          </CardTitle>
          <Badge
            className={
              service.isActive
                ? "bg-emerald-900/20 border-emerald-900/30 text-emerald-400 ml-2"
                : "bg-gray-900/20 border-gray-900/30 text-gray-400 ml-2"
            }
          >
            {service.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        {service.category && (
          <Badge variant="outline" className="text-xs w-fit">
            {service.category}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {service.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {service.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <p className="text-xl font-bold text-white">
                {getRateDisplay(service)}
              </p>
            </div>
            {service.duration && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{service.duration} minutes</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <span>Created {format(new Date(service.createdAt), "MMM d, yyyy")}</span>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-emerald-900/30"
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
