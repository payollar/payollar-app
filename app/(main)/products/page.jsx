import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Users, DollarSign } from "lucide-react"
import Link from "next/link"

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      {/* <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">MC</span>
              </div>
              <span className="text-xl font-bold">MediaConnect</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/products" className="text-foreground font-medium">
                Products
              </Link>
            </div>
          </div>
        </div>
      </nav> */}

      {/* Header */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-balance">Browse Media Services</h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              Discover the perfect advertising channels for your campaign. From traditional broadcast to cutting-edge
              digital platforms.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by location, audience, or media type..." className="pl-10 h-12" />
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                <MapPin className="h-3 w-3 mr-1" />
                All Locations
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                <Users className="h-3 w-3 mr-1" />
                All Demographics
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                <DollarSign className="h-3 w-3 mr-1" />
                Any Budget
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Media Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* TV Media */}
            <Link href="/products/tv-media">
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer group overflow-hidden">
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src="/tv-media.jpg"
                    alt="TV Media"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white text-2xl font-bold">TV Media</h3>
                  </div>
                </div>
                <CardContent className="space-y-4 pt-4">
                  <p className="text-muted-foreground text-sm">
                    Reach millions with television advertising across local and national networks.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Available Networks:</span>
                      <span className="font-medium">50+</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Starting Price:</span>
                      <span className="font-medium">₵2,500/spot</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Reach:</span>
                      <span className="font-medium">50K-2M</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-transparent" variant="outline">
                    View TV Stations
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Radio Media */}
            <Link href="/products/radio-media">
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer group overflow-hidden">
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src="/radio-media.jpg"
                    alt="Radio Media"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white text-2xl font-bold">Radio Media</h3>
                  </div>
                </div>
                <CardContent className="space-y-4 pt-4">
                  <p className="text-muted-foreground text-sm">
                    Connect with audiences through AM/FM radio stations nationwide.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Available Stations:</span>
                      <span className="font-medium">100+</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Starting Price:</span>
                      <span className="font-medium">₵250/spot</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Reach:</span>
                      <span className="font-medium">10K-500K</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-transparent" variant="outline">
                    View Radio Stations
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Billboard Media */}
            <Link href="/products/billboard-media">
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer group overflow-hidden">
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src="/billboard.jpg"
                    alt="Billboard Media"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white text-2xl font-bold">Billboard Media</h3>
                  </div>
                </div>
                <CardContent className="space-y-4 pt-4">
                  <p className="text-muted-foreground text-sm">
                    High-impact outdoor advertising in prime locations across cities.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Available Locations:</span>
                      <span className="font-medium">200+</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Starting Price:</span>
                      <span className="font-medium">₵8,000/month</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Daily Impressions:</span>
                      <span className="font-medium">5K-100K</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-transparent" variant="outline">
                    View Billboards
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Digital Media */}
            <Link href="/products/digital-media">
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer group overflow-hidden">
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src="/social-media2.jpg"
                    alt="Digital Media"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white text-2xl font-bold">Digital Media</h3>
                  </div>
                </div>
                <CardContent className="space-y-4 pt-4">
                  <p className="text-muted-foreground text-sm">
                    Social media, streaming, and online advertising platforms.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platforms:</span>
                      <span className="font-medium">15+</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Starting Price:</span>
                      <span className="font-medium">₵500/campaign</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Targeting Options:</span>
                      <span className="font-medium">Advanced</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-transparent" variant="outline">
                    View Digital Options
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Influencer Marketing */}
            <Link href="/products/influencer-marketing">
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer group overflow-hidden">
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src="/radio.jpeg"
                    alt="Influencer Marketing"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white text-2xl font-bold">Influencer Marketing</h3>
                  </div>
                </div>
                <CardContent className="space-y-4 pt-4">
                  <p className="text-muted-foreground text-sm">
                    Partner with top influencers to reach engaged audiences authentically.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Available Influencers:</span>
                      <span className="font-medium">500+</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Starting Price:</span>
                      <span className="font-medium">₵1,000/post</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Engagement:</span>
                      <span className="font-medium">5K-500K</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-transparent" variant="outline">
                    View Influencers
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Video Clipping */}
            <Link href="/products/video-clipping">
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer group overflow-hidden">
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src="/clipping.jpg"
                    alt="Video Clipping"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white text-2xl font-bold">Video Clipping</h3>
                  </div>
                </div>
                <CardContent className="space-y-4 pt-4">
                  <p className="text-muted-foreground text-sm">
                    Professional video editing and clipping services for all platforms.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Turnaround Time:</span>
                      <span className="font-medium">24-48 hrs</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Starting Price:</span>
                      <span className="font-medium">₵300/video</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Formats:</span>
                      <span className="font-medium">All Platforms</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-transparent" variant="outline">
                    View Packages
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Popular Package Deals</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              Save more with our curated multi-channel advertising packages.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">Most Popular</Badge>
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl">Multi-Channel Starter</CardTitle>
                <div className="text-3xl font-bold mt-2">
                  ₵12,000<span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>5 Radio Stations
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>2 TV Networks
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    Digital Campaign Setup
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    Basic Analytics
                  </li>
                </ul>
                <Button className="w-full">Get Started</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Premium Mix</CardTitle>
                <div className="text-3xl font-bold mt-2">
                  ₵35,000<span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    15 Radio Stations
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>5 TV Networks
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>3 Billboard Locations
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    Advanced Digital Campaigns
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    Premium Analytics
                  </li>
                </ul>
                <Button className="w-full bg-transparent" variant="outline">
                  Choose Plan
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="text-3xl font-bold mt-2">
                  Custom<span className="text-lg font-normal text-muted-foreground"> pricing</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    Unlimited Channels
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    National Coverage
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    Dedicated Account Manager
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    Custom Analytics Dashboard
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    24/7 Priority Support
                  </li>
                </ul>
                <Button className="w-full bg-transparent" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
