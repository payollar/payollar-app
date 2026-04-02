"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Filter,
  DollarSign,
  Users,
  ArrowRight,
  MapPin,
  Clock,
  Target,
  Loader2,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { applyToCampaign } from "@/actions/campaigns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Particles } from "@/components/ui/particles";
import { SectionShell } from "@/components/landing/section-shell";
import { cn } from "@/lib/utils";

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
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <Particles
          className="absolute inset-0 opacity-[0.35]"
          quantity={72}
          color="#0055ff"
          staticity={48}
          ease={50}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <SectionShell className="relative z-10 max-w-[90rem] pb-20 pt-2 md:pb-28 md:pt-4">
        {/* Hero — designed card (no banner image) */}
        <section className="mb-10">
          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/60 shadow-xl shadow-black/15 backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="relative px-6 py-10 text-center md:px-12 md:py-14">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                <Target className="h-7 w-7" strokeWidth={2.25} />
              </div>
              <Badge variant="glow" className="mb-4 px-3 py-1.5 text-xs font-medium">
                <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
                {campaigns.length} active {campaigns.length === 1 ? "campaign" : "campaigns"}
              </Badge>
              <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl lg:text-[2.75rem] [font-family:var(--font-heading)]">
                Discover brand campaigns
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
                Connect with leading brands—browse opportunities, apply in one flow, and grow your
                creator business.
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-10 rounded-2xl border border-border/80 bg-card/40 p-4 shadow-inner backdrop-blur-sm md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search campaigns, brands, keywords…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 rounded-xl border-border/80 bg-background/80 pl-10 shadow-sm"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-11 w-full rounded-xl border-border/80 bg-background/80 md:w-[200px]">
                <Filter className="mr-2 h-4 w-4 shrink-0" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CAMPAIGN_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="h-11 w-full rounded-xl border-border/80 bg-background/80 md:w-[200px]">
                <MapPin className="mr-2 h-4 w-4 shrink-0" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Grid */}
        <section>
          {filteredCampaigns.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center md:py-20">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No campaigns match</h3>
              <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                Try another search or filter—or check back soon for new briefs.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {filteredCampaigns.map((campaign) => (
                <Card
                  key={campaign.id}
                  className={cn(
                    "group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all duration-300",
                    "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
                  )}
                  onClick={() => handleApply(campaign)}
                >
                  <div className="relative aspect-[2/1] w-full overflow-hidden md:aspect-[16/9]">
                    {campaign.imageUrl ? (
                      <Image
                        src={campaign.imageUrl}
                        alt={campaign.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 92vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/8 to-muted">
                        <Target className="h-14 w-14 text-primary/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90" />
                    <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-1.5">
                      <Badge className="border border-white/20 bg-black/55 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-md">
                        Active
                      </Badge>
                      <Badge className="border border-white/15 bg-white/15 text-[10px] font-medium text-white backdrop-blur-md">
                        {campaign.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="space-y-4 p-5">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-primary">{campaign.brand}</span>
                        <div className="flex shrink-0 items-center text-xs text-muted-foreground">
                          <Users className="mr-1 h-3.5 w-3.5" />
                          {campaign.applicants || 0}
                        </div>
                      </div>
                      <h3 className="font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {campaign.title}
                      </h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{campaign.description}</p>
                    </div>

                    <div className="space-y-1.5 border-t border-border/60 pt-3">
                      <div className="flex items-center text-sm">
                        <DollarSign className="mr-2 h-4 w-4 shrink-0 text-primary" />
                        <span className="font-medium">{formatBudget(campaign)}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4 shrink-0" />
                        <span>{campaign.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4 shrink-0" />
                        <span>Deadline {format(new Date(campaign.deadline), "MMM d, yyyy")}</span>
                      </div>
                    </div>

                    {campaign.requirements && campaign.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {campaign.requirements.slice(0, 2).map((req, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="rounded-full border-border/80 bg-muted/40 text-xs font-normal"
                          >
                            {req}
                          </Badge>
                        ))}
                        {campaign.requirements.length > 2 && (
                          <Badge
                            variant="outline"
                            className="rounded-full border-border/80 bg-muted/40 text-xs"
                          >
                            +{campaign.requirements.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    <Button variant="marketing" className="w-full rounded-full font-semibold shadow-md shadow-primary/15">
                      Apply now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </SectionShell>

      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl border-border/80">
          <DialogHeader>
            <DialogTitle className="text-xl [font-family:var(--font-heading)]">Apply to campaign</DialogTitle>
            <DialogDescription>
              {selectedCampaign?.title} · {selectedCampaign?.brand}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitApplication} className="mt-4 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name *</Label>
                <Input id="name" name="name" placeholder="Your full name" required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@email.com"
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" placeholder="+233 …" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="City, region" className="rounded-xl" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio / social links</Label>
              <Input id="portfolio" name="portfolio" placeholder="Instagram, YouTube, site…" className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Relevant experience *</Label>
              <Textarea
                id="experience"
                name="experience"
                placeholder="Why you’re a fit for this campaign…"
                rows={4}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Your rate (₵)</Label>
              <Input id="rate" name="rate" type="number" placeholder="Expected compensation" min="0" className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Textarea
                id="availability"
                name="availability"
                placeholder="Start dates, constraints…"
                rows={2}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Anything else?</Label>
              <Textarea id="additionalInfo" name="additionalInfo" placeholder="Optional details" rows={3} className="rounded-xl" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="glass"
                className="flex-1 rounded-full"
                onClick={() => setIsApplyModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="marketing" className="flex-1 rounded-full font-semibold" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit application"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
