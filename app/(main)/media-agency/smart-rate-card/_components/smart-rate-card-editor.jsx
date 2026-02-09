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
} from "lucide-react";
import { toast } from "sonner";
import { SmartTableEditor } from "./smart-table-editor";

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
          body: JSON.stringify({ title: newSectionTitle }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Section added");
        setNewSectionTitle("");
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
              Add Table
            </Button>
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
