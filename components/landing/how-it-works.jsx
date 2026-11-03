"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, UserPlus, Search, Calendar, CheckCircle, Sparkles } from "lucide-react";
import { SectionParticles } from "@/components/landing/section-particles";
import { useLandingTheme } from "@/components/landing/landing-theme";
import { cn } from "@/lib/utils";

export function HowItWorksSection() {
  const { theme } = useLandingTheme();
  const isLight = theme === "light";

  const steps = [
    {
      icon: UserPlus,
      video: "/icons/profile2.MP4",
      title: "Create Profile",
      description:
        "Sign up and build your professional profile with portfolio, rates, and availability",
      color: "bg-white",
    },
    {
      icon: Search,
      video: "/icons/search.MP4",
      title: "Discover Opportunities",
      description:
        "Browse or get matched with relevant gigs from TV, radio, & digital media companies",
      color: "bg-white",
    },
    {
      icon: Calendar,
      video: "/icons/book.MP4",
      title: "Book & Negotiate",
      description:
        "Apply for gigs, negotiate terms, and confirm bookings with secure contracts",
      color: "bg-white",
    },
    {
      icon: CheckCircle,
      video: "/icons/verified.MP4",
      title: "Deliver & Get Paid",
      description:
        "Complete your performance, get reviewed, and receive secure payment",
      color: "bg-white",
    },
  ];

  return (
    <section
      className={cn(
        "relative mx-4 overflow-hidden rounded-3xl sm:mx-6 lg:mx-8 xl:mx-12",
        isLight
          ? "border border-slate-200/90 bg-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)]"
          : "bg-black"
      )}
    >
      <div className="absolute inset-0">
        <div
          className={cn(
            "absolute right-1/4 top-0 h-96 w-96 rounded-full blur-3xl",
            isLight ? "bg-primary/10" : "bg-primary/15"
          )}
        />
        <div
          className={cn(
            "absolute bottom-0 left-1/4 h-96 w-96 rounded-full blur-3xl",
            isLight ? "bg-sky-200/40" : "bg-primary/10"
          )}
        />
        <SectionParticles
          className="inset-0"
          opacityClass={isLight ? "opacity-[0.08]" : "opacity-[0.14]"}
          quantity={44}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mb-20 text-center">
          <Badge
            variant="default"
            className="mb-4 rounded-full border-0 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md shadow-primary/30"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Simple Process
          </Badge>
          <h2
            className={cn(
              "mb-6 text-4xl font-bold md:text-5xl",
              isLight ? "text-slate-900" : "text-white"
            )}
          >
            How{" "}
            <span className="mt-1 inline-block rounded-xl bg-primary px-3 py-1.5 text-white shadow-lg shadow-primary/35 md:mt-0 md:px-4 md:py-2">
              Payollar
            </span>{" "}
            Works
          </h2>
          <p
            className={cn(
              "mx-auto max-w-3xl text-xl",
              isLight ? "text-slate-600" : "text-white/80"
            )}
          >
            Get started in minutes and begin connecting with opportunities that
            match your talent
          </p>
        </div>

        <div className="relative">
          <div
            className={cn(
              "absolute left-0 right-0 top-1/2 hidden h-0.5 -translate-y-1/2 lg:block",
              isLight
                ? "bg-gradient-to-r from-primary/10 via-primary/35 to-primary/10"
                : "bg-gradient-to-r from-primary/20 via-primary/45 to-primary/20"
            )}
          />

          <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card
                  className={cn(
                    "group backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/45 hover:shadow-2xl hover:shadow-primary/15",
                    isLight
                      ? "border border-slate-200/90 bg-slate-50/80 shadow-[0_12px_32px_-20px_rgba(15,23,42,0.25)]"
                      : "border border-white/10 bg-white/[0.04] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
                  )}
                >
                  <CardContent className="p-8 text-center">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border-4 bg-primary text-sm font-bold text-primary-foreground shadow-md shadow-primary/40",
                          isLight ? "border-white" : "border-black"
                        )}
                      >
                        {index + 1}
                      </div>
                    </div>

                    <div
                      className={cn(
                        "mb-6 inline-flex overflow-hidden rounded-full p-6 shadow-lg transition-transform duration-300 group-hover:scale-105",
                        isLight
                          ? "border border-slate-200 bg-white"
                          : step.color
                      )}
                    >
                      {step.video ? (
                        <video
                          src={step.video}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="h-16 w-16 object-contain"
                        />
                      ) : (
                        <step.icon
                          className={cn(
                            "h-16 w-16",
                            step.color === "bg-white"
                              ? "text-gray-900"
                              : "text-white"
                          )}
                        />
                      )}
                    </div>

                    <h3
                      className={cn(
                        "mb-4 text-xl font-bold",
                        isLight ? "text-slate-900" : "text-white"
                      )}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={cn(
                        "mb-6 leading-relaxed",
                        isLight ? "text-slate-600" : "text-gray-300"
                      )}
                    >
                      {step.description}
                    </p>

                    {index < steps.length - 1 && (
                      <div className="absolute top-1/2 -right-4 hidden -translate-y-1/2 transform lg:block">
                        <ArrowRight className="h-6 w-6 text-primary/55" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
