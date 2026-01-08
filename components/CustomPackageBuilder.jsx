"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, Calculator, Trash2, Plus, Minus } from "lucide-react"
import InquiryFormModal from "@/components/InquiryFormModal"

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

// Digital media segments with rates (similar to radio package structure)
const DIGITAL_SEGMENTS = [
  {
    id: "social_media_postings",
    name: "Social Media Postings",
    type: "POST",
    rate: 150.0,
    description: "Facebook, Instagram, Twitter posts",
  },
  {
    id: "facebook_ads",
    name: "Facebook Ads",
    type: "AD",
    rate: 512.0,
    description: "Sponsored posts and carousel ads",
  },
  {
    id: "instagram_ads",
    name: "Instagram Ads",
    type: "AD",
    rate: 450.0,
    description: "Feed, Stories, and Reels ads",
  },
  {
    id: "youtube_ads",
    name: "YouTube Ads",
    type: "AD",
    rate: 324.0,
    description: "Skippable and non-skippable video ads",
  },
  {
    id: "google_search_ads",
    name: "Google Search Ads",
    type: "AD",
    rate: 231.0,
    description: "Search engine marketing",
  },
  {
    id: "linkedin_ads",
    name: "LinkedIn Ads",
    type: "AD",
    rate: 380.0,
    description: "B2B targeting and sponsored content",
  },
  {
    id: "tiktok_ads",
    name: "TikTok Ads",
    type: "AD",
    rate: 420.0,
    description: "In-feed and brand takeover ads",
  },
  {
    id: "email_campaigns",
    name: "Email Campaigns",
    type: "CAMPAIGN",
    rate: 200.0,
    description: "Newsletter and promotional emails",
  },
]

// Radio segments with rates (based on the screenshot structure)
const RADIO_SEGMENTS = [
  {
    id: "kuro_yi_mu_nsem",
    name: "KURO YI MU NSEM",
    type: "SPOT",
    rate: 512.0,
    description: "Morning Drive (6:30-9:30AM)",
  },
  {
    id: "power_sports",
    name: "POWER SPORTS",
    type: "SPOT",
    rate: 231.0,
    description: "Sports Show (9:30AM-12PM)",
  },
  {
    id: "ofie_kwkan_so",
    name: "OFIE KWKAN SO",
    type: "SPOT",
    rate: 324.0,
    description: "Afternoon Show (3:30PM-6PM)",
  },
  {
    id: "after_6pm_news",
    name: "AFTER 6PM NEWS",
    type: "SPOT",
    rate: 324.0,
    description: "Evening News (6PM-7PM)",
  },
  {
    id: "nite_with_stars",
    name: "NITE WITH THE STARS",
    type: "SPOT",
    rate: 280.0,
    description: "Night Entertainment (7PM-12AM)",
  },
  {
    id: "social_media_postings",
    name: "SOCIAL MEDIA POSTINGS",
    type: "POST",
    rate: 150.0,
    description: "Radio station social media promotion",
  },
]

// Tax rates (Ghana)
const TAX_RATES = {
  GETFUND: 0.025, // 2.5%
  NHIL: 0.025, // 2.5%
  COVID_LEVY: 0.01, // 1.0%
  VAT: 0.15, // 15%
}

export default function CustomPackageBuilder({ mediaType = "digital", onPackageSubmit }) {
  const [weeks, setWeeks] = useState(2) // Default 2 weeks
  const [discount, setDiscount] = useState(0) // Discount percentage
  const [bookings, setBookings] = useState({}) // { segmentId_day: quantity }
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Get segments based on media type
  const segments = useMemo(() => {
    if (mediaType === "digital") return DIGITAL_SEGMENTS
    if (mediaType === "radio") return RADIO_SEGMENTS
    // Default to digital
    return DIGITAL_SEGMENTS
  }, [mediaType])

  // Calculate totals
  const calculations = useMemo(() => {
    let segmentTotals = {}
    let grandTotal = 0

    // Calculate totals for each segment
    segments.forEach((segment) => {
      let segmentTotal = 0
      DAYS.forEach((day) => {
        const key = `${segment.id}_${day}`
        const quantity = bookings[key] || 0
        segmentTotal += quantity * segment.rate
      })
      segmentTotals[segment.id] = {
        total: segmentTotal,
        quantity: Object.keys(DAYS).reduce((sum, _, idx) => {
          const key = `${segment.id}_${DAYS[idx]}`
          return sum + (bookings[key] || 0)
        }, 0),
      }
      grandTotal += segmentTotal
    })

    // Calculate weekly total
    const weeklyTotal = grandTotal
    const totalWeeks = weeklyTotal * weeks

    // Apply discount
    const discountAmount = (totalWeeks * discount) / 100
    const subtotal = totalWeeks - discountAmount

    // Calculate levies
    const getfund = subtotal * TAX_RATES.GETFUND
    const nhil = subtotal * TAX_RATES.NHIL
    const covidLevy = subtotal * TAX_RATES.COVID_LEVY
    const subtotalAfterLevies = subtotal + getfund + nhil + covidLevy

    // Calculate VAT
    const vat = subtotalAfterLevies * TAX_RATES.VAT
    const finalTotal = subtotalAfterLevies + vat

    return {
      segmentTotals,
      weeklyTotal,
      totalWeeks,
      discountAmount,
      subtotal,
      getfund,
      nhil,
      covidLevy,
      subtotalAfterLevies,
      vat,
      finalTotal,
      totalQuantity: Object.values(segmentTotals).reduce((sum, seg) => sum + seg.quantity, 0),
    }
  }, [bookings, weeks, discount, segments])

  const updateBooking = (segmentId, day, value) => {
    const numValue = parseInt(value) || 0
    if (numValue < 0) return

    const key = `${segmentId}_${day}`
    setBookings((prev) => ({
      ...prev,
      [key]: numValue,
    }))
  }

  const incrementBooking = (segmentId, day) => {
    const key = `${segmentId}_${day}`
    const current = bookings[key] || 0
    updateBooking(segmentId, day, current + 1)
  }

  const decrementBooking = (segmentId, day) => {
    const key = `${segmentId}_${day}`
    const current = bookings[key] || 0
    if (current > 0) {
      updateBooking(segmentId, day, current - 1)
    }
  }

  const clearAll = () => {
    setBookings({})
    setDiscount(0)
    setWeeks(2)
  }

  const handleSubmit = () => {
    const packageData = {
      type: "custom",
      mediaType,
      weeks,
      discount,
      bookings,
      calculations,
      segments: segments.map((seg) => ({
        ...seg,
        totals: calculations.segmentTotals[seg.id],
      })),
    }

    if (onPackageSubmit) {
      onPackageSubmit(packageData)
    } else {
      setIsModalOpen(true)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Custom Package Builder</CardTitle>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="weeks" className="text-sm">
                  Weeks:
                </Label>
                <Input
                  id="weeks"
                  type="number"
                  min="1"
                  max="12"
                  value={weeks}
                  onChange={(e) => setWeeks(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                  className="w-20"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="discount" className="text-sm">
                  Discount (%):
                </Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                  className="w-20"
                />
              </div>
              <Button variant="outline" size="sm" onClick={clearAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold sticky left-0 bg-background z-10 min-w-[200px]">
                    SEGMENT
                  </th>
                  <th className="text-center p-3 font-semibold min-w-[60px]">@</th>
                  {DAYS.map((day) => (
                    <th key={day} className="text-center p-3 font-semibold min-w-[70px]">
                      {day}
                    </th>
                  ))}
                  <th className="text-center p-3 font-semibold min-w-[70px]">TOTAL</th>
                  <th className="text-center p-3 font-semibold min-w-[100px]">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((segment) => {
                  const segmentTotal = Object.keys(DAYS).reduce((sum, _, idx) => {
                    const key = `${segment.id}_${DAYS[idx]}`
                    return sum + (bookings[key] || 0)
                  }, 0)
                  const segmentAmount = segmentTotal * segment.rate

                  return (
                    <tr key={segment.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 sticky left-0 bg-background z-10">
                        <div>
                          <div className="font-medium">{segment.name}</div>
                          <div className="text-xs text-muted-foreground">{segment.description}</div>
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <div className="font-medium">₵{segment.rate.toFixed(2)}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {segment.type}
                        </Badge>
                      </td>
                      {DAYS.map((day) => {
                        const key = `${segment.id}_${day}`
                        const quantity = bookings[key] || 0

                        return (
                          <td key={day} className="text-center p-2">
                            <div className="flex items-center justify-center space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => decrementBooking(segment.id, day)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                min="0"
                                value={quantity}
                                onChange={(e) => updateBooking(segment.id, day, e.target.value)}
                                className="w-12 h-8 text-center text-sm"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => incrementBooking(segment.id, day)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        )
                      })}
                      <td className="text-center p-3 font-medium">{segmentTotal}</td>
                      <td className="text-center p-3 font-medium">₵{segmentAmount.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>Package Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Items:</span>
                <span className="font-medium">{calculations.totalQuantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total per Week:</span>
                <span className="font-medium">₵{calculations.weeklyTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total {weeks} Week{weeks > 1 ? "s" : ""}:</span>
                <span className="font-medium">₵{calculations.totalWeeks.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Less {discount}% Discount:</span>
                  <span className="font-medium">-₵{calculations.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-medium pt-2 border-t">
                <span>Subtotal:</span>
                <span>₵{calculations.subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GETFUND (2.5%):</span>
                <span className="font-medium">₵{calculations.getfund.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">NHIL (2.5%):</span>
                <span className="font-medium">₵{calculations.nhil.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">COVID LEVY (1.0%):</span>
                <span className="font-medium">₵{calculations.covidLevy.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal after Levies:</span>
                <span className="font-medium">₵{calculations.subtotalAfterLevies.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">VAT (15%):</span>
                <span className="font-medium">₵{calculations.vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>GRAND TOTAL:</span>
                <span className="text-primary">₵{calculations.finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={handleSubmit} className="w-full" size="lg" disabled={calculations.totalQuantity === 0}>
              Request Custom Package
            </Button>
          </div>
        </CardContent>
      </Card>

      <InquiryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageInfo={{
          name: `Custom ${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} Package`,
          price: `₵${calculations.finalTotal.toFixed(2)}`,
          details: `${calculations.totalQuantity} items over ${weeks} week${weeks > 1 ? "s" : ""}`,
          customData: {
            weeks,
            discount,
            bookings,
            calculations,
          },
        }}
      />
    </div>
  )
}
