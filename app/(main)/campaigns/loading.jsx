export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="h-52 animate-pulse rounded-3xl bg-slate-200" />
      <div className="mt-6 grid gap-5 lg:grid-cols-[15.5rem_minmax(0,1fr)_20rem]">
        <div className="h-80 animate-pulse rounded-2xl bg-white" />
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-white" />
      </div>
    </div>
  );
}
