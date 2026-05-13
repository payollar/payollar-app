"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Target, Users, TrendingUp, CheckCircle } from "lucide-react";
import Link from "next/link";
import { SectionParticles } from "@/components/landing/section-particles";

export function CampaignsSection() {
  const features = [
    {
      icon: Target,
      image: "/icons/cc1.PNG",
      title: "Post Campaigns",
      description: "Create detailed campaigns with requirements, budget, and deadlines",
      color: "",
    },
    {
      icon: Users,
      image: "/icons/cc2.PNG",
      title: "Reach Top Talents",
      description: "Talents apply directly to your campaigns with their portfolios",
      color: "",
    },
    {
      icon: CheckCircle,
      image: "/icons/c2.PNG",
      title: "Review & Select",
      description: "Review applications, select the best fits, and start collaborating",
      color: "",
    },
    {
      icon: TrendingUp,
      image: "/icons/cc3.PNG",
      title: "Track Results",
      description: "Monitor campaign performance and manage multiple projects easily",
      color: "",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background py-24 md:py-28">
      <div className="absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <SectionParticles
          className="-right-16 top-12 h-[min(32rem,70vh)] w-[min(100%,28rem)] md:right-0"
          opacityClass="opacity-[0.14]"
          quantity={36}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: Features Grid */}
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border border-border/60 bg-card/90 shadow-sm backdrop-blur-sm transition-all hover:border-primary/35 hover:shadow-lg hover:shadow-primary/[0.08]"
                >
                  <CardContent className="p-4">
                    <div className={`mb-3 inline-flex rounded-lg border border-border/40 bg-muted/50 p-3 ${feature.color}`}>
                      <img src={feature.image} alt={feature.title} className="h-16 w-16 object-contain" />
                    </div>
                    <h4 className="mb-1 font-semibold text-foreground">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Content */}
          <div className="order-1 space-y-8 lg:order-2">
            <div className="space-y-4">
              <Badge
                variant="default"
                className="rounded-full border-0 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md shadow-primary/25"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                For Clients & Companies
              </Badge>
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-foreground [font-family:var(--font-heading)] md:text-5xl">
                <span>Post </span>
                <span className="mt-1 inline-block rounded-xl bg-primary px-3 py-1.5 text-primary-foreground shadow-lg shadow-primary/30 md:mt-0 md:px-4 md:py-2">
                  Campaigns
                </span>
                <span> & Find Talents</span>
              </h2>
              <p className="text-xl leading-relaxed text-muted-foreground">
                Need creative talent for your projects? Post campaigns and let top creators apply. Review portfolios,
                select the best matches, and start collaborating.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" variant="marketing" className="gap-2 shadow-lg shadow-primary/25">
                <Link href="/campaigns">
                  <Target className="h-5 w-5" />
                  Browse Campaigns
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
