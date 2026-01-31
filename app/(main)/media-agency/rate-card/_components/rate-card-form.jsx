"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

export function RateCardForm({ mediaAgencyId }) {
  const [listingType, setListingType] = useState("");
  const [name, setName] = useState("");
  const [network, setNetwork] = useState("");
  const [location, setLocation] = useState("");
  const [frequency, setFrequency] = useState("");
  const [description, setDescription] = useState("");
  const [reach, setReach] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [currentTimeSlot, setCurrentTimeSlot] = useState("");
  const [demographics, setDemographics] = useState([]);
  const [currentDemographic, setCurrentDemographic] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addTimeSlot = () => {
    if (currentTimeSlot.trim() && !timeSlots.includes(currentTimeSlot.trim())) {
      setTimeSlots([...timeSlots, currentTimeSlot.trim()]);
      setCurrentTimeSlot("");
    }
  };

  const removeTimeSlot = (slot) => {
    setTimeSlots(timeSlots.filter(s => s !== slot));
  };

  const addDemographic = () => {
    if (currentDemographic.trim() && !demographics.includes(currentDemographic.trim())) {
      setDemographics([...demographics, currentDemographic.trim()]);
      setCurrentDemographic("");
    }
  };

  const removeDemographic = (demo) => {
    setDemographics(demographics.filter(d => d !== demo));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!listingType || !name || !location) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/media-agency/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaAgencyId,
          listingType,
          name,
          network,
          location,
          frequency,
          description,
          reach,
          priceRange,
          timeSlots,
          demographics,
          status: "ACTIVE",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create listing");
      }

      toast.success("Media listing created successfully!");
      // Reset form
      setListingType("");
      setName("");
      setNetwork("");
      setLocation("");
      setFrequency("");
      setDescription("");
      setReach("");
      setPriceRange("");
      setTimeSlots([]);
      setDemographics([]);
      window.location.reload();
    } catch (error) {
      console.error("Error creating listing:", error);
      toast.error("Failed to create media listing");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="listingType">
            Media Type <span className="text-red-500">*</span>
          </Label>
          <Select value={listingType} onValueChange={setListingType} required>
            <SelectTrigger>
              <SelectValue placeholder="Select media type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TV">TV</SelectItem>
              <SelectItem value="RADIO">Radio</SelectItem>
              <SelectItem value="BILLBOARD">Billboard</SelectItem>
              <SelectItem value="DIGITAL">Digital</SelectItem>
              <SelectItem value="INFLUENCER_MARKETING">Influencer Marketing</SelectItem>
              <SelectItem value="VIDEO_CLIPPING">Video Clipping</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">
            Listing Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Joy FM, TV3, etc."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="network">Network/Group</Label>
          <Input
            id="network"
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            placeholder="e.g., Multimedia Group, Media General"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">
            Location <span className="text-red-500">*</span>
          </Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Accra, Greater Accra"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency/Channel</Label>
          <Input
            id="frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            placeholder="e.g., 99.7 FM, Channel 3"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reach">Estimated Reach</Label>
          <Input
            id="reach"
            value={reach}
            onChange={(e) => setReach(e.target.value)}
            placeholder="e.g., 2M+ listeners, 5M+ households"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priceRange">Price Range</Label>
          <Input
            id="priceRange"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            placeholder="e.g., ₵250-1,500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your media listing..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Time Slots</Label>
        <div className="flex gap-2">
          <Input
            value={currentTimeSlot}
            onChange={(e) => setCurrentTimeSlot(e.target.value)}
            placeholder="e.g., Morning Drive, Prime Time"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTimeSlot();
              }
            }}
          />
          <Button type="button" onClick={addTimeSlot} variant="outline">
            Add
          </Button>
        </div>
        {timeSlots.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {timeSlots.map((slot) => (
              <Badge key={slot} variant="secondary" className="flex items-center gap-1">
                {slot}
                <button
                  type="button"
                  onClick={() => removeTimeSlot(slot)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Target Demographics</Label>
        <div className="flex gap-2">
          <Input
            value={currentDemographic}
            onChange={(e) => setCurrentDemographic(e.target.value)}
            placeholder="e.g., Adults 25-54"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addDemographic();
              }
            }}
          />
          <Button type="button" onClick={addDemographic} variant="outline">
            Add
          </Button>
        </div>
        {demographics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {demographics.map((demo) => (
              <Badge key={demo} variant="outline" className="flex items-center gap-1">
                {demo}
                <button
                  type="button"
                  onClick={() => removeDemographic(demo)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Listing"
        )}
      </Button>
    </form>
  );
}
