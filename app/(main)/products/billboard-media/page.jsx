"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Biohazard as Billboard, Search, MapPin, Eye, Star, ArrowLeft, Car } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import InquiryFormModal from "@/components/InquiryFormModal"

export default function BillboardMediaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)

  const handlePackageClick = (locationName, pkg) => {
    setSelectedPackage({
      name: `${locationName} - ${pkg.name}`,
      price: pkg.price,
      details: pkg.duration,
    })
    setIsModalOpen(true)
  }

  const billboards = [
    {
      id: 1,
      name: "Kwame Nkrumah Circle Digital",
      type: "Digital LED",
      location: "Kwame Nkrumah Circle, Accra",
      impressions: "150K daily",
      rating: 4.9,
      size: "48' x 14'",
      priceRange: "₵15,000-40,000",
      traffic: "High Vehicle & Pedestrian",
      demographics: ["Adults 18-54", "Commuters", "Business Professionals"],
      packages: [
        { name: "1 Week Campaign", price: "₵15,000", duration: "7 days, 12 rotations/hour" },
        { name: "2 Week Campaign", price: "₵28,000", duration: "14 days, 12 rotations/hour" },
        { name: "Monthly Campaign", price: "₵50,000", duration: "30 days, 12 rotations/hour" },
      ],
    },
    {
      id: 2,
      name: "Accra Mall Premium",
      type: "Digital Billboard",
      location: "Tetteh Quarshie, Accra",
      impressions: "100K daily",
      rating: 4.8,
      size: "20' x 60'",
      priceRange: "₵12,000-35,000",
      traffic: "High Vehicle Traffic",
      demographics: ["Adults 25-54", "Shoppers", "Middle Class"],
      packages: [
        { name: "1 Week Campaign", price: "₵12,000", duration: "7 days, 10 rotations/hour" },
        { name: "2 Week Campaign", price: "₵22,000", duration: "14 days, 10 rotations/hour" },
        { name: "Monthly Campaign", price: "₵40,000", duration: "30 days, 10 rotations/hour" },
      ],
    },
    {
      id: 3,
      name: "Kumasi Central Market",
      type: "Static Billboard",
      location: "Kejetia, Kumasi",
      impressions: "80K daily",
      rating: 4.7,
      size: "14' x 48'",
      priceRange: "₵8,000-22,000",
      traffic: "High Pedestrian & Vehicle",
      demographics: ["Adults 18-54", "Traders", "Shoppers"],
      packages: [
        { name: "1 Month Rental", price: "₵8,000", duration: "30 days" },
        { name: "3 Month Rental", price: "₵22,000", duration: "90 days" },
        { name: "6 Month Rental", price: "₵40,000", duration: "180 days" },
      ],
    },
    {
      id: 4,
      name: "Tema Motorway Digital",
      type: "Digital LED",
      location: "Tema Motorway, Accra",
      impressions: "120K daily",
      rating: 4.8,
      size: "48' x 14'",
      priceRange: "₵10,000-30,000",
      traffic: "High Vehicle Traffic",
      demographics: ["Adults 25-54", "Commuters"],
      packages: [
        { name: "1 Week Campaign", price: "₵10,000", duration: "7 days, 10 rotations/hour" },
        { name: "2 Week Campaign", price: "₵18,000", duration: "14 days, 10 rotations/hour" },
        { name: "Monthly Campaign", price: "₵32,000", duration: "30 days, 10 rotations/hour" },
      ],
    },
    {
      id: 5,
      name: "Spintex Road Premium",
      type: "Static Billboard",
      location: "Spintex Road, Accra",
      impressions: "60K daily",
      rating: 4.6,
      size: "14' x 48'",
      priceRange: "₵6,000-18,000",
      traffic: "Vehicle Traffic",
      demographics: ["Adults 25-54", "Residents", "Commuters"],
      packages: [
        { name: "1 Month Rental", price: "₵6,000", duration: "30 days" },
        { name: "3 Month Rental", price: "₵16,000", duration: "90 days" },
        { name: "6 Month Rental", price: "₵30,000", duration: "180 days" },
      ],
    },
    {
      id: 6,
      name: "Takoradi Harbour Road",
      type: "Static Billboard",
      location: "Harbour Road, Takoradi",
      impressions: "45K daily",
      rating: 4.5,
      size: "14' x 48'",
      priceRange: "₵5,000-15,000",
      traffic: "Vehicle Traffic",
      demographics: ["Adults 18-54", "Port Workers", "Commuters"],
      packages: [
        { name: "1 Month Rental", price: "₵5,000", duration: "30 days" },
        { name: "3 Month Rental", price: "₵13,000", duration: "90 days" },
        { name: "6 Month Rental", price: "₵24,000", duration: "180 days" },
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
                <Billboard className="h-6 w-6 text-orange-500" />
                <span className="text-lg font-semibold">Billboard Media</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-12 bg-gradient-to-r from-orange-500/10 to-red-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-balance">Billboard Advertising</h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              Make a bold statement with outdoor advertising in high-traffic locations across Ghana. From digital
              displays to traditional billboards.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search locations..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  <SelectItem value="accra">Accra</SelectItem>
                  <SelectItem value="kumasi">Kumasi</SelectItem>
                  <SelectItem value="takoradi">Takoradi</SelectItem>
                  <SelectItem value="tamale">Tamale</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="digital">Digital LED</SelectItem>
                  <SelectItem value="static">Static Billboard</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Budget</SelectItem>
                  <SelectItem value="low">Under ₵10,000</SelectItem>
                  <SelectItem value="mid">₵10,000 - ₵30,000</SelectItem>
                  <SelectItem value="high">₵30,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Billboards List */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {billboards.map((billboard) => (
              <Card key={billboard.id} className="overflow-hidden">
                <div className="grid lg:grid-cols-3 gap-6 p-6">
                  {/* Billboard Info */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{billboard.name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {billboard.type}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{billboard.rating}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{billboard.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Billboard className="h-4 w-4 text-muted-foreground" />
                        <span>{billboard.size}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span>{billboard.impressions}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span>{billboard.traffic}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Target Demographics:</div>
                      <div className="flex flex-wrap gap-1">
                        {billboard.demographics.map((demo, index) => (
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
                      {billboard.packages.map((pkg, index) => (
                        <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{pkg.name}</CardTitle>
                            <div className="text-2xl font-bold text-primary">{pkg.price}</div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="text-sm text-muted-foreground">{pkg.duration}</div>
                            <Button
                              className="w-full"
                              size="sm"
                              onClick={() => handlePackageClick(billboard.name, pkg)}
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

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Locations
            </Button>
          </div>
        </div>
      </section>

      <InquiryFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} packageInfo={selectedPackage} />
    </div>
  )
}
