"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Video, Search, Clock, Star, ArrowLeft, MapPin, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import InquiryFormModal from "@/components/InquiryFormModal"
import { getHeaderImage } from "@/lib/getHeaderImage"
import { getActiveMediaListings, getPublishedRateCards } from "@/actions/media-agency"

export default function VideoClippingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [registeredListings, setRegisteredListings] = useState([])
  const [rateCards, setRateCards] = useState([])
  const headerImage = getHeaderImage("/products/video-clipping")

  useEffect(() => {
    getActiveMediaListings("VIDEO_CLIPPING").then((result) => {
      if (result.success && result.listings?.length) {
        setRegisteredListings(result.listings)
      }
    })
    getPublishedRateCards("VIDEO_CLIPPING").then((result) => {
      if (result.success && result.rateCards?.length) {
        setRateCards(result.rateCards)
      }
    })
  }, [])

  const handlePackageClick = (serviceName, pkg) => {
    setSelectedPackage({
      name: `${serviceName} - ${pkg.name}`,
      price: pkg.price,
      details: pkg.features.join(", "),
    })
    setIsModalOpen(true)
  }

  const videoServices = [
    {
      id: 1,
      name: "Social Media Clips",
      category: "Short-Form Content",
      turnaround: "24-48 hours",
      rating: 4.9,
      formats: ["Instagram Reels", "TikTok", "YouTube Shorts", "Facebook"],
      features: ["Color Grading", "Captions", "Music", "Transitions"],
      packages: [
        {
          name: "Single Clip",
          price: "₵300",
          features: ["1 video clip", "Up to 60 seconds", "Basic editing", "1 revision"],
        },
        {
          name: "Content Bundle",
          price: "₵1,200",
          features: ["5 video clips", "Up to 60 seconds each", "Advanced editing", "2 revisions"],
        },
        {
          name: "Monthly Package",
          price: "₵4,000",
          features: ["20 video clips", "Priority editing", "Unlimited revisions", "Custom branding"],
        },
      ],
    },
    {
      id: 2,
      name: "YouTube Editing",
      category: "Long-Form Content",
      turnaround: "3-5 days",
      rating: 4.8,
      formats: ["YouTube", "Vimeo", "Website Embed"],
      features: ["Full Editing", "Thumbnails", "Intro/Outro", "SEO Optimization"],
      packages: [
        {
          name: "Basic Edit",
          price: "₵800",
          features: ["Up to 10 min video", "Basic cuts & transitions", "Color correction", "1 revision"],
        },
        {
          name: "Professional Edit",
          price: "₵2,500",
          features: ["Up to 30 min video", "Advanced editing", "Custom graphics", "3 revisions", "Thumbnail design"],
        },
        {
          name: "Premium Package",
          price: "₵6,000",
          features: [
            "Up to 60 min video",
            "Cinematic editing",
            "Motion graphics",
            "Unlimited revisions",
            "SEO optimization",
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Commercial Videos",
      category: "Advertising Content",
      turnaround: "5-7 days",
      rating: 4.9,
      formats: ["TV Commercials", "Online Ads", "Social Media Ads"],
      features: ["Professional Editing", "Color Grading", "Sound Design", "Multiple Formats"],
      packages: [
        {
          name: "Standard Commercial",
          price: "₵3,500",
          features: ["30-second ad", "Professional editing", "Color grading", "2 revisions", "2 format exports"],
        },
        {
          name: "Premium Commercial",
          price: "₵8,000",
          features: [
            "60-second ad",
            "Cinematic editing",
            "Sound design",
            "Motion graphics",
            "4 revisions",
            "All formats",
          ],
        },
        {
          name: "Campaign Package",
          price: "₵20,000",
          features: [
            "Multiple ad versions",
            "A/B testing cuts",
            "Full production support",
            "Unlimited revisions",
            "Priority delivery",
          ],
        },
      ],
    },
    {
      id: 4,
      name: "Event Highlights",
      category: "Event Coverage",
      turnaround: "3-5 days",
      rating: 4.7,
      formats: ["Highlight Reels", "Full Event Videos", "Social Media Clips"],
      features: ["Multi-Camera Editing", "Music Sync", "Titles & Graphics", "Fast Delivery"],
      packages: [
        {
          name: "Highlight Reel",
          price: "₵2,000",
          features: ["3-5 min highlight", "Music & transitions", "Color correction", "2 revisions"],
        },
        {
          name: "Extended Coverage",
          price: "₵5,000",
          features: [
            "10-15 min video",
            "Multi-camera editing",
            "Custom graphics",
            "Social clips included",
            "3 revisions",
          ],
        },
        {
          name: "Full Event Package",
          price: "₵12,000",
          features: [
            "Full event video",
            "Highlight reel",
            "Social media clips",
            "Drone footage editing",
            "Unlimited revisions",
          ],
        },
      ],
    },
    {
      id: 5,
      name: "Product Videos",
      category: "E-commerce Content",
      turnaround: "2-4 days",
      rating: 4.8,
      formats: ["Product Demos", "Unboxing", "Reviews", "Tutorials"],
      features: ["Professional Editing", "Text Overlays", "Music", "Multiple Angles"],
      packages: [
        {
          name: "Single Product",
          price: "₵600",
          features: ["1 product video", "Up to 2 min", "Basic editing", "Text overlays", "1 revision"],
        },
        {
          name: "Product Series",
          price: "₵2,500",
          features: ["5 product videos", "Up to 2 min each", "Advanced editing", "Custom branding", "2 revisions"],
        },
        {
          name: "E-commerce Bundle",
          price: "₵8,000",
          features: [
            "15 product videos",
            "Priority editing",
            "Multiple formats",
            "Custom templates",
            "Unlimited revisions",
          ],
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
                <Video className="h-6 w-6 text-cyan-500" />
                <span className="text-lg font-semibold">Video Clipping</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Cover */}
      <section className="relative h-64 md:h-80 w-full">
        <img
          src={headerImage}
          alt="Video Clipping Cover"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Professional Video Editing</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90">
            Transform your raw footage into polished, engaging content. From social media clips to full productions,
            we've got you covered.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-balance">Professional Video Editing</h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              Transform your raw footage into polished, engaging content. From social media clips to full productions,
              we've got you covered.
            </p>
          </div> */}

          <div className="max-w-4xl mx-auto space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search services..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="event">Event Coverage</SelectItem>
                  <SelectItem value="product">Product Videos</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Turnaround" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Timeline</SelectItem>
                  <SelectItem value="fast">24-48 hours</SelectItem>
                  <SelectItem value="standard">3-5 days</SelectItem>
                  <SelectItem value="extended">5-7 days</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Budget</SelectItem>
                  <SelectItem value="low">Under ₵1,000</SelectItem>
                  <SelectItem value="mid">₵1,000 - ₵5,000</SelectItem>
                  <SelectItem value="high">₵5,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Rate Cards Section */}
      {rateCards.length > 0 && (
        <section className="py-12 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Video Clipping Rate Cards</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rateCards.map((rateCard) => (
                <Link key={rateCard.id} href={`/rate-cards/${rateCard.id}`}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                    {rateCard.imageUrl && (
                      <div className="relative h-40 w-full overflow-hidden">
                        <img
                          src={rateCard.imageUrl}
                          alt={rateCard.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold">{rateCard.title}</h3>
                        <Badge variant="outline">Rate Card</Badge>
                      </div>
                      {rateCard.agency?.agencyName && (
                        <p className="text-sm text-muted-foreground mb-2">{rateCard.agency.agencyName}</p>
                      )}
                      {rateCard.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                          <MapPin className="h-3 w-3" />
                          {rateCard.location}
                        </p>
                      )}
                      {rateCard.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{rateCard.description}</p>
                      )}
                      <Button className="w-full mt-4" variant="outline">
                        View Rate Card
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {registeredListings.length > 0 && (
        <section className="py-12 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Registered Video Clipping Listings</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {registeredListings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{listing.name}</h3>
                    {listing.agency?.agencyName && (
                      <p className="text-sm text-muted-foreground">{listing.agency.agencyName}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                      {listing.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{listing.location}</span>}
                      {listing.reach && <span>{listing.reach}</span>}
                      {listing.priceRange && <span>{listing.priceRange}</span>}
                    </div>
                    <Link href={`/media/schedule?type=VIDEO_CLIPPING&listing=${listing.id}`}>
                      <Button className="w-full mt-4" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {videoServices.map((service) => (
              <Card key={service.id} className="overflow-hidden">
                <div className="grid lg:grid-cols-3 gap-6 p-6">
                  <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{service.name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {service.category}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{service.rating}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{service.turnaround}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Supported Formats:</div>
                      <div className="flex flex-wrap gap-1">
                        {service.formats.map((format, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {format}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Features:</div>
                      <div className="flex flex-wrap gap-1">
                        {service.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <h4 className="font-semibold mb-4">Available Packages</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {service.packages.map((pkg, index) => (
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
                            <Button className="w-full" size="sm" onClick={() => handlePackageClick(service.name, pkg)}>
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
              Load More Services
            </Button>
          </div>
        </div>
      </section>

      <InquiryFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} packageInfo={selectedPackage} />
    </div>
  )
}
