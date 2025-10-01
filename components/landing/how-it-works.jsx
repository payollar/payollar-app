"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, UserPlus, Search, Calendar, CheckCircle } from "lucide-react"

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
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: CheckCircle,
      title: "Deliver & Get Paid",
      description: "Complete your performance, get reviewed, and receive secure payment",
      color: "from-orange-500 to-red-500",
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            🚀 Simple Process
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              PAYOLA
            </span>{" "}
            Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started in minutes and begin connecting with opportunities that match your talent
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-200 via-blue-200 via-green-200 to-orange-200 transform -translate-y-1/2"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    {/* Step number */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-8 h-8 bg-white rounded-full border-4 border-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                        {index + 1}
                      </div>
                    </div>

                    {/* Icon */}
                    <div
                      className={`inline-flex p-6 rounded-full bg-gradient-to-r ${step.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">{step.description}</p>

                    {/* Arrow for desktop */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                        <ArrowRight className="w-6 h-6 text-gray-300" />
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
          <div className="inline-flex items-center space-x-4 bg-white rounded-full px-8 py-4 shadow-lg">
            <span className="text-gray-600">Ready to get started?</span>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              Join Now
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
