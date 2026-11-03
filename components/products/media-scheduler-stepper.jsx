"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Horizontal planner stepper: completed (check), active (brand), upcoming (muted).
 */
export function MediaSchedulerStepper({
  steps,
  currentStep,
  onStepChange,
  title = "Media Scheduler",
  description = "Select station, dates, airtime, and frequency—then review and add to cart.",
  className,
}) {
  const active = steps.find((step) => step.id === currentStep) || steps[0];

  return (
    <div className={cn("mb-10 sm:mb-12", className)}>
      <div className="mb-7 sm:mb-9">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:mt-3 sm:text-base">
          {description}
        </p>
      </div>

      {/* Mobile: compact current step */}
      <div className="mb-5 flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:hidden">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Step {currentStep} of {steps.length}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-950">{active?.label}</p>
        </div>
        <div className="flex items-center gap-1">
          {steps.map((step) => (
            <span
              key={step.id}
              className={cn(
                "h-1.5 w-4 rounded-full transition-colors",
                currentStep > step.id
                  ? "bg-emerald-400"
                  : currentStep === step.id
                    ? "bg-slate-900"
                    : "bg-slate-200"
              )}
            />
          ))}
        </div>
      </div>

      {/* Desktop / tablet stepper */}
      <div className="hidden sm:block">
        <ol className="flex w-full items-start">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isComplete = currentStep > step.id;
            const isLast = index === steps.length - 1;

            return (
              <li key={step.id} className="relative flex min-w-0 flex-1 flex-col items-center">
                {!isLast ? (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-[calc(50%+1.35rem)] right-[calc(-50%+1.35rem)] top-5 h-0.5",
                      isComplete ? "bg-emerald-300" : "bg-slate-200"
                    )}
                  />
                ) : null}

                <button
                  type="button"
                  onClick={() => onStepChange?.(step.id)}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Go to step ${step.id}: ${step.label}`}
                  className="group relative z-10 flex w-full flex-col items-center outline-none"
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold tabular-nums transition-all duration-200",
                      isActive &&
                        "bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.22)] ring-4 ring-slate-900/10",
                      isComplete &&
                        "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 group-hover:bg-emerald-100",
                      !isActive &&
                        !isComplete &&
                        "border border-slate-200 bg-white text-slate-400 group-hover:border-slate-300 group-hover:text-slate-600"
                    )}
                  >
                    {isComplete ? <Check className="h-4 w-4" strokeWidth={2.75} /> : step.id}
                  </span>
                  <span
                    className={cn(
                      "mt-3 max-w-[7.5rem] text-center text-xs font-medium leading-snug tracking-tight lg:max-w-none lg:text-[13px]",
                      isActive && "text-slate-900",
                      isComplete && "text-emerald-700",
                      !isActive && !isComplete && "text-slate-400 group-hover:text-slate-600"
                    )}
                  >
                    {step.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Small screens: tappable step chips */}
      <div className="-mx-1 overflow-x-auto pb-1 sm:hidden">
        <div className="flex min-w-max gap-2 px-1">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isComplete = currentStep > step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepChange?.(step.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive && "bg-slate-900 text-white",
                  isComplete && "bg-emerald-50 text-emerald-700",
                  !isActive && !isComplete && "bg-slate-100 text-slate-500"
                )}
              >
                {isComplete ? <Check className="h-3.5 w-3.5" strokeWidth={2.75} /> : <span>{step.id}</span>}
                {step.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
