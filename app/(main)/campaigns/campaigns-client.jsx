"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Filter,
  DollarSign,
  Users,
  TrendingUp,
  ArrowRight,
  MapPin,
  Clock,
  Target,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { applyToCampaign } from "@/actions/campaigns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const CAMPAIGN_CATEGORIES = [
  "TV Media",
  "Radio Media",
  "Digital Media",
  "Billboard Media",
  "Influencer Marketing",
  "Video Clipping",
];

const LOCATIONS = [
  "Accra",
  "Kumasi",
  "Takoradi",
  "Tamale",
  "Cape Coast",
  "Nationwide",
  "Multiple Cities",
];

export function CampaignsClient({ initialCampaigns = [] }) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || campaign.category === categoryFilter;
    const matchesLocation = locationFilter === "all" || campaign.location === locationFilter;

    return matchesSearch && matchesCategory && matchesLocation;
  });

  const handleApply = (campaign) => {
    setSelectedCampaign(campaign);
    setIsApplyModalOpen(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    if (!selectedCampaign) return;

    const formData = new FormData(e.target);
    formData.append("campaignId", selectedCampaign.id);

    setIsSubmitting(true);
    try {
      const result = await applyToCampaign(formData);

      if (result?.success) {
        toast.success("Application submitted successfully!");
        setIsApplyModalOpen(false);
        setSelectedCampaign(null);
        router.refresh();
      }
    } catch (error) {
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBudget = (campaign) => {
    if (campaign.budgetMin && campaign.budgetMax) {
      return `₵${campaign.budgetMin.toLocaleString()} - ₵${campaign.budgetMax.toLocaleString()}`;
    } else if (campaign.budgetMin) {
      return `₵${campaign.budgetMin.toLocaleString()}+`;
    } else if (campaign.budgetMax) {
      return `Up to ₵${campaign.budgetMax.toLocaleString()}`;
    }
    return "Budget not specified";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden w-full px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative w-full h-[250px] md:h-[300px] lg:h-[350px] rounded-2xl overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src="/campaign-banner.PNG"
              alt="Campaigns Banner"
              className="w-full h-full object-cover rounded-2xl"
              style={{ objectFit: "cover" }}
            />
          </div>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 z-[1] rounded-2xl"></div>
          {/* Content */}
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="text-center space-y-4 max-w-3xl mx-auto">
                <Badge variant="secondary" className="w-fit mx-auto backdrop-blur-sm bg-background/80">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {campaigns.length} Active Campaigns
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-balance text-white drop-shadow-lg">
                  Discover exciting brand campaigns
                </h1>
                <p className="text-lg text-white/90 text-pretty drop-shadow-md">
                  Connect with top brands and monetize your talent. Browse campaigns, apply instantly, and grow your creator business.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="border-b border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns, brands, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CAMPAIGN_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Campaigns Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-16">
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No campaigns found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => (
                <Card
                  key={campaign.id}
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => handleApply(campaign)}
                >
                  <div className="relative overflow-hidden">
                    {campaign.imageUrl ? (
                      <Image
                        src={campaign.imageUrl}
                        alt={campaign.title}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 flex items-center justify-center">
                        <Target className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="backdrop-blur">
                        Active
                      </Badge>
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="backdrop-blur">
                        {campaign.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary">{campaign.brand}</span>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Users className="h-3 w-3 mr-1" />
                          {campaign.applicants || 0}
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                        {campaign.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-medium">{formatBudget(campaign)}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{campaign.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Deadline: {format(new Date(campaign.deadline), "MMM d, yyyy")}</span>
                      </div>
                    </div>

                    {campaign.requirements && campaign.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {campaign.requirements.slice(0, 2).map((req, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                        {campaign.requirements.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{campaign.requirements.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Application Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply to Campaign</DialogTitle>
            <DialogDescription>
              Submit your application for {selectedCampaign?.title} by {selectedCampaign?.brand}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitApplication} className="space-y-6 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" name="name" placeholder="Your full name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" placeholder="your@email.com" required />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" placeholder="+233 XX XXX XXXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="City, Region" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio/Social Media Links</Label>
              <Input id="portfolio" name="portfolio" placeholder="Instagram, YouTube, Website, etc." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Relevant Experience *</Label>
              <Textarea
                id="experience"
                name="experience"
                placeholder="Tell us about your relevant experience and why you're a great fit for this campaign..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Your Rate (₵)</Label>
              <Input id="rate" name="rate" type="number" placeholder="Your expected compensation" min="0" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Textarea
                id="availability"
                name="availability"
                placeholder="When are you available to start? Any scheduling constraints?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea id="additionalInfo" name="additionalInfo" placeholder="Any other details you'd like to share..." rows={3} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setIsApplyModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

