"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function TermsAndConditionsForm({ mediaAgencyId, currentVersion }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/media-agency/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaAgencyId,
          title,
          content,
          version: currentVersion + 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create terms and conditions");
      }

      toast.success("Terms and conditions created successfully!");
      setTitle("");
      setContent("");
      window.location.reload();
    } catch (error) {
      console.error("Error creating TC:", error);
      toast.error("Failed to create terms and conditions");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Standard Terms & Conditions 2024"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your terms and conditions here..."
          rows={10}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Terms & Conditions"
        )}
      </Button>
    </form>
  );
}
