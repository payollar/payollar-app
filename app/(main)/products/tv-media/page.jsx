"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tv, Search, MapPin, Users, Clock, Star, ArrowLeft, Eye, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import InquiryFormModal from "@/components/InquiryFormModal"
import CustomPackageBuilder from "@/components/CustomPackageBuilder"
import { MediaStationCard } from "@/components/MediaStationCard"
import { getHeaderImage } from "@/lib/getHeaderImage"
import { getActiveMediaListings, getPublishedRateCards } from "@/actions/media-agency"

export default function TVMediaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [customBuilderStationId, setCustomBuilderStationId] = useState(null)
  const [registeredListings, setRegisteredListings] = useState([])
  const [rateCards, setRateCards] = useState([])
  const headerImage = getHeaderImage("/products/tv-media")

  useEffect(() => {
    getActiveMediaListings("TV").then((result) => {
      if (result.success && result.listings?.length) {
        setRegisteredListings(result.listings)
      }
    })
    getPublishedRateCards("TV").then((result) => {
      if (result.success && result.rateCards?.length) {
        setRateCards(result.rateCards)
      }
    })
  }, [])

  const handlePackageClick = (stationName, pkg) => {
    setSelectedPackage({
      name: `${stationName} - ${pkg.name}`,
      price: pkg.price,
      details: `${pkg.duration || "30 seconds"} • ${pkg.slots ?? 0} spots`,
      mediaType: "tv",
      defaultSpots: pkg.slots ?? 0,
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

      {/* Registered TV Listings - full station card with packages */}
      {/* Rate Cards Section */}
      {rateCards.length > 0 && (
        <section className="py-12 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">TV Rate Cards</h2>
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
                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
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
            <h2 className="text-2xl font-bold mb-6">Registered TV Listings</h2>
            <div className="space-y-8">
              {registeredListings.map((listing) => (
                <MediaStationCard
                  key={listing.id}
                  listing={listing}
                  mediaType="tv"
                  onSelectPackage={handlePackageClick}
                  onCustomPackageClick={(stationId, stationName) => {
                    if (customBuilderStationId === stationId) setCustomBuilderStationId(null)
                    else setCustomBuilderStationId(stationId)
                  }}
                  showCustomBuilder={customBuilderStationId === listing.id}
                  onCustomPackageSubmit={handleCustomPackageSubmit}
                  CustomBuilderComponent={CustomPackageBuilder}
                />
              ))}
            </div>
          </div>
        </section>
      )}


      {/* Inquiry Form Modal */}
      <InquiryFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} packageInfo={selectedPackage} />
    </div>
  )
}
