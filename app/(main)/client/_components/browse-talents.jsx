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
  Briefcase,
  User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ClientPageShell, clientCardClass } from "./client-page-shell";

const fieldClass = "border-border/60 bg-background text-foreground";

export function BrowseTalents({ talents = [], categories = [], specialties = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

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
    <ClientPageShell
      eyebrow="Discover"
      title="Browse talents"
      description="Discover talented creators and their available services."
      actions={
        <Button variant="marketing" className="gap-2" asChild>
          <Link href="/talents">
            <Search className="h-4 w-4" />
            Public directory
          </Link>
        </Button>
      }
    >
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search talents by name, specialty, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 ${fieldClass}`}
          />
        </div>
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger className={`w-full sm:w-[200px] ${fieldClass}`}>
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
          <SelectTrigger className={`w-full sm:w-[200px] ${fieldClass}`}>
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
        <Card className={clientCardClass}>
          <CardContent className="p-12 text-center">
            <Search className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
            <h3 className="mb-2 text-xl font-medium text-foreground">No talents found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
    </ClientPageShell>
  );
}

function TalentCard({ talent }) {
  const servicesCount = talent._count?.services || 0;
  const displayedServices = talent.services?.slice(0, 3) || [];

  return (
    <Card
      className={`${clientCardClass} group overflow-hidden transition-all hover:border-primary/25 hover:shadow-md`}
    >
      <CardHeader className="relative">
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-border/60">
            {talent.imageUrl ? (
              <Image
                src={talent.imageUrl}
                alt={talent.name || "Talent"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="mb-1 truncate text-lg font-bold text-foreground">
              {talent.name || "Unknown Talent"}
            </CardTitle>
            {talent.specialty && (
              <Badge variant="outline" className="mb-2 text-xs">
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
              <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Briefcase className="h-4 w-4 text-primary" />
                Available services ({servicesCount})
              </h4>
            </div>
            <div className="space-y-2">
              {displayedServices.map((service) => (
                <div
                  key={service.id}
                  className="rounded-lg border border-border/50 bg-muted/30 p-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {service.title}
                      </p>
                      {service.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {service.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-2 shrink-0">
                      <p className="text-sm font-bold tabular-nums text-primary">
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
          <div className="rounded-lg border border-border/50 bg-muted/20 p-4 text-center">
            <p className="text-sm text-muted-foreground">No services listed yet</p>
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
        <Button variant="marketing" className="w-full" asChild>
          <Link href={`/talents/${talent.specialty || "all"}/${talent.id}`}>View profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
