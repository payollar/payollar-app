import { Skeleton } from "@/components/ui/skeleton";

/** Matches chat page: min-height below navbar, flows with document (no inner scroll box). */
export default function ChatLoading() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-5.25rem)] w-full max-w-[56rem] flex-col md:min-h-[calc(100dvh-7rem)] xl:max-w-[64rem]">
      <div className="flex flex-1 flex-col space-y-4 p-4 sm:p-6">
        <Skeleton className="mx-auto h-8 w-2/3 max-w-sm rounded-lg bg-white/10" />
        <Skeleton className="mx-auto h-4 w-full max-w-md rounded bg-white/10" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Skeleton className="h-32 rounded-2xl bg-white/10 sm:h-36" />
          <Skeleton className="h-32 rounded-2xl bg-white/10 sm:h-36" />
          <Skeleton className="h-32 rounded-2xl bg-white/10 sm:h-36" />
          <Skeleton className="h-32 rounded-2xl bg-white/10 sm:h-36" />
        </div>
      </div>
      <div className="sticky bottom-0 z-30 mt-auto shrink-0 space-y-3 border-t border-white/10 bg-black/95 p-4 backdrop-blur-md">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
          <Skeleton className="h-8 w-16 rounded-full bg-white/10" />
        </div>
        <Skeleton className="h-12 w-full rounded-full bg-white/10" />
      </div>
    </div>
  );
}
