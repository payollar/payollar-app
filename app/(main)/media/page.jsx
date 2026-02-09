import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Tv,
  Radio,
  Biohazard as Billboard,
  Smartphone,
  Upload,
  BarChart3,
  Search,
  Calendar,
  Zap,
  MapPin,
  DollarSign,
  Users,
} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { getHeaderImage } from "@/lib/getHeaderImage"
import { getActiveMediaListings, getPublishedRateCards } from "@/actions/media-agency"
import { MediaListingsGrid } from "./_components/media-listings-grid"

export default async function MediaPage() {
  const headerImage = getHeaderImage("/media")

  const { success, listings = [] } = await getActiveMediaListings()
  const listingsByType = (success && Array.isArray(listings))
    ? listings.reduce((acc, listing) => {
        const type = listing.listingType || "OTHER"
        if (!acc[type]) acc[type] = []
        acc[type].push(listing)
        return acc
      }, {})
    : {}
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      {/* <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Media</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>

              <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How it Works
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/products">
                <Button>Browse Media Services</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav> */}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Zap className="h-3 w-3 mr-1" />
                  All Media Channels
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-balance">
                  Connect with every media channel
                  <span className="text-primary">.</span>
                </h1>
                <p className="text-xl text-muted-foreground text-pretty max-w-2xl">
                  Your complete advertising platform for TV, radio, billboard, social media, and digital campaigns.
                  Discover, book, and manage all your media advertising in one place.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="w-full sm:w-auto">
                    Explore Media Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                    See How It Works
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 bg-card/50 backdrop-blur">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">100+</div>
                    <div className="text-sm text-muted-foreground">Media Partners</div>
                  </div>
                </Card>
                <Card className="p-6 bg-card/50 backdrop-blur">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">98%</div>
                    <div className="text-sm text-muted-foreground">Booking Success</div>
                  </div>
                </Card>
                <Card className="p-6 bg-card/50 backdrop-blur">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">$100k+</div>
                    <div className="text-sm text-muted-foreground">Ad Spend Managed</div>
                  </div>
                </Card>
                <Card className="p-6 bg-card/50 backdrop-blur">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm text-muted-foreground">Support</div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* <section className="relative h-64 md:h-80 w-full">
        <img
          src={headerImage}
          alt="Media Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            Media Channels
          </h1>
        </div>
      </section> */}

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

      {/* Media Agency Registration CTA */}
      <section className="py-12 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border border-emerald-500/20 rounded-lg p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Zap className="h-3 w-3 mr-1" />
                  For Media Agencies
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold">List Your Media Channels</h2>
                <p className="text-muted-foreground text-lg">
                  Join our platform as a media agency and start receiving booking inquiries from clients. 
                  List your TV stations, radio channels, billboards, and digital platforms in one place.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    Reach thousands of potential clients
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    Monitor booking inquiries and performance
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    Manage all your media listings in one dashboard
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-4">
                <Link href="/media/register">
                  <Button size="lg" className="w-full text-lg h-14">
                    Register Your Agency
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground text-center">
                  Free registration • Verified agencies only • Start receiving bookings immediately
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Media Services Grid - shows registered listings by type */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Browse Media Services</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Registered listings appear in their respective media sections below. Click a listing to schedule or view more.
            </p>
          </div>
          <MediaListingsGrid listingsByType={listingsByType} />
        </div>
      </section>

      

      {/* Features Section */}
      {/* <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Everything you need for media advertising</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              From discovery to analytics, manage all your advertising campaigns across every media channel.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Discovery</h3>
              <p className="text-muted-foreground text-sm">
                Find the perfect media channels based on audience, location, and budget.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Booking</h3>
              <p className="text-muted-foreground text-sm">
                Book ad slots instantly across TV, radio, billboard, and digital platforms.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Creative Management</h3>
              <p className="text-muted-foreground text-sm">
                Upload and manage all your creative assets with version control.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Unified Analytics</h3>
              <p className="text-muted-foreground text-sm">
                Track performance across all channels with comprehensive reporting.
              </p>
            </Card>
          </div>
        </div>
      </section> */}

      {/* How It Works
      <section id="how-it-works" className="py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">How MediaConnect works</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              Three simple steps to launch your multi-channel advertising campaign.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto text-primary-foreground font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold">Browse & Select</h3>
              <p className="text-muted-foreground">
                Explore our comprehensive catalog of TV stations, radio networks, billboards, and digital platforms to
                find your ideal media mix.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto text-primary-foreground font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold">Book & Launch</h3>
              <p className="text-muted-foreground">
                Choose your packages, upload creative assets, and launch your campaigns across multiple channels with
                streamlined booking.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto text-primary-foreground font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold">Monitor & Optimize</h3>
              <p className="text-muted-foreground">
                Track performance across all channels with unified analytics and optimize your campaigns for maximum
                ROI.
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Trusted by marketing teams</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <CardContent className="p-0 space-y-4">
                <p className="text-muted-foreground">
                  "payollar revolutionized our advertising strategy. Managing TV, radio, and digital campaigns from
                  one platform saved us countless hours."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">SM</span>
                  </div>
                  <div>
                    <div className="font-semibold">Sarah Martinez</div>
                    <div className="text-sm text-muted-foreground">Marketing Director, TechCorp</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent className="p-0 space-y-4">
                <p className="text-muted-foreground">
                  "The unified analytics dashboard gives us insights across all our media channels. Our cross-platform
                  ROI improved by 60%."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">MJ</span>
                  </div>
                  <div>
                    <div className="font-semibold">Michael Johnson</div>
                    <div className="text-sm text-muted-foreground">CMO, RetailPlus</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent className="p-0 space-y-4">
                <p className="text-muted-foreground">
                  "As a media company, payollar has streamlined our inventory management and significantly increased
                  our booking efficiency."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">DW</span>
                  </div>
                  <div>
                    <div className="font-semibold">David Wilson</div>
                    <div className="text-sm text-muted-foreground">Operations Manager, MediaGroup</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

       {/* Featured Services */}
      <section className="py-24 bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Choose Your Media Channel</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              From traditional broadcast to digital platforms, find the perfect media mix for your campaign.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link href="/products/tv-media">
              <Card className="p-6 text-center hover:shadow-lg transition-all cursor-pointer group">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Tv className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">TV Media</h3>
                <p className="text-muted-foreground text-sm">
                  Reach millions with television advertising across local and national networks.
                </p>
                <div className="mt-4 text-primary text-sm font-medium">View TV Stations →</div>
              </Card>
            </Link>
            <Link href="/products/radio-media">
              <Card className="p-6 text-center hover:shadow-lg transition-all cursor-pointer group">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Radio className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Radio Media</h3>
                <p className="text-muted-foreground text-sm">
                  Connect with audiences through AM/FM radio stations nationwide.
                </p>
                <div className="mt-4 text-primary text-sm font-medium">View Radio Stations →</div>
              </Card>
            </Link>
            <Link href="/products/billboard-media">
              <Card className="p-6 text-center hover:shadow-lg transition-all cursor-pointer group">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Billboard className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Billboard Media</h3>
                <p className="text-muted-foreground text-sm">
                  High-impact outdoor advertising in prime locations across cities.
                </p>
                <div className="mt-4 text-primary text-sm font-medium">View Billboards →</div>
              </Card>
            </Link>
            <Link href="/products/digital-media">
              <Card className="p-6 text-center hover:shadow-lg transition-all cursor-pointer group">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Smartphone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Digital Media</h3>
                <p className="text-muted-foreground text-sm">
                  Social media, streaming, and online advertising platforms.
                </p>
                <div className="mt-4 text-primary text-sm font-medium">View Digital Options →</div>
              </Card>
            </Link>
          </div>
        </div>
      </section>



      {/* Featured Packages */}
      <section className="py-16 bg">
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
    
      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Payollar</span>
              </div>
              <p className="text-muted-foreground text-sm">
                The complete platform for multi-channel advertising management.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Services</h4>
              <div className="space-y-2 text-sm">
                <Link
                  href="/products/tv-media"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  TV Media
                </Link>
                <Link
                  href="/products/radio-media"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Radio Media
                </Link>
                <Link
                  href="/products/billboard-media"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Billboard Media
                </Link>
                <Link
                  href="/products/digital-media"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Digital Media
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <div className="space-y-2 text-sm">
                <Link href="/about" className="block text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
                <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
                <Link href="/careers" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <div className="space-y-2 text-sm">
                <Link href="/help" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
                <Link href="/products" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Browse Services
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 payollar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
