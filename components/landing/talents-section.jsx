"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Star,
  MapPin,
  Clock,
  DollarSign,
  Music,
  Radio,
  Mic,
  Camera,
  Users,
  Zap,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { SectionParticles } from "@/components/landing/section-particles"

export function TalentsSection() {
  const [activeCategory, setActiveCategory] = useState("all")
  const scrollContainerRef = useRef(null)

  const categories = [
    {
      id: "all",
      label: "All Talents",
      icon: Users,
      image: "/icons/all.PNG",
      description: "Browse all categories",
    },
    {
      id: "dj",
      label: "DJs & Producers",
      icon: Music,
      image: "/icons/t4.PNG",
      description: "Electronic music specialists",
    },
    {
      id: "mc",
      label: "MCs & Hosts",
      icon: Mic,
      image: "/icons/t7.PNG",
      description: "Event hosts and presenters",
    },
    {
      id: "artist",
      label: "Recording Artists",
      icon: Star,
      image: "/icons/t6.PNG",
      description: "Singers and musicians",
    },
    {
      id: "influencer",
      label: "Content Creators",
      icon: Camera,
      image: "/icons/t3.PNG",
      description: "Social media influencers",
    },
    {
      id: "radio",
      label: "Radio & Podcast",
      icon: Radio,
      image: "/icons/t8.PNG",
      description: "Audio content specialists",
    },
    {
      id: "voice",
      label: "Voice Over",
      icon: Users,
      image: "/icons/t2.PNG",
      description: "Narration and commercial",
    },
    {
      id: "live",
      label: "Live Performance",
      icon: Zap,
      image: "/icons/t5.PNG",
      description: "Stage and event performers",
    },
    {
      id: "model",
      label: "Models",
      icon: Users,
      image: "/models.png",
      description: "Fashion and commercial talent",
    },
    {
      id: "dancer",
      label: "Dancers",
      icon: Zap,
      image: "/dancers.png",
      description: "Professional dancers & choreographers",
    },
  ]

  const allTalents = [
    {
      id: 1,
      name: "Odeal",
      title: "British Artist",
      category: "artist",
      image: "/images/about-hero.jpg",
      rating: 4.9,
      reviews: 127,
      location: "Los Angeles, CA",
      rate: "$150/hour",
      availability: "Available",
      specialties: ["alte", "Techno", "Progressive"],
      verified: true,
    },
    {
      id: 2,
      name: "King promise",
      title: "Ghanaian artist",
      category: "artist",
      image: "/images/kingp.jpg",
      rating: 4.8,
      reviews: 89,
      location: "Ghana, Accra",
      rate: "$120/hour",
      availability: "Available",
      specialties: ["Live Events", "afro beats", "pop"],
      verified: true,
    },
    {
      id: 3,
      name: "Russ",
      title: "Singer-Songwriter",
      category: "dj",
      image: "/images/russ.jpg",
      rating: 5.0,
      reviews: 156,
      location: "Nashville, TN",
      rate: "$200/hour",
      availability: "Busy",
      specialties: ["Pop", "Country", "Acoustic"],
      verified: true,
    },
    {
      id: 4,
      name: "Ayra Starr",
      title: "Nigerian artist",
      category: "influencer",
      image: "/images/ayra.jpg",
      rating: 4.7,
      reviews: 203,
      location: "Miami, FL",
      rate: "$100/hour",
      availability: "Available",
      specialties: ["Social Media", "Video"],
      verified: true,
    },
    {
      id: 5,
      name: "Fave",
      title: "Ghanaian Artist",
      category: "radio",
      image: "/images/fave.jpg",
      rating: 4.9,
      reviews: 78,
      location: "Ghana, Accra",
      rate: "$80/hour",
      availability: "Available",
      specialties: ["Interviews", "Tech Talk", "Business"],
      verified: true,
    },
    {
      id: 6,
      name: "Kaesfr",
      title: "Voice Over Artist",
      category: "artist",
      image: "/images/kaesfr.jpg",
      rating: 4.8,
      reviews: 134,
      location: "Ghana, Accra",
      rate: "$90/hour",
      availability: "Available",
      specialties: ["Commercial", "Narration", "Character"],
      verified: true,
    },
    {
      id: 7,
      name: "Beat Master",
      title: "Hip-Hop Producer",
      category: "dj",
      image: "/placeholder.svg?height=300&width=300",
      rating: 4.7,
      reviews: 98,
      location: "Atlanta, GA",
      rate: "$200/hour",
      availability: "Available",
      specialties: ["Hip-Hop", "Trap", "R&B"],
      verified: true,
    },
    {
      id: 8,
      name: "Sarah Live",
      title: "Event MC",
      category: "mc",
      image: "/placeholder.svg?height=300&width=300",
      rating: 4.9,
      reviews: 167,
      location: "Chicago, IL",
      rate: "$180/hour",
      availability: "Available",
      specialties: ["Weddings", "Corporate", "Parties"],
      verified: true,
    },
  ]

  const filteredTalents =
    activeCategory === "all" ? allTalents : allTalents.filter((talent) => talent.category === activeCategory)

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320
      const currentScroll = scrollContainerRef.current.scrollLeft
      const targetScroll = direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className="relative overflow-hidden bg-background py-16 md:py-24">
      <div className="absolute inset-0">
        <div className="absolute left-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <SectionParticles
          className="left-0 top-0 h-[min(36rem,80vh)] w-[min(100%,32rem)]"
          opacityClass="opacity-[0.12]"
          quantity={34}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge
            variant="default"
            className="mb-4 rounded-full border-0 bg-primary px-4 py-2 text-sm font-medium text-white shadow-md shadow-primary/25"
          >
            🎭 Featured Talents
          </Badge>
          <h2 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Meet Our{" "}
            <span className="inline-block rounded-xl bg-primary px-3 py-1.5 text-white shadow-lg shadow-primary/30 md:px-4 md:py-2">
              Top Performers
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground dark:text-white/75">
            Discover verified professionals ready to bring your projects to life
          </p>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`group rounded-xl border-2 bg-white p-4 transition-all duration-300 hover:shadow-lg ${
                  activeCategory === category.id
                    ? "border-primary shadow-lg shadow-primary/25 ring-2 ring-primary/20"
                    : "border-gray-200 hover:border-primary/50"
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div
                    className={`rounded-lg p-3 transition-colors duration-300 ${
                      activeCategory === category.id
                        ? "bg-primary text-primary-foreground"
                        : "border border-gray-100 bg-gray-50 text-primary group-hover:bg-primary/5"
                    }`}
                  >
                    <img 
                      src={category.image} 
                      alt={category.label}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                  </div>
                  <div>
                    <h3
                      className={`font-semibold text-sm transition-colors duration-300 ${
                        activeCategory === category.id ? "text-gray-900" : "text-gray-700"
                      }`}
                    >
                      {category.label}
                    </h3>
                    <p className={`text-xs mt-1 transition-colors duration-300 ${
                      activeCategory === category.id ? "text-gray-600" : "text-gray-500"
                    }`}>{category.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Talents Carousel */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
                {activeCategory === "all"
                  ? "Popular talents"
                  : `${categories.find((c) => c.id === activeCategory)?.label}`}
              </h3>
              <p className="text-gray-600 dark:text-white/70">
                {filteredTalents.length} {filteredTalents.length === 1 ? "talent" : "talents"} available
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="hidden md:flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => scroll("left")}
                className="h-10 w-10 rounded-full border-border bg-muted/50 p-0 text-foreground hover:border-primary/40 hover:bg-primary/10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scroll("right")}
                className="h-10 w-10 rounded-full border-border bg-muted/50 p-0 text-foreground hover:border-primary/40 hover:bg-primary/10"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Carousel Container */}
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {filteredTalents.map((talent) => (
                <div key={talent.id} className="w-80 shrink-0">
                  <Card className="group flex transform flex-col gap-0 overflow-hidden rounded-xl border border-gray-200 bg-white p-0 py-0 shadow-md transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/15 dark:border-gray-200">
                    <div className="relative shrink-0">
                      <img
                        src={talent.image || "/placeholder.svg"}
                        alt={talent.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                      {/* Availability badge */}
                      <div className="absolute top-4 right-4">
                        <Badge
                          className={`${
                            talent.availability === "Available" ? "bg-primary text-primary-foreground" : "bg-yellow-500 text-white"
                          }`}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {talent.availability}
                        </Badge>
                      </div>

                      {/* Verified badge */}
                      {talent.verified && (
                        <div className="absolute left-4 top-4">
                          <Badge className="border-0 bg-primary text-primary-foreground shadow-sm">✓ Verified</Badge>
                        </div>
                      )}

                      {/* Rating overlay */}
                      <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                        <div className="flex items-center space-x-1 bg-black/80 backdrop-blur-sm rounded-full px-3 py-1.5">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-bold text-white">{talent.rating}</span>
                          <span className="text-xs text-gray-300">({talent.reviews})</span>
                        </div>
                      </div>
                    </div>

                    <CardContent className="border-t border-gray-100 bg-white p-6">
                      <div className="space-y-4">
                        {/* Name and title */}
                        <div>
                          <h3 className="mb-1 text-xl font-bold text-gray-900">{talent.name}</h3>
                          <p className="text-gray-600">{talent.title}</p>
                        </div>

                        {/* Location and rate */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span>{talent.location}</span>
                          </div>
                          <div className="flex items-center gap-1 font-semibold text-gray-900">
                            <DollarSign className="h-4 w-4 shrink-0 text-primary" />
                            <span className="text-primary">{talent.rate}</span>
                          </div>
                        </div>

                        {/* Specialties */}
                        <div className="flex flex-wrap gap-2">
                          {talent.specialties.map((specialty, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="border-primary/35 bg-white text-xs text-primary"
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2">
                          <Link
                            href="/talents"
                            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md border-0 bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                          >
                            Book Now
                          </Link>
                          <Button
                            asChild
                            variant="outline"
                            className="flex-1 border-gray-200 bg-white text-gray-900 hover:border-primary/40 hover:bg-primary/5 hover:text-gray-900"
                          >
                            <Link href="/talents">
                              <Eye className="mr-1 h-4 w-4" />
                              View Profile
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden justify-center space-x-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => scroll("left")}
                className="h-10 w-10 rounded-full border-border bg-muted/50 p-0 text-foreground hover:border-primary/40 hover:bg-primary/10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scroll("right")}
                className="h-10 w-10 rounded-full border-border bg-muted/50 p-0 text-foreground hover:border-primary/40 hover:bg-primary/10"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-primary/40 bg-transparent px-8 py-3 text-lg font-semibold text-foreground transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Link href="/talents">
              View All Talents
            </Link>
          </Button>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
