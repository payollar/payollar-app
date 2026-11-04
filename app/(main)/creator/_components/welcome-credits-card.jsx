"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BorderBeam } from "border-beam";
import { MetalFx } from "metal-fx";
import { CheckCircle2, Clock3, Gift, Loader2, Sparkles } from "lucide-react";
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

  return (
    <BorderBeam
      size="md"
      theme="dark"
      colorVariant="ocean"
      strength={0.9}
      borderRadius={16}
      duration={7}
      className="w-full"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a1630] via-[#071022] to-[#05080f] p-4">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-[#0055ff]/25 blur-2xl"
        />
        <div className="relative flex items-start gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0055ff]/20 text-[#8eb7ff]">
            <Gift className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Credits</p>
            <p className="mt-1 text-xs leading-relaxed text-white/70">
              {claimed
                ? `GH₵${reward} claimed. Unlocks for payout after your first booking.`
                : expired
                  ? `GH₵${reward} welcome offer has expired.`
                  : `Claim GH₵${reward} free credits. Payout unlocks after your first booking.`}
            </p>
            {!claimed && timerReady && !expired ? (
              <p className="mt-2 font-mono text-xs font-semibold tabular-nums text-[#8eb7ff]">
                {formatRemaining(remainingMs)} left
              </p>
            ) : null}
          </div>
        </div>
        <div className="relative mt-3 inline-flex">
          {claimed ? (
            <MetalFx variant="button" preset="chromatic" theme="dark" strength={0.9}>
              <button
                type="button"
                disabled
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#0055ff] px-3.5 text-xs font-semibold text-white opacity-90"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Claimed
              </button>
            </MetalFx>
          ) : expired ? null : pending ? (
            <button
              type="button"
              disabled
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#0055ff]/60 px-3.5 text-xs font-semibold text-white"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Claiming…
            </button>
          ) : (
            <MetalFx variant="button" preset="chromatic" theme="dark" strength={0.9}>
              <button
                type="button"
                onClick={onClaim}
                className="inline-flex h-8 items-center rounded-full bg-[#0055ff] px-3.5 text-xs font-semibold text-white transition hover:bg-[#0046d4]"
              >
                Claim credits
              </button>
            </MetalFx>
          )}
        </div>
      </div>
    </BorderBeam>
  );
}

export function WelcomeCreditsCard({ offer }) {
  const [pending, startTransition] = useTransition();
  const [localOffer, setLocalOffer] = useState(offer);
  const remainingMs = useCountdown(localOffer?.expiresAt);
  const expired =
    Boolean(localOffer?.expired) ||
    (typeof remainingMs === "number" && remainingMs <= 0 && Boolean(localOffer?.expiresAt));
  const timerReady = typeof remainingMs === "number";

  useEffect(() => {
    setLocalOffer(offer);
  }, [offer]);

  if (!localOffer?.eligible) return null;

  if (localOffer.claimed) {
    return (
      <BorderBeam
        size="md"
        theme="light"
        colorVariant="forest"
        strength={0.75}
        borderRadius={24}
        duration={8}
      >
        <section className="rounded-[24px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-950">Welcome credits claimed</p>
              <p className="mt-1 text-sm text-slate-500">
                GH₵ {localOffer.reward} was added to your balance. You can cash out from Payouts when ready.
              </p>
              <Link
                href="/creator/payouts"
                className="mt-3 inline-flex text-sm font-medium text-[#0055ff] hover:text-[#003ecc]"
              >
                View payouts
              </Link>
            </div>
          </div>
        </section>
      </BorderBeam>
    );
  }

  if (expired) {
    return (
      <section className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Clock3 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-950">Welcome offer expired</p>
            <p className="mt-1 text-sm text-slate-500">
              The GH₵ {localOffer.reward} signup credits window has closed.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const router = useRouter();

  const onClaim = () => {
    startTransition(async () => {
      try {
        const result = await claimCreatorWelcomeCredits();
        setLocalOffer((prev) => ({
          ...prev,
          claimed: true,
          canClaim: false,
          balance: result.credits,
        }));
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

  return (
    <BorderBeam
      size="md"
      theme="light"
      colorVariant="ocean"
      strength={0.85}
      borderRadius={24}
      duration={7}
    >
      <section className="overflow-hidden rounded-[24px] border border-[#dbe7ff] bg-white">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0055ff] text-white">
              <Gift className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#0055ff]">
                <Sparkles className="h-3.5 w-3.5" />
                Welcome offer
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">
                Claim GH₵ {localOffer.reward} free credits
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Claim within 24 hours. Payout unlocks after your first booking.
              </p>
            </div>
          </div>

          <div className="shrink-0 rounded-2xl bg-[#f4f6fb] px-4 py-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Time left
            </p>
            <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-slate-950">
              {timerReady ? formatRemaining(remainingMs) : "--:--:--"}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 p-4 sm:p-5">
          {pending ? (
            <button
              type="button"
              disabled
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-slate-200 text-sm font-semibold text-slate-400"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Claiming…
            </button>
          ) : (
            <MetalFx
              variant="button"
              preset="chromatic"
              theme="light"
              strength={0.95}
              className="w-full"
              style={{ background: "#0055ff", color: "#ffffff" }}
            >
              <button
                type="button"
                onClick={onClaim}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white"
              >
                Claim GH₵ {localOffer.reward} credits
              </button>
            </MetalFx>
          )}
        </div>
      </section>
    </BorderBeam>
  );
}
