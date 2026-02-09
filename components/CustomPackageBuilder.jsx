"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

// Time class tabs (Premium, M1–M4) with base rate per 30 sec in GHS
const TIME_CLASSES = [
  { id: "premium", label: "Premium", rate30: 1500, timeRange: "6:00pm - 10:00pm" },
  { id: "m1", label: "M1", rate30: 1209.52, timeRange: "6:00am - 10:00am" },
  { id: "m2", label: "M2", rate30: 1000, timeRange: "10:00am - 2:00pm" },
  { id: "m3", label: "M3", rate30: 850, timeRange: "2:00pm - 6:00pm" },
  { id: "m4", label: "M4", rate30: 700, timeRange: "6:00pm - 10:00pm" },
]

const SPOT_LENGTHS = [
  { value: 15, label: "15 sec" },
  { value: 30, label: "30 sec" },
  { value: 45, label: "45 sec" },
  { value: 60, label: "60 sec" },
]

const FREQUENCIES = [
  { id: "once", label: "Once" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "custom", label: "Custom Dates" },
]

const VAT_RATE = 0.15

function getDaysBetween(start, end) {
  if (!start || !end) return 0
  const s = new Date(start)
  const e = new Date(end)
  s.setHours(0, 0, 0, 0)
  e.setHours(0, 0, 0, 0)
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff + 1)
}

function getCalendarDays(year, month) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startPad = first.getDay()
  const days = []
  for (let i = 0; i < startPad; i++) days.push(null)
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d))
  return days
}

const MONTHS = "January,February,March,April,May,June,July,August,September,October,November,December".split(",")
const DAY_NAMES = "Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(",")
// Short labels for weekday view (Sun=0 .. Sat=6)
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function toDateKey(d) {
  const x = new Date(d)
  const y = x.getFullYear()
  const m = String(x.getMonth() + 1).padStart(2, "0")
  const day = String(x.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

// Normalize listing time classes from API (ratePer30Sec) to builder shape (rate30)
function normalizeTimeClasses(listingTimeClasses) {
  if (!listingTimeClasses?.length) return null
  return listingTimeClasses.map((tc) => ({
    id: tc.id,
    label: tc.label,
    timeRange: tc.timeRange,
    rate30: Number(tc.ratePer30Sec),
  }))
}

export default function CustomPackageBuilder({ mediaType = "tv", onPackageSubmit, stationName, timeClasses: listingTimeClasses }) {
  const effectiveTimeClasses = useMemo(
    () => normalizeTimeClasses(listingTimeClasses) || TIME_CLASSES,
    [listingTimeClasses]
  )
  const firstTimeClassId = effectiveTimeClasses[0]?.id ?? "m1"

  const [timeClassId, setTimeClassId] = useState(firstTimeClassId)
  const [dayType, setDayType] = useState("mon-fri") // "mon-fri" | "sat-sun"
  const [spotLength, setSpotLength] = useState(30)
  const [frequency, setFrequency] = useState("daily")
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [customDates, setCustomDates] = useState([]) // for "Custom Dates" frequency
  // Times per frequency: e.g. 2 = 2 spots per day (Daily), 2 per week (Weekly), 2 per date (Custom)
  const [timesPerFrequency, setTimesPerFrequency] = useState(1)
  // Week day view: which days to include [Sun=0, Mon=1, ..., Sat=6]. Spots per day = timesPerFrequency.
  const [selectedWeekdays, setSelectedWeekdays] = useState(() => [false, true, true, true, true, true, false]) // Mon–Fri by default
  // Step 4: per-date time classes (mix). Key = dateKey "YYYY-MM-DD", value = array of time class ids
  const [dateTimeClasses, setDateTimeClasses] = useState({})

  useEffect(() => {
    const exists = effectiveTimeClasses.some((t) => t.id === timeClassId)
    if (!exists) setTimeClassId(firstTimeClassId)
  }, [effectiveTimeClasses, timeClassId, firstTimeClassId])

  const timeClass = useMemo(() => effectiveTimeClasses.find((t) => t.id === timeClassId) || effectiveTimeClasses[0], [effectiveTimeClasses, timeClassId])
  const spotMultiplier = useMemo(() => spotLength / 30, [spotLength])
  const costPerSpot = useMemo(
    () => timeClass.rate30 * spotMultiplier,
    [timeClass.rate30, spotMultiplier]
  )

  // Selected dates array (from Step 3)
  const selectedDatesArray = useMemo(() => {
    if (frequency === "once" && startDate) return [new Date(startDate)]
    if (frequency === "daily" && startDate && endDate) {
      const out = []
      const s = new Date(startDate)
      const e = new Date(endDate)
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) out.push(new Date(d))
      return out
    }
    if (frequency === "weekly" && startDate && endDate) {
      const out = []
      const s = new Date(startDate)
      const e = new Date(endDate)
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) out.push(new Date(d))
      return out
    }
    if (frequency === "custom") return customDates.map((d) => new Date(d)).sort((a, b) => a - b)
    return []
  }, [frequency, startDate, endDate, customDates])

  // Mixed schedule: only dates whose day of week is selected; spots per day = timesPerFrequency.
  const mixedRows = useMemo(() => {
    const multiplier = Math.max(1, timesPerFrequency)
    return selectedDatesArray
      .filter((date) => selectedWeekdays[date.getDay()])
      .map((date) => {
        const key = toDateKey(date)
        const classIds = dateTimeClasses[key]?.length ? dateTimeClasses[key] : [timeClassId]
        const baseDayCost = classIds.reduce((sum, cid) => {
          const tc = effectiveTimeClasses.find((t) => t.id === cid)
          return sum + (tc ? tc.rate30 * spotMultiplier : 0)
        }, 0)
        const dayOfWeek = date.getDay()
        const spotsForDay = multiplier
        const dayCost = baseDayCost * spotsForDay
        const labels = classIds.map((cid) => effectiveTimeClasses.find((t) => t.id === cid)?.label || cid).join(" + ")
        const ranges = classIds.map((cid) => effectiveTimeClasses.find((t) => t.id === cid)?.timeRange || "").join(", ")
        return {
          date,
          key,
          dayName: DAY_NAMES[dayOfWeek],
          classIds,
          labels,
          ranges,
          dayCost,
          baseDayCost,
          spotsForDay,
        }
      })
  }, [selectedDatesArray, dateTimeClasses, timeClassId, spotMultiplier, selectedWeekdays, timesPerFrequency, effectiveTimeClasses])

  const numSpots = useMemo(() => {
    if (mixedRows.length > 0) return mixedRows.reduce((sum, r) => sum + (r.spotsForDay ?? 0), 0)
    const multiplier = Math.max(1, timesPerFrequency)
    if (frequency === "once") return 1 * multiplier
    if (frequency === "daily" && startDate && endDate) return getDaysBetween(startDate, endDate) * multiplier
    if (frequency === "weekly" && startDate && endDate) {
      const weeks = Math.ceil(getDaysBetween(startDate, endDate) / 7)
      return weeks * multiplier
    }
    if (frequency === "custom") return customDates.length * multiplier
    return 0
  }, [mixedRows, frequency, startDate, endDate, customDates, timesPerFrequency])

  const subtotal = useMemo(() => {
    if (mixedRows.length > 0) return mixedRows.reduce((sum, r) => sum + r.dayCost, 0)
    return costPerSpot * numSpots
  }, [mixedRows, costPerSpot, numSpots])

  const vat = useMemo(() => subtotal * VAT_RATE, [subtotal])
  const totalCost = useMemo(() => subtotal + vat, [subtotal, vat])

  const uniqueTimeClassLabels = useMemo(() => {
    const ids = new Set()
    mixedRows.forEach((r) => r.classIds.forEach((id) => ids.add(id)))
    return Array.from(ids)
      .map((id) => effectiveTimeClasses.find((t) => t.id === id)?.label || id)
      .sort()
      .join(", ")
  }, [mixedRows, effectiveTimeClasses])

  const calculations = useMemo(
    () => ({
      costPerSpot,
      numSpots,
      subtotal,
      vat,
      finalTotal: totalCost,
      totalQuantity: numSpots,
      totalDays: frequency === "daily" && startDate && endDate ? getDaysBetween(startDate, endDate) : undefined,
      weeks: frequency === "weekly" && startDate && endDate ? Math.ceil(getDaysBetween(startDate, endDate) / 7) : undefined,
      mixedRows,
      dateTimeClasses,
    }),
    [costPerSpot, numSpots, subtotal, vat, totalCost, frequency, startDate, endDate, mixedRows, dateTimeClasses]
  )

  const calendarDays = useMemo(
    () => getCalendarDays(calendarMonth.year, calendarMonth.month),
    [calendarMonth.year, calendarMonth.month]
  )

  const isDateInRange = (d) => {
    if (!d) return false
    const t = d.getTime()
    if (frequency === "custom") return customDates.some((x) => new Date(x).setHours(0, 0, 0, 0) === new Date(t).setHours(0, 0, 0, 0))
    if (!startDate || !endDate) return false
    const s = new Date(startDate).setHours(0, 0, 0, 0)
    const e = new Date(endDate).setHours(0, 0, 0, 0)
    const v = new Date(t).setHours(0, 0, 0, 0)
    return v >= s && v <= e
  }

  const handleCalendarClick = (d) => {
    if (!d) return
    if (frequency === "custom") {
      const key = d.toDateString()
      setCustomDates((prev) => {
        const has = prev.some((x) => new Date(x).toDateString() === key)
        if (has) return prev.filter((x) => new Date(x).toDateString() !== key)
        return [...prev, d].sort((a, b) => a - b)
      })
      return
    }
    if (!startDate || (startDate && endDate)) {
      setStartDate(d)
      setEndDate(null)
    } else {
      const s = startDate.getTime()
      const e = d.getTime()
      if (e < s) {
        setStartDate(d)
        setEndDate(startDate)
      } else {
        setEndDate(d)
      }
    }
  }

  const frequencyLabel = useMemo(() => {
    if (frequency === "once") return "Once (1 day)"
    if (frequency === "daily" && startDate && endDate) {
      const days = getDaysBetween(startDate, endDate)
      return `Daily (${days} days)`
    }
    if (frequency === "weekly" && startDate && endDate) {
      const weeks = Math.ceil(getDaysBetween(startDate, endDate) / 7)
      return `Weekly (${weeks} weeks)`
    }
    if (frequency === "custom") return `Custom (${customDates.length} dates)`
    return "—"
  }, [frequency, startDate, endDate, customDates])

  const summaryText = useMemo(() => {
    if (frequency !== "daily" || !startDate || !endDate) return null
    const s = new Date(startDate)
    const e = new Date(endDate)
    const sm = MONTHS[s.getMonth()]
    const em = MONTHS[e.getMonth()]
    return `Your ad will air daily from ${sm} ${s.getDate()} - ${em} ${e.getDate()}.`
  }, [frequency, startDate, endDate])

  const handleAddToMediaPlan = () => {
    const weeks =
      calculations.weeks ??
      (frequency === "daily" && calculations.totalDays ? Math.ceil(calculations.totalDays / 7) : numSpots > 0 ? 1 : 0)
    const packageData = {
      type: "custom",
      mediaType,
      timeClass: timeClassId,
      timeClassLabel: timeClass.label,
      spotLength,
      frequency,
      startDate: startDate?.toISOString?.(),
      endDate: endDate?.toISOString?.(),
      customDates: customDates.map((d) => d.toISOString?.()),
      timesPerFrequency,
      selectedWeekdays,
      dateTimeClasses: mixedRows.length > 0 ? dateTimeClasses : undefined,
      mixedRows: mixedRows.length > 0 ? mixedRows.map((r) => ({ dateKey: r.key, classIds: r.classIds, dayCost: r.dayCost, labels: r.labels, spotsForDay: r.spotsForDay })) : undefined,
      calculations: {
        ...calculations,
        costPerSpot,
        subtotal,
        vat,
        finalTotal: totalCost,
        totalQuantity: numSpots,
      },
      weeks,
    }
    onPackageSubmit?.(packageData)
  }

  const toggleDateClass = (dateKey, classId) => {
    setDateTimeClasses((prev) => {
      const current = prev[dateKey] || [timeClassId]
      const has = current.includes(classId)
      const next = has ? current.filter((c) => c !== classId) : [...current, classId]
      if (next.length === 0) return { ...prev, [dateKey]: [timeClassId] } // keep at least one
      return { ...prev, [dateKey]: next }
    })
  }

  const canSubmit = numSpots > 0

  return (
    <div className="rounded-xl border bg-card text-card-foreground overflow-hidden">
      {/* Time class tabs + Mon-Fri / Sat-Sun */}
      <div className="border-b bg-muted/30 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg overflow-hidden border border-border bg-background p-0.5">
            {effectiveTimeClasses.map((tc) => (
              <button
                key={tc.id}
                type="button"
                onClick={() => setTimeClassId(tc.id)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors",
                  timeClassId === tc.id
                    ? "bg-amber-700 text-white rounded-md shadow"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tc.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 border rounded-lg overflow-hidden bg-background">
            <button
              type="button"
              onClick={() => setDayType("mon-fri")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                dayType === "mon-fri" ? "bg-teal-600 text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Mon-Fri
            </button>
            <button
              type="button"
              onClick={() => setDayType("sat-sun")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                dayType === "sat-sun" ? "bg-teal-600 text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sat-Sun
            </button>
          </div>
          <span className="text-sm text-muted-foreground">{timeClass.timeRange}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 p-6">
        {/* Left: Steps */}
        <div className="lg:col-span-3 space-y-6">
          {/* Step 1: Spot length */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Step 1: Select Spot Length</Label>
            <div className="flex flex-wrap gap-2">
              {SPOT_LENGTHS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSpotLength(opt.value)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium border-2 transition-colors",
                    spotLength === opt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Frequency */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Step 2: Select Frequency</Label>
            <div className="flex flex-wrap gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFrequency(f.id)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium border transition-colors",
                    frequency === f.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Times per frequency */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Number of times per {frequency === "once" ? "occurrence" : frequency === "daily" ? "day" : frequency === "weekly" ? "week" : "selected date"}
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              How many spots do you want {frequency === "once" ? "for this single run" : frequency === "daily" ? "each day" : frequency === "weekly" ? "each week" : "on each selected date"}?
            </p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                disabled={frequency === "once" || timesPerFrequency <= 1}
                onClick={() => setTimesPerFrequency((n) => Math.max(1, n - 1))}
              >
                −
              </Button>
              <Input
                type="number"
                min={1}
                max={20}
                value={timesPerFrequency}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  if (!Number.isNaN(v)) setTimesPerFrequency(Math.max(1, Math.min(20, v)))
                }}
                className="w-24 h-10 text-center"
                disabled={frequency === "once"}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                disabled={frequency === "once" || timesPerFrequency >= 20}
                onClick={() => setTimesPerFrequency((n) => Math.min(20, n + 1))}
              >
                +
              </Button>
              {frequency !== "once" && (
                <span className="text-sm text-muted-foreground">
                  {timesPerFrequency} {timesPerFrequency === 1 ? "time" : "times"} per {frequency === "daily" ? "day" : frequency === "weekly" ? "week" : "date"}
                </span>
              )}
            </div>
          </div>

          {/* Week day view: which days to run (spots per day = number selected above) */}
          <div>
            <Label className="text-base font-semibold mb-2 block">Days of the week</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Select which days to run your ads. Each uses {timesPerFrequency} {timesPerFrequency === 1 ? "spot" : "spots"} (from above).
            </p>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_LABELS.map((label, dayIndex) => (
                <button
                  key={dayIndex}
                  type="button"
                  onClick={() =>
                    setSelectedWeekdays((prev) => {
                      const next = [...prev]
                      next[dayIndex] = !next[dayIndex]
                      return next
                    })
                  }
                  className={cn(
                    "min-w-[3rem] py-2.5 px-3 rounded-lg text-sm font-medium border-2 transition-colors",
                    selectedWeekdays[dayIndex]
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/40 border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/60"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Dates */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Step 3: Select Dates</Label>
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarMonth((m) =>
                        m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 }
                      )
                    }
                    className="p-2 rounded-md hover:bg-muted"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-medium">
                    {MONTHS[calendarMonth.month]} {calendarMonth.year}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarMonth((m) =>
                        m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 }
                      )
                    }
                    className="p-2 rounded-md hover:bg-muted"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((d, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => d && handleCalendarClick(d)}
                      disabled={!d}
                      className={cn(
                        "aspect-square rounded-md text-sm font-medium transition-colors",
                        !d && "invisible",
                        d && isDateInRange(d) && "bg-emerald-600 text-white",
                        d && !isDateInRange(d) && "hover:bg-muted"
                      )}
                    >
                      {d ? d.getDate() : ""}
                    </button>
                  ))}
                </div>
                {summaryText && (
                  <p className="mt-4 text-sm text-muted-foreground">{summaryText}</p>
                )}
                <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
                  Next
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Step 4: Mixed Time Classes Summary */}
          <div>
            <div className="mb-2">
              <Label className="text-base font-semibold block">Step 4: Mixed Time Classes Summary</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Build a custom schedule by combining different time classes.
              </p>
            </div>
            {selectedDatesArray.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  Select dates in Step 3 to see and edit your mixed time class schedule here.
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 font-medium">Date</th>
                          <th className="text-left p-3 font-medium">Day</th>
                          <th className="text-left p-3 font-medium">Time Class(es)</th>
                          <th className="text-left p-3 font-medium">Notes</th>
                          <th className="text-left p-3 font-medium">Time Range</th>
                          <th className="text-center p-3 font-medium">Spots</th>
                          <th className="text-right p-3 font-medium">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mixedRows.map((row) => (
                          <tr key={row.key} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="p-3">
                              {MONTHS[row.date.getMonth()]} {row.date.getDate()}, {row.date.getFullYear()}
                            </td>
                            <td className="p-3">{row.dayName}</td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {effectiveTimeClasses.map((tc) => {
                                  const isOn = row.classIds.includes(tc.id)
                                  return (
                                    <button
                                      key={tc.id}
                                      type="button"
                                      onClick={() => toggleDateClass(row.key, tc.id)}
                                      className={cn(
                                        "rounded px-2 py-1 text-xs font-medium border transition-colors",
                                        isOn
                                          ? "bg-emerald-600 text-white border-emerald-600"
                                          : "bg-muted/50 border-border text-muted-foreground hover:border-emerald-500"
                                      )}
                                    >
                                      {tc.label}
                                    </button>
                                  )
                                })}
                              </div>
                            </td>
                            <td className="p-3 text-muted-foreground">—</td>
                            <td className="p-3 text-muted-foreground">{row.ranges}</td>
                            <td className="p-3 text-center font-medium">{row.spotsForDay ?? 0}</td>
                            <td className="p-3 text-right font-medium">
                              GHS {row.dayCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {summaryText && (
                    <p className="p-4 pt-0 text-sm text-muted-foreground border-t">{summaryText}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right: Your Booking Summary */}
        <div className="lg:col-span-2">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Your Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time Class:</span>
                <span className="font-medium text-right max-w-[60%]">
                  {mixedRows.length > 0 ? uniqueTimeClassLabels : timeClass.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spot Length:</span>
                <span className="font-medium">{spotLength} sec</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {mixedRows.length > 0 ? "Time classes:" : "Frequency:"}
                </span>
                <span className="font-medium">
                  {mixedRows.length > 0
                    ? `${numSpots} Spots | ${spotLength} sec`
                    : frequencyLabel}
                </span>
              </div>
              {mixedRows.length === 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost per spot:</span>
                  <span className="font-medium">GHS {costPerSpot.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">GHS {subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT (15%):</span>
                <span className="font-medium">GHS {vat.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-bold text-base">
                <span>Total Cost:</span>
                <span className="text-primary">GHS {totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <Button
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                size="lg"
                disabled={!canSubmit}
                onClick={handleAddToMediaPlan}
              >
                <Play className="h-4 w-4 mr-2" />
                Add to Media Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
