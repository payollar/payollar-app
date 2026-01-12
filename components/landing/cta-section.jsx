"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, ShoppingBag } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="space-y-8">
          {/* Badge */}
          <div className="flex justify-center">
            <Badge className="bg-emerald-500/20 border-emerald-500/30 text-emerald-400 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Join the Revolution
            </Badge>
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Ready to Transform Your{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Career?
            </span>
          </h2>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Join thousands of talents and media companies already using Payollar to create amazing content together.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">1K+</div>
              <div className="text-gray-400 text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">100+</div>
              <div className="text-gray-400 text-sm">Successful Bookings</div>
            </div>
            {/* <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">$2M+</div>
              <div className="text-gray-400 text-sm">Paid to Talents</div>
            </div> */}
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">98%</div>
              <div className="text-gray-400 text-sm">Satisfaction Rate</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 transform hover:scale-105"
            >
              <Link href="/onboarding">
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-emerald-500/30 text-white hover:bg-emerald-500/10 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm transition-all duration-300 bg-transparent"
            >
              <Link href="/store">
                <ShoppingBag className="mr-2 w-5 h-5" />
                Shop Products
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="pt-8 border-t border-emerald-900/30">
            <p className="text-gray-400 mb-4">Trusted by industry leaders</p>
            <div className="flex justify-center items-center space-x-8 opacity-60 flex-wrap gap-4">
              <div className="text-emerald-400 font-semibold">RadioWave FM</div>
              <div className="text-emerald-400 font-semibold">StreamTV</div>
              <div className="text-emerald-400 font-semibold">Digital Media Co</div>
              <div className="text-emerald-400 font-semibold">SoundStage</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
