"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { ClipReview } from "@/components/clip/clip-review";
import { cn } from "@/lib/utils";

const samples = [
  { label: "48-min interview", url: "youtube.com/watch?v=interview-ep-14" },
  { label: "Friday live set", url: "twitch.tv/sets/friday-live" },
  { label: "Product demo", url: "drive.google.com/file/product-demo" },
];

const library = {
  "youtube.com/watch?v=interview-ep-14": {
    label: "Sample · 48-min interview",
    frames: [
      { src: "/host.jpeg", alt: "Host speaking on stage" },
      { src: "/images/ayra.jpg", alt: "Creator close-up" },
      { src: "/voice.jpeg", alt: "Singer at a microphone" },
      { src: "/images/fave.jpg", alt: "Portrait on a red backdrop" },
      { src: "/images/russ.jpg", alt: "Artist portrait" },
      { src: "/bloggers.jpg", alt: "Creator working outside" },
    ],
    clips: [
      {
        id: "hook",
        score: 96,
        time: "0:27",
        tag: "Hook",
        at: "02:14",
        image: "/host.jpeg",
        alt: "Host speaking on stage",
        line: "Stop posting the whole episode.",
        note: "Opens on a command. Safe-area caption, two lines.",
      },
      {
        id: "story",
        score: 91,
        time: "0:34",
        tag: "Story",
        at: "11:02",
        image: "/images/mellisa.jpg",
        alt: "Creator riding through the city",
        line: "I cut my posting time in half.",
        note: "A number in the first second. Holds the face in frame.",
      },
      {
        id: "demo",
        score: 88,
        time: "0:19",
        tag: "Demo",
        at: "27:40",
        image: "/voice.jpeg",
        alt: "Singer at a microphone",
        line: "Here's the cut I actually post.",
        note: "The face stays in the vertical frame. Ends on the note.",
      },
    ],
  },
  "twitch.tv/sets/friday-live": {
    label: "Sample · Friday live set",
    frames: [
      { src: "/dj.jpeg", alt: "DJ at the decks" },
      { src: "/producer.jpeg", alt: "Producer at a console" },
      { src: "/images/fave.jpg", alt: "Portrait on a red backdrop" },
      { src: "/content.jpeg", alt: "Creator in a leather jacket" },
      { src: "/fashionshow.jpg", alt: "Model on a runway" },
      { src: "/images/kingp.jpg", alt: "Recording session" },
    ],
    clips: [
      {
        id: "hook",
        score: 94,
        time: "0:22",
        tag: "Drop",
        at: "06:40",
        image: "/dj.jpeg",
        alt: "DJ at the decks",
        line: "This is the part people replay.",
        note: "The drop lands in the first second. Hands stay in frame.",
      },
      {
        id: "story",
        score: 89,
        time: "0:31",
        tag: "Set",
        at: "18:05",
        image: "/producer.jpeg",
        alt: "Producer at a console",
        line: "I built the set around one loop.",
        note: "Wide room, then a tighter crop on the hands.",
      },
      {
        id: "demo",
        score: 86,
        time: "0:18",
        tag: "Crowd",
        at: "41:12",
        image: "/fashionshow.jpg",
        alt: "Model on a runway",
        line: "Watch the room when it hits.",
        note: "A wide shot that still reads as a vertical cut.",
      },
    ],
  },
  "drive.google.com/file/product-demo": {
    label: "Sample · Product demo",
    frames: [
      { src: "/techproduct.jpg", alt: "Product flat lay" },
      { src: "/foodcontent.jpg", alt: "Food being photographed" },
      { src: "/clipping.jpg", alt: "Edit bay with a timeline on screen" },
      { src: "/design2.jpg", alt: "Design still" },
      { src: "/bloggers.jpg", alt: "Creator working outside" },
      { src: "/content.jpeg", alt: "Creator in a leather jacket" },
    ],
    clips: [
      {
        id: "hook",
        score: 93,
        time: "0:16",
        tag: "Open",
        at: "00:42",
        image: "/techproduct.jpg",
        alt: "Product flat lay",
        line: "Unbox it. Then show the click.",
        note: "The product fills the frame before the talking starts.",
      },
      {
        id: "story",
        score: 90,
        time: "0:28",
        tag: "Use",
        at: "04:18",
        image: "/foodcontent.jpg",
        alt: "Food being photographed",
        line: "Film the result, not the setup.",
        note: "The plate stays readable in 9:16 and 1:1.",
      },
      {
        id: "demo",
        score: 85,
        time: "0:24",
        tag: "Cut",
        at: "09:03",
        image: "/clipping.jpg",
        alt: "Edit bay with a timeline on screen",
        line: "Here's the cut I actually post.",
        note: "Screen stays readable. Ends on the finished file.",
      },
    ],
  },
};

const steps = ["Reading the transcript", "Scoring the openers", "Writing captions"];

const bars = [18, 28, 22, 40, 34, 56, 48, 70, 44, 62, 38, 80, 52, 36, 64, 42, 30, 58, 46, 24, 50, 72, 40, 28, 60, 34, 48, 22];

function looksLikeLink(value) {
  return /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}([/?#].*)?$/i.test(value.trim());
}

export function ClipHero() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [phase, setPhase] = useState("preview");
  const [stepIndex, setStepIndex] = useState(0);
  const [reel, setReel] = useState(library[samples[0].url]);
  const [activeId, setActiveId] = useState(library[samples[0].url].clips[0].id);
  const [ratio, setRatio] = useState("9:16");

  useEffect(() => {
    if (phase !== "running") return undefined;
    setStepIndex(0);
    const timers = steps.map((_, index) =>
      setTimeout(() => {
        setStepIndex(index);
        if (index === steps.length - 1) {
          setTimeout(() => setPhase("done"), 650);
        }
      }, 700 * (index + 1))
    );
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  function run(nextUrl, label) {
    const value = nextUrl.trim();
    if (!looksLikeLink(value)) {
      setError("Paste a video link, or pick a sample below.");
      return;
    }
    setError("");
    setUrl(value);
    const nextReel = library[value] ?? {
      ...library[samples[0].url],
      label: label || value.replace(/^https?:\/\//, ""),
    };
    setReel(nextReel);
    setActiveId(nextReel.clips[0].id);
    setPhase("running");
    setReviewOpen(true);
  }

  const active = reel.clips.find((clip) => clip.id === activeId) ?? reel.clips[0];
  const showClips = phase !== "running";

  return (
    <section id="try" className="scroll-mt-24 px-4 pb-8 pt-28 sm:px-6 lg:pt-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1.5 pr-3 text-sm text-white/80">
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-black">
              For creators
            </span>
            <span style={{ fontFamily: "var(--font-handwriting), cursive" }} className="text-base text-white/85">
              the long video is already filmed
            </span>
          </p>

          <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-[4.4rem]">
            One recording.
            <span className="mt-1 block bg-linear-to-r from-white via-blue-200 to-[#7aa6ff] bg-clip-text text-transparent">
              A week of posts.
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg">
            Paste a podcast, stream, or YouTube link. Clip marks the moments worth posting, writes the on-screen
            captions, and hands you a cut for every feed.
          </p>

          <form
            className="mt-8"
            onSubmit={(event) => {
              event.preventDefault();
              run(url);
            }}
          >
            <label htmlFor="clip-url" className="sr-only">
              Video link
            </label>
            <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 sm:flex-row sm:items-center">
              <input
                id="clip-url"
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  if (error) setError("");
                }}
                placeholder="Paste a YouTube, podcast, or drive link"
                className="h-12 min-w-0 flex-1 bg-transparent px-3 text-base text-white outline-none placeholder:text-white/35"
                autoComplete="off"
              />
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0055ff] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1a66ff] disabled:opacity-70"
                disabled={phase === "running"}
              >
                {phase === "running" ? <Loader2 className="size-4 animate-spin" /> : <ArrowUpRight className="size-4" />}
                Find clips
              </button>
            </div>
            {error && (
              <p className="mt-2 px-1 text-sm text-red-300" role="alert">
                {error}
              </p>
            )}
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {samples.map((sample) => (
              <button
                key={sample.url}
                type="button"
                onClick={() => run(sample.url, `Sample · ${sample.label}`)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/75 transition-colors hover:border-white/25 hover:text-white"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        <ClipReview
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          url={url}
          phase={phase}
          stepIndex={stepIndex}
          reel={reel}
          active={active}
          activeId={activeId}
          onSelect={setActiveId}
          ratio={ratio}
          onRatio={setRatio}
        />

        <Studio
          phase={phase}
          stepIndex={stepIndex}
          projectLabel={reel.label}
          frames={reel.frames}
          clips={reel.clips}
          showClips={showClips}
          activeId={activeId}
          onSelect={setActiveId}
        />
      </div>
    </section>
  );
}

function Studio({ phase, stepIndex, projectLabel, frames, clips, showClips, activeId, onSelect }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-8 rounded-full bg-[#0055ff]/20 blur-3xl" aria-hidden />
      <div className="relative rounded-3xl border border-white/10 bg-[#0c0f18] shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2 text-xs text-white/55">
            <span className="size-2 rounded-full bg-emerald-400" />
            Clip studio
          </div>
          <p className="truncate pl-4 text-xs text-white/40">{projectLabel}</p>
        </div>

        <div className="px-4 py-4 sm:px-5">
          <div className="flex gap-1.5">
            {frames.map((frame, index) => (
              <div
                key={frame.src}
                className={cn(
                  "relative h-14 min-w-0 flex-1 overflow-hidden rounded-md",
                  index === 1 || index === 3 ? "ring-2 ring-[#0055ff]" : "ring-1 ring-white/10"
                )}
              >
                <Image src={frame.src} alt={frame.alt} fill className="object-cover" sizes="90px" />
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-end gap-1" aria-hidden>
            {bars.map((height, index) => {
              const hot = index > 8 && index < 18;
              return (
                <span
                  key={index}
                  className={cn("min-w-0 flex-1 rounded-sm", hot ? "bg-[#0055ff]" : "bg-white/15")}
                  style={{ height: Math.max(8, Math.round(height * 0.45)) }}
                />
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-white/35">
            <span>00:00</span>
            <span>Moments in blue</span>
            <span>48:12</span>
          </div>
        </div>

        <div className="px-4 pb-4 sm:px-5" aria-live="polite">
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
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {showClips &&
                clips.map((clip) => (
                  <button
                    key={clip.id}
                    type="button"
                    onClick={() => onSelect(clip.id)}
                    aria-pressed={clip.id === activeId}
                    className={cn(
                      "rounded-2xl border p-2 text-left transition-colors",
                      clip.id === activeId
                        ? "border-[#0055ff] bg-[#0055ff]/10"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20"
                    )}
                  >
                    <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-black">
                      <Image src={clip.image} alt={clip.alt} fill className="object-cover" sizes="180px" />
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
          )}
        </div>
      </div>
    </div>
  );
}
