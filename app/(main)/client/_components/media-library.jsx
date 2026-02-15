"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Search,
  FileText,
  Download,
  Tv,
  Radio,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  BarChart3,
  FolderOpen,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export function MediaLibrary({ bookings = [], certificates = [], reports = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("bookings");

  // Calculate statistics
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(
      (b) => b.status === "CONFIRMED" && new Date(b.endDate || b.startDate || Date.now()) >= new Date()
    ).length;
    const completedBookings = bookings.filter((b) => b.status === "COMPLETED").length;
    const totalCertificates = certificates.length;
    const totalReports = reports.length;

    return {
      totalBookings,
      activeBookings,
      completedBookings,
      totalCertificates,
      totalReports,
    };
  }, [bookings, certificates, reports]);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        searchQuery === "" ||
        booking.listing?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.agency?.agencyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.packageName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      const matchesMediaType =
        mediaTypeFilter === "all" ||
        booking.listing?.listingType === mediaTypeFilter;

      return matchesSearch && matchesStatus && matchesMediaType;
    });
  }, [bookings, searchQuery, statusFilter, mediaTypeFilter]);

  // Filter certificates
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const matchesSearch =
        searchQuery === "" ||
        cert.stationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.agency?.agencyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.campaignRefId?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMediaType =
        mediaTypeFilter === "all" ||
        (mediaTypeFilter === "TV" &&
          (cert.stationName?.toLowerCase().includes("tv") ||
            cert.stationName?.toLowerCase().includes("television"))) ||
        (mediaTypeFilter === "RADIO" &&
          cert.stationName?.toLowerCase().includes("radio"));

      return matchesSearch && matchesMediaType;
    });
  }, [certificates, searchQuery, mediaTypeFilter]);

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        searchQuery === "" ||
        report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.agency?.agencyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reportType?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [reports, searchQuery]);

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

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: { variant: "secondary", icon: AlertCircle },
      CONFIRMED: { variant: "default", icon: CheckCircle },
      COMPLETED: { variant: "outline", icon: CheckCircle },
      CANCELLED: { variant: "destructive", icon: XCircle },
    };
    return variants[status] || variants.PENDING;
  };

  const getMediaTypeIcon = (type) => {
    switch (type) {
      case "TV":
        return Tv;
      case "RADIO":
        return Radio;
      default:
        return FolderOpen;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Media Library</h1>
        <p className="text-muted-foreground">
          Manage your media bookings, campaign reports, and transmission certificates
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-transparent backdrop-blur-md border-white/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-transparent backdrop-blur-md border-white/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold">{stats.activeBookings}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-transparent backdrop-blur-md border-white/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completedBookings}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-transparent backdrop-blur-md border-white/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Certificates</p>
                <p className="text-2xl font-bold">{stats.totalCertificates}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-transparent backdrop-blur-md border-white/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reports</p>
                <p className="text-2xl font-bold">{stats.totalReports}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            Bookings ({bookings.length})
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            Reports ({reports.length})
          </TabsTrigger>
          <TabsTrigger value="certificates" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            Certificates ({certificates.length})
          </TabsTrigger>
        </TabsList>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={mediaTypeFilter} onValueChange={setMediaTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Media Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="TV">TV</SelectItem>
                <SelectItem value="RADIO">Radio</SelectItem>
                <SelectItem value="BILLBOARD">Billboard</SelectItem>
                <SelectItem value="DIGITAL">Digital</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium mb-2">No bookings found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {bookings.length === 0
                    ? "You haven't made any media bookings yet."
                    : "Try adjusting your filters to see more results."}
                </p>
                {bookings.length === 0 && (
                  <Button asChild className="bg-white hover:bg-gray-100 text-gray-900">
                    <Link href="/products">Browse Media Services</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const statusBadge = getStatusBadge(booking.status);
                const MediaIcon = getMediaTypeIcon(booking.listing?.listingType);
                const relatedCerts = certificates.filter(
                  (c) => c.bookingId === booking.id
                );
                const relatedReports = reports.filter(
                  (r) => r.bookingId === booking.id
                );

                return (
                  <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          {booking.listing?.imageUrl ? (
                            <img
                              src={booking.listing.imageUrl}
                              alt={booking.listing.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                              {MediaIcon && <MediaIcon className="h-8 w-8 text-muted-foreground" />}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">
                                {booking.listing?.name || "Media Listing"}
                              </h3>
                              <Badge {...statusBadge}>
                                {booking.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {booking.agency?.agencyName}
                            </p>
                            {booking.packageName && (
                              <p className="text-sm font-medium mb-2">
                                Package: {booking.packageName}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              {booking.listing?.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{booking.listing.location}</span>
                                </div>
                              )}
                              {booking.startDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {format(new Date(booking.startDate), "MMM d, yyyy")}
                                    {booking.endDate &&
                                      ` - ${format(new Date(booking.endDate), "MMM d, yyyy")}`}
                                  </span>
                                </div>
                              )}
                              {booking.duration && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{booking.duration}</span>
                                </div>
                              )}
                              {booking.slots && (
                                <span>{booking.slots} spots</span>
                              )}
                            </div>
                            {booking.totalAmount && (
                              <p className="text-lg font-bold mt-2">
                                ₵{booking.totalAmount.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Related Certificates and Reports */}
                      {(relatedCerts.length > 0 || relatedReports.length > 0) && (
                        <div className="pt-4 border-t flex gap-4 text-sm">
                          {relatedCerts.length > 0 && (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {relatedCerts.length} certificate{relatedCerts.length > 1 ? "s" : ""}
                              </span>
                            </div>
                          )}
                          {relatedReports.length > 0 && (
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {relatedReports.length} report{relatedReports.length > 1 ? "s" : ""}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Reports List */}
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium mb-2">No reports found</p>
                <p className="text-sm text-muted-foreground">
                  {reports.length === 0
                    ? "No campaign reports have been shared with you yet."
                    : "Try adjusting your search to see more results."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{report.title}</h3>
                          <Badge variant="outline">{report.reportType}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {report.agency?.agencyName}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(report.startDate), "MMM d, yyyy")} -{" "}
                              {format(new Date(report.endDate), "MMM d, yyyy")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              Created {format(new Date(report.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                        {report.content && (
                          <p className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">
                            {report.content}
                          </p>
                        )}
                        {report.metrics && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Key Metrics:</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(report.metrics).slice(0, 5).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="text-xs">
                                  {key}: {String(value)}
                                </Badge>
                              ))}
                              {Object.keys(report.metrics).length > 5 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{Object.keys(report.metrics).length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search certificates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={mediaTypeFilter} onValueChange={setMediaTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Media Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="TV">TV</SelectItem>
                <SelectItem value="RADIO">Radio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Certificates List */}
          {filteredCertificates.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium mb-2">No certificates found</p>
                <p className="text-sm text-muted-foreground">
                  {certificates.length === 0
                    ? "No transmission certificates have been shared with you yet."
                    : "Try adjusting your filters to see more results."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCertificates.map((cert) => {
                const isTV =
                  cert.stationName?.toLowerCase().includes("tv") ||
                  cert.stationName?.toLowerCase().includes("television");
                const StationIcon = isTV ? Tv : Radio;

                return (
                  <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
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
                            <div className="grid md:grid-cols-2 gap-3 text-sm text-muted-foreground mb-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Aired: {format(new Date(cert.airDate), "MMM d, yyyy")}
                                </span>
                              </div>
                              {cert.airTime && (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span>{cert.airTime}</span>
                                </div>
                              )}
                              {cert.stationName && (
                                <div className="flex items-center gap-2">
                                  <StationIcon className="h-4 w-4" />
                                  <span>{cert.stationName}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="font-medium">Campaign:</span>
                                <span className="font-mono text-xs">{cert.campaignRefId}</span>
                              </div>
                            </div>
                            {cert.notes && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {cert.notes}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Uploaded {format(new Date(cert.createdAt), "MMM d, yyyy")} by{" "}
                              {cert.agency?.agencyName}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={cert.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              View
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
