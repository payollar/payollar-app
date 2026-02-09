"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Save,
  Eye,
  EyeOff,
  Trash2,
  GripVertical,
  Edit,
  X,
  Check,
  Tv,
  Radio,
  Biohazard as Billboard,
  Smartphone,
  Users,
  Video,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { SmartRateCardEditor } from "./_components/smart-rate-card-editor";

export default function SmartRateCardPage() {
  const router = useRouter();
  const [rateCards, setRateCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRateCardId, setSelectedRateCardId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRateCardTitle, setNewRateCardTitle] = useState("");
  const [newRateCardDescription, setNewRateCardDescription] = useState("");
  const [mediaListings, setMediaListings] = useState([]);
  const [selectedListingId, setSelectedListingId] = useState("");
  const [selectedListingType, setSelectedListingType] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    fetchRateCards();
    fetchMediaListings();
  }, []);

  const fetchMediaListings = async () => {
    try {
      const response = await fetch("/api/media-agency/listings");
      const data = await response.json();
      if (data.success) {
        setMediaListings(data.listings || []);
      }
    } catch (error) {
      console.error("Error fetching media listings:", error);
    }
  };

  const fetchRateCards = async () => {
    try {
      const response = await fetch("/api/media-agency/rate-cards");
      const data = await response.json();
      if (data.success) {
        setRateCards(data.rateCards);
        if (data.rateCards.length > 0 && !selectedRateCardId) {
          setSelectedRateCardId(data.rateCards[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching rate cards:", error);
      toast.error("Failed to load rate cards");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRateCard = async () => {
    if (!newRateCardTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const selectedListing = selectedListingId 
        ? mediaListings.find((l) => l.id === selectedListingId)
        : null;

      const response = await fetch("/api/media-agency/rate-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newRateCardTitle,
          description: newRateCardDescription,
          isPublished: false,
          listingId: selectedListingId || null,
          listingType: selectedListingType || selectedListing?.listingType || null,
          location: newLocation || selectedListing?.location || null,
          imageUrl: newImageUrl || selectedListing?.imageUrl || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Rate card created");
        setNewRateCardTitle("");
        setNewRateCardDescription("");
        setSelectedListingId("");
        setSelectedListingType("");
        setNewLocation("");
        setNewImageUrl("");
        setShowCreateForm(false);
        await fetchRateCards();
        setSelectedRateCardId(data.rateCard.id);
      } else {
        toast.error(data.error || "Failed to create rate card");
      }
    } catch (error) {
      console.error("Error creating rate card:", error);
      toast.error("Failed to create rate card");
    }
  };

  const handleDeleteRateCard = async (id) => {
    if (!confirm("Are you sure you want to delete this rate card?")) {
      return;
    }

    try {
      const response = await fetch(`/api/media-agency/rate-cards/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Rate card deleted");
        await fetchRateCards();
        if (selectedRateCardId === id) {
          setSelectedRateCardId(null);
        }
      } else {
        toast.error(data.error || "Failed to delete rate card");
      }
    } catch (error) {
      console.error("Error deleting rate card:", error);
      toast.error("Failed to delete rate card");
    }
  };

  const handleTogglePublish = async (rateCard) => {
    try {
      const response = await fetch(`/api/media-agency/rate-cards/${rateCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublished: !rateCard.isPublished,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(
          data.rateCard.isPublished ? "Rate card published" : "Rate card unpublished"
        );
        await fetchRateCards();
      } else {
        toast.error(data.error || "Failed to update rate card");
      }
    } catch (error) {
      console.error("Error updating rate card:", error);
      toast.error("Failed to update rate card");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading rate cards...</div>
      </div>
    );
  }

  const selectedRateCard = rateCards.find((rc) => rc.id === selectedRateCardId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Rate Cards</h1>
          <p className="text-muted-foreground">
            Create flexible, table-based rate cards for your media services
          </p>
        </div>
        <div className="flex gap-2">
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Rate Card
            </Button>
          )}
        </div>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Rate Card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newRateCardTitle}
                onChange={(e) => setNewRateCardTitle(e.target.value)}
                placeholder="e.g., TV Media Rate Card 2024"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newRateCardDescription}
                onChange={(e) => setNewRateCardDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
              />
            </div>
            
            {/* Media Listing Integration */}
            <div className="space-y-4 border-t pt-4">
              <div>
                <Label>Link to Media Listing (Optional)</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Link this rate card to an existing media listing to display it on the frontend
                </p>
                <Select
                  value={selectedListingId || "none"}
                  onValueChange={(value) => {
                    if (value === "none") {
                      setSelectedListingId("");
                      setSelectedListingType("");
                      setNewLocation("");
                      setNewImageUrl("");
                    } else {
                      setSelectedListingId(value);
                      const listing = mediaListings.find((l) => l.id === value);
                      if (listing) {
                        setSelectedListingType(listing.listingType);
                        setNewLocation(listing.location || "");
                        setNewImageUrl(listing.imageUrl || "");
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a media listing (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None - Create standalone rate card</SelectItem>
                    {mediaListings.map((listing) => (
                      <SelectItem key={listing.id} value={listing.id}>
                        {listing.name} ({listing.listingType}) - {listing.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(!selectedListingId || selectedListingId === "none") && (
                <>
                  <div>
                    <Label htmlFor="listingType">Media Type (Optional)</Label>
                    <Select
                      value={selectedListingType}
                      onValueChange={setSelectedListingType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select media type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TV">
                          <div className="flex items-center gap-2">
                            <Tv className="h-4 w-4" />
                            TV Media
                          </div>
                        </SelectItem>
                        <SelectItem value="RADIO">
                          <div className="flex items-center gap-2">
                            <Radio className="h-4 w-4" />
                            Radio Media
                          </div>
                        </SelectItem>
                        <SelectItem value="BILLBOARD">
                          <div className="flex items-center gap-2">
                            <Billboard className="h-4 w-4" />
                            Billboard Media
                          </div>
                        </SelectItem>
                        <SelectItem value="DIGITAL">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            Digital Media
                          </div>
                        </SelectItem>
                        <SelectItem value="INFLUENCER_MARKETING">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Influencer Marketing
                          </div>
                        </SelectItem>
                        <SelectItem value="VIDEO_CLIPPING">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Video Clipping
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location">Location (Optional)</Label>
                    <Input
                      id="location"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g., Accra, Kumasi"
                    />
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                    <Input
                      id="imageUrl"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateRateCard}>
                <Check className="h-4 w-4 mr-2" />
                Create
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewRateCardTitle("");
                  setNewRateCardDescription("");
                  setSelectedListingId("");
                  setSelectedListingType("");
                  setNewLocation("");
                  setNewImageUrl("");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {rateCards.length === 0 && !showCreateForm && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No rate cards yet</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Rate Card
            </Button>
          </CardContent>
        </Card>
      )}

      {rateCards.length > 0 && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rate Cards</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {rateCards.map((rateCard) => (
                    <div
                      key={rateCard.id}
                      className={`p-4 cursor-pointer hover:bg-muted transition-colors ${
                        selectedRateCardId === rateCard.id ? "bg-muted border-l-2 border-primary" : ""
                      }`}
                      onClick={() => setSelectedRateCardId(rateCard.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{rateCard.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {rateCard.isPublished ? (
                              <span className="text-green-600">Published</span>
                            ) : (
                              <span className="text-gray-500">Draft</span>
                            )}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePublish(rateCard);
                            }}
                          >
                            {rateCard.isPublished ? (
                              <Eye className="h-3 w-3" />
                            ) : (
                              <EyeOff className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRateCard(rateCard.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3">
            {selectedRateCard ? (
              <SmartRateCardEditor
                rateCardId={selectedRateCard.id}
                onUpdate={fetchRateCards}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Select a rate card to edit
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
