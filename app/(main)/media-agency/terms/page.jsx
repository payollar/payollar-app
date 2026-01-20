import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Edit, Check } from "lucide-react";
import { TermsAndConditionsForm } from "./_components/terms-form";

export default async function MediaAgencyTermsPage() {
  const user = await checkUser();

  if (!user || user.role !== "MEDIA_AGENCY") {
    redirect("/");
  }

  const mediaAgency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
    include: {
      termsAndConditions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!mediaAgency) {
    redirect("/media-agency/settings");
  }

  const activeTC = mediaAgency.termsAndConditions.find(tc => tc.isActive);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Terms & Conditions</h1>
        <p className="text-muted-foreground">
          Upload and manage your terms and conditions for clients
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Active TC */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Active Terms & Conditions
            </CardTitle>
            <CardDescription>
              Currently active version
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeTC ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{activeTC.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
                    {activeTC.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Version {activeTC.version}</span>
                    <span>Updated {new Date(activeTC.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/media-agency/terms/${activeTC.id}`} target="_blank">
                    View Full Document
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active terms and conditions</p>
                <p className="text-sm">Create one to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Update Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {activeTC ? "Update Terms & Conditions" : "Create Terms & Conditions"}
            </CardTitle>
            <CardDescription>
              {activeTC
                ? "Create a new version of your terms and conditions"
                : "Upload your terms and conditions document"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TermsAndConditionsForm mediaAgencyId={mediaAgency.id} currentVersion={activeTC?.version || 0} />
          </CardContent>
        </Card>
      </div>

      {/* Version History */}
      {mediaAgency.termsAndConditions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Version History</CardTitle>
            <CardDescription>
              Previous versions of your terms and conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mediaAgency.termsAndConditions.map((tc) => (
                <div
                  key={tc.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{tc.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Version {tc.version} • {new Date(tc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {tc.isActive && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Active
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
