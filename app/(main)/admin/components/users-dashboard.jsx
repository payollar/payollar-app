"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Search,
  User,
  Mail,
  Calendar,
  Shield,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import { format } from "date-fns";

export function UsersDashboard({ initialUsers, initialStats, initialPagination }) {
  const [users, setUsers] = useState(initialUsers || []);
  const [stats, setStats] = useState(initialStats || {});
  const [pagination, setPagination] = useState(initialPagination || {});
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageErrors, setImageErrors] = useState(new Set());

  const fetchUsers = async (page = 1, search = "", role = "ALL", verification = "ALL") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        search,
        role,
        verificationStatus: verification,
      });

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setPagination(data.pagination);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, searchTerm, roleFilter, verificationFilter);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, roleFilter, verificationFilter]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchUsers(newPage, searchTerm, roleFilter, verificationFilter);
  };

  const getRoleBadge = (role) => {
    const variants = {
      ADMIN: "bg-purple-900/20 border-purple-900/30 text-purple-400",
      CREATOR: "bg-blue-900/20 border-blue-900/30 text-blue-400",
      CLIENT: "bg-emerald-900/20 border-emerald-900/30 text-emerald-400",
      UNASSIGNED: "bg-gray-900/20 border-gray-900/30 text-gray-400",
    };
    return variants[role] || variants.UNASSIGNED;
  };

  const getVerificationBadge = (status) => {
    const variants = {
      VERIFIED: "bg-emerald-900/20 border-emerald-900/30 text-emerald-400",
      PENDING: "bg-amber-900/20 border-amber-900/30 text-amber-400",
      REJECTED: "bg-red-900/20 border-red-900/30 text-red-400",
    };
    return status ? variants[status] : "bg-gray-900/20 border-gray-900/30 text-gray-400";
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-muted/20 border-emerald-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers || 0}</p>
              </div>
              <User className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/20 border-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Creators</p>
                <p className="text-2xl font-bold text-white">{stats.creators || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/20 border-emerald-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clients</p>
                <p className="text-2xl font-bold text-white">{stats.clients || 0}</p>
              </div>
              <User className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/20 border-amber-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Verification</p>
                <p className="text-2xl font-bold text-white">{stats.pendingCreators || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Users Table */}
        <Card className="bg-muted/20 border-emerald-900/20">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle className="text-lg md:text-xl font-bold text-white">
                  All Users
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Manage and view all platform users
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8 bg-background border-emerald-900/20 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filters:</span>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[140px] bg-background border-emerald-900/20 text-sm">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="CREATOR">Creator</SelectItem>
                <SelectItem value="CLIENT">Client</SelectItem>
                <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="w-full sm:w-[160px] bg-background border-emerald-900/20 text-sm">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            {(roleFilter !== "ALL" || verificationFilter !== "ALL" || searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRoleFilter("ALL");
                  setVerificationFilter("ALL");
                  setSearchTerm("");
                }}
                className="text-muted-foreground hover:text-white"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No users found matching your criteria.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-emerald-900/20">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        User
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Joined
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Activity
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-emerald-900/10 hover:bg-muted/10 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted/20 border-2 border-emerald-900/30 flex-shrink-0">
                              {user.imageUrl && user.imageUrl.trim() !== "" && !imageErrors.has(user.id) ? (
                                <Image
                                  src={user.imageUrl}
                                  alt={user.name || user.email || "User"}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                  unoptimized={user.imageUrl?.startsWith('http')}
                                  onError={() => {
                                    setImageErrors(prev => new Set(prev).add(user.id));
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-900/20 to-purple-900/20">
                                  <span className="text-base text-emerald-400 font-bold">
                                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {user.name || "No name"}
                              </p>
                              {user.specialty && (
                                <p className="text-xs text-muted-foreground">
                                  {user.specialty}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={getRoleBadge(user.role)}
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {user.verificationStatus ? (
                            <Badge
                              variant="outline"
                              className={getVerificationBadge(user.verificationStatus)}
                            >
                              {user.verificationStatus}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(user.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-muted-foreground">
                            {user.role === "CREATOR" && (
                              <div className="space-y-1">
                                <p>Appointments: {user._count?.creatorAppointments || 0}</p>
                                <p>Products: {user._count?.digitalProducts || 0}</p>
                              </div>
                            )}
                            {user.role === "CLIENT" && (
                              <div className="space-y-1">
                                <p>Appointments: {user._count?.clientAppointments || 0}</p>
                                <p>Campaigns: {user._count?.campaigns || 0}</p>
                              </div>
                            )}
                            {user.role === "UNASSIGNED" && (
                              <span className="text-xs">No activity</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                            className="text-emerald-400 hover:text-emerald-300"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {users.map((user) => (
                  <Card
                    key={user.id}
                    className="bg-background border-emerald-900/20 hover:border-emerald-700/30 transition-all"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted/20 border-2 border-emerald-900/30 flex-shrink-0">
                          {user.imageUrl && user.imageUrl.trim() !== "" && !imageErrors.has(user.id) ? (
                            <Image
                              src={user.imageUrl}
                              alt={user.name || user.email || "User"}
                              fill
                              className="object-cover"
                              sizes="48px"
                              unoptimized={user.imageUrl?.startsWith('http')}
                              onError={() => {
                                setImageErrors(prev => new Set(prev).add(user.id));
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-900/20 to-purple-900/20">
                              <span className="text-base text-emerald-400 font-bold">
                                {(user.name || user.email || "U").charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">
                            {user.name || "No name"}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </span>
                          </div>
                          {user.specialty && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {user.specialty}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getRoleBadge(user.role)}`}
                        >
                          {user.role}
                        </Badge>
                        {user.verificationStatus && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${getVerificationBadge(user.verificationStatus)}`}
                          >
                            {user.verificationStatus}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(user.createdAt), "MMM d, yyyy")}</span>
                        </div>
                        {user.role === "CREATOR" && (
                          <div className="text-right">
                            <p>Appts: {user._count?.creatorAppointments || 0}</p>
                            <p>Products: {user._count?.digitalProducts || 0}</p>
                          </div>
                        )}
                        {user.role === "CLIENT" && (
                          <div className="text-right">
                            <p>Appts: {user._count?.clientAppointments || 0}</p>
                            <p>Campaigns: {user._count?.campaigns || 0}</p>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                        className="w-full text-emerald-400 hover:text-emerald-300"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-emerald-900/20">
                  <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} users
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="border-emerald-900/30 text-xs sm:text-sm"
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <span className="text-xs sm:text-sm text-muted-foreground px-2">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= pagination.totalPages || loading}
                      className="border-emerald-900/30 text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
            <DialogHeader>
              <div className="flex flex-col items-center sm:items-start gap-3 sm:gap-4 pb-4 border-b border-emerald-900/20">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-muted/20 border-4 border-emerald-900/30">
                  {selectedUser.imageUrl && selectedUser.imageUrl.trim() !== "" && !imageErrors.has(selectedUser.id) ? (
                    <Image
                      src={selectedUser.imageUrl}
                      alt={selectedUser.name || selectedUser.email || "User"}
                      fill
                      className="object-cover"
                      sizes="96px"
                      unoptimized={selectedUser.imageUrl?.startsWith('http')}
                      onError={() => {
                        setImageErrors(prev => new Set(prev).add(selectedUser.id));
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-900/20 to-purple-900/20">
                      <span className="text-2xl sm:text-3xl text-emerald-400 font-bold">
                        {(selectedUser.name || selectedUser.email || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <DialogTitle className="text-lg sm:text-2xl">{selectedUser.name || "No name"}</DialogTitle>
                  <DialogDescription className="text-xs sm:text-base mt-2 break-all">
                    {selectedUser.email}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Role</h4>
                  <Badge variant="outline" className={getRoleBadge(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                </div>
                {selectedUser.verificationStatus && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Verification Status
                    </h4>
                    <Badge
                      variant="outline"
                      className={getVerificationBadge(selectedUser.verificationStatus)}
                    >
                      {selectedUser.verificationStatus}
                    </Badge>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Joined</h4>
                  <p className="text-white">
                    {format(new Date(selectedUser.createdAt), "PPP")}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Email Verified
                  </h4>
                  <p className="text-white">
                    {selectedUser.emailVerified ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              {/* Creator-specific info */}
              {selectedUser.role === "CREATOR" && (
                <div className="space-y-4 pt-4 border-t border-emerald-900/20">
                  <h3 className="text-sm sm:text-base font-semibold text-white">Creator Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {selectedUser.specialty && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Specialty
                        </h4>
                        <p className="text-white">{selectedUser.specialty}</p>
                      </div>
                    )}
                    {selectedUser.experience !== null && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Experience
                        </h4>
                        <p className="text-white">{selectedUser.experience} years</p>
                      </div>
                    )}
                    {selectedUser.description && (
                      <div className="sm:col-span-2">
                        <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                          Description
                        </h4>
                        <p className="text-xs sm:text-sm text-white whitespace-pre-line break-words">
                          {selectedUser.description}
                        </p>
                      </div>
                    )}
                    {selectedUser.portfolioUrls && selectedUser.portfolioUrls.length > 0 && (
                      <div className="sm:col-span-2">
                        <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                          Portfolio Links
                        </h4>
                        <div className="space-y-1">
                          {selectedUser.portfolioUrls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 text-xs sm:text-sm block break-all"
                            >
                              {url}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Activity Stats */}
              <div className="space-y-4 pt-4 border-t border-emerald-900/20">
                <h3 className="text-sm sm:text-base font-semibold text-white">Activity Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Appointments
                    </h4>
                    <p className="text-2xl font-bold text-white">
                      {(selectedUser._count?.creatorAppointments || 0) +
                        (selectedUser._count?.clientAppointments || 0)}
                    </p>
                  </div>
                  {selectedUser.role === "CREATOR" && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Products
                        </h4>
                        <p className="text-2xl font-bold text-white">
                          {selectedUser._count?.digitalProducts || 0}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Credits
                        </h4>
                        <p className="text-2xl font-bold text-white">
                          {selectedUser.credits || 0}
                        </p>
                      </div>
                    </>
                  )}
                  {selectedUser.role === "CLIENT" && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Campaigns
                      </h4>
                      <p className="text-2xl font-bold text-white">
                        {selectedUser._count?.campaigns || 0}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
