"use client";

import { useEffect, useMemo, useState } from "react";
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
import { ListingCoverUpload } from "./listing-cover-upload";
import { BillboardMapPicker } from "./billboard-map-picker";

const fieldClass =
  "h-11 rounded-xl border-slate-200 bg-white shadow-none focus-visible:border-[#0055ff] focus-visible:ring-[#0055ff]/20";

const TYPE_COPY = {
  TV: {
    nameLabel: "Station name",
    namePlaceholder: "e.g. TV3, Joy Prime",
    networkLabel: "Network / group",
    networkPlaceholder: "e.g. Media General",
    locationPlaceholder: "e.g. Accra, Greater Accra",
    channelLabel: "Channel",
    channelPlaceholder: "e.g. Channel 3, DStv 154",
    showChannel: true,
    reachLabel: "Estimated reach",
    reachPlaceholder: "e.g. 2M+ viewers",
    pricePlaceholder: "e.g. ₵500–5,000",
    descriptionPlaceholder:
      "Describe the station, audience, and typical campaign fit…",
    slotsLabel: "Dayparts / time slots",
    slotsPlaceholder: "e.g. Prime Time, Morning Show",
    showSlots: true,
    demographicsPlaceholder: "e.g. Adults 25–54",
  },
  RADIO: {
    nameLabel: "Station name",
    namePlaceholder: "e.g. Joy FM, Citi FM",
    networkLabel: "Network / group",
    networkPlaceholder: "e.g. Multimedia Group",
    locationPlaceholder: "e.g. Accra, Greater Accra",
    channelLabel: "Frequency",
    channelPlaceholder: "e.g. 99.7 FM",
    showChannel: true,
    reachLabel: "Estimated reach",
    reachPlaceholder: "e.g. 2M+ listeners",
    pricePlaceholder: "e.g. ₵250–1,500",
    descriptionPlaceholder:
      "Describe the station, shows, and typical campaign fit…",
    slotsLabel: "Dayparts / time slots",
    slotsPlaceholder: "e.g. Morning Drive, Midday",
    showSlots: true,
    demographicsPlaceholder: "e.g. Adults 25–54",
  },
  DIGITAL: {
    nameLabel: "Publisher / platform",
    namePlaceholder: "e.g. Joy Online, Citi Digital",
    networkLabel: "Network / brand",
    networkPlaceholder: "e.g. Multimedia Group",
    locationPlaceholder: "e.g. Ghana, Accra",
    channelLabel: "Category / vertical",
    channelPlaceholder: "e.g. News · Digital, Business",
    showChannel: true,
    reachLabel: "Estimated reach / impressions",
    reachPlaceholder: "e.g. 2.5M monthly",
    pricePlaceholder: "e.g. ₵2,500+",
    descriptionPlaceholder:
      "Describe digital inventory — homepage, articles, newsletter, social…",
    slotsLabel: "Ad placements",
    slotsPlaceholder: "e.g. Homepage takeover, ROS banner",
    showSlots: true,
    demographicsPlaceholder: "e.g. News readers, Professionals 18–45",
  },
  BILLBOARD: {
    nameLabel: "Site name",
    namePlaceholder: "e.g. Airport Roundabout, Spintex Road",
    networkLabel: "Media owner / brand",
    networkPlaceholder: "e.g. Skyline Outdoor GH",
    locationPlaceholder: "e.g. Airport Roundabout, Accra",
    channelLabel: "Board type / size",
    channelPlaceholder: "e.g. Static 12m × 6m, Digital LED",
    showChannel: true,
    reachLabel: "Daily traffic / reach",
    reachPlaceholder: "e.g. 145K vehicles / day",
    pricePlaceholder: "e.g. ₵6,000+",
    descriptionPlaceholder:
      "Describe the site, orientation, lighting, and traffic context…",
    slotsLabel: "Facing / positions",
    slotsPlaceholder: "e.g. Dual-facing, Northbound",
    showSlots: true,
    demographicsPlaceholder: "e.g. Commuters, Airport traffic",
  },
  INFLUENCER_MARKETING: {
    nameLabel: "Talent / show name",
    namePlaceholder: "e.g. Brand show series",
    networkLabel: "Network / brand",
    networkPlaceholder: "e.g. Payollar Entertainment",
    locationPlaceholder: "e.g. Accra, Ghana",
    channelLabel: "Platform",
    channelPlaceholder: "e.g. Instagram, YouTube, TikTok",
    showChannel: true,
    reachLabel: "Estimated followers / reach",
    reachPlaceholder: "e.g. 500K followers",
    pricePlaceholder: "e.g. ₵3,000+",
    descriptionPlaceholder: "Describe the talent, content style, and audience…",
    slotsLabel: "Deliverables",
    slotsPlaceholder: "e.g. Reel, Story set, Live",
    showSlots: true,
    demographicsPlaceholder: "e.g. Gen Z, Lifestyle",
  },
  VIDEO_CLIPPING: {
    nameLabel: "Clipping product",
    namePlaceholder: "e.g. Match highlights package",
    networkLabel: "Network / brand",
    networkPlaceholder: "e.g. Sports desk",
    locationPlaceholder: "e.g. Accra, Ghana",
    channelLabel: "Format",
    channelPlaceholder: "e.g. Vertical short, Horizontal cutdown",
    showChannel: true,
    reachLabel: "Estimated views",
    reachPlaceholder: "e.g. 100K views / clip",
    pricePlaceholder: "e.g. ₵1,500+",
    descriptionPlaceholder: "Describe clipping turnaround, sports, or content types…",
    slotsLabel: "Clip types",
    slotsPlaceholder: "e.g. Highlight, Teaser, Recap",
    showSlots: true,
    demographicsPlaceholder: "e.g. Sports fans 18–35",
  },
};

const DEFAULT_COPY = {
  nameLabel: "Listing name",
  namePlaceholder: "e.g. Station, publisher, or site name",
  networkLabel: "Network / group",
  networkPlaceholder: "e.g. Media group or brand",
  locationPlaceholder: "e.g. Accra, Greater Accra",
  channelLabel: "Channel / category",
  channelPlaceholder: "e.g. Frequency, channel, or category",
  showChannel: true,
  reachLabel: "Estimated reach",
  reachPlaceholder: "e.g. 2M+ audience",
  pricePlaceholder: "e.g. ₵250–1,500",
  descriptionPlaceholder: "Describe this media listing…",
  slotsLabel: "Time slots / placements",
  slotsPlaceholder: "e.g. Morning Drive",
  showSlots: true,
  demographicsPlaceholder: "e.g. Adults 25–54",
};

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

export function RateCardForm({ mediaAgencyId, primaryMediaType = null }) {
  const lockedType = primaryMediaType
    ? String(primaryMediaType).toUpperCase()
    : null;
  const [listingType, setListingType] = useState(lockedType || "");
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
  const [imageUrl, setImageUrl] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (lockedType) setListingType(lockedType);
  }, [lockedType]);

  const copy = useMemo(
    () => TYPE_COPY[listingType] || DEFAULT_COPY,
    [listingType]
  );

  const handleTypeChange = (nextType) => {
    setListingType(nextType);
    // Clear type-specific chips when switching so TV dayparts don't stick on Digital
    setTimeSlots([]);
    setCurrentTimeSlot("");
    if (nextType !== "BILLBOARD") {
      setLatitude(null);
      setLongitude(null);
    }
  };

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
          frequency: copy.showChannel ? frequency : "",
          description,
          reach,
          priceRange,
          timeSlots: copy.showSlots ? timeSlots : [],
          demographics,
          imageUrl: imageUrl || null,
          latitude: listingType === "BILLBOARD" ? latitude : null,
          longitude: listingType === "BILLBOARD" ? longitude : null,
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
      setImageUrl("");
      setLatitude(null);
      setLongitude(null);
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
      <ListingCoverUpload value={imageUrl} onChange={setImageUrl} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="listingType" className="text-sm font-medium text-slate-700">
            Media type <span className="text-[#0055ff]">*</span>
          </Label>
          {lockedType ? (
            <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700">
              {String(lockedType).replaceAll("_", " ")}
              <span className="ml-2 text-xs font-normal text-slate-400">
                (your agency type)
              </span>
            </div>
          ) : (
            <Select value={listingType} onValueChange={handleTypeChange} required>
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
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-slate-700">
            {copy.nameLabel} <span className="text-[#0055ff]">*</span>
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={copy.namePlaceholder}
            required
            className={fieldClass}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="network" className="text-sm font-medium text-slate-700">
            {copy.networkLabel}
          </Label>
          <Input
            id="network"
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            placeholder={copy.networkPlaceholder}
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
            placeholder={copy.locationPlaceholder}
            required
            className={fieldClass}
          />
        </div>

        {listingType === "BILLBOARD" ? (
          <div className="sm:col-span-2">
            <BillboardMapPicker
              value={{ latitude, longitude }}
              onChange={({ latitude: lat, longitude: lng }) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
              onLocationLabel={(label) => {
                if (!location.trim()) setLocation(label);
              }}
            />
          </div>
        ) : null}

        {copy.showChannel ? (
          <div className="space-y-2">
            <Label htmlFor="frequency" className="text-sm font-medium text-slate-700">
              {copy.channelLabel}
            </Label>
            <Input
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder={copy.channelPlaceholder}
              className={fieldClass}
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="reach" className="text-sm font-medium text-slate-700">
            {copy.reachLabel}
          </Label>
          <Input
            id="reach"
            value={reach}
            onChange={(e) => setReach(e.target.value)}
            placeholder={copy.reachPlaceholder}
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
            placeholder={copy.pricePlaceholder}
            className={cn(fieldClass, "sm:max-w-sm")}
          />
          {listingType === "DIGITAL" || listingType === "BILLBOARD" ? (
            <p className="text-xs text-slate-400">
              Optional — marketplace can also show “From” using your package
              prices.
            </p>
          ) : null}
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
          placeholder={copy.descriptionPlaceholder}
          rows={3}
          className="min-h-[96px] resize-y rounded-xl border-slate-200 bg-white shadow-none focus-visible:border-[#0055ff] focus-visible:ring-[#0055ff]/20"
        />
      </div>

      <div
        className={cn(
          "grid gap-4",
          copy.showSlots ? "lg:grid-cols-2" : "lg:grid-cols-1"
        )}
      >
        {copy.showSlots ? (
          <ChipField
            label={copy.slotsLabel}
            value={currentTimeSlot}
            onChange={setCurrentTimeSlot}
            onAdd={addTimeSlot}
            items={timeSlots}
            onRemove={(slot) => setTimeSlots(timeSlots.filter((s) => s !== slot))}
            placeholder={copy.slotsPlaceholder}
          />
        ) : null}
        <ChipField
          label="Target demographics"
          value={currentDemographic}
          onChange={setCurrentDemographic}
          onAdd={addDemographic}
          items={demographics}
          onRemove={(demo) =>
            setDemographics(demographics.filter((d) => d !== demo))
          }
          placeholder={copy.demographicsPlaceholder}
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
