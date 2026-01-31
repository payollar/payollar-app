"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Radio,
  Tv,
  Smartphone,
  Biohazard as Billboard,
  Users,
  Calendar,
  Package,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function MediaFeaturesSection() {
  const mediaTypes = [
    { name: "TV Media", icon: Tv, color: "bg-white/20 text-white border border-white/30" },
    { name: "Radio Media", icon: Radio, color: "bg-white/20 text-white border border-white/30" },
    { name: "Digital Media", icon: Smartphone, color: "bg-white/20 text-white border border-white/30" },
    { name: "Billboard", icon: Billboard, color: "bg-white/20 text-white border border-white/30" },
    { name: "Influencer Marketing", icon: Users, color: "bg-white/20 text-white border border-white/30" },
  ]

  return (
    <section className="relative overflow-hidden rounded-3xl bg-black mx-4 sm:mx-6 lg:mx-8 xl:mx-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy + CTA */}
          <div className="space-y-6 order-2 lg:order-1 text-white">
            <Badge className="px-4 py-2 bg-white/20 border border-white/30 text-white">
              📺 Media Booking Platform
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Powerful{" "}
              <span className="bg-white/90 bg-clip-text text-transparent">
                Media Features
              </span>{" "}
              for Your Campaigns
            </h2>
            <p className="text-base md:text-lg text-white/95 max-w-lg leading-relaxed">
              Book TV, Radio, Digital, and Billboard media with ease. Build custom packages,
              track performance, and get verified transmission certificates—all in one platform.
            </p>
            <div className="flex flex-wrap gap-3">
              {mediaTypes.map((type, idx) => (
                <Badge key={idx} className={`${type.color} px-3 py-1.5 text-xs font-medium`}>
                  <type.icon className="w-3.5 h-3.5 mr-1.5" />
                  {type.name}
                </Badge>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 shadow-md rounded-lg"
              >
                <Link href="/media/schedule">
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule Media
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-white/50 text-white hover:bg-white/20 rounded-lg"
              >
                <Link href="/media/packages">
                  <Package className="mr-2 h-5 w-5" />
                  View Packages
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Media image only */}
          <div className="relative order-1 lg:order-2 w-full flex justify-center lg:justify-end">
            <Image
              src="/icons/media.PNG"
              alt="Media booking"
              width={1200}
              height={800}
              className="w-full max-w-md h-auto object-contain"
              unoptimized={true}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
