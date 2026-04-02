"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Shield,
  Globe,
  Users,
  TrendingUp,
  ShoppingBag,
  Calendar,
  Award,
  Sparkles,
} from "lucide-react";
import { SectionParticles } from "@/components/landing/section-particles";

function FeatureIcon({ feature }) {
  const [imageError, setImageError] = useState(false);

  if (feature.image && !imageError) {
    return (
      <img
        src={feature.image.startsWith("/") ? feature.image : `/${feature.image}`}
        alt={feature.title}
        className="h-14 w-14 object-contain"
        style={{ display: "block" }}
        onError={(e) => {
          setImageError(true);
          e.target.style.display = "none";
        }}
      />
    );
  }

  return <feature.icon className="h-14 w-14 text-primary" />;
}

export function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      image: "/icons/bolt.PNG",
      title: "Lightning Fast Booking",
      description: "Book top talents in minutes with our streamlined booking system",
      color: "",
    },
    {
      icon: Shield,
      image: "/icons/secure.PNG",
      title: "Verified Professionals",
      description: "All talents are vetted and verified for quality and professionalism",
      color: "",
    },
    {
      icon: Globe,
      image: "/icons/global.PNG",
      title: "Global Reach",
      description: "Connect with talents from around the world, available remotely",
      color: "",
    },
    {
      icon: Users,
      image: "/icons/support.PNG",
      title: "Dedicated Support",
      description: "Get personal project management and 24/7 customer support",
      color: "",
    },
    {
      icon: ShoppingBag,
      image: "/icons/product.PNG",
      title: "Digital Products",
      description: "Browse and purchase digital products directly from creators",
      color: "",
    },
    {
      icon: Calendar,
      image: "/icons/calendar.PNG",
      title: "Flexible Scheduling",
      description: "Choose time slots that work for both you and your talent",
      color: "",
    },
    {
      icon: TrendingUp,
      image: "/icons/growth.PNG",
      title: "Growth Analytics",
      description: "Track your campaign performance and talent engagement metrics",
      color: "",
    },
    {
      icon: Award,
      image: "/icons/trust.PNG",
      title: "Quality Guarantee",
      description: "100% satisfaction guaranteed",
      color: "",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background py-24 md:py-28">
      <div className="absolute inset-0">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <SectionParticles className="inset-0" opacityClass="opacity-[0.16]" quantity={48} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center md:mb-20">
          <Badge
            variant="default"
            className="mb-4 rounded-full border-0 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md shadow-primary/25"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Powerful Features
          </Badge>
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl [font-family:var(--font-heading)]">
            Everything you need to{" "}
            <span className="mt-1 inline-block rounded-xl bg-primary px-3 py-1.5 text-primary-foreground shadow-lg shadow-primary/30 md:mt-0 md:px-4 md:py-2">
              succeed
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground md:text-xl">
            A complete platform designed for creators, clients, and media professionals
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group border border-border/60 bg-card/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-lg hover:shadow-primary/[0.08]"
            >
              <CardContent className="p-6">
                <div className="mb-3 inline-flex items-center justify-center overflow-hidden rounded-xl border border-border/40 bg-muted/40 p-3 transition-transform duration-300 group-hover:scale-[1.02]">
                  <FeatureIcon feature={feature} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
