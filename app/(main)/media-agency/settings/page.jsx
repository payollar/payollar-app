import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, Phone, Globe, MapPin } from "lucide-react";

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Complete your media agency profile
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Media agency profile not found. Please contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your media agency profile and preferences
        </p>
      </div>

      <Card>
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
                  className="text-sm text-blue-600 hover:underline"
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
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Verification Status</p>
                <p className="text-xs text-muted-foreground">
                  {mediaAgency.verificationStatus === "VERIFIED" && "Your agency is verified"}
                  {mediaAgency.verificationStatus === "PENDING" && "Your agency is pending verification"}
                  {mediaAgency.verificationStatus === "REJECTED" && "Your agency verification was rejected"}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                mediaAgency.verificationStatus === "VERIFIED" ? "bg-green-100 text-green-800" :
                mediaAgency.verificationStatus === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }`}>
                {mediaAgency.verificationStatus}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
