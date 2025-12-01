"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, MapPin, Heart, Star, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import InquiryFormModal from "@/components/InquiryFormModal"
import { getHeaderImage } from "@/lib/getHeaderImage"

export default function InfluencerMarketingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const headerImage = getHeaderImage("/products/influencer-marketing")

  const handlePackageClick = (influencerName, pkg) => {
    setSelectedPackage({
      name: `${influencerName} - ${pkg.name}`,
      price: pkg.price,
      details: pkg.deliverables.join(", "),
    })
    setIsModalOpen(true)
  }

  const influencers = [
    {
      id: 1,
      name: "Nana Ama Lifestyle",
      category: "Lifestyle & Fashion",
      location: "Accra, Ghana",
      followers: "500K+",
      rating: 4.9,
      engagement: "8.5%",
      platforms: ["Instagram", "TikTok", "YouTube"],
      demographics: ["Women 18-34", "Fashion Enthusiasts"],
      packages: [
        {
          name: "Single Post",
          price: "₵3,000",
          deliverables: ["1 Instagram post", "Story mention", "24hr visibility"],
        },
        {
          name: "Campaign Package",
          price: "₵8,000",
          deliverables: ["3 Instagram posts", "5 Stories", "1 Reel", "7-day campaign"],
        },
        {
          name: "Brand Ambassador",
          price: "₵25,000",
          deliverables: ["Weekly content", "Stories & Reels", "YouTube feature", "30-day partnership"],
        },
      ],
    },
    {
      id: 2,
      name: "Kwame Tech Reviews",
      category: "Technology & Gadgets",
      location: "Accra, Ghana",
      followers: "350K+",
      rating: 4.8,
      engagement: "7.2%",
      platforms: ["YouTube", "Instagram", "Twitter"],
      demographics: ["Men 25-44", "Tech Enthusiasts"],
      packages: [
        {
          name: "Product Review",
          price: "₵5,000",
          deliverables: ["YouTube review video", "Instagram post", "Honest feedback"],
        },
        {
          name: "Tech Campaign",
          price: "₵12,000",
          deliverables: ["2 YouTube videos", "3 Instagram posts", "Twitter thread", "14-day campaign"],
        },
        {
          name: "Long-term Partnership",
          price: "₵35,000",
          deliverables: ["Monthly reviews", "Social media coverage", "Event appearances", "90-day partnership"],
        },
      ],
    },
    {
      id: 3,
      name: "Ama's Kitchen",
      category: "Food & Cooking",
      location: "Kumasi, Ghana",
      followers: "280K+",
      rating: 4.7,
      engagement: "9.1%",
      platforms: ["Instagram", "TikTok", "Facebook"],
      demographics: ["Women 25-54", "Food Lovers"],
      packages: [
        {
          name: "Recipe Feature",
          price: "₵2,500",
          deliverables: ["1 Recipe video", "Instagram post", "Product placement"],
        },
        {
          name: "Food Campaign",
          price: "₵7,000",
          deliverables: ["3 Recipe videos", "5 Instagram posts", "TikTok series", "14-day campaign"],
        },
        {
          name: "Brand Partnership",
          price: "₵20,000",
          deliverables: ["Weekly recipes", "Social media coverage", "Product reviews", "30-day partnership"],
        },
      ],
    },
    {
      id: 4,
      name: "Fitness with Kofi",
      category: "Health & Fitness",
      location: "Accra, Ghana",
      followers: "420K+",
      rating: 4.8,
      engagement: "8.8%",
      platforms: ["Instagram", "YouTube", "TikTok"],
      demographics: ["Adults 18-44", "Fitness Enthusiasts"],
      packages: [
        {
          name: "Workout Feature",
          price: "₵3,500",
          deliverables: ["1 Workout video", "Instagram post", "Product showcase"],
        },
        {
          name: "Fitness Campaign",
          price: "₵10,000",
          deliverables: ["4 Workout videos", "Daily stories", "Reels series", "21-day campaign"],
        },
        {
          name: "Health Ambassador",
          price: "₵30,000",
          deliverables: ["Weekly content", "Live sessions", "Product endorsement", "60-day partnership"],
        },
      ],
    },
    {
      id: 5,
      name: "Yaa Beauty Hub",
      category: "Beauty & Skincare",
      location: "Accra, Ghana",
      followers: "380K+",
      rating: 4.9,
      engagement: "10.2%",
      platforms: ["Instagram", "TikTok", "YouTube"],
      demographics: ["Women 18-35", "Beauty Enthusiasts"],
      packages: [
        {
          name: "Product Review",
          price: "₵2,800",
          deliverables: ["1 Review video", "Instagram post", "Honest testimonial"],
        },
        {
          name: "Beauty Campaign",
          price: "₵8,500",
          deliverables: ["3 Tutorial videos", "5 Instagram posts", "TikTok series", "14-day campaign"],
        },
        {
          name: "Brand Ambassador",
          price: "₵28,000",
          deliverables: ["Weekly tutorials", "Product launches", "Event coverage", "60-day partnership"],
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
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
                <Users className="h-6 w-6 text-pink-500" />
                <span className="text-lg font-semibold">Influencer Marketing</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Cover */}
      <section className="relative h-64 md:h-80 w-full">
        <img
          src={headerImage}
          alt="Influencer Marketing Cover"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Influencer Marketing</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90">
              Partner with Ghana's top influencers to reach engaged audiences authentically
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-pink-500/10 to-purple-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-balance">Influencer Marketing</h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              Partner with Ghana's top influencers to reach engaged audiences authentically. From lifestyle to tech,
              find the perfect voice for your brand.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search influencers..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle & Fashion</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="food">Food & Cooking</SelectItem>
                  <SelectItem value="fitness">Health & Fitness</SelectItem>
                  <SelectItem value="beauty">Beauty & Skincare</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Followers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="micro">10K-100K</SelectItem>
                  <SelectItem value="mid">100K-500K</SelectItem>
                  <SelectItem value="macro">500K+</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Budget</SelectItem>
                  <SelectItem value="low">Under ₵5,000</SelectItem>
                  <SelectItem value="mid">₵5,000 - ₵15,000</SelectItem>
                  <SelectItem value="high">₵15,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {influencers.map((influencer) => (
              <Card key={influencer.id} className="overflow-hidden">
                <div className="grid lg:grid-cols-3 gap-6 p-6">
                  <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{influencer.name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {influencer.category}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{influencer.rating}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{influencer.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{influencer.followers} followers</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        <span>{influencer.engagement} engagement</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Platforms:</div>
                      <div className="flex flex-wrap gap-1">
                        {influencer.platforms.map((platform, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Audience:</div>
                      <div className="flex flex-wrap gap-1">
                        {influencer.demographics.map((demo, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {demo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <h4 className="font-semibold mb-4">Available Packages</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {influencer.packages.map((pkg, index) => (
                        <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{pkg.name}</CardTitle>
                            <div className="text-2xl font-bold text-primary">{pkg.price}</div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <ul className="space-y-1 text-xs text-muted-foreground">
                              {pkg.deliverables.map((item, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                            <Button
                              className="w-full"
                              size="sm"
                              onClick={() => handlePackageClick(influencer.name, pkg)}
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
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Influencers
            </Button>
          </div>
        </div>
      </section>

      <InquiryFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} packageInfo={selectedPackage} />
    </div>
  )
}
