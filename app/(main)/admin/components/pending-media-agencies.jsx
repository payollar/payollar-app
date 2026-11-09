"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Radio,
  Tv,
  Megaphone,
  Smartphone,
  Users,
  Video,
  User,
  Eye,
  Clock3,
} from "lucide-react";
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
import { updateMediaAgencyStatus } from "@/actions/admin";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const PANEL =
  "rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]";

const MEDIA_TYPE_ICONS = {
  TV: Tv,
  RADIO: Radio,
  BILLBOARD: Megaphone,
  DIGITAL: Smartphone,
  INFLUENCER_MARKETING: Users,
  VIDEO_CLIPPING: Video,
};

function AgencyAvatar({ agency }) {
  if (agency.logoUrl) {
    return (
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <Image
          src={agency.logoUrl}
          alt={agency.agencyName}
          fill
          className="object-cover"
          sizes="48px"
          unoptimized={agency.logoUrl?.startsWith("http")}
        />
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
      <Building2 className="h-5 w-5" />
    </div>
  );
}

function InfoRow({ icon: Icon, children }) {
  if (!children) return null;
  return (
    <div className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      <span className="truncate">{children}</span>
    </div>
  );
}

export function PendingMediaAgencies({ agencies }) {
  const [selectedAgency, setSelectedAgency] = useState(null);
  const router = useRouter();

  const {
    loading,
    data,
    fn: submitStatusUpdate,
  } = useFetch(updateMediaAgencyStatus);

  const handleViewDetails = (agency) => setSelectedAgency(agency);
  const handleCloseDialog = () => setSelectedAgency(null);

  const handleUpdateStatus = async (agencyId, status) => {
    if (loading) return;
    const formData = new FormData();
    formData.append("agencyId", agencyId);
    formData.append("status", status);
    await submitStatusUpdate(formData);
  };

  useEffect(() => {
    if (data?.success) {
      toast.success("Media agency status updated successfully");
      handleCloseDialog();
      router.refresh();
    }
  }, [data, router]);

  return (
    <section className={cn(PANEL, "overflow-hidden")}>
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-end sm:justify-between md:px-5">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Pending registrations
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Review and approve media agency applications.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
          <Clock3 className="h-4 w-4 text-amber-600" />
          <span className="font-semibold tabular-nums text-slate-950">
            {agencies.length}
          </span>
          <span>pending</span>
        </div>
      </div>

      <div className="p-3 md:p-4">
        {agencies.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white">
              <Building2 className="h-5 w-5" />
            </span>
            <p className="text-sm font-semibold text-slate-950">Queue is clear</p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              No pending media agency registrations right now.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {agencies.map((agency) => (
              <article
                key={agency.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50/70"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <AgencyAvatar agency={agency} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-slate-950">
                          {agency.agencyName}
                        </h3>
                        <Badge
                          variant="outline"
                          className="rounded-full border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700"
                        >
                          Pending
                        </Badge>
                      </div>

                      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                        <InfoRow icon={Building2}>{agency.contactName}</InfoRow>
                        {agency.user ? (
                          <InfoRow icon={User}>
                            {agency.user.name || agency.user.email}
                          </InfoRow>
                        ) : null}
                        <InfoRow icon={Mail}>{agency.email}</InfoRow>
                        <InfoRow icon={Phone}>{agency.phone}</InfoRow>
                        <InfoRow icon={MapPin}>
                          {[agency.city, agency.region, agency.country]
                            .filter(Boolean)
                            .join(", ")}
                        </InfoRow>
                        {agency.website ? (
                          <div className="flex min-w-0 items-center gap-2 text-sm">
                            <Globe className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <a
                              href={agency.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate font-medium text-slate-950 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-950"
                            >
                              {agency.website}
                            </a>
                          </div>
                        ) : null}
                      </div>

                      {agency.listings?.length > 0 ? (
                        <div className="mt-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            {agency.listings.length} media listing
                            {agency.listings.length !== 1 ? "s" : ""}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {agency.listings.map((listing) => {
                              const Icon =
                                MEDIA_TYPE_ICONS[listing.listingType] ||
                                Building2;
                              return (
                                <Badge
                                  key={listing.id}
                                  variant="outline"
                                  className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700"
                                >
                                  <Icon className="mr-1 h-3 w-3" />
                                  {listing.name}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}

                      <p className="mt-3 text-xs text-slate-400">
                        Submitted {format(new Date(agency.createdAt), "PPp")}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(agency)}
                    className="h-9 shrink-0 rounded-full border-slate-200 px-3 text-slate-700 hover:bg-slate-100"
                  >
                    <Eye className="mr-1.5 h-4 w-4" />
                    Review
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedAgency} onOpenChange={handleCloseDialog}>
        <DialogContent className="mx-2 max-h-[90vh] max-w-3xl overflow-y-auto border-slate-200 bg-white text-slate-900 sm:mx-auto">
          {selectedAgency ? (
            <>
              <DialogHeader>
                <div className="flex flex-col items-center gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:gap-4">
                  {selectedAgency.logoUrl ? (
                    <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 sm:h-24 sm:w-24">
                      <Image
                        src={selectedAgency.logoUrl}
                        alt={selectedAgency.agencyName}
                        fill
                        className="object-cover"
                        sizes="96px"
                        unoptimized={selectedAgency.logoUrl?.startsWith("http")}
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-950 text-white sm:h-24 sm:w-24">
                      <Building2 className="h-7 w-7" />
                    </div>
                  )}
                  <div className="min-w-0 text-center sm:text-left">
                    <DialogTitle className="text-lg font-semibold text-slate-950 sm:text-2xl">
                      {selectedAgency.agencyName}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-slate-500">
                      Submitted {format(new Date(selectedAgency.createdAt), "PPp")}
                    </DialogDescription>
                    <Badge
                      variant="outline"
                      className="mt-3 rounded-full border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700"
                    >
                      Pending
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 py-2">
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-slate-950">
                    Agency information
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                      { label: "Contact person", value: selectedAgency.contactName },
                      { label: "Email", value: selectedAgency.email },
                      { label: "Phone", value: selectedAgency.phone },
                      {
                        label: "Location",
                        value: [selectedAgency.city, selectedAgency.region, selectedAgency.country]
                          .filter(Boolean)
                          .join(", "),
                      },
                      { label: "Address", value: selectedAgency.address },
                    ]
                      .filter((item) => item.value)
                      .map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <p className="text-xs text-slate-500">{item.label}</p>
                          <p className="mt-1 break-words text-sm font-medium text-slate-950">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    {selectedAgency.website ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                        <p className="text-xs text-slate-500">Website</p>
                        <a
                          href={selectedAgency.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block break-all text-sm font-medium text-slate-950 underline decoration-slate-300 underline-offset-2"
                        >
                          {selectedAgency.website}
                        </a>
                      </div>
                    ) : null}
                  </div>
                  {selectedAgency.description ? (
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">Description</p>
                      <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
                        {selectedAgency.description}
                      </p>
                    </div>
                  ) : null}
                </div>

                {selectedAgency.listings?.length > 0 ? (
                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <h3 className="text-sm font-semibold text-slate-950">
                      Media listings ({selectedAgency.listings.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedAgency.listings.map((listing) => {
                        const Icon =
                          MEDIA_TYPE_ICONS[listing.listingType] || Building2;
                        return (
                          <div
                            key={listing.id}
                            className="rounded-2xl border border-slate-200 bg-white p-3"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                              {listing.imageUrl ? (
                                <div className="relative h-28 w-full overflow-hidden rounded-xl border border-slate-200 sm:h-16 sm:w-16">
                                  <Image
                                    src={listing.imageUrl}
                                    alt={listing.name}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                    unoptimized={listing.imageUrl?.startsWith("http")}
                                  />
                                </div>
                              ) : null}
                              <div className="min-w-0 flex-1">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <Icon className="h-4 w-4 text-slate-700" />
                                  <h4 className="text-sm font-semibold text-slate-950">
                                    {listing.name}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className="rounded-full border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600"
                                  >
                                    {listing.listingType}
                                  </Badge>
                                </div>
                                <div className="space-y-1 text-sm text-slate-600">
                                  {listing.network ? (
                                    <p>Network: {listing.network}</p>
                                  ) : null}
                                  <p>Location: {listing.location}</p>
                                  {listing.frequency ? (
                                    <p>Frequency: {listing.frequency}</p>
                                  ) : null}
                                  {listing.reach ? <p>Reach: {listing.reach}</p> : null}
                                  {listing.priceRange ? (
                                    <p>Price range: {listing.priceRange}</p>
                                  ) : null}
                                  {listing.description ? (
                                    <p className="mt-2 text-slate-700">
                                      {listing.description}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>

              <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                <Button
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={loading}
                  className="h-10 w-full rounded-full border-slate-200 text-slate-700 sm:w-auto"
                >
                  Cancel
                </Button>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleUpdateStatus(selectedAgency.id, "REJECTED")
                    }
                    disabled={loading}
                    className="h-10 w-full rounded-full border-rose-200 text-rose-700 hover:bg-rose-50 sm:w-auto"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    onClick={() =>
                      handleUpdateStatus(selectedAgency.id, "VERIFIED")
                    }
                    disabled={loading}
                    className="h-10 w-full rounded-full bg-slate-950 text-white hover:bg-slate-800 sm:w-auto"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
