"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-11 rounded-xl border-slate-200 bg-white shadow-none focus-visible:border-[#0055ff] focus-visible:ring-[#0055ff]/20";

function ChipField({
  label,
  value,
  onChange,
  onAdd,
  items,
  onRemove,
  placeholder,
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(fieldClass, "min-w-0 flex-1")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={onAdd}
          className="h-11 shrink-0 rounded-xl border-slate-200 px-3"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <Badge
              key={item}
              className="gap-1 rounded-full border-0 bg-slate-100 px-2.5 py-1 font-medium text-slate-700"
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(item)}
                className="rounded-full p-0.5 hover:bg-slate-200 hover:text-rose-600"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}

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

  const addDemographic = () => {
    if (
      currentDemographic.trim() &&
      !demographics.includes(currentDemographic.trim())
    ) {
      setDemographics([...demographics, currentDemographic.trim()]);
      setCurrentDemographic("");
    }
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="listingType" className="text-sm font-medium text-slate-700">
            Media type <span className="text-[#0055ff]">*</span>
          </Label>
          <Select value={listingType} onValueChange={setListingType} required>
            <SelectTrigger className={fieldClass}>
              <SelectValue placeholder="Select media type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TV">TV</SelectItem>
              <SelectItem value="RADIO">Radio</SelectItem>
              <SelectItem value="BILLBOARD">Billboard</SelectItem>
              <SelectItem value="DIGITAL">Digital</SelectItem>
              <SelectItem value="INFLUENCER_MARKETING">
                Influencer Marketing
              </SelectItem>
              <SelectItem value="VIDEO_CLIPPING">Video Clipping</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-slate-700">
            Listing name <span className="text-[#0055ff]">*</span>
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Joy FM, TV3"
            required
            className={fieldClass}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="network" className="text-sm font-medium text-slate-700">
            Network / group
          </Label>
          <Input
            id="network"
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            placeholder="e.g. Multimedia Group"
            className={fieldClass}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium text-slate-700">
            Location <span className="text-[#0055ff]">*</span>
          </Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Accra, Greater Accra"
            required
            className={fieldClass}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency" className="text-sm font-medium text-slate-700">
            Frequency / channel
          </Label>
          <Input
            id="frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            placeholder="e.g. 99.7 FM, Channel 3"
            className={fieldClass}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reach" className="text-sm font-medium text-slate-700">
            Estimated reach
          </Label>
          <Input
            id="reach"
            value={reach}
            onChange={(e) => setReach(e.target.value)}
            placeholder="e.g. 2M+ listeners"
            className={fieldClass}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="priceRange" className="text-sm font-medium text-slate-700">
            Price range
          </Label>
          <Input
            id="priceRange"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            placeholder="e.g. ₵250–1,500"
            className={cn(fieldClass, "sm:max-w-sm")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-slate-700">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe this media listing…"
          rows={3}
          className="min-h-[96px] resize-y rounded-xl border-slate-200 bg-white shadow-none focus-visible:border-[#0055ff] focus-visible:ring-[#0055ff]/20"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChipField
          label="Time slots"
          value={currentTimeSlot}
          onChange={setCurrentTimeSlot}
          onAdd={addTimeSlot}
          items={timeSlots}
          onRemove={(slot) => setTimeSlots(timeSlots.filter((s) => s !== slot))}
          placeholder="e.g. Morning Drive"
        />
        <ChipField
          label="Target demographics"
          value={currentDemographic}
          onChange={setCurrentDemographic}
          onAdd={addDemographic}
          items={demographics}
          onRemove={(demo) =>
            setDemographics(demographics.filter((d) => d !== demo))
          }
          placeholder="e.g. Adults 25–54"
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="h-10 rounded-full bg-[#0055ff] px-5 text-white hover:bg-[#0046d4]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create listing
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
