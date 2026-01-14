"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, ShoppingBag } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Blurred background image */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/about-hero.jpg')",
            filter: "blur(40px)",
            transform: "scale(1.1)"
          }}
        ></div>
        <div className="absolute inset-0 bg-white/70"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="space-y-8">
          {/* Badge */}
          <div className="flex justify-center">
            <Badge className="bg-gray-100 border-gray-200 text-gray-700 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Join the Revolution
            </Badge>
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
            Ready to Transform Your{" "}
            <span className="text-gray-700">
              Career?
            </span>
          </h2>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Join thousands of talents and media companies already using Payollar to create amazing content together.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">1K+</div>
              <div className="text-gray-600 text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">100+</div>
              <div className="text-gray-600 text-sm">Successful Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">98%</div>
              <div className="text-gray-600 text-sm">Satisfaction Rate</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg shadow-gray-900/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 bg-white"
            >
              <Link href="/store">
                <ShoppingBag className="mr-2 w-5 h-5" />
                Shop Products
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-gray-500 mb-4">Trusted by industry leaders</p>
            <div className="flex justify-center items-center space-x-8 opacity-70 flex-wrap gap-4">
              <div className="text-gray-600 font-semibold">RadioWave FM</div>
              <div className="text-gray-600 font-semibold">StreamTV</div>
              <div className="text-gray-600 font-semibold">Digital Media Co</div>
              <div className="text-gray-600 font-semibold">SoundStage</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
