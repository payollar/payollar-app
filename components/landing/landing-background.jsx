export default function LandingBackground() {
  return (
    <div className="pointer-events-none absolute left-0 top-0 z-0 min-h-dvh w-full overflow-hidden">
      <div className="absolute inset-x-0 top-0 mx-auto h-1/4 w-1/4 bg-primary/20 blur-[8rem]" />
      <div
        className="absolute inset-0 -z-10 min-h-screen w-screen opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.07) 1.35px, transparent 1.35px)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}
