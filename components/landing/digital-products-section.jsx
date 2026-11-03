"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Calendar,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Shield,
  Sparkles,
  ArrowRight,
  Target,
  Video,
} from "lucide-react";
import Link from "next/link";
import { SectionParticles } from "@/components/landing/section-particles";
import { useLandingTheme } from "@/components/landing/landing-theme";
import { cn } from "@/lib/utils";

export function CreatorsSection() {
  const { theme } = useLandingTheme();
  const isLight = theme === "light";

  const benefits = [
    {
      icon: Calendar,
      image: "/icons/c6.PNG",
      title: "Get Booked",
      description:
        "Clients book appointments directly through your profile - set your own availability and rates",
      color: "",
    },
    {
      icon: ShoppingBag,
      image: "/icons/product.PNG",
      title: "Sell Digital Products",
      description: "Sell music, videos, courses, templates. Keep 99% of every sale - only 1% platform fee",
      color: "",
    },
    {
      icon: Target,
      image: "/icons/c1.PNG",
      title: "Apply to Campaigns",
      description: "Browse and apply to campaigns from top brands and companies looking for your talent",
      color: "",
    },
    {
      icon: DollarSign,
      image: "/icons/c3.PNG",
      title: "Track Earnings",
      description: "Monitor all your income streams - bookings, product sales, and campaign payments",
      color: "",
    },
    {
      icon: User,
      image: "/icons/c4.PNG",
      title: "Build Your Profile",
      description: "Showcase your skills, portfolio, and experience. Get verified and stand out to clients",
      color: "",
    },
    {
      icon: Shield,
      image: "/icons/c2.PNG",
      title: "Secure Payouts",
      description: "Direct bank transfers for all your earnings - fast, secure, and transparent",
      color: "",
    },
  ];

  return (
    <section
      className={cn(
        "relative overflow-hidden py-24 md:py-28",
        isLight ? "bg-transparent" : "bg-background"
      )}
    >
      <div className="absolute inset-0">
        <div
          className={cn(
            "absolute right-1/4 top-1/4 h-96 w-96 rounded-full blur-3xl",
            isLight ? "bg-primary/[0.06]" : "bg-primary/10"
          )}
        />
        <div
          className={cn(
            "absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full blur-3xl",
            isLight ? "bg-sky-200/25" : "bg-primary/5"
          )}
        />
        <SectionParticles
          className="bottom-0 right-0 h-[min(28rem,65vh)] w-[min(100%,26rem)]"
          opacityClass={isLight ? "opacity-[0.07]" : "opacity-[0.13]"}
          quantity={32}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge
                variant="default"
                className="rounded-full border-0 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md shadow-primary/25"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                For Creators
              </Badge>
              <h2 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
                <span>Join as a </span>
                <span className="mt-1 inline-block rounded-xl bg-primary px-3 py-1.5 text-primary-foreground shadow-lg shadow-primary/30 md:mt-0 md:px-4 md:py-2">
                  Payollar Creator
                </span>
              </h2>
              <p className="text-xl leading-relaxed text-muted-foreground">
                Unlock multiple income streams on one platform. Get booked by clients, sell digital products, apply to
                campaigns, and grow your creative career - all while keeping more of what you earn.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  className={cn(
                    "border shadow-sm transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10",
                    isLight
                      ? "border-slate-200/90 bg-white"
                      : "border-border/70 bg-card"
                  )}
                >
                  <CardContent className="p-4">
                    <div
                      className={cn(
                        "mb-3 inline-flex rounded-lg border p-3",
                        benefit.color,
                        isLight
                          ? "border-slate-200 bg-slate-50"
                          : "border-border/50 bg-muted/60"
                      )}
                    >
                      <img src={benefit.image} alt={benefit.title} className="h-12 w-12 object-contain" />
                    </div>
                    <h4 className="mb-1 font-semibold text-foreground">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary/40 bg-transparent text-foreground hover:border-primary hover:bg-primary/10"
              >
                <Link href="/talents">
                  View Creator Profiles
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="space-y-6">
              {/* Dashboard Preview */}
              <Card
                className={cn(
                  "overflow-hidden rounded-xl border shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10",
                  isLight ? "border-slate-200/90 bg-white" : "border-border/70 bg-card"
                )}
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-lg font-bold text-foreground">Creator Dashboard</h4>
                    <Badge className="border-0 bg-primary/15 text-primary">Live</Badge>
                  </div>
                  <div className="mb-4 grid grid-cols-3 gap-4">
                    <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-center shadow-sm">
                      <DollarSign className="mx-auto mb-1 h-6 w-6 text-primary" />
                      <p className="text-xs text-muted-foreground">Earnings</p>
                      <p className="text-sm font-bold text-foreground">₵5,240</p>
                    </div>
                    <div className="rounded-lg border border-primary/15 bg-primary/5 p-3 text-center shadow-sm">
                      <Calendar className="mx-auto mb-1 h-6 w-6 text-primary" />
                      <p className="text-xs text-muted-foreground">Bookings</p>
                      <p className="text-sm font-bold text-foreground">12</p>
                    </div>
                    <div className="rounded-lg border border-primary/15 bg-primary/5 p-3 text-center shadow-sm">
                      <ShoppingBag className="mx-auto mb-1 h-6 w-6 text-primary" />
                      <p className="text-xs text-muted-foreground">Products</p>
                      <p className="text-sm font-bold text-foreground">8</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">This Month</span>
                    <span className="font-semibold text-primary">+42% Growth</span>
                  </div>
                </CardContent>
              </Card>

              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={cn(
                    "overflow-hidden rounded-xl border shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10",
                    isLight ? "border-slate-200/90 bg-white" : "border-border/70 bg-card"
                  )}
                >
                  <CardContent className="p-4">
                    <div
                      className={cn(
                        "mb-3 rounded-lg border p-3",
                        isLight
                          ? "border-slate-200 bg-slate-50"
                          : "border-border/40 bg-muted/50"
                      )}
                    >
                      <img
                        src="/icons/video.PNG"
                        alt="Video Sessions"
                        className="mx-auto h-12 w-12 object-contain"
                      />
                    </div>
                    <h4 className="mb-1 text-sm font-semibold text-foreground">Video Sessions</h4>
                    <p className="text-xs text-muted-foreground">Connect with clients</p>
                  </CardContent>
                </Card>

                <Card
                  className={cn(
                    "overflow-hidden rounded-xl border shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10",
                    isLight ? "border-slate-200/90 bg-white" : "border-border/70 bg-card"
                  )}
                >
                  <CardContent className="p-4">
                    <div
                      className={cn(
                        "mb-3 rounded-lg border p-3",
                        isLight
                          ? "border-slate-200 bg-slate-50"
                          : "border-border/40 bg-muted/50"
                      )}
                    >
                      <img src="/icons/c7.PNG" alt="Portfolio" className="mx-auto h-12 w-12 object-contain" />
                    </div>
                    <h4 className="mb-1 text-sm font-semibold text-foreground">Portfolio</h4>
                    <p className="text-xs text-muted-foreground">Showcase your work</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Floating badge */}
            <div
              className={cn(
                "absolute -bottom-4 -right-4 rounded-full border px-6 py-3 shadow-lg",
                isLight
                  ? "border-slate-200 bg-white shadow-[0_12px_30px_-16px_rgba(15,23,42,0.35)]"
                  : "border-border/80 bg-card"
              )}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Multiple Income Streams</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
