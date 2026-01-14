"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  FileText,
} from "lucide-react"
import Link from "next/link"

export function CreatorsSection() {
  const benefits = [
    {
      icon: Calendar,
      image: "/icons/c6.PNG",
      title: "Get Booked",
      description: "Clients book appointments directly through your profile - set your own availability and rates",
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
  ]

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="px-4 py-2 bg-emerald-50 border-emerald-200 text-emerald-600">
                <Sparkles className="w-4 h-4 mr-2" />
                For Creators
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Join as a{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  Payollar Creator
                </span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Unlock multiple income streams on one platform. Get booked by clients, sell digital products, 
                apply to campaigns, and grow your creative career - all while keeping more of what you earn.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  className="border-white/40 bg-gradient-to-br from-emerald-50/40 via-white/30 to-emerald-50/40 backdrop-blur-lg hover:border-emerald-200/60 hover:shadow-xl transition-all shadow-lg shadow-emerald-500/5"
                >
                  <CardContent className="p-4">
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${benefit.color} mb-3`}>
                      <img 
                        src={benefit.image} 
                        alt={benefit.title}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-lg shadow-emerald-500/50"
              >
                <Link href="/onboarding">
                  <User className="mr-2 h-5 w-5" />
                  Become a Creator
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-emerald-300 text-gray-700 hover:bg-emerald-50"
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
              <Card className="border border-gray-200/50 bg-gradient-to-br from-emerald-50/40 via-white/30 to-emerald-50/40 backdrop-blur-lg overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.15),0_0_0_1px_rgba(16,185,129,0.1)] transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-900">Creator Dashboard</h4>
                    <Badge className="bg-emerald-500/30 backdrop-blur-sm border border-emerald-500/40 text-emerald-700">Live</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-emerald-100/50 backdrop-blur-sm rounded-lg p-3 text-center border border-emerald-200/50 shadow-sm">
                      <DollarSign className="w-6 h-6 text-emerald-700 mx-auto mb-1" />
                      <p className="text-xs text-gray-700">Earnings</p>
                      <p className="text-sm font-bold text-gray-900">₵5,240</p>
                    </div>
                    <div className="bg-emerald-100/50 backdrop-blur-sm rounded-lg p-3 text-center border border-emerald-200/50 shadow-sm">
                      <Calendar className="w-6 h-6 text-emerald-700 mx-auto mb-1" />
                      <p className="text-xs text-gray-700">Bookings</p>
                      <p className="text-sm font-bold text-gray-900">12</p>
                    </div>
                    <div className="bg-emerald-100/50 backdrop-blur-sm rounded-lg p-3 text-center border border-emerald-200/50 shadow-sm">
                      <ShoppingBag className="w-6 h-6 text-emerald-700 mx-auto mb-1" />
                      <p className="text-xs text-gray-700">Products</p>
                      <p className="text-sm font-bold text-gray-900">8</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">This Month</span>
                    <span className="text-emerald-600 font-semibold">+42% Growth</span>
                  </div>
                </CardContent>
              </Card>

              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border border-gray-200/50 bg-gradient-to-br from-emerald-50/40 via-white/30 to-emerald-50/40 backdrop-blur-lg overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.15),0_0_0_1px_rgba(16,185,129,0.1)] transition-all duration-300 transform hover:-translate-y-2">
                  <CardContent className="p-4">
                    <div className="bg-rounded-lg p-3 mb-3">
                      <img 
                        src="/icons/video.PNG" 
                        alt="Video Sessions"
                        className="w-12 h-12 object-contain mx-auto"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">Video Sessions</h4>
                    <p className="text-xs text-gray-600">Connect with clients</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200/50 bg-gradient-to-br from-emerald-50/40 via-white/30 to-emerald-50/40 backdrop-blur-lg overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.15),0_0_0_1px_rgba(16,185,129,0.1)] transition-all duration-300 transform hover:-translate-y-2">
                  <CardContent className="p-4">
                    <div className=" rounded-lg p-3 mb-3">
                      <img 
                        src="/icons/c7.PNG" 
                        alt="Portfolio"
                        className="w-12 h-12 object-contain mx-auto"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">Portfolio</h4>
                    <p className="text-xs text-gray-600">Showcase your work</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 bg-emerald-50 backdrop-blur-sm border border-emerald-200 rounded-full px-6 py-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span className="text-gray-900 font-semibold">Multiple Income Streams</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

