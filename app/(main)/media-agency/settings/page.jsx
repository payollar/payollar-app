import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, Globe, MapPin } from "lucide-react";
import { MediaAgencyPageShell } from "../_components/media-agency-page-shell";
import { DASHBOARD_CARD_CLASS } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

export default async function MediaAgencySettingsPage() {
  const user = await checkUser();

  if (!user || user.role !== "MEDIA_AGENCY") {
    redirect("/");
  }

  const mediaAgency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
  });

  if (!mediaAgency) {
    return (
      <MediaAgencyPageShell
        eyebrow="Agency"
        title="Settings"
        description="Complete your media agency profile."
      >
        <Card className={DASHBOARD_CARD_CLASS}>
          <CardContent className="pt-8 pb-8">
            <p className="text-center text-muted-foreground">
              Media agency profile not found. Please contact support.
            </p>
          </CardContent>
        </Card>
      </MediaAgencyPageShell>
    );
  }

  return (
    <MediaAgencyPageShell
      eyebrow="Agency"
      title="Settings"
      description="Manage your media agency profile and preferences."
    >
      <Card className={DASHBOARD_CARD_CLASS}>
        <CardHeader>
          <CardTitle>Agency Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Agency Name
              </div>
              <p className="text-sm">{mediaAgency.agencyName}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Contact Person
              </div>
              <p className="text-sm">{mediaAgency.contactName}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </div>
              <p className="text-sm">{mediaAgency.email}</p>
            </div>
            {mediaAgency.phone && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone
                </div>
                <p className="text-sm">{mediaAgency.phone}</p>
              </div>
            )}
            {mediaAgency.website && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  Website
                </div>
                <a
                  href={mediaAgency.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {mediaAgency.website}
                </a>
              </div>
            )}
            {mediaAgency.address && (
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Address
                </div>
                <p className="text-sm">
                  {mediaAgency.address}
                  {mediaAgency.city && `, ${mediaAgency.city}`}
                  {mediaAgency.region && `, ${mediaAgency.region}`}
                  {`, ${mediaAgency.country}`}
                </p>
              </div>
            )}
          </div>
          {mediaAgency.description && (
            <div className="space-y-2 pt-4 border-t">
              <div className="text-sm font-medium">Description</div>
              <p className="text-sm text-muted-foreground">{mediaAgency.description}</p>
            </div>
          )}
          <div className="border-t border-border/50 pt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Verification status</p>
                <p className="text-xs text-muted-foreground">
                  {mediaAgency.verificationStatus === "VERIFIED" && "Your agency is verified"}
                  {mediaAgency.verificationStatus === "PENDING" && "Your agency is pending verification"}
                  {mediaAgency.verificationStatus === "REJECTED" && "Your agency verification was rejected"}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "w-fit font-medium",
                  mediaAgency.verificationStatus === "VERIFIED" &&
                    "border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
                  mediaAgency.verificationStatus === "PENDING" &&
                    "border-amber-500/35 bg-amber-500/10 text-amber-800 dark:text-amber-300",
                  mediaAgency.verificationStatus === "REJECTED" &&
                    "border-destructive/35 bg-destructive/10 text-destructive"
                )}
              >
                {mediaAgency.verificationStatus}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </MediaAgencyPageShell>
  );
}
