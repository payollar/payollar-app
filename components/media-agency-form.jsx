"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Loader2, Building2, Radio, Tv, Megaphone, Smartphone, Users, Video } from "lucide-react"
import { submitMediaAgencyForm } from "@/actions/media-agency"
import { toast } from "sonner"
import useFetch from "@/hooks/use-fetch"
import { useEffect } from "react"
import { UploadButton } from "@uploadthing/react"
import "@uploadthing/react/styles.css"

const MEDIA_TYPES = [
  { value: "TV", label: "TV Station", icon: Tv },
  { value: "RADIO", label: "Radio Station", icon: Radio },
  { value: "BILLBOARD", label: "Billboard", icon: Megaphone },
  { value: "DIGITAL", label: "Digital Platform", icon: Smartphone },
  { value: "INFLUENCER_MARKETING", label: "Influencer Marketing", icon: Users },
  { value: "VIDEO_CLIPPING", label: "Video Clipping", icon: Video },
]

export default function MediaAgencyForm() {
  const { loading, data, fn: submitForm } = useFetch(submitMediaAgencyForm)
  
  const [formData, setFormData] = useState({
    contactName: "",
    email: "",
    phone: "",
    city: "",
    region: "",
    country: "Ghana",
  })

  const [listings, setListings] = useState([])
  const [showListingForm, setShowListingForm] = useState(false)
  const [currentListing, setCurrentListing] = useState({
    listingType: "",
    name: "",
    network: "",
    location: "",
    frequency: "",
    description: "",
    reach: "",
    demographics: [],
    imageUrl: "",
    priceRange: "",
    timeSlots: [],
  })

  const [newDemographic, setNewDemographic] = useState("")
  const [newTimeSlot, setNewTimeSlot] = useState("")

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleListingChange = (field, value) => {
    setCurrentListing((prev) => ({ ...prev, [field]: value }))
  }

  const addListing = () => {
    if (!currentListing.listingType || !currentListing.name || !currentListing.location) {
      toast.error("Please fill in at least listing type, name, and location")
      return
    }

    setListings([...listings, { ...currentListing, id: Date.now() }])
    setCurrentListing({
      listingType: "",
      name: "",
      network: "",
      location: "",
      frequency: "",
      description: "",
      reach: "",
      demographics: [],
      imageUrl: "",
      priceRange: "",
      timeSlots: [],
    })
    setShowListingForm(false)
    toast.success("Media listing added")
  }

  const removeListing = (index) => {
    setListings(listings.filter((_, i) => i !== index))
  }

  const addDemographic = () => {
    if (newDemographic.trim()) {
      setCurrentListing((prev) => ({
        ...prev,
        demographics: [...prev.demographics, newDemographic.trim()],
      }))
      setNewDemographic("")
    }
  }

  const removeDemographic = (index) => {
    setCurrentListing((prev) => ({
      ...prev,
      demographics: prev.demographics.filter((_, i) => i !== index),
    }))
  }

  const addTimeSlot = () => {
    if (newTimeSlot.trim()) {
      setCurrentListing((prev) => ({
        ...prev,
        timeSlots: [...prev.timeSlots, newTimeSlot.trim()],
      }))
      setNewTimeSlot("")
    }
  }

  const removeTimeSlot = (index) => {
    setCurrentListing((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.contactName || !formData.email) {
      toast.error("Please fill in all required fields")
      return
    }

    await submitForm({
      ...formData,
      listings: listings.map(({ id, ...rest }) => rest),
    })
  }

  // Handle form submission response
  useEffect(() => {
    if (data) {
      if (data.success) {
        toast.success("Registration submitted successfully! Our team will review your submission.")
      } else if (data.error) {
        toast.error(data.error || "Failed to submit registration. Please try again.")
      }
    }
  }, [data])

  if (data?.success) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="border-emerald-500/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold">Registration Submitted Successfully!</h2>
              <p className="text-muted-foreground">
                Thank you for registering your media agency. Our team will review your submission and contact you soon.
              </p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Submit Another Registration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">Register as Media Agency</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Provide your personal details and list your media channels to start receiving booking inquiries from clients.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactName"
                  placeholder="John Doe"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange("contactName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+233 XX XXX XXXX"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Accra"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  placeholder="Greater Accra"
                  value={formData.region}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Media Listings</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Add your media channels (TV stations, radio stations, billboards, etc.)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {listings.length > 0 && (
              <div className="space-y-2">
                {listings.map((listing, index) => {
                  const Icon = MEDIA_TYPES.find((t) => t.value === listing.listingType)?.icon || Building2
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-emerald-500" />
                        <div>
                          <div className="font-medium">{listing.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {listing.listingType} • {listing.location}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeListing(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}

            {!showListingForm ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowListingForm(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Media Listing
              </Button>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Media Type <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={currentListing.listingType}
                        onValueChange={(value) => handleListingChange("listingType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select media type" />
                        </SelectTrigger>
                        <SelectContent>
                          {MEDIA_TYPES.map((type) => {
                            const Icon = type.icon
                            return (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder="Joy FM"
                        value={currentListing.name}
                        onChange={(e) => handleListingChange("name", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Network/Group</Label>
                      <Input
                        placeholder="Multimedia Group"
                        value={currentListing.network}
                        onChange={(e) => handleListingChange("network", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Location <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder="Accra, Greater Accra"
                        value={currentListing.location}
                        onChange={(e) => handleListingChange("location", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Frequency/Channel</Label>
                      <Input
                        placeholder="99.7 FM or Channel 3"
                        value={currentListing.frequency}
                        onChange={(e) => handleListingChange("frequency", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Price Range</Label>
                      <Input
                        placeholder="₵250-1,500"
                        value={currentListing.priceRange}
                        onChange={(e) => handleListingChange("priceRange", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Reach</Label>
                    <Input
                      placeholder="2M+ listeners"
                      value={currentListing.reach}
                      onChange={(e) => handleListingChange("reach", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe this media channel..."
                      rows={3}
                      value={currentListing.description}
                      onChange={(e) => handleListingChange("description", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Listing Image</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Upload an image for this media channel (station logo, billboard photo, etc.)
                    </p>
                    <UploadButton
                      endpoint="mediaAgencyImage"
                      onClientUploadComplete={(res) => {
                        try {
                          let imageUrl = null;
                          
                          if (Array.isArray(res) && res.length > 0) {
                            const file = res[0];
                            imageUrl = file?.key ? `https://utfs.io/f/${file.key}` : file?.url || file?.serverData?.url;
                          } else if (res && typeof res === 'object' && !Array.isArray(res)) {
                            imageUrl = res.key ? `https://utfs.io/f/${res.key}` : res.url || res.serverData?.url;
                          }
                          
                          if (imageUrl) {
                            handleListingChange("imageUrl", imageUrl);
                            toast.success("Image uploaded successfully");
                          } else {
                            toast.error("Upload completed but URL not found");
                          }
                        } catch (error) {
                          console.error("Error processing upload:", error);
                          toast.error("Error processing upload");
                        }
                      }}
                      onUploadError={(error) => {
                        console.error("Upload error:", error);
                        toast.error(`Upload failed: ${error.message || "Please try again."}`);
                      }}
                    />
                    {currentListing.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={currentListing.imageUrl}
                          alt="Listing preview"
                          className="w-32 h-32 rounded-lg object-cover border border-border"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Demographics</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Adults 25-54"
                        value={newDemographic}
                        onChange={(e) => setNewDemographic(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDemographic())}
                      />
                      <Button type="button" onClick={addDemographic} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {currentListing.demographics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentListing.demographics.map((demo, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {demo}
                            <button
                              type="button"
                              onClick={() => removeDemographic(index)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Available Time Slots</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Morning Drive (6AM-10AM)"
                        value={newTimeSlot}
                        onChange={(e) => setNewTimeSlot(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTimeSlot())}
                      />
                      <Button type="button" onClick={addTimeSlot} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {currentListing.timeSlots.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentListing.timeSlots.map((slot, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {slot}
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(index)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowListingForm(false)
                        setCurrentListing({
                          listingType: "",
                          name: "",
                          network: "",
                          location: "",
                          frequency: "",
                          description: "",
                          reach: "",
                          demographics: [],
                          imageUrl: "",
                          priceRange: "",
                          timeSlots: [],
                        })
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="button" onClick={addListing} className="flex-1">
                      Add Listing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Registration"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

