"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star, Play, Music, MapPin, Clock, Eye } from "lucide-react"
import Link from "next/link"

export function FeaturedCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const featuredTalents = [
    {
      id: 1,
      name: "king promise",
      title: "Grammy-Nominated Producer",
      image: "/images/kingp.jpg",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 5.0,
      reviews: 234,
      location: "Los Angeles, CA",
      description: "Specializing in electronic music production with over 10 years of experience in the industry.",
      achievements: ["Grammy Nomination 2023", "Billboard Top 100", "500M+ Streams"],
      genres: ["Electronic", "House", "Progressive"],
      rate: "$300/hour",
      availability: "Available",
      verified: true,
      category: "dj",
    },
    {
      id: 2,
      name: "Mellisa",
      title: "Award-Winning Host",
      image: "/images/mellisa.jpg",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 4.9,
      reviews: 189,
      location: "New York, NY",
      description: "Dynamic MC and event host with experience in major TV networks and live events.",
      achievements: ["Emmy Award Winner", "500+ Events Hosted", "National TV Appearances"],
      genres: ["Live Events", "TV Hosting", "Corporate"],
      rate: "$250/hour",
      availability: "Available",
      verified: true,
      category: "mc",
    },
    {
      id: 3,
      name: "Fave",
      title: "Platinum Recording Artist",
      image: "/images/fave.jpg",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 5.0,
      reviews: 156,
      location: "Nashville, TN",
      description: "Multi-platinum recording artist with chart-topping hits and international recognition.",
      achievements: ["Platinum Album", "World Tour 2023", "Music Awards Winner"],
      genres: ["Pop", "R&B", "Soul"],
      rate: "$400/hour",
      availability: "Busy",
      verified: true,
      category: "artist",
    },
    {
      id: 4,
      name: "Ayra starr",
      title: "Content Creator",
      image: "/images/ayra.jpg",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 4.8,
      reviews: 312,
      location: "Miami, FL",
      description: "Macro influencer with 2M+ followers across platforms, specializing in lifestyle and music content.",
      achievements: ["2M+ Followers", "Brand Partner of the Year", "Viral Content Creator"],
      genres: ["Lifestyle", "Music", "Fashion"],
      rate: "$180/hour",
      availability: "Available",
      verified: true,
      category: "influencer",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredTalents.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % featuredTalents.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + featuredTalents.length) % featuredTalents.length)

  const currentTalent = featuredTalents[currentSlide]

  return (
    <section className="py-12 md:py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2 bg-white/10 text-white border-white/20">
            ⭐ Featured Spotlight
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
            Spotlight on{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Excellence
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Meet our top-rated talents who have delivered exceptional results for major brands and media companies
          </p>
        </div>

        {/* --- Mobile Carousel --- */}
        {isMobile ? (
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {featuredTalents.map((talent) => (
                  <div key={talent.id} className="w-full flex-shrink-0 px-2">
                    <Card className="overflow-hidden bg-white/5 backdrop-blur-sm border-white/10">
                      <div className="relative">
                        <img
                          src={talent.image || "/placeholder.svg"}
                          alt={talent.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3">
                            <Play className="w-5 h-5" />
                          </Button>
                        </div>

                        {/* Status badges */}
                        <div className="absolute top-3 right-3 flex flex-col space-y-2">
                          {talent.verified && <Badge className="bg-blue-500 text-white text-xs">✓ Verified</Badge>}
                          <Badge
                            className={`text-xs ${
                              talent.availability === "Available"
                                ? "bg-green-500 text-white"
                                : "bg-yellow-500 text-white"
                            }`}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {talent.availability}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-4 space-y-3">
                        {/* Rating */}
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-white font-semibold text-sm">{talent.rating}</span>
                          <span className="text-gray-400 text-sm">({talent.reviews})</span>
                        </div>

                        {/* Name + Title */}
                        <h3 className="text-xl font-bold text-white mb-1">{talent.name}</h3>
                        <p className="text-purple-300 text-sm">{talent.title}</p>

                        {/* Location */}
                        <div className="flex items-center space-x-1 text-gray-400 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{talent.location}</span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-300 text-sm line-clamp-2">{talent.description}</p>

                        {/* Genres */}
                        <div className="flex flex-wrap gap-1">
                          {talent.genres.slice(0, 2).map((genre, index) => (
                            <Badge key={index} className="bg-purple-600/30 text-purple-200 border-purple-400/30 text-xs">
                              {genre}
                            </Badge>
                          ))}
                        </div>

                        {/* Rate + CTA */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="text-lg font-bold text-white">{talent.rate}</div>
                          <div className="flex space-x-2">
                            <Link href="/talents">
                              <Button size="sm" variant="outline" className="bg-transparent text-white border-white/30">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Link href="/talents">
                              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                                Book
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Navigation */}
            <Button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 text-white rounded-full p-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 text-white rounded-full p-2">
              <ChevronRight className="w-5 h-5" />
            </Button>

            {/* Dots */}
            <div className="flex justify-center space-x-2 mt-6">
              {featuredTalents.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full ${index === currentSlide ? "bg-purple-400 w-6" : "bg-white/30"}`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* --- Desktop Layout --- */
          <div className="relative">
            <Card className="overflow-hidden bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
                  {/* Media */}
                  <div className="relative overflow-hidden">
                    <img src={currentTalent.image || "/placeholder.svg"} alt={currentTalent.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button size="lg" className="bg-white/20 text-white rounded-full p-4 hover:bg-white/30">
                        <Play className="w-8 h-8" />
                      </Button>
                    </div>

                    {/* Music icon */}
                    <div className="absolute top-6 right-6 p-3 bg-white/10 rounded-full animate-pulse">
                      <Music className="w-6 h-6 text-white" />
                    </div>

                    {/* Status badges */}
                    <div className="absolute top-6 left-6 flex flex-col space-y-2">
                      {currentTalent.verified && <Badge className="bg-blue-500 text-white">✓ Verified</Badge>}
                      <Badge className={currentTalent.availability === "Available" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}>
                        <Clock className="w-4 h-4 mr-1" />
                        {currentTalent.availability}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 lg:p-12 flex flex-col justify-center space-y-6">
                    <div className="flex items-center space-x-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                      <span className="text-white font-semibold">{currentTalent.rating}</span>
                      <span className="text-gray-400">({currentTalent.reviews} reviews)</span>
                    </div>

                    <h3 className="text-3xl font-bold text-white">{currentTalent.name}</h3>
                    <p className="text-xl text-purple-300">{currentTalent.title}</p>
                    <div className="flex items-center text-gray-400">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{currentTalent.location}</span>
                    </div>

                    <p className="text-gray-300">{currentTalent.description}</p>

                    <div>
                      <h4 className="text-white font-semibold mb-3">Key Achievements</h4>
                      {currentTalent.achievements.map((ach, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span className="text-gray-300">{ach}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {currentTalent.genres.map((genre, i) => (
                        <Badge key={i} className="bg-purple-600/30 text-purple-200 border-purple-400/30">{genre}</Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="text-2xl font-bold text-white">{currentTalent.rate}</div>
                      <div className="flex space-x-3">
                        <Link href="/talents">
                          <Button variant="outline" className="bg-transparent text-white border-white/30"> 
                            <Eye className="w-4 h-4 mr-2" /> View Profile
                          </Button>
                        </Link>
                        <Link href="/talents">
                          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full">
                            Book Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Desktop Navigation */}
            <Button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 text-white rounded-full p-3">
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 text-white rounded-full p-3">
              <ChevronRight className="w-6 h-6" />
            </Button>

            {/* Dots */}
            <div className="flex justify-center space-x-2 mt-8">
              {featuredTalents.map((_, index) => (
                <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full ${index === currentSlide ? "bg-purple-400" : "bg-white/30"}`} />
              ))}
            </div>
          </div>
        )}

        {/* Bottom stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 text-center">
          <div><div className="text-2xl md:text-3xl font-bold text-white">500+</div><div className="text-gray-400">Featured Talents</div></div>
          <div><div className="text-2xl md:text-3xl font-bold text-white">98%</div><div className="text-gray-400">Success Rate</div></div>
          <div><div className="text-2xl md:text-3xl font-bold text-white">50M+</div><div className="text-gray-400">Total Reach</div></div>
          <div><div className="text-2xl md:text-3xl font-bold text-white">24/7</div><div className="text-gray-400">Support</div></div>
        </div>
      </div>
    </section>
  )
}
