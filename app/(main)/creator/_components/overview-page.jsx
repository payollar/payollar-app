"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadButton } from "@uploadthing/react";
import {  X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  TrendingUp,
  Calendar,
  BarChart3,
  CreditCard,
  Loader2,
  AlertCircle,
  Plus,
  UserRoundPen,
  Images,
  DollarSign,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { requestPayout } from "@/actions/payout";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs"; 
import { PieChart } from "lucide-react";

export function OverviewPage({ earnings = {}, payouts = [], doctor, initialSkills = [] }) {
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [skills, setSkills] = useState(initialSkills);
  const [newSkill, setNewSkill] = useState("");
  const [portfolio, setPortfolio] = useState([]);

  const {
    thisMonthEarnings = 0,
    completedAppointments = 0,
    averageEarningsPerMonth = 0,
    availableCredits = 0,
    availablePayout = 0,
  } = earnings;

  // Custom hook for payout request
  const { loading, data, fn: submitPayoutRequest } = useFetch(requestPayout);

  // Check if there's any pending payout
  const pendingPayout = payouts.find(
    (payout) => payout.status === "PROCESSING"
  );

  const handlePayoutRequest = async (e) => {
    e.preventDefault();

    if (!paypalEmail) {
      toast.error("PayPal email is required");
      return;
    }

    const formData = new FormData();
    formData.append("paypalEmail", paypalEmail);

    await submitPayoutRequest(formData);
  };

  useEffect(() => {
    if (data?.success) {
      setShowPayoutDialog(false);
      setPaypalEmail("");
      toast.success("Payout request submitted successfully!");
    }
  }, [data]);

  const { getToken } = useAuth();

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const res = await fetch("/api/skills", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSkills(data);
      }
    })();
  }, []);
  
  const addSkill = async () => {
    if (!newSkill.trim()) return;
    const token = await getToken();
  
    const res = await fetch("/api/skills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 👈 only token
      },
      body: JSON.stringify({ name: newSkill }),
    });

  
    if (res.ok) {
      const skill = await res.json();
      setSkills((prev) => [...prev, skill]);
      setNewSkill("");
    }
  };

  const deleteSkill = async (id) => {
    const token = await getToken();
  
    const res = await fetch(`/api/skills?id=${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (res.ok) {
      setSkills((prev) => prev.filter((s) => s.id !== id));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/portfolio", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("Fetched portfolio:", data); // 👈 check this
        if (res.ok) {
          setPortfolio(data);
        } else {
          console.error("Portfolio fetch failed:", data);
        }
      } catch (err) {
        console.error("Failed to load portfolio:", err);
      }
    })();
  }, [getToken]);
  

  

  const platformFee = availableCredits * 2; // $2 per credit

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-emerald-900/20 hover:border-emerald-700/40 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                <p className="text-2xl font-bold text-white">
                  ${(earnings?.totalEarnings || 0).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  All time
                </p>
              </div>
              <div className="bg-emerald-900/20 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-900/20 hover:border-emerald-700/40 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">This Month</p>
                <p className="text-2xl font-bold text-white">
                  ${(earnings?.thisMonthEarnings || 0).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date().toLocaleString('default', { month: 'long' })}
                </p>
              </div>
              <div className="bg-emerald-900/20 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-900/20 hover:border-emerald-700/40 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed Sessions</p>
                <p className="text-2xl font-bold text-white">
                  {earnings?.completedAppointments || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total bookings
                </p>
              </div>
              <div className="bg-emerald-900/20 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Skills and Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-emerald-400" />
              Skills & Expertise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Skill badges */}
            <div className="flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <Badge
                    key={skill.id}
                    className="bg-emerald-800 text-white flex items-center gap-2 px-3 py-1"
                  >
                    {skill.name}
                    <button
                      onClick={() => deleteSkill(skill.id)}
                      className="ml-1 text-gray-300 hover:text-red-400 transition-colors"
                      aria-label={`Remove ${skill.name}`}
                    >
                      ✕
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No skills added yet. Add your expertise to attract more clients!</p>
              )}
            </div>

            {/* Add skill input */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Enter a skill (e.g., Video Editing, Voice Acting)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                className="bg-background border-emerald-900/20 text-white"
              />
              <Button 
                onClick={addSkill} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={!newSkill.trim()}
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-emerald-400" />
              Performance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span className="text-muted-foreground">Average per Month</span>
                <span className="text-white font-semibold">
                  ${(earnings?.averageEarningsPerMonth || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span className="text-muted-foreground">Sessions Completed</span>
                <span className="text-white font-semibold">
                  {earnings?.completedAppointments || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="border-emerald-900/20">

  <CardHeader>
    <CardTitle className="text-xl font-bold text-white flex items-center">
      <Images  className="h-5 w-5 mr-2 text-emerald-400" />
      Portfolio
    </CardTitle>
  </CardHeader>

  <CardContent className="p-6 space-y-4">
  <UploadButton
  endpoint="portfolioUploader"
  onClientUploadComplete={async (res) => {
    const files = res.map((file) => ({
      name: file.name,
      key: file.key,
      url: file.ufsUrl, // ✅ always use ufsUrl
      fileType: file.type || file.fileType || "", // ✅ ensure type is saved
      size: file.size,
    }));

    const token = await getToken();
    const response = await fetch("/api/portfolio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ files }),
    });

    if (response.ok) {
      const saved = await response.json();
      setPortfolio((prev) => [...prev, ...saved]);
    } else {
      console.error("Failed to save portfolio:", await response.json());
    }
  }}
  onUploadError={(error) => console.error("Upload error:", error)}
/>


{/* Uploaded items */}
<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
  {portfolio.length > 0 ? (
    portfolio.map((file, i) => (
      <div
        key={i}
        className="relative rounded-lg overflow-hidden border border-emerald-900/30 group"
      >
       {file.fileType?.startsWith("image/") ? (
  <img
    src={file.url}
    alt={`portfolio-${i}`}
    className="w-full h-60 object-cover"
  />
) : file.fileType?.startsWith("video/") ? (
  <video
    src={file.url}
    controls
    preload="metadata"
    className="w-full h-60 object-cover bg-black"
  >
    Sorry, your browser doesn’t support embedded videos.
  </video>
) : (
  <a
    href={file.url}
    target="_blank"
    rel="noopener noreferrer"
    className="block p-4 text-center text-emerald-400 hover:underline"
  >
    {file.name || "View File"}
  </a>
)}
        {/* Delete button */}
        <button
          onClick={async () => {
            const token = await getToken();
            const res = await fetch(`/api/portfolio?id=${file.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              setPortfolio((prev) =>
                prev.filter((item) => item.id !== file.id)
              );
            }
          }}
          className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ))
  ) : (
    <p className="text-gray-400 text-sm">
      No portfolio items uploaded yet.
    </p>
  )}
  </div>
</CardContent>
</Card>
</div>
  
  );
}
