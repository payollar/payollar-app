"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  GripVertical,
  Edit,
  X,
  Check,
  Save,
  Eye,
  EyeOff,
  ExternalLink,
  MapPin,
  Users,
  Radio,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SmartTableEditor } from "./smart-table-editor";
import Link from "next/link";
import { SMART_RATE_CARD_TEMPLATES } from "@/lib/rate-card-templates";

const COLUMN_DATA_TYPES = [
  { value: "TEXT", label: "Text" },
  { value: "NUMBER", label: "Number" },
  { value: "CURRENCY", label: "Currency" },
  { value: "DROPDOWN", label: "Dropdown" },
  { value: "BOOLEAN", label: "Boolean" },
  { value: "NOTES", label: "Notes" },
];

export function SmartRateCardEditor({ rateCardId, onUpdate }) {
  const [rateCard, setRateCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionTemplateKey, setNewSectionTemplateKey] = useState("");
  const [editingDetails, setEditingDetails] = useState(false);
  const [newLocation, setNewLocation] = useState("");
  const [newReach, setNewReach] = useState("");
  const [newDemographics, setNewDemographics] = useState([]);
  const [newDemographicInput, setNewDemographicInput] = useState("");

  useEffect(() => {
    fetchRateCard();
  }, [rateCardId]);

  const fetchRateCard = async () => {
    try {
      const response = await fetch(`/api/media-agency/rate-cards/${rateCardId}`);
      const data = await response.json();
      if (data.success) {
        setRateCard(data.rateCard);
        setNewTitle(data.rateCard.title);
        setNewDescription(data.rateCard.description || "");
        setNewLocation(data.rateCard.location || "");
        setNewReach(data.rateCard.reach || "");
        setNewDemographics(Array.isArray(data.rateCard.demographics) ? data.rateCard.demographics : []);
      }
    } catch (error) {
      console.error("Error fetching rate card:", error);
      toast.error("Failed to load rate card");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTitle = async () => {
    if (!newTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const response = await fetch(`/api/media-agency/rate-cards/${rateCardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });

      const data = await response.json();
      if (data.success) {
        setRateCard({ ...rateCard, title: newTitle });
        setEditingTitle(false);
        toast.success("Title updated");
      } else {
        toast.error(data.error || "Failed to update title");
      }
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Failed to update title");
    }
  };

  const handleUpdateDescription = async () => {
    try {
      const response = await fetch(`/api/media-agency/rate-cards/${rateCardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: newDescription }),
      });

      const data = await response.json();
      if (data.success) {
        setRateCard({ ...rateCard, description: newDescription });
        toast.success("Description updated");
      } else {
        toast.error(data.error || "Failed to update description");
      }
    } catch (error) {
      console.error("Error updating description:", error);
      toast.error("Failed to update description");
    }
  };

  const handleUpdateDetails = async () => {
    try {
      const response = await fetch(`/api/media-agency/rate-cards/${rateCardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: newLocation || null,
          reach: newReach || null,
          demographics: newDemographics,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRateCard({
          ...rateCard,
          location: newLocation || null,
          reach: newReach || null,
          demographics: newDemographics,
        });
        setEditingDetails(false);
        toast.success("Details updated");
      } else {
        toast.error(data.error || "Failed to update details");
      }
    } catch (error) {
      console.error("Error updating details:", error);
      toast.error("Failed to update details");
    }
  };

  const addDemographic = () => {
    const val = newDemographicInput.trim();
    if (val && !newDemographics.includes(val)) {
      setNewDemographics([...newDemographics, val]);
      setNewDemographicInput("");
    }
  };

  const removeDemographic = (index) => {
    setNewDemographics(newDemographics.filter((_, i) => i !== index));
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) {
      toast.error("Section title is required");
      return;
    }

    try {
      const response = await fetch(
        `/api/media-agency/rate-cards/${rateCardId}/sections`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newSectionTitle,
            templateKey: newSectionTemplateKey || undefined,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Section added");
        setNewSectionTitle("");
        setNewSectionTemplateKey("");
        setShowAddSection(false);
        await fetchRateCard();
        if (onUpdate) onUpdate();
      } else {
        toast.error(data.error || "Failed to add section");
      }
    } catch (error) {
      console.error("Error adding section:", error);
      toast.error("Failed to add section");
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm("Are you sure you want to delete this section? All tables and data will be lost.")) {
      return;
    }

    // TODO: Implement section deletion API
    toast.info("Section deletion not yet implemented");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading rate card...
        </CardContent>
      </Card>
    );
  }

  if (!rateCard) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Rate card not found
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {editingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="text-2xl font-bold"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUpdateTitle();
                      } else if (e.key === "Escape") {
                        setEditingTitle(false);
                        setNewTitle(rateCard.title);
                      }
                    }}
                    autoFocus
                  />
                  <Button size="sm" onClick={handleUpdateTitle}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingTitle(false);
                      setNewTitle(rateCard.title);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <CardTitle
                  className="text-2xl cursor-pointer hover:bg-muted/50 p-2 -m-2 rounded"
                  onClick={() => setEditingTitle(true)}
                >
                  {rateCard.title}
                  <Edit className="h-4 w-4 inline ml-2 opacity-50" />
                </CardTitle>
              )}
              <div className="mt-2">
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  onBlur={handleUpdateDescription}
                  placeholder="Add a description..."
                  className="min-h-[60px]"
                />
              </div>

              {/* Location, Reach, Demographics - editable via edit icon */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Rate card details</span>
                  {!editingDetails ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={() => setEditingDetails(true)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-1">
                      <Button size="sm" onClick={handleUpdateDetails}>
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingDetails(false);
                          setNewLocation(rateCard.location || "");
                          setNewReach(rateCard.reach || "");
                          setNewDemographics(Array.isArray(rateCard.demographics) ? rateCard.demographics : []);
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
                {editingDetails ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Location</Label>
                      <Input
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="e.g., Accra, Kumasi, Nationwide"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Listeners / Viewers (Reach)</Label>
                      <Input
                        value={newReach}
                        onChange={(e) => setNewReach(e.target.value)}
                        placeholder="e.g., 2M+ listeners, 5M+ viewers"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Target Demographics</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={newDemographicInput}
                          onChange={(e) => setNewDemographicInput(e.target.value)}
                          placeholder="e.g., Adults 25-54"
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDemographic())}
                        />
                        <Button type="button" onClick={addDemographic} size="sm" variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {newDemographics.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {newDemographics.map((demo, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {demo}
                              <button
                                type="button"
                                onClick={() => removeDemographic(index)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-sm">
                    {rateCard.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{rateCard.location}</span>
                      </div>
                    )}
                    {rateCard.reach && (
                      <div className="flex items-center gap-2">
                        <Radio className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{rateCard.reach}</span>
                      </div>
                    )}
                    {rateCard.demographics?.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        {rateCard.demographics.map((d, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {d}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {!rateCard.location && !rateCard.reach && (!rateCard.demographics || rateCard.demographics.length === 0) && (
                      <p className="text-muted-foreground text-xs">Click Edit to add location, reach, and demographics</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                {rateCard.isPublished ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    Published
                  </span>
                ) : (
                  <span className="text-gray-500 flex items-center gap-1">
                    <EyeOff className="h-4 w-4" />
                    Draft
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2"
              >
                <Link href={`/rate-cards/${rateCardId}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4" />
                  Preview
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Sections */}
      {rateCard.sections?.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle className="text-xl">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.tables?.map((table) => (
              <SmartTableEditor
                key={table.id}
                table={table}
                onUpdate={fetchRateCard}
              />
            ))}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `/api/media-agency/rate-cards/${rateCardId}/sections/${section.id}/tables`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ title: null }),
                      }
                    );
                    const data = await response.json();
                    if (data.success) {
                      toast.success("Table added");
                      await fetchRateCard();
                    }
                  } catch (error) {
                    toast.error("Failed to add table");
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Empty Table
              </Button>

              {/* Prebuilt template: TV Time Classes & Segments */}
              <Button
                variant="outline"
                onClick={async () => {
                  const template = SMART_RATE_CARD_TEMPLATES.find(
                    (t) => t.key === "tv_time_classes"
                  );
                  try {
                    const response = await fetch(
                      `/api/media-agency/rate-cards/${rateCardId}/sections/${section.id}/tables`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          title: template?.defaultTitle || "Time Classes & Segments",
                          templateKey: "tv_time_classes",
                        }),
                      }
                    );
                    const data = await response.json();
                    if (data.success) {
                      toast.success("Time class template table added");
                      await fetchRateCard();
                    } else {
                      toast.error(data.error || "Failed to add template table");
                    }
                  } catch (error) {
                    console.error("Error adding template table:", error);
                    toast.error("Failed to add template table");
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Time Class Template
              </Button>
              {/* Prebuilt template: Spot Advert */}
              <Button
                variant="outline"
                onClick={async () => {
                  const template = SMART_RATE_CARD_TEMPLATES.find(
                    (t) => t.key === "spot_advert"
                  );
                  try {
                    const response = await fetch(
                      `/api/media-agency/rate-cards/${rateCardId}/sections/${section.id}/tables`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          title: template?.defaultTitle || "Spot Advert Rates",
                          templateKey: "spot_advert",
                        }),
                      }
                    );
                    const data = await response.json();
                    if (data.success) {
                      toast.success("Spot advert template table added");
                      await fetchRateCard();
                    } else {
                      toast.error(data.error || "Failed to add template table");
                    }
                  } catch (error) {
                    console.error("Error adding template table:", error);
                    toast.error("Failed to add template table");
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Spot Advert Template
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add Section */}
      {showAddSection ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label>Section Title</Label>
                <Input
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="e.g., TV Rates, Radio Packages"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddSection();
                    } else if (e.key === "Escape") {
                      setShowAddSection(false);
                      setNewSectionTitle("");
                    }
                  }}
                  autoFocus
                />
              </div>
              <div>
                <Label>Template (optional)</Label>
                <Select
                  value={newSectionTemplateKey || "none"}
                  onValueChange={(v) => setNewSectionTemplateKey(v === "none" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No template</SelectItem>
                    {SMART_RATE_CARD_TEMPLATES.map((t) => (
                      <SelectItem key={t.key} value={t.key}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose a template to add a prebuilt table with time classes and pricing.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddSection}>
                  <Check className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddSection(false);
                    setNewSectionTitle("");
                    setNewSectionTemplateKey("");
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setShowAddSection(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      )}
    </div>
  );
}
