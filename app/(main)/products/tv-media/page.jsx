"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tv, Search, MapPin, Users, Clock, Star, ArrowLeft, Eye, Calendar } from "lucide-react"
import Link from "next/link"
import InquiryFormModal from "@/components/InquiryFormModal"
import CustomPackageBuilder from "@/components/CustomPackageBuilder"
import { getHeaderImage } from "@/lib/getHeaderImage"
import { getActiveMediaListings } from "@/actions/media-agency"

export default function TVMediaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [customBuilderStationId, setCustomBuilderStationId] = useState(null)
  const [registeredListings, setRegisteredListings] = useState([])
  const headerImage = getHeaderImage("/products/tv-media")

  useEffect(() => {
    getActiveMediaListings("TV").then((result) => {
      if (result.success && result.listings?.length) {
        setRegisteredListings(result.listings)
      }
    })
  }, [])

  const handlePackageClick = (stationName, pkg) => {
    setSelectedPackage({
      name: `${stationName} - ${pkg.name}`,
      price: pkg.price,
      details: `${pkg.duration} • ${pkg.slots} spots`,
      mediaType: "tv",
      defaultSpots: pkg.slots,
    })
    setIsModalOpen(true)
  }

  const handleCustomPackageClick = (stationId, stationName) => {
    if (customBuilderStationId === stationId) {
      setCustomBuilderStationId(null)
    } else {
      setCustomBuilderStationId(stationId)
    }
  }

  const handleCustomPackageSubmit = (stationName, packageData) => {
    setSelectedPackage({
      name: `${stationName} - Custom Package`,
      price: `₵${packageData.calculations.finalTotal.toFixed(2)}`,
      details: `${packageData.calculations.totalQuantity} spots over ${packageData.weeks} week${packageData.weeks > 1 ? "s" : ""}`,
      mediaType: "tv",
      defaultSpots: packageData.calculations.totalQuantity,
      customData: packageData,
    })
    setIsModalOpen(true)
    setCustomBuilderStationId(null)
  }

  const tvStations = [
    {
      id: 1,
      name: "GTV (Ghana Television)",
      network: "GBC",
      location: "Accra, Greater Accra",
      reach: "5M+ households",
      rating: 4.8,
      priceRange: "₵3,500-12,000",
      timeSlots: ["Prime Time", "Morning", "Late Night"],
      demographics: ["Adults 25-54", "Adults 18-49"],
      packages: [
        { name: "Morning Show Package", price: "₵3,500", duration: "30 seconds", slots: 5, estimatedReach: "2.5M+ viewers" },
        { name: "Prime Time Package", price: "₵12,000", duration: "30 seconds", slots: 3, estimatedReach: "4.5M+ viewers" },
        { name: "Weekend Special", price: "₵6,000", duration: "30 seconds", slots: 8, estimatedReach: "3.5M+ viewers" },
      ],
    },
    {
      id: 2,
      name: "TV3 Network",
      network: "Media General",
      location: "Accra, Greater Accra",
      reach: "4M+ households",
      rating: 4.7,
      priceRange: "₵3,000-10,000",
      timeSlots: ["Prime Time", "Daytime", "News"],
      demographics: ["Adults 25-54", "Adults 35-64"],
      packages: [
        { name: "News Hour Package", price: "₵3,000", duration: "30 seconds", slots: 6, estimatedReach: "2.2M+ viewers" },
        { name: "Prime Drama Package", price: "₵10,000", duration: "30 seconds", slots: 4, estimatedReach: "3.8M+ viewers" },
        { name: "Daytime Bundle", price: "₵5,000", duration: "30 seconds", slots: 10, estimatedReach: "2.8M+ viewers" },
      ],
    },
    {
      id: 3,
      name: "UTV Ghana",
      network: "Despite Media",
      location: "Accra, Greater Accra",
      reach: "3M+ households",
      rating: 4.6,
      priceRange: "₵2,500-8,000",
      timeSlots: ["Morning", "Afternoon", "Evening"],
      demographics: ["Adults 18-49", "Adults 25-54"],
      packages: [
        { name: "Morning News Package", price: "₵2,500", duration: "30 seconds", slots: 8, estimatedReach: "1.8M+ viewers" },
        { name: "Evening Package", price: "₵8,000", duration: "30 seconds", slots: 5, estimatedReach: "2.5M+ viewers" },
        { name: "All-Day Bundle", price: "₵15,000", duration: "30 seconds", slots: 20, estimatedReach: "2.8M+ viewers" },
      ],
    },
    {
      id: 4,
      name: "Metro TV",
      network: "Independent",
      location: "Accra, Greater Accra",
      reach: "2.5M+ households",
      rating: 4.5,
      priceRange: "₵2,000-7,000",
      timeSlots: ["Prime Time", "News", "Talk Shows"],
      demographics: ["Adults 25-54", "Adults 35-64"],
      packages: [
        { name: "News Package", price: "₵2,000", duration: "30 seconds", slots: 5, estimatedReach: "1.5M+ viewers" },
        { name: "Prime Time Package", price: "₵7,000", duration: "30 seconds", slots: 3, estimatedReach: "2.2M+ viewers" },
        { name: "Talk Show Bundle", price: "₵4,500", duration: "30 seconds", slots: 7, estimatedReach: "1.8M+ viewers" },
      ],
    },
    {
      id: 5,
      name: "Adom TV",
      network: "Multimedia Group",
      location: "Kumasi, Ashanti Region",
      reach: "2M+ households",
      rating: 4.6,
      priceRange: "₵1,800-6,500",
      timeSlots: ["Morning", "Afternoon", "Evening"],
      demographics: ["Adults 18-49", "Adults 25-54"],
      packages: [
        { name: "Morning Package", price: "₵1,800", duration: "30 seconds", slots: 6, estimatedReach: "1.2M+ viewers" },
        { name: "Evening Package", price: "₵6,500", duration: "30 seconds", slots: 4, estimatedReach: "1.8M+ viewers" },
        { name: "Full Day Bundle", price: "₵12,000", duration: "30 seconds", slots: 15, estimatedReach: "1.9M+ viewers" },
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
                <Tv className="h-6 w-6 text-blue-500" />
                <span className="text-lg font-semibold">TV Media</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Cover */}
      <section className="relative h-64 md:h-80 w-full">
        <img
          src={headerImage}
          alt="TV Media Cover"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Television Advertising</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90">
              Reach millions of viewers with premium television advertising  across major networks and local stations in
              Ghana.
            </p>
          </div>
        </div>
      </section>

      {/* Header */}
      <section className="py-12 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-balance">Television Advertising</h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              Reach millions of viewers with premium television advertising across major networks and local stations in
              Ghana.
            </p>
          </div> */}

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search stations..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="accra">Greater Accra</SelectItem>
                  <SelectItem value="kumasi">Ashanti Region</SelectItem>
                  <SelectItem value="takoradi">Western Region</SelectItem>
                  <SelectItem value="tamale">Northern Region</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Networks</SelectItem>
                  <SelectItem value="gbc">GBC</SelectItem>
                  <SelectItem value="media-general">Media General</SelectItem>
                  <SelectItem value="multimedia">Multimedia Group</SelectItem>
                  <SelectItem value="despite">Despite Media</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Budget</SelectItem>
                  <SelectItem value="low">Under ₵5,000</SelectItem>
                  <SelectItem value="mid">₵5,000 - ₵20,000</SelectItem>
                  <SelectItem value="high">₵20,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Registered TV Listings */}
      {registeredListings.length > 0 && (
        <section className="py-12 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Registered TV Listings</h2>
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
                    <Link href={`/media/schedule?type=TV&listing=${listing.id}`}>
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

      {/* TV Stations List */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {tvStations.map((station) => (
              <Card key={station.id} className="overflow-hidden">
                <div className="grid lg:grid-cols-3 gap-6 p-6">
                  {/* Station Info */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{station.name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {station.network}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{station.rating}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{station.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{station.reach}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{station.timeSlots.join(", ")}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Target Demographics:</div>
                      <div className="flex flex-wrap gap-1">
                        {station.demographics.map((demo, index) => (
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
                      {station.packages.map((pkg, index) => (
                        <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{pkg.name}</CardTitle>
                            <div className="text-2xl font-bold text-primary">{pkg.price}</div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="text-sm text-muted-foreground">
                              {pkg.duration} • {pkg.slots} spots
                            </div>
                            {pkg.estimatedReach && (
                              <div className="flex items-center gap-1 text-sm text-primary font-medium">
                                <Eye className="h-4 w-4" />
                                {pkg.estimatedReach}
                              </div>
                            )}
                            <Button className="w-full" size="sm" onClick={() => handlePackageClick(station.name, pkg)}>
                              Select Package
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                      {/* Custom Package Option */}
                      <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Custom Package</CardTitle>
                          <div className="text-2xl font-bold text-primary">Build Your Own</div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm text-muted-foreground">
                            Create a personalized package
                          </div>
                          <Button 
                            className="w-full" 
                            size="sm" 
                            variant={customBuilderStationId === station.id ? "outline" : "default"}
                            onClick={() => handleCustomPackageClick(station.id, station.name)}
                          >
                            {customBuilderStationId === station.id ? "Hide Builder" : "Build Custom Package"}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Custom Package Builder for this station */}
                    {customBuilderStationId === station.id && (
                      <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
                        <h5 className="font-semibold mb-4">Custom Package Builder for {station.name}</h5>
                        <CustomPackageBuilder
                          mediaType="radio"
                          onPackageSubmit={(packageData) => handleCustomPackageSubmit(station.name, packageData)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Stations
            </Button>
          </div>
        </div>
      </section>

      {/* Inquiry Form Modal */}
      <InquiryFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} packageInfo={selectedPackage} />
    </div>
  )
}
