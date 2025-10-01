"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Shield, Star, Music, Mic, Camera, Headphones, ArrowRight } from "lucide-react"
import Link from "next/link"


export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const creativeImages = [
    { src: "/images/about-hero.jpg", alt: "DJ performing", type: "artist" },
    { src: "/images/russ.jpg", alt: "D on stage", type: "producer" },
    { src: "/images/ayra.jpg", alt: "Artist recording", type: "artist" },
    { src: "/images/mellisa.jpg", alt: "Influencer creating content", type: "influencer" },
    { src: "/images/kaesfr.jpg", alt: "Radio host", type: "artist" },
    { src: "/images/kingp.jpg", alt: "Podcast recording", type: "artist" },
    { src: "/images/fave.jpg", alt: "Live performance", type: "artist" },
    { src: "/images/dude.jpg", alt: "Studio session", type: "artist" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % creativeImages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center">
      {/* Add padding top to account for fixed navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20 md:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                Discover the best{" "}
                <span className="italic bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Talents
                </span>{" "}
                for your projects
              </h1>

              <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg">
                Get instant access to vetted creative professionals, a dedicated project manager, and a seamless
                management platform to execute media, content, and entertainment projects—on your terms
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-full">
                  <Shield className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                </div>
                <span className="text-gray-300 font-medium text-sm md:text-base">Quality guaranteed</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/20 rounded-full">
                  <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                </div>
                <span className="text-gray-300 font-medium text-sm md:text-base">Top-rated professionals</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Link href="/onboarding">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-emerald-700/30 hover:bg-muted/80"
                >
                  <Link href="/talents">Find Talents</Link>
                </Button>
              </div>
            
            {/* Company Logos */}
            <div className="pt-6 md:pt-8">
              <p className="text-gray-500 text-xs md:text-sm mb-3 md:mb-4">Trusted by industry leaders</p>
              <div className="flex items-center space-x-4 md:space-x-8 opacity-60 overflow-x-auto">
                <div className="text-gray-400 font-semibold text-sm md:text-lg whitespace-nowrap">RadioWave</div>
                <div className="text-gray-400 font-semibold text-sm md:text-lg whitespace-nowrap">StreamTV</div>
                <div className="text-gray-400 font-semibold text-sm md:text-lg whitespace-nowrap">SoundStage</div>
                <div className="text-gray-400 font-semibold text-sm md:text-lg whitespace-nowrap">MediaCorp</div>
              </div>
            </div>
          </div>

          {/* Right Creative Grid */}
          <div className="relative order-1 lg:order-2 mb-8 lg:mb-0">
            <div className="grid grid-cols-3 gap-2 md:gap-4 h-[400px] md:h-[600px]">
              {/* Large featured image */}
              <div className="col-span-2 row-span-2 relative overflow-hidden rounded-xl md:rounded-2xl">
                <img
                  src={creativeImages[currentIndex]?.src || "/placeholder.svg"}
                  alt={creativeImages[currentIndex]?.alt}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 text-white">
                  <div className="flex items-center space-x-2 mb-1 md:mb-2">
                    <Music className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm font-medium">Featured Talent</span>
                  </div>
                  <h3 className="text-sm md:text-lg font-bold">
                    Professional {creativeImages[currentIndex]?.type?.toUpperCase()}
                  </h3>
                </div>
              </div>

              {/* Smaller grid items */}
              <div className="space-y-2 md:space-y-4">
                <div className="relative overflow-hidden rounded-lg md:rounded-xl h-24 md:h-32">
                  <img
                    src="/images/talent4.jpg"
                    alt="Creative work"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent"></div>
                </div>
                <div className="relative overflow-hidden rounded-lg md:rounded-xl h-24 md:h-32">
                  <img
                    src="/images/talent2.jpg"
                    alt="Creative work"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent"></div>
                </div>
              </div>

              <div className="col-span-2 relative overflow-hidden rounded-lg md:rounded-xl">
                <img
                  src="/images/talent6.jpg"
                  alt="Creative work"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-pink-900/60 to-transparent"></div>
              </div>

              <div className="relative overflow-hidden rounded-lg md:rounded-xl">
                <img
                  src="/images/talent3.jpg"
                  alt="Creative work"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 to-transparent"></div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-2 md:-top-4 -right-2 md:-right-4 p-2 md:p-3 bg-white/10 backdrop-blur-sm rounded-full">
              <Headphones className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div className="absolute top-1/2 -left-2 md:-left-4 p-2 md:p-3 bg-white/10 backdrop-blur-sm rounded-full">
              <Mic className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div className="absolute -bottom-2 md:-bottom-4 left-1/3 p-2 md:p-3 bg-white/10 backdrop-blur-sm rounded-full">
              <Camera className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
