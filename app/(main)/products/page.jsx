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
                      <span className="text-muted-foreground">Starting Price:</span>
                      <span className="font-medium">₵2,500/spot</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Reach:</span>
                      <span className="font-medium">50K-2M</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-transparent" variant="outline">
                    Buy TV Media
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
                      <span className="text-muted-foreground">Starting Price:</span>
                      <span className="font-medium">₵250/spot</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Reach:</span>
                      <span className="font-medium">10K-500K</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-transparent" variant="outline">
                    Buy Radio Media
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Billboard Media (Coming soon) */}
            <Card className="h-full transition-all group overflow-hidden opacity-90">
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src="/billboard.jpg"
                    alt="Billboard Media"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <Badge className="border-0 bg-white/15 text-white backdrop-blur-md">
                      Coming soon
                    </Badge>
                  </div>
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
                      <span className="text-muted-foreground">Starting Price:</span>
                      <span className="font-medium">₵8,000/month</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Daily Impressions:</span>
                      <span className="font-medium">5K-100K</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-transparent" variant="outline" disabled>
                    Coming soon
                  </Button>
                </CardContent>
              </Card>
            

            {/* Digital Media / Influencer Marketing / Video Clipping hidden for now */}
          </div>
        </div>
      </section>
    </div>
  )
}
