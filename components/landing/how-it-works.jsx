"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, UserPlus, Search, Calendar, CheckCircle } from "lucide-react"
import Link from "next/link"

export function HowItWorksSection() {
  const steps = [
    {
      icon: UserPlus,
      video: "/icons/profile2.MP4",
      title: "Create Profile",
      description: "Sign up and build your professional profile with portfolio, rates, and availability",
      color: "bg-white",
    },
    {
      icon: Search,
      video: "/icons/search.MP4",
      title: "Discover Opportunities",
      description: "Browse or get matched with relevant gigs from TV, radio, & digital media companies",
      color: "bg-white",
    },
    {
      icon: Calendar,
      video: "/icons/book.MP4",
      title: "Book & Negotiate",
      description: "Apply for gigs, negotiate terms, and confirm bookings with secure contracts",
      color: "bg-white",
    },
    {
      icon: CheckCircle,
      video: "/icons/verified.MP4",
      title: "Deliver & Get Paid",
      description: "Complete your performance, get reviewed, and receive secure payment",
      color: "bg-white",
    },
  ]

  return (
    <section className="py-24 bg-black relative overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 xl:mx-12">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <Badge className="mb-4 px-4 py-2 bg-emerald-500/20 border-emerald-500/30 text-emerald-400">
            🚀 Simple Process
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How{" "}
            <span className="bg-white bg-clip-text text-transparent ">
              Payollar
            </span>{" "}
            Works
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get started in minutes and begin connecting with opportunities that match your talent
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500/30 via-blue-500/30 via-emerald-500/30 to-orange-500/30 transform -translate-y-1/2"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="group hover:shadow-2xl hover:shadow-white/10 transition-all duration-500 transform hover:-translate-y-4 border-white/10 bg-white/[0.03] backdrop-blur-2xl hover:border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                  <CardContent className="p-8 text-center">
                    {/* Step number */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-8 h-8 bg-white rounded-full border-4 border-black flex items-center justify-center text-sm font-bold text-black">
                        {index + 1}
                      </div>
                    </div>

                    {/* Icon or Video */}
                    <div
                      className={`inline-flex p-6 rounded-full ${step.color.includes('bg-') ? step.color : `bg-gradient-to-r ${step.color}`} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg overflow-hidden`}
                    >
                      {step.video ? (
                        <video
                          src={step.video}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-16 h-16 object-contain"
                        />
                      ) : (
                        <step.icon className={`w-16 h-16 ${step.color === 'bg-white' ? 'text-black' : 'text-white'}`} />
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-gray-300 leading-relaxed mb-6">{step.description}</p>

                    {/* Arrow for desktop */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                        <ArrowRight className="w-6 h-6 text-emerald-500/50" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-4 bg-slate-800/50 backdrop-blur-sm border border-emerald-900/30 rounded-full px-8 py-4 shadow-lg">
            <span className="text-gray-300">Ready to get started?</span>
            <Button
              asChild
              className="bg-white hover:from-emerald-700 hover:to-cyan-700 text-black px-6 py-2 rounded-full font-semibold "
            >
              <Link href="/onboarding">
                Join Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
