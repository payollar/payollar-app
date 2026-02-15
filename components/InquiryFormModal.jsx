"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createMediaBooking } from "@/actions/media-agency"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function InquiryFormModal({ isOpen, onClose, packageInfo, userEmail, userName }) {
  const router = useRouter()
  // Check if this is TV or Radio media (show number of spots field)
  const isMediaPackage = packageInfo?.mediaType === "radio" || packageInfo?.mediaType === "tv"
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    budget: "",
    startDate: "",
    numberOfSpots: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when package changes or modal opens, and auto-fill user data if available
  useEffect(() => {
    if (isOpen && packageInfo) {
      setFormData({
        fullName: userName || "",
        email: userEmail || "",
        phone: "",
        company: "",
        budget: "",
        startDate: "",
        numberOfSpots: packageInfo?.defaultSpots?.toString() || "",
        message: "",
      })
    }
  }, [isOpen, packageInfo, userEmail, userName])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!packageInfo?.listingId || !packageInfo?.agencyId) {
      toast.error("Missing booking information. Please try again.")
      return
    }

    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields.")
      return
    }

    setIsSubmitting(true)

    try {
      // Extract price from packageInfo (could be string like "₵1,000" or number)
      let packagePrice = null
      if (packageInfo.price) {
        if (typeof packageInfo.price === "string") {
          // Remove currency symbols and commas, then parse
          packagePrice = parseFloat(packageInfo.price.replace(/[₵$,\s]/g, ""))
        } else {
          packagePrice = packageInfo.price
        }
      }

      // Calculate total amount (price * quantity if spots are specified)
      let totalAmount = packagePrice
      if (isMediaPackage && formData.numberOfSpots && packagePrice) {
        // For media packages, multiply price by number of spots if applicable
        const spots = parseInt(formData.numberOfSpots) || 1
        totalAmount = packagePrice * spots
      }

      const bookingData = {
        listingId: packageInfo.listingId,
        agencyId: packageInfo.agencyId,
        clientName: formData.fullName,
        clientEmail: formData.email,
        clientPhone: formData.phone,
        packageName: packageInfo.name,
        packagePrice: packagePrice,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: null, // Could be calculated based on duration if needed
        duration: packageInfo.details || null,
        slots: formData.numberOfSpots ? parseInt(formData.numberOfSpots) : null,
        totalAmount: totalAmount,
        notes: [
          formData.company && `Company: ${formData.company}`,
          formData.budget && `Budget: ${formData.budget}`,
          formData.message,
        ].filter(Boolean).join("\n"),
      }

      const result = await createMediaBooking(bookingData)

      if (result.success) {
        toast.success("Booking request submitted successfully! The media agency will contact you shortly.")
        onClose()
        // Revalidate the media library page
        router.refresh()
      } else {
        toast.error(result.error || "Failed to submit booking request. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting booking:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Request Information</DialogTitle>
          {packageInfo && (
            <div className="text-sm text-muted-foreground mt-2">
              Package: <span className="font-medium text-foreground">{packageInfo.name}</span> •{" "}
              <span className="font-medium text-foreground">{packageInfo.price}</span>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
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
                placeholder="john@company.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                placeholder="Your Company Inc."
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">
                Budget Range <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.budget} onValueChange={(value) => handleChange("budget", value)} required>
                <SelectTrigger id="budget">
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-5k">Under $5,000</SelectItem>
                  <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                  <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                  <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                  <SelectItem value="50k-plus">$50,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Preferred Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
            </div>
          </div>

          {isMediaPackage && (
            <div className="space-y-2">
              <Label htmlFor="numberOfSpots">
                Number of Spots <span className="text-destructive">*</span>
              </Label>
              <Input
                id="numberOfSpots"
                type="number"
                min="1"
                placeholder={packageInfo?.defaultSpots ? `Default: ${packageInfo.defaultSpots} spots` : "Enter number of spots"}
                value={formData.numberOfSpots}
                onChange={(e) => handleChange("numberOfSpots", e.target.value)}
                required
              />
              {packageInfo?.defaultSpots && (
                <p className="text-xs text-muted-foreground">
                  Package includes {packageInfo.defaultSpots} spots. You can request more or fewer spots.
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Additional Information</Label>
            <Textarea
              id="message"
              placeholder="Tell us about your advertising goals, target audience, or any specific requirements..."
              rows={4}
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 bg-transparent"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
