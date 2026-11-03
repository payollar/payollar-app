import { cn } from "@/lib/utils";

/**
 * Guidance list of shows/programs for an airtime slot.
 * Agency-filled values preferred; demo samples used until then.
 */
export function MediaSlotPrograms({
  programs,
  programsSource,
  className,
  max = 3,
}) {
  const list = Array.isArray(programs)
    ? programs.map((p) => String(p).trim()).filter(Boolean)
    : [];
  if (!list.length) return null;

  const shown = list.slice(0, max);
  const rest = list.length - shown.length;
  const isDemo = programsSource === "demo";

  return (
    <p className={cn("mt-1.5 text-xs leading-snug text-slate-500", className)}>
      <span className="font-medium text-slate-600">Programs: </span>
      {shown.join(" · ")}
      {rest > 0 ? ` +${rest} more` : ""}
      {isDemo ? (
        <span className="font-normal text-slate-400"> · demo</span>
      ) : null}
    </p>
  );
}
