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
      title: "Create Profile",
      description: "Sign up and build your professional profile with portfolio, rates, and availability",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Search,
      title: "Discover Opportunities",
      description: "Browse or get matched with relevant gigs from TV, radio, and digital media companies",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Calendar,
      title: "Book & Negotiate",
      description: "Apply for gigs, negotiate terms, and confirm bookings with secure contracts",
      color: "from-emerald-500 to-green-500",
    },
    {
      icon: CheckCircle,
      title: "Deliver & Get Paid",
      description: "Complete your performance, get reviewed, and receive secure payment",
      color: "from-orange-500 to-red-500",
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <Badge className="mb-4 px-4 py-2 bg-emerald-500/20 border-emerald-500/30 text-emerald-400">
            🚀 Simple Process
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              PAYOLA
            </span>{" "}
            Works
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
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
                <Card className="group hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 transform hover:-translate-y-4 border-emerald-900/20 bg-slate-800/50 backdrop-blur-sm hover:border-emerald-700/40">
                  <CardContent className="p-8 text-center">
                    {/* Step number */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-8 h-8 bg-emerald-600 rounded-full border-4 border-slate-900 flex items-center justify-center text-sm font-bold text-white">
                        {index + 1}
                      </div>
                    </div>

                    {/* Icon */}
                    <div
                      className={`inline-flex p-6 rounded-full bg-gradient-to-r ${step.color} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed mb-6">{step.description}</p>

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
              className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-6 py-2 rounded-full font-semibold shadow-lg shadow-emerald-500/50"
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
