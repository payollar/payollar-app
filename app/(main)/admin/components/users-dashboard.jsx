"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
  X,
  Clock3,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const PANEL =
  "rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]";

function StatCard({ label, value, icon: Icon }) {
  return (
    <section className={cn(PANEL, "p-4 md:p-5")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white">
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </section>
  );
}

function UserAvatar({ user, size = "md", imageErrors, onImageError }) {
  const sizeClass = size === "lg" ? "h-20 w-20 sm:h-24 sm:w-24" : "h-10 w-10";
  const textClass = size === "lg" ? "text-2xl sm:text-3xl" : "text-sm";
  const hasImage =
    user.imageUrl && user.imageUrl.trim() !== "" && !imageErrors.has(user.id);

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100",
        sizeClass
      )}
    >
      {hasImage ? (
        <Image
          src={user.imageUrl}
          alt={user.name || user.email || "User"}
          fill
          className="object-cover"
          sizes={size === "lg" ? "96px" : "40px"}
          unoptimized={user.imageUrl?.startsWith("http")}
          onError={() => onImageError(user.id)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-950 text-white">
          <span className={cn("font-semibold", textClass)}>
            {(user.name || user.email || "U").charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

function ActivityLines({ user, compact = false }) {
  if (user.role === "CREATOR") {
    return (
      <div className={cn("text-slate-600", compact ? "space-y-0.5 text-xs" : "space-y-1 text-sm")}>
        <p>Appointments: {user._count?.creatorAppointments || 0}</p>
        <p>Products: {user._count?.digitalProducts || 0}</p>
      </div>
    );
  }
  if (user.role === "CLIENT") {
    return (
      <div className={cn("text-slate-600", compact ? "space-y-0.5 text-xs" : "space-y-1 text-sm")}>
        <p>Appointments: {user._count?.clientAppointments || 0}</p>
        <p>Campaigns: {user._count?.campaigns || 0}</p>
      </div>
    );
  }
  return <span className="text-xs text-slate-400">No activity</span>;
}

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

  const handleImageError = (id) => {
    setImageErrors((prev) => new Set(prev).add(id));
  };

  const getRoleBadge = (role) => {
    const variants = {
      ADMIN: "border-violet-200 bg-violet-50 text-violet-700",
      CREATOR: "border-sky-200 bg-sky-50 text-sky-700",
      CLIENT: "border-emerald-200 bg-emerald-50 text-emerald-700",
      UNASSIGNED: "border-slate-200 bg-slate-50 text-slate-600",
    };
    return variants[role] || variants.UNASSIGNED;
  };

  const getVerificationBadge = (status) => {
    const variants = {
      VERIFIED: "border-emerald-200 bg-emerald-50 text-emerald-700",
      PENDING: "border-amber-200 bg-amber-50 text-amber-700",
      REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
    };
    return status ? variants[status] : "border-slate-200 bg-slate-50 text-slate-500";
  };

  const hasActiveFilters =
    roleFilter !== "ALL" || verificationFilter !== "ALL" || searchTerm;

  return (
    <div className="-m-3 min-h-full min-w-0 space-y-4 bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:space-y-5 md:p-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-950 md:text-xl">Users</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage accounts, roles, and verification across the platform.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Total users" value={stats.totalUsers || 0} icon={User} />
        <StatCard label="Creators" value={stats.creators || 0} icon={Shield} />
        <StatCard label="Clients" value={stats.clients || 0} icon={User} />
        <StatCard
          label="Pending verification"
          value={stats.pendingCreators || 0}
          icon={Clock3}
        />
      </div>

      <section className={cn(PANEL, "overflow-hidden")}>
        <div className="border-b border-slate-100 px-4 py-4 md:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">All users</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Search, filter, and inspect every account.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:min-w-[420px]">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
                  className="h-10 rounded-full border-slate-200 bg-white pl-9 text-sm text-slate-900 placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-10 w-full rounded-full border-slate-200 bg-white text-sm text-slate-700 sm:w-[140px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="CREATOR">Creator</SelectItem>
                  <SelectItem value="CLIENT">Client</SelectItem>
                  <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                </SelectContent>
              </Select>
              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger className="h-10 w-full rounded-full border-slate-200 bg-white text-sm text-slate-700 sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All status</SelectItem>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRoleFilter("ALL");
                    setVerificationFilter("ALL");
                    setSearchTerm("");
                  }}
                  className="h-10 rounded-full px-3 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  <X className="mr-1 h-4 w-4" />
                  Clear
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="p-2 md:p-3">
          {loading ? (
            <div className="py-16 text-center text-sm text-slate-500">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">
              No users found matching your criteria.
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[880px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-left">
                      {[
                        "User",
                        "Email",
                        "Role",
                        "Status",
                        "Joined",
                        "Activity",
                        "Actions",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className={cn(
                            "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400",
                            heading === "Actions" && "text-right"
                          )}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              user={user}
                              imageErrors={imageErrors}
                              onImageError={handleImageError}
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-950">
                                {user.name || "No name"}
                              </p>
                              {user.specialty ? (
                                <p className="truncate text-xs text-slate-500">
                                  {user.specialty}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex max-w-[220px] items-center gap-2">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span className="truncate text-sm text-slate-600">
                              {user.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                              getRoleBadge(user.role)
                            )}
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          {user.verificationStatus ? (
                            <Badge
                              variant="outline"
                              className={cn(
                                "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                                getVerificationBadge(user.verificationStatus)
                              )}
                            >
                              {user.verificationStatus}
                            </Badge>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {format(new Date(user.createdAt), "MMM d, yyyy")}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <ActivityLines user={user} />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                            className="h-8 rounded-full px-3 text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                          >
                            <Eye className="mr-1.5 h-4 w-4" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {users.map((user) => (
                  <article
                    key={user.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start gap-3">
                      <UserAvatar
                        user={user}
                        imageErrors={imageErrors}
                        onImageError={handleImageError}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {user.name || "No name"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                        {user.specialty ? (
                          <p className="mt-1 text-xs text-slate-500">{user.specialty}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                          getRoleBadge(user.role)
                        )}
                      >
                        {user.role}
                      </Badge>
                      {user.verificationStatus ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                            getVerificationBadge(user.verificationStatus)
                          )}
                        >
                          {user.verificationStatus}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </div>
                      <ActivityLines user={user} compact />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                      className="mt-3 h-9 w-full rounded-full border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="mr-1.5 h-4 w-4" />
                      View details
                    </Button>
                  </article>
                ))}
              </div>

              {pagination.totalPages > 1 ? (
                <div className="mt-3 flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-2 pt-4 sm:flex-row">
                  <p className="text-center text-xs text-slate-500 sm:text-left sm:text-sm">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} users
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="h-9 rounded-full border-slate-200 text-slate-700"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <span className="px-2 text-xs text-slate-500 sm:text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= pagination.totalPages || loading}
                      className="h-9 rounded-full border-slate-200 text-slate-700"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      {selectedUser ? (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="mx-2 max-h-[90vh] max-w-3xl overflow-y-auto border-slate-200 bg-white text-slate-900 sm:mx-auto">
            <DialogHeader>
              <div className="flex flex-col items-center gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:gap-4">
                <UserAvatar
                  user={selectedUser}
                  size="lg"
                  imageErrors={imageErrors}
                  onImageError={handleImageError}
                />
                <div className="min-w-0 text-center sm:text-left">
                  <DialogTitle className="text-lg font-semibold text-slate-950 sm:text-2xl">
                    {selectedUser.name || "No name"}
                  </DialogTitle>
                  <DialogDescription className="mt-1 break-all text-sm text-slate-500">
                    {selectedUser.email}
                  </DialogDescription>
                  <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                        getRoleBadge(selectedUser.role)
                      )}
                    >
                      {selectedUser.role}
                    </Badge>
                    {selectedUser.verificationStatus ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                          getVerificationBadge(selectedUser.verificationStatus)
                        )}
                      >
                        {selectedUser.verificationStatus}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Joined
                  </h4>
                  <p className="text-sm font-medium text-slate-950">
                    {format(new Date(selectedUser.createdAt), "PPP")}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Email verified
                  </h4>
                  <p className="text-sm font-medium text-slate-950">
                    {selectedUser.emailVerified ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              {selectedUser.role === "CREATOR" ? (
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <h3 className="text-sm font-semibold text-slate-950">Creator information</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {selectedUser.specialty ? (
                      <div>
                        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Specialty
                        </h4>
                        <p className="text-sm font-medium text-slate-950">
                          {selectedUser.specialty}
                        </p>
                      </div>
                    ) : null}
                    {selectedUser.experience !== null && selectedUser.experience !== undefined ? (
                      <div>
                        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Experience
                        </h4>
                        <p className="text-sm font-medium text-slate-950">
                          {selectedUser.experience} years
                        </p>
                      </div>
                    ) : null}
                    {selectedUser.description ? (
                      <div className="sm:col-span-2">
                        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Description
                        </h4>
                        <p className="whitespace-pre-line break-words text-sm text-slate-700">
                          {selectedUser.description}
                        </p>
                      </div>
                    ) : null}
                    {selectedUser.portfolioUrls?.length > 0 ? (
                      <div className="sm:col-span-2">
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Portfolio links
                        </h4>
                        <div className="space-y-1">
                          {selectedUser.portfolioUrls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block break-all text-sm font-medium text-slate-950 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-950"
                            >
                              {url}
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="space-y-4 border-t border-slate-100 pt-4">
                <h3 className="text-sm font-semibold text-slate-950">Activity</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Appointments</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
                      {(selectedUser._count?.creatorAppointments || 0) +
                        (selectedUser._count?.clientAppointments || 0)}
                    </p>
                  </div>
                  {selectedUser.role === "CREATOR" ? (
                    <>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Products</p>
                        <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
                          {selectedUser._count?.digitalProducts || 0}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Credits</p>
                        <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
                          {selectedUser.credits || 0}
                        </p>
                      </div>
                    </>
                  ) : null}
                  {selectedUser.role === "CLIENT" ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Campaigns</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
                        {selectedUser._count?.campaigns || 0}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
