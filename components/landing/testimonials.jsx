"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "DJ Marcus",
      role: "Electronic Music Producer",
      company: "Los Angeles",
      image: "/dj.jpeg",
      rating: 5,
      text: "PAYOLLAR transformed my career. I've booked more gigs in 6 months than I did in 2 years on my own. The platform is intuitive and the clients are professional.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      name: "Sarah Chen",
      role: "Radio Host & MC",
      company: "New York",
      image: "/host.jpeg",
      rating: 5,
      text: "As an MC, finding quality gigs was always a challenge. PAYOLLAR connected me with amazing radio stations and events. The payment system is seamless too!",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      name: "Alex Rivera",
      role: "Content Director",
      company: "StreamTV Network",
      image: "/producer.jpeg",
      rating: 5,
      text: "We've hired dozens of talents through PAYOLLAR. The quality is consistently high, and the booking process saves us hours of work. Highly recommended!",
      gradient: "from-emerald-500 to-green-500",
    },
    {
      name: "Maya Johnson",
      role: "Singer-Songwriter",
      company: "Nashville",
      image: "/images/ayra.jpg",
      rating: 5,
      text: "The exposure I've gotten through PAYOLLAR is incredible. I've performed on radio shows I never thought I'd reach. It's opened so many doors for my music.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      name: "David Park",
      role: "Program Manager",
      company: "RadioWave FM",
      image: "/voice.jpeg",
      rating: 5,
      text: "PAYOLLAR makes talent booking effortless. We can find exactly what we need, when we need it. The talent pool is diverse and professional.",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      name: "Luna Martinez",
      role: "Social Media Influencer",
      company: "Miami",
      image: "/images/mellisa.jpg",
      rating: 5,
      text: "From podcast appearances to brand collaborations, PAYOLLAR has been my go-to platform. The opportunities are endless and the support team is amazing.",
      gradient: "from-pink-500 to-rose-500",
    },
  ]

  // Update gradients to emerald theme
  const testimonialsWithTheme = testimonials.map((t, idx) => ({
    ...t,
    gradient: [
      "from-emerald-500 to-cyan-500",
      "from-emerald-400 to-teal-500",
      "from-cyan-500 to-emerald-500",
      "from-teal-500 to-emerald-400",
      "from-emerald-500 to-green-500",
      "from-cyan-400 to-emerald-500",
    ][idx % 6],
  }))

  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonialsWithTheme, ...testimonialsWithTheme]

  return (
    <section className="py-16 md:py-20 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 px-4 py-2 bg-emerald-50 border-emerald-200 text-emerald-600">
            💬 Success Stories
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Community
            </span>{" "}
            Says
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join thousands of talents and media companies who have found success through PAYOLLAR
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative overflow-hidden mb-12 py-4">
          {/* Marquee Track 1 */}
          <div className="flex animate-marquee gap-4 md:gap-6 mb-4">
            {duplicatedTestimonials.map((testimonial, index) => (
              <Card
                key={`marquee-1-${index}`}
                className="flex-shrink-0 w-[280px] md:w-[320px] group border-gray-200 bg-white hover:border-emerald-300 transition-all duration-300 relative overflow-hidden"
              >
                {/* Gradient border effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${testimonial.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                ></div>

                <CardContent className="p-4 md:p-5 relative z-10">
                  {/* Quote icon */}
                  <div className="mb-3">
                    <Quote className="w-5 h-5 text-emerald-400/60 group-hover:text-emerald-400 transition-colors duration-300" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Testimonial text */}
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-3 italic line-clamp-3">
                    "{testimonial.text}"
                  </p>

                  {/* Author info */}
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${testimonial.gradient} p-0.5 mr-2`}>
                      <img
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-full h-full rounded-full object-cover bg-gray-100"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-xs">{testimonial.name}</h4>
                      <p className="text-xs text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Marquee Track 2 (Reverse direction for more dynamic effect) */}
          <div className="flex animate-marquee-reverse gap-4 md:gap-6">
            {duplicatedTestimonials.map((testimonial, index) => (
              <Card
                key={`marquee-2-${index}`}
                className="flex-shrink-0 w-[280px] md:w-[320px] group border-gray-200 bg-white hover:border-emerald-300 transition-all duration-300 relative overflow-hidden"
              >
                {/* Gradient border effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${testimonial.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                ></div>

                <CardContent className="p-4 md:p-5 relative z-10">
                  {/* Quote icon */}
                  <div className="mb-3">
                    <Quote className="w-5 h-5 text-emerald-400/60 group-hover:text-emerald-400 transition-colors duration-300" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Testimonial text */}
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-3 italic line-clamp-3">
                    "{testimonial.text}"
                  </p>

                  {/* Author info */}
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${testimonial.gradient} p-0.5 mr-2`}>
                      <img
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-full h-full rounded-full object-cover bg-gray-100"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-xs">{testimonial.name}</h4>
                      <p className="text-xs text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
