"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Radio, Search, MapPin, Users, Clock, Star, ArrowLeft, Eye, Calendar } from "lucide-react"
import Link from "next/link"
import InquiryFormModal from "@/components/InquiryFormModal"
import CustomPackageBuilder from "@/components/CustomPackageBuilder"
import { getHeaderImage } from "@/lib/getHeaderImage"
import { getActiveMediaListings } from "@/actions/media-agency"

export default function RadioMediaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [showCustomBuilder, setShowCustomBuilder] = useState(false)
  const [customBuilderStationId, setCustomBuilderStationId] = useState(null)
  const [registeredListings, setRegisteredListings] = useState([])
  const headerImage = getHeaderImage("/products/radio-media")

  useEffect(() => {
    getActiveMediaListings("RADIO").then((result) => {
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
      mediaType: "radio",
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
      mediaType: "radio",
      defaultSpots: packageData.calculations.totalQuantity,
      customData: packageData,
    })
    setIsModalOpen(true)
    setCustomBuilderStationId(null)
  }

  const radioStations = [
    {
      id: 1,
      name: "Joy FM",
      format: "News/Talk",
      location: "Accra, Greater Accra",
      reach: "2M+ listeners",
      rating: 4.9,
      frequency: "99.7 FM",
      priceRange: "₵250-1,500",
      timeSlots: ["Morning Drive", "Afternoon Drive", "Evening"],
      demographics: ["Adults 25-54", "Adults 35-64"],
      packages: [
        { name: "Morning Drive Package", price: "₵1,500", duration: "60 seconds", slots: 10, estimatedReach: "1.2M+ listeners" },
        { name: "Afternoon Package", price: "₵1,000", duration: "60 seconds", slots: 15, estimatedReach: "800K+ listeners" },
        { name: "Weekend Bundle", price: "₵750", duration: "60 seconds", slots: 20, estimatedReach: "600K+ listeners" },
      ],
    },
    {
      id: 2,
      name: "Asempa FM",
      format: "News/Current Affairs",
      location: "Accra, Greater Accra",
      reach: "1.8M+ listeners",
      rating: 4.8,
      frequency: "94.7 FM",
      priceRange: "₵300-1,200",
      timeSlots: ["Morning Show", "Midday", "Evening"],
      demographics: ["Adults 18-49", "Adults 25-54"],
      packages: [
        { name: "Morning Show Package", price: "₵1,200", duration: "60 seconds", slots: 8, estimatedReach: "1.1M+ listeners" },
        { name: "Midday Mix", price: "₵800", duration: "60 seconds", slots: 12, estimatedReach: "700K+ listeners" },
        { name: "All-Day Bundle", price: "₵2,000", duration: "60 seconds", slots: 25, estimatedReach: "1.5M+ listeners" },
      ],
    },
    {
      id: 3,
      name: "Peace FM",
      format: "Talk/Entertainment",
      location: "Accra, Greater Accra",
      reach: "2.5M+ listeners",
      rating: 4.9,
      frequency: "104.3 FM",
      priceRange: "₵400-1,800",
      timeSlots: ["Morning News", "Talk Shows", "Evening"],
      demographics: ["Adults 25-54", "Adults 35-64"],
      packages: [
        { name: "Morning News Package", price: "₵1,800", duration: "60 seconds", slots: 12, estimatedReach: "1.8M+ listeners" },
        { name: "Talk Show Package", price: "₵1,200", duration: "60 seconds", slots: 10, estimatedReach: "1.5M+ listeners" },
        { name: "Weekly Bundle", price: "₵3,000", duration: "60 seconds", slots: 30, estimatedReach: "2.2M+ listeners" },
      ],
    },
    {
      id: 4,
      name: "Hitz FM",
      format: "Music/Entertainment",
      location: "Accra, Greater Accra",
      reach: "1.5M+ listeners",
      rating: 4.7,
      frequency: "103.9 FM",
      priceRange: "₵250-1,000",
      timeSlots: ["Morning", "Workday", "Evening"],
      demographics: ["Adults 18-34", "Youth 15-24"],
      packages: [
        { name: "Workday Package", price: "₵1,000", duration: "60 seconds", slots: 15, estimatedReach: "900K+ listeners" },
        { name: "Morning Package", price: "₵800", duration: "60 seconds", slots: 10, estimatedReach: "750K+ listeners" },
        { name: "Evening Special", price: "₵600", duration: "60 seconds", slots: 18, estimatedReach: "650K+ listeners" },
      ],
    },
    {
      id: 5,
      name: "Adom FM",
      format: "Entertainment/Talk",
      location: "Kumasi, Ashanti Region",
      reach: "1.2M+ listeners",
      rating: 4.8,
      frequency: "106.3 FM",
      priceRange: "₵200-900",
      timeSlots: ["Morning", "Afternoon", "Evening"],
      demographics: ["Adults 18-49", "Adults 25-54"],
      packages: [
        { name: "Morning Package", price: "₵900", duration: "60 seconds", slots: 12, estimatedReach: "850K+ listeners" },
        { name: "Afternoon Package", price: "₵700", duration: "60 seconds", slots: 15, estimatedReach: "700K+ listeners" },
        { name: "Full Day Bundle", price: "₵1,800", duration: "60 seconds", slots: 35, estimatedReach: "1.1M+ listeners" },
      ],
    },
    {
      id: 6,
      name: "Luv FM",
      format: "News/Talk",
      location: "Kumasi, Ashanti Region",
      reach: "800K+ listeners",
      rating: 4.6,
      frequency: "99.5 FM",
      priceRange: "₵180-800",
      timeSlots: ["Morning Drive", "Midday", "Evening"],
      demographics: ["Adults 25-54", "Adults 35-64"],
      packages: [
        { name: "Morning Drive Package", price: "₵800", duration: "60 seconds", slots: 10, estimatedReach: "600K+ listeners" },
        { name: "Midday Package", price: "₵600", duration: "60 seconds", slots: 12, estimatedReach: "500K+ listeners" },
        { name: "Weekly Special", price: "₵1,500", duration: "60 seconds", slots: 28, estimatedReach: "750K+ listeners" },
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
                <Radio className="h-6 w-6 text-green-500" />
                <span className="text-lg font-semibold">Radio Media</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Cover */}
      <section className="relative h-64 md:h-80 w-full">
        <img
          src={headerImage}
          alt="Radio Media Cover"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Radio Advertising</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90">
              Connect with audiences through AM/FM radio stations across Ghana. Perfect for local and regional
              campaigns.
            </p>
          </div>
        </div>
      </section>

      {/* Header */}
      <section className="py-12 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-balance">Radio Advertising</h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              Connect with engaged audiences through AM/FM radio stations across Ghana. Perfect for local and regional
              campaigns.
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
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="news">News/Talk</SelectItem>
                  <SelectItem value="music">Music/Entertainment</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Budget</SelectItem>
                  <SelectItem value="low">Under ₵500</SelectItem>
                  <SelectItem value="mid">₵500 - ₵2,000</SelectItem>
                  <SelectItem value="high">₵2,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Package Builder Section */}
      {/* <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Build Your Custom Radio Package</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Create a personalized radio advertising package by selecting spots across different time segments and days of
              the week. Choose from morning drive, sports shows, afternoon programs, and more.
            </p>
            <Button
              onClick={() => setShowCustomBuilder(!showCustomBuilder)}
              className="mt-6"
              variant={showCustomBuilder ? "outline" : "default"}
            >
              {showCustomBuilder ? "Hide Custom Builder" : "Show Custom Package Builder"}
            </Button>
          </div>

          {showCustomBuilder && (
            <div className="mt-8">
              <CustomPackageBuilder
                mediaType="radio"
                onPackageSubmit={(packageData) => {
                  setSelectedPackage({
                    name: "Custom Radio Package",
                    price: `₵${packageData.calculations.finalTotal.toFixed(2)}`,
                    details: `${packageData.calculations.totalQuantity} spots over ${packageData.weeks} week${packageData.weeks > 1 ? "s" : ""}`,
                    customData: packageData,
                  })
                  setIsModalOpen(true)
                }}
              />
            </div>
          )}
        </div>
      </section> */}

      {/* Registered Radio Listings */}
      {registeredListings.length > 0 && (
        <section className="py-12 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Registered Radio Listings</h2>
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
                    <Link href={`/media/schedule?type=RADIO&listing=${listing.id}`}>
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

      {/* Radio Stations List */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {radioStations.map((station) => (
              <Card key={station.id} className="overflow-hidden">
                <div className="grid lg:grid-cols-3 gap-6 p-6">
                  {/* Station Info */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{station.name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {station.format}
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
                        <Radio className="h-4 w-4 text-muted-foreground" />
                        <span>{station.frequency}</span>
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

      <InquiryFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} packageInfo={selectedPackage} />
    </div>
  )
}
