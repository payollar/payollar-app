"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Quote, ArrowRight } from "lucide-react"
import Link from "next/link"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "DJ Marcus",
      role: "Electronic Music Producer",
      company: "Los Angeles",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: "PAYOLA transformed my career. I've booked more gigs in 6 months than I did in 2 years on my own. The platform is intuitive and the clients are professional.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      name: "Sarah Chen",
      role: "Radio Host & MC",
      company: "New York",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: "As an MC, finding quality gigs was always a challenge. PAYOLA connected me with amazing radio stations and events. The payment system is seamless too!",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      name: "Alex Rivera",
      role: "Content Director",
      company: "StreamTV Network",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: "We've hired dozens of talents through PAYOLA. The quality is consistently high, and the booking process saves us hours of work. Highly recommended!",
      gradient: "from-emerald-500 to-green-500",
    },
    {
      name: "Maya Johnson",
      role: "Singer-Songwriter",
      company: "Nashville",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: "The exposure I've gotten through PAYOLA is incredible. I've performed on radio shows I never thought I'd reach. It's opened so many doors for my music.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      name: "David Park",
      role: "Program Manager",
      company: "RadioWave FM",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: "PAYOLA makes talent booking effortless. We can find exactly what we need, when we need it. The talent pool is diverse and professional.",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      name: "Luna Martinez",
      role: "Social Media Influencer",
      company: "Miami",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: "From podcast appearances to brand collaborations, PAYOLA has been my go-to platform. The opportunities are endless and the support team is amazing.",
      gradient: "from-pink-500 to-rose-500",
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <Badge className="mb-4 px-4 py-2 bg-emerald-500/20 border-emerald-500/30 text-emerald-400">
            💬 Success Stories
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            What Our{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Community
            </span>{" "}
            Says
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join thousands of talents and media companies who have found success through PAYOLA
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 transform hover:-translate-y-2 border-emerald-900/20 bg-slate-800/50 backdrop-blur-sm hover:border-emerald-700/40 relative overflow-hidden"
            >
              {/* Gradient border effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${testimonial.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
              ></div>

              <CardContent className="p-8 relative z-10">
                {/* Quote icon */}
                <div className="mb-6">
                  <Quote className="w-8 h-8 text-emerald-500/50 group-hover:text-emerald-400 transition-colors duration-300" />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Testimonial text */}
                <p className="text-gray-300 leading-relaxed mb-6 italic">"{testimonial.text}"</p>

                {/* Author info */}
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${testimonial.gradient} p-0.5 mr-4`}>
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-full h-full rounded-full object-cover bg-slate-800"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                    <p className="text-xs text-gray-500">{testimonial.company}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex flex-col items-center space-y-4 bg-slate-800/50 backdrop-blur-sm border border-emerald-900/30 rounded-2xl px-12 py-8">
            <h3 className="text-2xl font-bold text-white">Ready to join them?</h3>
            <p className="text-gray-400">Start your success story today</p>
            <Button
              asChild
              className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all duration-300 transform hover:scale-105"
            >
              <Link href="/onboarding">
                Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
