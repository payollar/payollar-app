"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Play, Mic, Star, Package, MessageCircle, Film, Music, Radio } from "lucide-react"
import { cn } from "@/lib/utils"

const ICON_MAP = {
  play: Play,
  mic: Mic,
  star: Star,
  box: Package,
  "message-circle": MessageCircle,
  film: Film,
  music: Music,
  radio: Radio,
}

export function AdTypeSelector({ adTypes, selectedAdType, onSelect, mediaType = "tv" }) {
  const accentColor = mediaType === "tv" ? "blue" : "green"

  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">What type of ad are you looking for?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select your preferred ad format to browse available rate cards and stations
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {adTypes.map((adType) => {
          const Icon = ICON_MAP[adType.icon] || Mic
          const isSelected = selectedAdType === adType.id

          return (
            <Card
              key={adType.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md border-2 rounded-xl bg-white dark:bg-zinc-900",
                isSelected
                  ? accentColor === "blue"
                    ? "border-blue-500 bg-blue-500/5 ring-2 ring-blue-500/20"
                    : "border-green-500 bg-green-500/5 ring-2 ring-green-500/20"
                  : "border-border hover:border-muted-foreground/30"
              )}
              onClick={() => onSelect(adType.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center",
                      isSelected
                        ? accentColor === "blue"
                          ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                          : "bg-green-500/20 text-green-600 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base">{adType.label}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{adType.fullName}</p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{adType.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
