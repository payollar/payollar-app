"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Smartphone, Search, Users, Target, Star, ArrowLeft, Facebook, Instagram, Youtube, Twitter } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import InquiryFormModal from "@/components/InquiryFormModal"
import { getHeaderImage } from "@/lib/getHeaderImage"

export default function DigitalMediaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const headerImage = getHeaderImage("/products/digital-media")

  const handlePackageClick = (platformName, pkg) => {
    setSelectedPackage({
      name: `${platformName} - ${pkg.name}`,
      price: pkg.price,
      details: pkg.features.join(", "),
    })
    setIsModalOpen(true)
  }

  const digitalPlatforms = [
    {
      id: 1,
      name: "Facebook Ads",
      platform: "Meta",
      icon: Facebook,
      reach: "2.9B users",
      rating: 4.8,
      targeting: "Advanced",
      priceRange: "₵500-50,000",
      adFormats: ["Image", "Video", "Carousel", "Stories"],
      demographics: ["All Ages", "Global Reach"],
      packages: [
        {
          name: "Starter Campaign",
          price: "₵2,500",
          features: ["₵2,500 ad spend", "Basic targeting", "Image & video ads", "7-day campaign"],
        },
        {
          name: "Growth Campaign",
          price: "₵10,000",
          features: ["₵10,000 ad spend", "Advanced targeting", "All ad formats", "30-day campaign"],
        },
        {
          name: "Premium Campaign",
          price: "₵25,000",
          features: ["₵25,000 ad spend", "Premium targeting", "A/B testing", "60-day campaign"],
        },
      ],
    },
    {
      id: 2,
      name: "Instagram Ads",
      platform: "Meta",
      icon: Instagram,
      reach: "2B users",
      rating: 4.9,
      targeting: "Advanced",
      priceRange: "₵500-50,000",
      adFormats: ["Feed", "Stories", "Reels", "Explore"],
      demographics: ["Ages 18-34", "Visual Content"],
      packages: [
        {
          name: "Influencer Boost",
          price: "₵3,500",
          features: ["₵3,500 ad spend", "Stories & Reels", "Influencer targeting", "14-day campaign"],
        },
        {
          name: "Brand Awareness",
          price: "₵12,000",
          features: ["₵12,000 ad spend", "All placements", "Lookalike audiences", "30-day campaign"],
        },
        {
          name: "Conversion Focus",
          price: "₵30,000",
          features: ["₵30,000 ad spend", "Shopping ads", "Retargeting", "60-day campaign"],
        },
      ],
    },
    {
      id: 3,
      name: "YouTube Ads",
      platform: "Google",
      icon: Youtube,
      reach: "2.5B users",
      rating: 4.7,
      targeting: "Advanced",
      priceRange: "₵1,000-75,000",
      adFormats: ["Skippable", "Non-skippable", "Bumper", "Discovery"],
      demographics: ["All Ages", "Video Content"],
      packages: [
        {
          name: "Video Starter",
          price: "₵5,000",
          features: ["₵5,000 ad spend", "Skippable ads", "Basic targeting", "15-day campaign"],
        },
        {
          name: "Video Pro",
          price: "₵17,000",
          features: ["₵17,000 ad spend", "All ad formats", "Advanced targeting", "30-day campaign"],
        },
        {
          name: "Video Premium",
          price: "₵40,000",
          features: ["₵40,000 ad spend", "Premium placements", "Custom audiences", "60-day campaign"],
        },
      ],
    },
    {
      id: 4,
      name: "Twitter/X Ads",
      platform: "X Corp",
      icon: Twitter,
      reach: "550M users",
      rating: 4.5,
      targeting: "Moderate",
      priceRange: "₵500-25,000",
      adFormats: ["Promoted Tweets", "Promoted Trends", "Promoted Accounts"],
      demographics: ["Ages 25-49", "News & Trends"],
      packages: [
        {
          name: "Engagement Boost",
          price: "₵2,000",
          features: ["₵2,000 ad spend", "Promoted tweets", "Hashtag targeting", "10-day campaign"],
        },
        {
          name: "Trend Campaign",
          price: "₵7,500",
          features: ["₵7,500 ad spend", "All formats", "Conversation targeting", "21-day campaign"],
        },
        {
          name: "Brand Takeover",
          price: "₵20,000",
          features: ["₵20,000 ad spend", "Premium placement", "Trend sponsorship", "30-day campaign"],
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/products"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Products</span>
              </Link>
              <div className="h-6 w-px bg-border"></div>
              <div className="flex items-center space-x-2">
                <Smartphone className="h-6 w-6 text-purple-500" />
                <span className="text-lg font-semibold">Digital Media</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Cover */}
      <section className="relative h-64 md:h-80 w-full">
        <img
          src={headerImage}
          alt="Digital Media Cover"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Digital Advertising</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90">
              Reach your target audience with precision through social media and online platforms
            </p>
          </div>
        </div>
      </section>

      {/* Header */}
      <section className="py-12 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-balance">Digital Advertising</h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              Reach your target audience with precision through social media, streaming platforms, and online
              advertising networks.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search platforms..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Platform Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="video">Video Streaming</SelectItem>
                  <SelectItem value="search">Search Engines</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Ad Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="image">Image Ads</SelectItem>
                  <SelectItem value="video">Video Ads</SelectItem>
                  <SelectItem value="carousel">Carousel Ads</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Budget</SelectItem>
                  <SelectItem value="low">Under ₵5,000</SelectItem>
                  <SelectItem value="mid">₵5,000 - ₵25,000</SelectItem>
                  <SelectItem value="high">₵25,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Platforms List */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {digitalPlatforms.map((platform) => {
              const IconComponent = platform.icon
              return (
                <Card key={platform.id} className="overflow-hidden">
                  <div className="grid lg:grid-cols-3 gap-6 p-6">
                    {/* Platform Info */}
                    <div className="lg:col-span-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{platform.name}</h3>
                            <Badge variant="secondary" className="mt-1">
                              {platform.platform}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{platform.rating}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{platform.reach}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span>{platform.targeting} Targeting</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Ad Formats:</div>
                        <div className="flex flex-wrap gap-1">
                          {platform.adFormats.map((format, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {format}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Best For:</div>
                        <div className="flex flex-wrap gap-1">
                          {platform.demographics.map((demo, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {demo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Packages */}
                    <div className="lg:col-span-2">
                      <h4 className="font-semibold mb-4">Available Packages</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        {platform.packages.map((pkg, index) => (
                          <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg">{pkg.name}</CardTitle>
                              <div className="text-2xl font-bold text-primary">{pkg.price}</div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <ul className="space-y-1 text-xs text-muted-foreground">
                                {pkg.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                              <Button
                                className="w-full"
                                size="sm"
                                onClick={() => handlePackageClick(platform.name, pkg)}
                              >
                                Select Package
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Platforms
            </Button>
          </div>
        </div>
      </section>

      <InquiryFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} packageInfo={selectedPackage} />
    </div>
  )
}
