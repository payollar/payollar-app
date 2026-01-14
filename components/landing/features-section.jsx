"use client"

import { useState } from "react"
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

function FeatureIcon({ feature }) {
  const [imageError, setImageError] = useState(false);

  if (feature.image && !imageError) {
    return (
      <img
        src={feature.image}
        alt={feature.title}
        className="w-24 h-24 object-contain"
        style={{ display: 'block' }}
        onError={(e) => {
          setImageError(true);
          e.target.style.display = 'none';
        }}
      />
    );
  }

  return <feature.icon className="w-24 h-24 text-white" />;
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
      image: "icons/calendar.PNG",
      title: "Flexible Scheduling",
      description: "Choose time slots that work for both you and your talent",
      color: "",
    },
    {
      icon: TrendingUp,
      image: "icons/growth.PNG",
      title: "Growth Analytics",
      description: "Track your campaign performance and talent engagement metrics",
      color: "",
    },
    {
      icon: Award,
      image: "icons/trust.PNG",
      title: "Quality Guarantee",
      description: "100% satisfaction guaranteed",
      color: "",
    },
  ]

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 px-4 py-2 bg-emerald-50 border-emerald-200 text-emerald-600">
            ✨ Powerful Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              succeed
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A complete platform designed for creators, clients, and media professionals
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group border-gray-200 bg-white hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-2"
            >
              <CardContent className="p-6">
                <div
                  className={`inline-flex items-center justify-center p-4 rounded-xl ${feature.color.includes('bg-') ? feature.color : `bg-gradient-to-r ${feature.color}`} mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden`}
                >
                  <FeatureIcon feature={feature} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

