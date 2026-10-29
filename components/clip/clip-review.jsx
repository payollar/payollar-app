"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Captions, Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const steps = ["Reading the transcript", "Scoring the openers", "Writing captions"];
const ratios = ["9:16", "1:1", "16:9"];

function youtubeId(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, "");
    let id = null;
    if (host === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] ?? null;
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") id = parts[1] ?? null;
    }
    return id && /^[\w-]{10,11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

function stampToSeconds(stamp) {
  const parts = stamp.split(":").map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] ?? 0;
}

export function ClipReview({ open, onOpenChange, url, phase, stepIndex, reel, active, activeId, onSelect, ratio, onRatio }) {
  const videoId = youtubeId(url);
  const [start, setStart] = useState(0);

  useEffect(() => {
    setStart(0);
  }, [url, open]);

  function choose(clip) {
    onSelect(clip.id);
    if (videoId) setStart(stampToSeconds(clip.at));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(92vh,880px)] gap-0 overflow-y-auto border-white/10 bg-[#0c0f18] p-0 text-white sm:max-w-3xl">
        <div className="border-b border-white/8 px-5 py-4 pr-12">
          <DialogTitle className="text-base text-white">Clip studio</DialogTitle>
          <DialogDescription className="mt-1 truncate text-white/45">{reel.label}</DialogDescription>
        </div>

        <div className="px-4 py-4 sm:px-5">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
            {videoId ? (
              <div className="relative aspect-video">
                <iframe
                  key={`${videoId}-${start}`}
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?start=${start}&rel=0${start ? "&autoplay=1" : ""}`}
                  title={reel.label}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <SamplePlayer frames={reel.frames} active={active} />
            )}
          </div>

          <div className="mt-4" aria-live="polite">
            {phase === "running" ? (
              <ul className="space-y-2 rounded-2xl border border-white/8 bg-black/30 p-4">
                {steps.map((step, index) => {
                  const done = index < stepIndex;
                  const current = index === stepIndex;
                  return (
                    <li key={step} className="flex items-center gap-3 text-sm">
                      <span
                        className={cn(
                          "flex size-6 items-center justify-center rounded-full border",
                          done && "border-emerald-400/40 bg-emerald-400/15 text-emerald-300",
                          current && "border-[#0055ff] text-white",
                          !done && !current && "border-white/10 text-white/30"
                        )}
                      >
                        {done ? <Check className="size-3.5" /> : current ? <Loader2 className="size-3.5 animate-spin" /> : index + 1}
                      </span>
                      <span className={current || done ? "text-white" : "text-white/40"}>{step}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {reel.clips.map((clip) => (
                    <button
                      key={clip.id}
                      type="button"
                      onClick={() => choose(clip)}
                      aria-pressed={clip.id === activeId}
                      className={cn(
                        "rounded-2xl border p-2 text-left transition-colors",
                        clip.id === activeId
                          ? "border-[#0055ff] bg-[#0055ff]/10"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20"
                      )}
                    >
                      <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-black sm:aspect-video">
                        {videoId ? (
                          <img
                            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <Image src={clip.image} alt={clip.alt} fill className="object-cover" sizes="240px" />
                        )}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-black/80 to-transparent" />
                        <span className="absolute right-2 top-2 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                          {clip.score}
                        </span>
                        <span className="absolute left-2 top-2 text-[10px] font-medium text-white">{clip.tag}</span>
                        <p className="absolute inset-x-1.5 bottom-1.5 rounded-md bg-black/70 px-1.5 py-1 text-[10px] leading-snug text-white sm:text-[11px]">
                          {clip.line}
                        </p>
                      </div>
                      <p className="mt-2 text-[11px] text-white/45">
                        {clip.at} · {clip.time}
                      </p>
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <Captions className="size-4 shrink-0 text-[#7aa6ff]" />
                      {active.line}
                    </p>
                    <p className="mt-1 text-sm text-white/50">{active.note}</p>
                  </div>
                  <div className="flex w-fit rounded-full border border-white/10 p-0.5" role="group" aria-label="Frame ratio">
                    {ratios.map((item) => (
                      <button
                        key={item}
                        type="button"
                        aria-pressed={ratio === item}
                        onClick={() => onRatio(item)}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs",
                          ratio === item ? "bg-white text-black" : "text-white/55 hover:text-white"
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-xs text-white/40">
                  {videoId ? `Playing your link. Jump to ${active.at} from the board.` : "The sample is on the board."} Ready in {ratio}. Nothing posts until you approve it.
                </p>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SamplePlayer({ frames, active }) {
  return (
    <div>
      <div className="relative aspect-video">
        <Image src={active.image} alt={active.alt} fill className="object-cover" sizes="768px" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-4">
          <p className="text-sm font-medium text-white">{active.line}</p>
          <p className="mt-1 text-xs text-white/70">
            {active.at} · {active.time}
          </p>
        </div>
      </div>
      <div className="flex gap-1.5 p-3">
        {frames.map((frame, index) => (
          <div
            key={frame.src}
            className={cn(
              "relative h-12 min-w-0 flex-1 overflow-hidden rounded-md",
              index === 1 || index === 3 ? "ring-2 ring-[#0055ff]" : "ring-1 ring-white/10"
            )}
          >
            <Image src={frame.src} alt="" fill className="object-cover" sizes="90px" />
          </div>
        ))}
      </div>
    </div>
  );
}
