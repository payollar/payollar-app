import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, Plus, Download } from "lucide-react";
import { ReportingForm } from "./_components/reporting-form";

export default async function MediaAgencyReportingPage() {
  const user = await checkUser();

  if (!user || user.role !== "MEDIA_AGENCY") {
    redirect("/");
  }

  const mediaAgency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
    include: {
      reports: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!mediaAgency) {
    redirect("/media-agency/settings");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reporting</h1>
        <p className="text-muted-foreground">
          Create and manage performance reports for your media campaigns
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Create Report Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Report
            </CardTitle>
            <CardDescription>
              Generate a new performance report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportingForm mediaAgencyId={mediaAgency.id} />
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Reports
            </CardTitle>
            <CardDescription>
              Your latest performance reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mediaAgency.reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reports yet</p>
                <p className="text-sm">Create your first report to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mediaAgency.reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{report.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {report.reportType} • {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/media-agency/reporting/${report.id}`}>
                        <Download className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
