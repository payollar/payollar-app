"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Clock,
  Users,
  Target,
  DollarSign,
  ArrowRight,
  Check,
  Tv,
  Radio,
  Smartphone,
  Biohazard as Billboard,
  Building2,
  MapPin,
  Video,
} from "lucide-react"
import Link from "next/link"
import { getHeaderImage } from "@/lib/getHeaderImage"
import CustomPackageBuilder from "@/components/CustomPackageBuilder"
import InquiryFormModal from "@/components/InquiryFormModal"
import { getActiveMediaListings } from "@/actions/media-agency"

export default function ScheduleMediaPage() {
  const searchParams = useSearchParams()
  const headerImage = getHeaderImage("/media")
  const [selectedMediaType, setSelectedMediaType] = useState(null)
  const [selectedStation, setSelectedStation] = useState(null)
  const [mediaListings, setMediaListings] = useState([])
  const [filteredListings, setFilteredListings] = useState([])
  const [isLoadingListings, setIsLoadingListings] = useState(true)
  const [showCustomBuilder, setShowCustomBuilder] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    mediaType: "",
    listingId: "",
    startDate: "",
    endDate: "",
    budget: "",
    targetAudience: "",
    message: "",
  })

  // Fetch media listings on component mount
  useEffect(() => {
    async function fetchListings() {
      setIsLoadingListings(true)
      try {
        const result = await getActiveMediaListings()
        if (result.success) {
          setMediaListings(result.listings || [])
          setFilteredListings(result.listings || [])
        }
      } catch (error) {
        console.error("Error fetching media listings:", error)
      } finally {
        setIsLoadingListings(false)
      }
    }
    fetchListings()
  }, [])

  // Filter listings when media type is selected
  useEffect(() => {
    if (selectedMediaType) {
      const filtered = mediaListings.filter(
        listing => listing.listingType.toLowerCase() === selectedMediaType.toLowerCase()
      )
      setFilteredListings(filtered)
    } else {
      setFilteredListings(mediaListings)
    }
  }, [selectedMediaType, mediaListings])

  // Pre-select type and listing from URL (?type=TV&listing=id)
  useEffect(() => {
    const typeParam = searchParams.get("type")
    const listingIdParam = searchParams.get("listing")
    if (!typeParam || !listingIdParam || mediaListings.length === 0) return
    const listing = mediaListings.find(
      (l) => l.id === listingIdParam && (l.listingType || "").toLowerCase() === typeParam.toLowerCase()
    )
    if (listing) {
      setSelectedMediaType(listing.listingType)
      setSelectedStation(listing)
      setFormData((prev) => ({
        ...prev,
        mediaType: listing.listingType,
        listingId: listing.id,
      }))
    }
  }, [searchParams, mediaListings])

  const mediaTypes = [
    { id: "RADIO", name: "Radio Media", icon: Radio, description: "Radio spots and promotions" },
    { id: "TV", name: "TV Media", icon: Tv, description: "Television commercials and spots" },
    { id: "DIGITAL", name: "Digital Media", icon: Smartphone, description: "Social media, search ads, video ads" },
    { id: "BILLBOARD", name: "Billboard Media", icon: Billboard, description: "Outdoor advertising and billboards" },
    { id: "INFLUENCER_MARKETING", name: "Influencer Marketing", icon: Users, description: "Social media influencers and creators" },
    { id: "VIDEO_CLIPPING", name: "Video Clipping", icon: Video, description: "Video editing and clipping services" },
  ]

  const getMediaTypeIcon = (type) => {
    const mediaType = mediaTypes.find(mt => mt.id === type)
    return mediaType?.icon || Building2
  }

  const handleMediaTypeSelect = (typeId) => {
    setSelectedMediaType(typeId)
    setSelectedStation(null)
    handleInputChange("mediaType", typeId)
  }

  const handleStationSelect = (station) => {
    setSelectedStation(station)
    handleInputChange("listingId", station.id)
    handleInputChange("mediaType", station.listingType)
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  const handlePackageSubmit = (packageData) => {
    // Handle custom package submission
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold">
              Schedule Custom Media
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create a customized media campaign tailored to your specific needs, budget, and target audience.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {!showCustomBuilder ? (
              <>
                {/* Step 1: Media Type Selection */}
                {!selectedMediaType && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Step 1: Select Media Type</CardTitle>
                      <CardDescription>Choose the type of media you want to schedule</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {mediaTypes.map((type) => {
                          const Icon = type.icon
                          const count = mediaListings.filter(l => l.listingType === type.id).length
                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => handleMediaTypeSelect(type.id)}
                              className="p-4 rounded-lg border-2 transition-all text-left border-border hover:border-primary/50 hover:bg-primary/5"
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{type.name}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {type.description}
                                  </p>
                                  {count > 0 && (
                                    <p className="text-xs text-primary mt-1 font-medium">
                                      {count} station{count !== 1 ? 's' : ''} available
                                    </p>
                                  )}
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Station Selection */}
                {selectedMediaType && !selectedStation && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Step 2: Select Station</CardTitle>
                          <CardDescription>
                            Choose a station from {mediaTypes.find(mt => mt.id === selectedMediaType)?.name}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMediaType(null)
                            setSelectedStation(null)
                            handleInputChange("mediaType", "")
                            handleInputChange("listingId", "")
                          }}
                        >
                          Change Type
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingListings ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="text-sm text-muted-foreground mt-4">Loading stations...</p>
                        </div>
                      ) : filteredListings.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="font-medium">No stations available</p>
                          <p className="text-sm">No active stations found for this media type</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filteredListings.map((listing) => {
                            const Icon = getMediaTypeIcon(listing.listingType)
                            return (
                              <button
                                key={listing.id}
                                type="button"
                                onClick={() => handleStationSelect(listing)}
                                className="w-full p-4 rounded-lg border-2 transition-all text-left border-border hover:border-primary hover:bg-primary/5"
                              >
                                <div className="flex items-start gap-4">
                                  <div className="p-3 rounded-lg bg-primary/10">
                                    <Icon className="h-6 w-6 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold">{listing.name}</h3>
                                      {listing.network && (
                                        <Badge variant="outline" className="text-xs">
                                          {listing.network}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      {listing.location && (
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-4 w-4" />
                                          <span>{listing.location}</span>
                                        </div>
                                      )}
                                      {listing.frequency && (
                                        <div className="flex items-center gap-1">
                                          <Radio className="h-4 w-4" />
                                          <span>{listing.frequency}</span>
                                        </div>
                                      )}
                                    </div>
                                    {listing.reach && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Reach: {listing.reach}
                                      </p>
                                    )}
                                    {listing.priceRange && (
                                      <p className="text-sm font-medium text-primary mt-2">
                                        {listing.priceRange}
                                      </p>
                                    )}
                                  </div>
                                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Step 3: Scheduling Form - Only show after station is selected */}
                {selectedStation && (
                  <>

                    {/* Selected Station Info */}
                    <Card className="bg-primary/5 border-primary/20">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Check className="h-5 w-5 text-primary" />
                              Selected Station
                            </CardTitle>
                            <CardDescription>
                              {selectedStation.name} • {selectedStation.location}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedStation(null)
                              handleInputChange("listingId", "")
                            }}
                          >
                            Change Station
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Step 3: Contact Information</CardTitle>
                        <CardDescription>Tell us about yourself and your project</CardDescription>
                      </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+233 XX XXX XXXX"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company/Organization</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleInputChange("company", e.target.value)}
                          placeholder="Company Name"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                    {/* Campaign Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Campaign Details</CardTitle>
                        <CardDescription>Provide details about your media campaign</CardDescription>
                      </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange("startDate", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange("endDate", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget Range</Label>
                      <Select
                        value={formData.budget}
                        onValueChange={(value) => handleInputChange("budget", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-5k">Under ₵5,000</SelectItem>
                          <SelectItem value="5k-10k">₵5,000 - ₵10,000</SelectItem>
                          <SelectItem value="10k-25k">₵10,000 - ₵25,000</SelectItem>
                          <SelectItem value="25k-50k">₵25,000 - ₵50,000</SelectItem>
                          <SelectItem value="50k-100k">₵50,000 - ₵100,000</SelectItem>
                          <SelectItem value="over-100k">Over ₵100,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetAudience">Target Audience</Label>
                      <Input
                        id="targetAudience"
                        value={formData.targetAudience}
                        onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                        placeholder="e.g., Young adults 18-35, Urban professionals"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Additional Details</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Tell us more about your campaign goals, specific requirements, or any questions..."
                        rows={5}
                      />
                    </div>
                  </CardContent>
                </Card>

                    {/* Actions */}
                    <div className="flex gap-4">
                      <Button onClick={handleSubmit} size="lg" disabled={!selectedStation}>
                        Submit Inquiry
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="lg"
                        variant="outline"
                        className="flex-1 text-lg py-6"
                        onClick={() => setShowCustomBuilder(true)}
                        disabled={!selectedStation}
                      >
                        Build Custom Package
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Custom Package Builder</CardTitle>
                      <CardDescription>
                        Build a custom media package tailored to your needs
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCustomBuilder(false)}
                    >
                      Back to Form
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedStation ? (
                    <CustomPackageBuilder
                      mediaType={selectedStation.listingType.toLowerCase()}
                      stationId={selectedStation.id}
                      stationName={selectedStation.name}
                      onPackageSubmit={handlePackageSubmit}
                      timeClasses={selectedStation.timeClasses}
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Please select a station first</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Why Schedule Custom Media?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Targeted Reach</p>
                    <p className="text-sm text-muted-foreground">
                      Reach your exact target audience with precision targeting
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Budget Flexibility</p>
                    <p className="text-sm text-muted-foreground">
                      Work within your budget with customizable packages
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Flexible Scheduling</p>
                    <p className="text-sm text-muted-foreground">
                      Choose dates and times that work for your campaign
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Expert Support</p>
                    <p className="text-sm text-muted-foreground">
                      Get guidance from our media experts throughout the process
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Submit Your Request</p>
                    <p className="text-sm text-muted-foreground">
                      Fill out the form with your campaign details
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">We Review & Propose</p>
                    <p className="text-sm text-muted-foreground">
                      Our team reviews your needs and creates a custom proposal
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Approve & Launch</p>
                    <p className="text-sm text-muted-foreground">
                      Review the proposal, approve, and we launch your campaign
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Inquiry Modal */}
      <InquiryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageName="Custom Media Package"
        packagePrice={null}
        packageDetails="Custom media campaign"
      />
    </div>
  )
}
