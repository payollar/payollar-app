import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Download, Calendar, Clock, Radio, Tv, Eye, Trash2 } from "lucide-react";
import { TransmissionCertificateForm } from "./_components/tc-upload-form";

export default async function TransmissionCertificatesPage() {
  const user = await checkUser();

  if (!user || user.role !== "MEDIA_AGENCY") {
    redirect("/");
  }

  const mediaAgency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
    include: {
      transmissionCertificates: {
        orderBy: { airDate: "desc" },
        take: 50,
      },
    },
  });

  if (!mediaAgency) {
    redirect("/media-agency/settings");
  }

  const formatFileType = (type) => {
    if (type?.includes("pdf")) return "PDF";
    if (type?.includes("image")) return "Image";
    return type?.split("/")[1]?.toUpperCase() || "File";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transmission Certificates</h1>
        <p className="text-muted-foreground">
          Upload and manage transmission certificates confirming ad airing
        </p>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Transmission Certificate
          </CardTitle>
          <CardDescription>
            Upload PDF or image files confirming that ads aired on radio/TV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransmissionCertificateForm mediaAgencyId={mediaAgency.id} />
        </CardContent>
      </Card>

      {/* Uploaded Certificates */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Certificates</CardTitle>
          <CardDescription>
            {mediaAgency.transmissionCertificates.length} certificate(s) uploaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mediaAgency.transmissionCertificates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No certificates uploaded</p>
              <p className="text-sm">Upload your first transmission certificate above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mediaAgency.transmissionCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="border rounded-lg p-6 space-y-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-primary/10">
                        {cert.fileType?.includes("pdf") ? (
                          <FileText className="h-6 w-6 text-primary" />
                        ) : (
                          <Eye className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{cert.fileName}</h3>
                          <Badge variant="outline">
                            {formatFileType(cert.fileType)}
                          </Badge>
                          <Badge variant="secondary">
                            {formatFileSize(cert.fileSize)}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(cert.airDate).toLocaleDateString()}
                            </span>
                          </div>
                          {cert.airTime && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{cert.airTime}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">Campaign ID:</span>
                            <span className="font-mono text-xs">{cert.campaignRefId}</span>
                          </div>
                          {cert.stationName && (
                            <div className="flex items-center gap-2">
                              {cert.stationName.toLowerCase().includes("tv") || cert.stationName.toLowerCase().includes("television") ? (
                                <Tv className="h-4 w-4" />
                              ) : (
                                <Radio className="h-4 w-4" />
                              )}
                              <span>{cert.stationName}</span>
                            </div>
                          )}
                        </div>
                        {cert.notes && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {cert.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Uploaded on {new Date(cert.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" asChild>
                        <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          View
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
