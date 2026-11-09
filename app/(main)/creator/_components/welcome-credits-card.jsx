"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BorderBeam } from "border-beam";
import { MetalFx } from "metal-fx";
import { CheckCircle2, Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { claimCreatorWelcomeCredits, getCreatorWelcomeCreditsStatus } from "@/actions/credits";
import { useSidebar } from "@/components/ui/sidebar";

function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  // Cap display under 24:00:00 so a full day never reads as an extra hour
  const capped = Math.min(totalSeconds, 24 * 60 * 60 - 1);
  const hours = Math.floor(capped / 3600);
  const minutes = Math.floor((capped % 3600) / 60);
  const seconds = capped % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, "0")).join(":");
}

/** Stable countdown from a fixed expiresAt — no fallback flash to 24:00:00. */
function useCountdown(expiresAt) {
  const [remainingMs, setRemainingMs] = useState(null);

  useEffect(() => {
    if (!expiresAt) {
      setRemainingMs(null);
      return undefined;
    }

    const end = new Date(expiresAt).getTime();
    if (Number.isNaN(end)) {
      setRemainingMs(null);
      return undefined;
    }

    const tick = () => setRemainingMs(Math.max(0, end - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  return remainingMs;
}

/** Compact sidebar promo with live 24h countdown. Claims credits then opens Earnings. */
export function SidebarWelcomeCreditsPromo() {
  const [offer, setOffer] = useState(null);
  const [pending, startTransition] = useTransition();
  const { setOpenMobile } = useSidebar();
  const router = useRouter();
  const reward = offer?.reward ?? 100;
  const remainingMs = useCountdown(offer?.expiresAt);
  const expired =
    Boolean(offer?.expired) ||
    (typeof remainingMs === "number" && remainingMs <= 0 && Boolean(offer?.expiresAt));
  const claimed = Boolean(offer?.claimed);
  const timerReady = typeof remainingMs === "number";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await getCreatorWelcomeCreditsStatus();
        if (!cancelled) setOffer(status);
      } catch (error) {
        console.error("Welcome credits status failed:", error);
        if (!cancelled) {
          setOffer({
            eligible: true,
            claimed: false,
            expired: false,
            reward: 100,
            remainingMs: 24 * 60 * 60 * 1000 - 1000,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000 - 1000).toISOString(),
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onClaim = () => {
    startTransition(async () => {
      try {
        const result = await claimCreatorWelcomeCredits();
        setOffer((prev) => ({ ...prev, claimed: true, canClaim: false }));
        setOpenMobile(false);
        toast.success(
          `GH₵ ${result.rewarded} added — unlocks for payout after your first booking`
        );
        router.push("/creator/payouts");
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Could not claim credits");
      }
    });
  };

  const blurb = claimed
    ? `GH₵${reward} claimed · unlocks after first booking`
    : expired
      ? `GH₵${reward} welcome offer expired`
      : `Claim GH₵${reward} free credits`;

  return (
    <BorderBeam
      size="sm"
      theme="dark"
      colorVariant="ocean"
      strength={0.75}
      borderRadius={14}
      duration={7}
      className="w-full"
    >
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#0a1630] via-[#071022] to-[#05080f] px-3 py-2.5">
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0055ff]/20 text-[#8eb7ff]">
            <Gift className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-xs font-semibold text-white">Credits</p>
              {!claimed && timerReady && !expired ? (
                <p className="shrink-0 font-mono text-[10px] font-semibold tabular-nums text-[#8eb7ff]">
                  {formatRemaining(remainingMs)}
                </p>
              ) : null}
            </div>
            <p className="mt-0.5 truncate text-[11px] leading-snug text-white/65">
              {blurb}
            </p>
          </div>
        </div>
        {!claimed && !expired ? (
          <div className="relative mt-2">
            {pending ? (
              <button
                type="button"
                disabled
                className="inline-flex h-7 w-full items-center justify-center gap-1.5 rounded-full bg-[#0055ff]/60 px-3 text-[11px] font-semibold text-white"
              >
                <Loader2 className="h-3 w-3 animate-spin" />
                Claiming…
              </button>
            ) : (
              <MetalFx variant="button" preset="chromatic" theme="dark" strength={0.85}>
                <button
                  type="button"
                  onClick={onClaim}
                  className="inline-flex h-7 w-full items-center justify-center rounded-full bg-[#0055ff] px-3 text-[11px] font-semibold text-white transition hover:bg-[#0046d4]"
                >
                  Claim credits
                </button>
              </MetalFx>
            )}
          </div>
        ) : claimed ? (
          <div className="relative mt-2">
            <MetalFx variant="button" preset="chromatic" theme="dark" strength={0.85}>
              <button
                type="button"
                disabled
                className="inline-flex h-7 w-full items-center justify-center gap-1.5 rounded-full bg-[#0055ff] px-3 text-[11px] font-semibold text-white opacity-90"
              >
                <CheckCircle2 className="h-3 w-3" />
                Claimed
              </button>
            </MetalFx>
          </div>
        ) : null}
      </div>
    </BorderBeam>
  );
}
