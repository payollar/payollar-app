"use client"

import { useState } from "react"
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
} from "lucide-react"
import Link from "next/link"
import { getHeaderImage } from "@/lib/getHeaderImage"
import CustomPackageBuilder from "@/components/CustomPackageBuilder"
import InquiryFormModal from "@/components/InquiryFormModal"

export default function ScheduleMediaPage() {
  const headerImage = getHeaderImage("/media")
  const [selectedMediaType, setSelectedMediaType] = useState("digital")
  const [showCustomBuilder, setShowCustomBuilder] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    mediaType: "digital",
    startDate: "",
    endDate: "",
    budget: "",
    targetAudience: "",
    message: "",
  })

  const mediaTypes = [
    { id: "digital", name: "Digital Media", icon: Smartphone, description: "Social media, search ads, video ads" },
    { id: "radio", name: "", icon: Radio, description: "Radio spots and promotions" },
    { id: "tv", name: "TV Media", icon: Tv, description: "Television commercials and spots" },
    { id: "billboard", name: "Billboard Media", icon: Billboard, description: "Outdoor advertising and billboards" },
  ]

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
                {/* Media Type Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Select Media Type</CardTitle>
                    <CardDescription>Choose the type of media you want to schedule</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {mediaTypes.map((type) => {
                        const Icon = type.icon
                        const isSelected = selectedMediaType === type.id
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => {
                              setSelectedMediaType(type.id)
                              handleInputChange("mediaType", type.id)
                            }}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  isSelected ? "bg-primary/10" : "bg-muted"
                                }`}
                              >
                                <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : ""}`} />
                              </div>
                              <div className="flex-1">
                                <p className={`font-medium ${isSelected ? "text-primary" : ""}`}>
                                  {type.name}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {type.description}
                                </p>
                              </div>
                              {isSelected && (
                                <Check className="h-5 w-5 text-primary" />
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
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
                  <Button onClick={handleSubmit} size="lg">
                    Submit Inquiry
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    className="flex-1 text-lg py-6"
                    onClick={() => setShowCustomBuilder(true)}
                  >
                    Build Custom Package
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
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
                  <CustomPackageBuilder
                    mediaType={selectedMediaType}
                    onPackageSubmit={handlePackageSubmit}
                  />
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
