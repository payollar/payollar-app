import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>
      <div className="relative z-10 mx-auto max-w-[90rem] px-4 pb-20 pt-2 md:px-8 md:pt-4">
        <Skeleton className="mb-10 h-56 w-full rounded-2xl bg-muted md:h-64" />
        <Skeleton className="mb-10 h-24 w-full rounded-2xl bg-muted" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[380px] rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
