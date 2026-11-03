"use client";

import { useLandingTheme } from "@/components/landing/landing-theme";

export default function LandingBackground() {
  const { theme } = useLandingTheme();
  const isLight = theme === "light";

  return (
    <div className="pointer-events-none absolute left-0 top-0 z-0 min-h-dvh w-full overflow-hidden">
      {isLight ? (
        <>
          <div className="absolute inset-0 bg-[#f4f6fb]" />
          <div className="absolute inset-x-0 top-0 h-[42rem] bg-gradient-to-b from-white via-[#f7f9fc] to-transparent" />
          <div className="absolute -left-28 -top-10 h-[32rem] w-[32rem] rounded-full bg-[#0055ff]/[0.08] blur-[7.5rem]" />
          <div className="absolute -right-20 top-24 h-[26rem] w-[26rem] rounded-full bg-sky-300/25 blur-[6.5rem]" />
          <div className="absolute bottom-32 left-[35%] h-[20rem] w-[20rem] rounded-full bg-indigo-200/30 blur-[5.5rem]" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(15,23,42,0.045) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </>
      ) : (
        <>
          <div className="absolute inset-x-0 top-0 mx-auto h-1/4 w-1/4 bg-primary/20 blur-[8rem]" />
          <div
            className="absolute inset-0 -z-10 min-h-screen w-screen opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.07) 1.35px, transparent 1.35px)",
              backgroundSize: "24px 24px",
            }}
          />
        </>
      )}
    </div>
  );
}
