import { cn } from "@/lib/utils";

export function SectionShell({ children, className }) {
  return (
    <div
      className={cn(
        "w-full mx-auto max-w-7xl px-4 md:px-8 lg:px-12 xl:px-16",
        className
      )}
    >
      {children}
    </div>
  );
}
