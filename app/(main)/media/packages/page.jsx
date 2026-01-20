"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tv,
  Radio,
  Biohazard as Billboard,
  Smartphone,
  Users,
  Clock,
  Star,
  Check,
  ArrowRight,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { getHeaderImage } from "@/lib/getHeaderImage"

export default function MediaPackagesPage() {
  const headerImage = getHeaderImage("/media")

  const mediaTypes = [
    {
      id: "tv",
      name: "TV Media",
      icon: Tv,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      packages: [
        {
          name: "Prime Time Package",
          price: "₵15,000",
          duration: "30 seconds",
          slots: 5,
          estimatedReach: "2.5M+ viewers",
          features: ["Prime time slots", "High viewership", "Multiple channels"],
          rating: 4.9,
        },
        {
          name: "Daytime Package",
          price: "₵8,000",
          duration: "30 seconds",
          slots: 10,
          estimatedReach: "1.8M+ viewers",
          features: ["Daytime slots", "Cost-effective", "Wide reach"],
          rating: 4.7,
        },
        {
          name: "Weekend Special",
          price: "₵12,000",
          duration: "60 seconds",
          slots: 3,
          estimatedReach: "2.2M+ viewers",
          features: ["Weekend slots", "Extended duration", "Premium placement"],
          rating: 4.8,
        },
      ],
    },
    {
      id: "radio",
      name: "",
      icon: Radio,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      packages: [
        {
          name: "Morning Drive Package",
          price: "₵5,000",
          duration: "30 seconds",
          slots: 7,
          estimatedReach: "1.5M+ listeners",
          features: ["Morning slots", "Rush hour coverage", "High listenership"],
          rating: 4.8,
        },
        {
          name: "Afternoon Package",
          price: "₵3,500",
          duration: "30 seconds",
          slots: 10,
          estimatedReach: "1.2M+ listeners",
          features: ["Afternoon slots", "Steady audience", "Affordable"],
          rating: 4.6,
        },
        {
          name: "Evening Package",
          price: "₵4,500",
          duration: "30 seconds",
          slots: 8,
          estimatedReach: "1.3M+ listeners",
          features: ["Evening slots", "Prime time", "Great value"],
          rating: 4.7,
        },
      ],
    },
    {
      id: "digital",
      name: "Digital Media",
      icon: Smartphone,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      packages: [
        {
          name: "Social Media Bundle",
          price: "₵2,500",
          duration: "1 month",
          slots: 20,
          estimatedReach: "500K+ impressions",
          features: ["Facebook, Instagram, Twitter", "Targeted ads", "Analytics"],
          rating: 4.9,
        },
        {
          name: "Search Engine Package",
          price: "₵1,800",
          duration: "1 month",
          slots: 15,
          estimatedReach: "300K+ impressions",
          features: ["Google Ads", "SEO optimization", "Performance tracking"],
          rating: 4.7,
        },
        {
          name: "Video Ads Package",
          price: "₵3,200",
          duration: "1 month",
          slots: 10,
          estimatedReach: "800K+ views",
          features: ["YouTube ads", "Video production", "Multi-platform"],
          rating: 4.8,
        },
      ],
    },
    {
      id: "billboard",
      name: "Billboard Media",
      icon: Billboard,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      packages: [
        {
          name: "Prime Location",
          price: "₵20,000",
          duration: "1 month",
          slots: 1,
          estimatedReach: "200K+ daily views",
          features: ["High-traffic location", "24/7 visibility", "Premium placement"],
          rating: 4.9,
        },
        {
          name: "Standard Location",
          price: "₵12,000",
          duration: "1 month",
          slots: 1,
          estimatedReach: "120K+ daily views",
          features: ["Good visibility", "Strategic placement", "Cost-effective"],
          rating: 4.6,
        },
        {
          name: "Multi-Location Package",
          price: "₵50,000",
          duration: "1 month",
          slots: 3,
          estimatedReach: "600K+ daily views",
          features: ["Multiple locations", "Maximum reach", "Bulk discount"],
          rating: 4.8,
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold">
              Media Packages
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from our curated packages across TV, Radio, Digital, and Billboard media.
              All packages are designed to maximize your reach and ROI.
            </p>
          </div>
        </div>
      </section>

      {/* Packages by Media Type */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Tabs defaultValue="tv" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            {mediaTypes.map((type) => {
              const Icon = type.icon
              return (
                <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {type.name}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {mediaTypes.map((type) => {
            const Icon = type.icon
            return (
              <TabsContent key={type.id} value={type.id} className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-lg ${type.bgColor}`}>
                    <Icon className={`h-6 w-6 ${type.color}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{type.name} Packages</h2>
                    <p className="text-muted-foreground">Select a package that fits your needs</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {type.packages.map((pkg, index) => (
                    <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-xl">{pkg.name}</CardTitle>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{pkg.rating}</span>
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-primary">{pkg.price}</div>
                        <CardDescription className="flex flex-col gap-2 mt-2">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {pkg.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {pkg.slots} {pkg.slots === 1 ? "slot" : "slots"}
                            </span>
                          </div>
                          {pkg.estimatedReach && (
                            <span className="flex items-center gap-1 text-primary font-medium">
                              <Eye className="h-4 w-4" />
                              {pkg.estimatedReach}
                            </span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Features:</p>
                          <ul className="space-y-1">
                            {pkg.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="h-4 w-4 text-primary" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Link href={`/products/${type.id}-media`}>
                          <Button className="w-full" size="sm">
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>

        {/* Custom Package CTA */}
        <div className="mt-16">
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-8 text-center space-y-4">
              <h3 className="text-2xl font-bold">Need a Custom Package?</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our team can create a tailored media package that perfectly fits your budget and goals.
              </p>
              <Link href="/media/schedule">
                <Button size="lg" className="mt-4">
                  Schedule Custom Media
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
