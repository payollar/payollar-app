"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Star,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  User,
  Sparkles,
  Filter,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function BrowseTalents({ talents = [], categories = [], specialties = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Calculate statistics
  const stats = useMemo(() => {
    const total = talents.length;
    const withServices = talents.filter((t) => t._count?.services > 0).length;
    const totalServices = talents.reduce(
      (acc, t) => acc + (t._count?.services || 0),
      0
    );
    return { total, withServices, totalServices };
  }, [talents]);

  // Filter talents
  const filteredTalents = useMemo(() => {
    return talents.filter((talent) => {
      const matchesSearch =
        searchQuery === "" ||
        talent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty =
        specialtyFilter === "all" || talent.specialty === specialtyFilter;

      const hasMatchingCategory =
        categoryFilter === "all" ||
        talent.services?.some((s) => s.category === categoryFilter);

      return matchesSearch && matchesSpecialty && hasMatchingCategory;
    });
  }, [talents, searchQuery, specialtyFilter, categoryFilter]);

  // Get unique specialties from talents
  const availableSpecialties = useMemo(() => {
    const specs = talents
      .map((t) => t.specialty)
      .filter((s) => s)
      .filter((value, index, self) => self.indexOf(value) === index);
    return specs.sort();
  }, [talents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Browse Talents</h1>
          <p className="text-muted-foreground mt-1">
            Discover talented creators and their available services
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/20 bg-transparent backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground/80 mb-1">Total Talents</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl"></div>
                <User className="h-10 w-10 text-blue-400 relative z-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/20 bg-transparent backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground/80 mb-1">With Services</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.withServices}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl"></div>
                <Briefcase className="h-10 w-10 text-emerald-400 relative z-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/20 bg-gradient-to-br from-blue-900/20 via-blue-900/10 to-transparent backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground/80 mb-1">Total Services</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalServices}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl"></div>
                <Sparkles className="h-10 w-10 text-blue-400 relative z-10" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search talents by name, specialty, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-800 text-white"
          />
        </div>
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger className="w-full sm:w-[200px] bg-gray-900/50 border-gray-800 text-white">
            <SelectValue placeholder="All Specialties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {availableSpecialties.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px] bg-gray-900/50 border-gray-800 text-white">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Talents Grid */}
      {filteredTalents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTalents.map((talent) => (
            <TalentCard key={talent.id} talent={talent} />
          ))}
        </div>
      ) : (
        <Card className="border-gray-800">
          <CardContent className="p-12 text-center">
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-white mb-2">
              No talents found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TalentCard({ talent }) {
  const servicesCount = talent._count?.services || 0;
  const displayedServices = talent.services?.slice(0, 3) || [];

  return (
    <Card className="border-gray-800 hover:border-gray-700 transition-all overflow-hidden group bg-gray-900/50">
      <CardHeader className="relative">
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-gray-700 flex-shrink-0">
            {talent.imageUrl ? (
              <Image
                src={talent.imageUrl}
                alt={talent.name || "Talent"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-600" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-white mb-1 truncate">
              {talent.name || "Unknown Talent"}
            </CardTitle>
            {talent.specialty && (
              <Badge variant="outline" className="text-xs border-gray-700 mb-2">
                {talent.specialty}
              </Badge>
            )}
            {talent.experience && (
              <p className="text-xs text-muted-foreground">
                {talent.experience} year{talent.experience !== 1 ? "s" : ""} experience
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {talent.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {talent.description}
          </p>
        )}

        {/* Services Section */}
        {servicesCount > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-emerald-400" />
                Available Services ({servicesCount})
              </h4>
            </div>
            <div className="space-y-2">
              {displayedServices.map((service) => (
                <div
                  key={service.id}
                  className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {service.title}
                      </p>
                      {service.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {service.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <p className="text-sm font-bold text-emerald-400">
                        ₵{service.rate.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {service.rateType === "PER_HOUR" ? "/hr" : service.rateType === "PER_PROJECT" ? "/project" : ""}
                      </p>
                    </div>
                  </div>
                  {service.category && (
                    <Badge
                      variant="outline"
                      className="text-xs mt-1 border-gray-700"
                    >
                      {service.category}
                    </Badge>
                  )}
                </div>
              ))}
              {servicesCount > 3 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  +{servicesCount - 3} more service{servicesCount - 3 !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/30 text-center">
            <p className="text-sm text-muted-foreground">
              No services available yet
            </p>
          </div>
        )}

        {/* Skills */}
        {talent.skills && talent.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {talent.skills.slice(0, 3).map((skill) => (
              <Badge
                key={skill.id}
                variant="outline"
                className="text-xs border-gray-700"
              >
                {skill.name}
              </Badge>
            ))}
            {talent.skills.length > 3 && (
              <Badge variant="outline" className="text-xs border-gray-700">
                +{talent.skills.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* View Profile Button */}
        <Link href={`/talents/${talent.specialty || "all"}/${talent.id}`}>
          <Button className="w-full bg-white hover:bg-gray-100 text-gray-900">
            View Profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
