"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  Shield, 
  Globe, 
  Users, 
  TrendingUp, 
  DollarSign,
  ShoppingBag,
  Calendar,
  Award
} from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast Booking",
      description: "Book top talents in minutes with our streamlined booking system",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Shield,
      title: "Verified Professionals",
      description: "All talents are vetted and verified for quality and professionalism",
      color: "from-emerald-500 to-green-500",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with talents from around the world, available remotely",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "Dedicated Support",
      description: "Get personal project management and 24/7 customer support",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: ShoppingBag,
      title: "Digital Products",
      description: "Browse and purchase digital products directly from creators",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Choose time slots that work for both you and your talent",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: TrendingUp,
      title: "Growth Analytics",
      description: "Track your campaign performance and talent engagement metrics",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Award,
      title: "Quality Guarantee",
      description: "100% satisfaction guaranteed or your money back",
      color: "from-amber-500 to-yellow-500",
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 px-4 py-2 bg-emerald-500/20 border-emerald-500/30 text-emerald-400">
            ✨ Powerful Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              succeed
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            A complete platform designed for creators, clients, and media professionals
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group border-emerald-900/20 bg-slate-800/50 backdrop-blur-sm hover:border-emerald-700/40 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-2"
            >
              <CardContent className="p-6">
                <div
                  className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

