"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Radio, Search, MapPin, Users, Clock, Star, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import InquiryFormModal from "@/components/InquiryFormModal"
import { getHeaderImage } from "@/lib/getHeaderImage"

export default function RadioMediaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const headerImage = getHeaderImage("/products/radio-media")

  const handlePackageClick = (stationName, pkg) => {
    setSelectedPackage({
      name: `${stationName} - ${pkg.name}`,
      price: pkg.price,
      details: `${pkg.duration} • ${pkg.slots} spots`,
    })
    setIsModalOpen(true)
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
        { name: "Morning Drive Package", price: "₵1,500", duration: "60 seconds", slots: 10 },
        { name: "Afternoon Package", price: "₵1,000", duration: "60 seconds", slots: 15 },
        { name: "Weekend Bundle", price: "₵750", duration: "60 seconds", slots: 20 },
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
        { name: "Morning Show Package", price: "₵1,200", duration: "60 seconds", slots: 8 },
        { name: "Midday Mix", price: "₵800", duration: "60 seconds", slots: 12 },
        { name: "All-Day Bundle", price: "₵2,000", duration: "60 seconds", slots: 25 },
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
        { name: "Morning News Package", price: "₵1,800", duration: "60 seconds", slots: 12 },
        { name: "Talk Show Package", price: "₵1,200", duration: "60 seconds", slots: 10 },
        { name: "Weekly Bundle", price: "₵3,000", duration: "60 seconds", slots: 30 },
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
        { name: "Workday Package", price: "₵1,000", duration: "60 seconds", slots: 15 },
        { name: "Morning Package", price: "₵800", duration: "60 seconds", slots: 10 },
        { name: "Evening Special", price: "₵600", duration: "60 seconds", slots: 18 },
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
        { name: "Morning Package", price: "₵900", duration: "60 seconds", slots: 12 },
        { name: "Afternoon Package", price: "₵700", duration: "60 seconds", slots: 15 },
        { name: "Full Day Bundle", price: "₵1,800", duration: "60 seconds", slots: 35 },
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
        { name: "Morning Drive Package", price: "₵800", duration: "60 seconds", slots: 10 },
        { name: "Midday Package", price: "₵600", duration: "60 seconds", slots: 12 },
        { name: "Weekly Special", price: "₵1,500", duration: "60 seconds", slots: 28 },
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
              Connect with audiences through AM/FM radio stations nationwide
            </p>
          </div>
        </div>
      </section>

      {/* Header */}
      <section className="py-12 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-balance">Radio Advertising</h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              Connect with engaged audiences through AM/FM radio stations across Ghana. Perfect for local and regional
              campaigns.
            </p>
          </div>

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
                            <Button className="w-full" size="sm" onClick={() => handlePackageClick(station.name, pkg)}>
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
