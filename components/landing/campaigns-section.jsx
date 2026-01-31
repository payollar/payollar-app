"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Target,
  Users,
  TrendingUp,
  Plus,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"

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
  ]

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Features Grid */}
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border-gray-200 bg-white hover:border-emerald-300 transition-all"
                >
                  <CardContent className="p-4">
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} mb-3`}>
                      <img 
                        src={feature.image} 
                        alt={feature.title}
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-8 order-1 lg:order-2">
            <div className="space-y-4">
              <Badge className="px-4 py-2 bg-cyan-50 border-cyan-200 text-cyan-600">
                <Sparkles className="w-4 h-4 mr-2" />
                For Clients & Companies
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Post{" "}
                <span className="bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                  Campaigns
                </span>{" "}
                & Find Talents
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Need creative talent for your projects? Post campaigns and let top creators apply. 
                Review portfolios, select the best matches, and start collaborating.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-black text-white "
              >
                <Link href="/campaigns">
                  <Target className="mr-2 h-5 w-5" />
                  Browse Campaigns
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-cyan-300 text-gray-700 hover:bg-cyan-50"
              >
                <Link href="/client">
                  <Plus className="mr-2 h-5 w-5" />
                  Post Campaign
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

