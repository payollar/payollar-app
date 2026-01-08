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
      title: "Get Booked",
      description: "Clients book appointments directly through your profile - set your own availability and rates",
      color: "from-emerald-500 to-green-500",
    },
    {
      icon: ShoppingBag,
      title: "Sell Digital Products",
      description: "Sell music, videos, courses, templates. Keep 99% of every sale - only 1% platform fee",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Target,
      title: "Apply to Campaigns",
      description: "Browse and apply to campaigns from top brands and companies looking for your talent",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: DollarSign,
      title: "Track Earnings",
      description: "Monitor all your income streams - bookings, product sales, and campaign payments",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: User,
      title: "Build Your Profile",
      description: "Showcase your skills, portfolio, and experience. Get verified and stand out to clients",
      color: "from-yellow-500 to-amber-500",
    },
    {
      icon: Shield,
      title: "Secure Payouts",
      description: "Direct bank transfers for all your earnings - fast, secure, and transparent",
      color: "from-indigo-500 to-purple-500",
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 relative overflow-hidden">
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
              <Badge className="px-4 py-2 bg-emerald-500/20 border-emerald-500/30 text-emerald-400">
                <Sparkles className="w-4 h-4 mr-2" />
                For Creators
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Join as a{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Payollar Creator
                </span>
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed">
                Unlock multiple income streams on one platform. Get booked by clients, sell digital products, 
                apply to campaigns, and grow your creative career - all while keeping more of what you earn.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  className="border-emerald-900/20 bg-slate-800/50 backdrop-blur-sm hover:border-emerald-700/40 transition-all"
                >
                  <CardContent className="p-4">
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${benefit.color} mb-3`}>
                      <benefit.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-white mb-1">{benefit.title}</h4>
                    <p className="text-sm text-gray-400">{benefit.description}</p>
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
                className="border-emerald-700/30 text-white hover:bg-emerald-900/30"
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
              <Card className="border-emerald-900/20 bg-slate-800/50 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-white">Creator Dashboard</h4>
                    <Badge className="bg-emerald-500/20 text-emerald-400">Live</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
                      <DollarSign className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-400">Earnings</p>
                      <p className="text-sm font-bold text-white">₵5,240</p>
                    </div>
                    <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                      <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-400">Bookings</p>
                      <p className="text-sm font-bold text-white">12</p>
                    </div>
                    <div className="bg-purple-500/10 rounded-lg p-3 text-center">
                      <ShoppingBag className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-400">Products</p>
                      <p className="text-sm font-bold text-white">8</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">This Month</span>
                    <span className="text-emerald-400 font-semibold">+42% Growth</span>
                  </div>
                </CardContent>
              </Card>

              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-emerald-900/20 bg-slate-800/50 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-4">
                    <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-lg p-3 mb-3">
                      <Video className="w-8 h-8 text-emerald-400 mx-auto" />
                    </div>
                    <h4 className="font-semibold text-white text-sm mb-1">Video Sessions</h4>
                    <p className="text-xs text-gray-400">Connect with clients</p>
                  </CardContent>
                </Card>

                <Card className="border-emerald-900/20 bg-slate-800/50 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-4">
                    <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-3 mb-3">
                      <FileText className="w-8 h-8 text-blue-400 mx-auto" />
                    </div>
                    <h4 className="font-semibold text-white text-sm mb-1">Portfolio</h4>
                    <p className="text-xs text-gray-400">Showcase your work</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full px-6 py-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-semibold">Multiple Income Streams</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

