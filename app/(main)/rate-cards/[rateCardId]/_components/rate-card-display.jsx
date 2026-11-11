"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { BookOpen, Building2, Calculator, Clock, ShoppingCart, X, Eye, CreditCard, ShoppingBag, Trash2, ArrowLeft, MapPin, Radio, Filter, BadgeCheck, ArrowRight, Globe } from "lucide-react";
import { getAdTypesForMediaType, getAdTypeById } from "@/lib/ad-types";
import {
  DAY_BAND_MON_FRI,
  DAY_BAND_SAT_SUN,
  normalizeDayBand,
} from "@/lib/tv-airtime-slots";
import { cn } from "@/lib/utils";

// Helper to read a semantic "role" from a SmartTableColumn config JSON.
// We use this to identify special columns like time classes.
const getColumnRole = (column) => {
  if (!column || !column.config) return null;
  const cfg = column.config;
  if (typeof cfg === "object" && cfg !== null && "role" in cfg) {
    return cfg.role;
  }
  return null;
};

// Find the time class column in a table, using either the explicit role
// or a sensible name/dataType heuristic as a fallback.
const getTimeClassColumn = (table) => {
  if (!table?.columns) return null;

  // Prefer explicit role
  const viaRole = table.columns.find((col) => getColumnRole(col) === "time_class");
  if (viaRole) return viaRole;

  // Fallback: dropdown column whose name looks like a time class field
  return (
    table.columns.find(
      (col) =>
        col.dataType === "DROPDOWN" &&
        typeof col.name === "string" &&
        col.name.toLowerCase().includes("time") &&
        col.name.toLowerCase().includes("class")
    ) || null
  );
};

const getDayBandColumn = (table) => {
  if (!table?.columns) return null;
  const viaRole = table.columns.find((col) => getColumnRole(col) === "day_band");
  if (viaRole) return viaRole;
  return (
    table.columns.find(
      (col) =>
        typeof col.name === "string" &&
        /^(days?|day\s*band|day\s*type)$/i.test(col.name.trim())
    ) || null
  );
};

const DAY_BAND_FILTER_OPTIONS = [
  { id: DAY_BAND_MON_FRI, label: "Mon–Fri" },
  { id: DAY_BAND_SAT_SUN, label: "Sat–Sun" },
];

function dayBandLabel(band) {
  if (band === DAY_BAND_SAT_SUN) return "Sat–Sun";
  if (band === DAY_BAND_MON_FRI) return "Mon–Fri";
  return null;
}

// Find rate for selected ad type + time class (+ optional day band).
// Prefers duration columns (30s default), then legacy rate_ad_type.
function getAdTypeRateFromRateCard(
  rateCard,
  selectedAdTypeId,
  selectedTimeClassForItem,
  durationSec = 30,
  preferredDayBand = null
) {
  if (!rateCard?.sections || !selectedAdTypeId) return null;
  const norm = (v) => (v && String(v).trim().toLowerCase()) || "";
  const targetId = norm(selectedAdTypeId);
  const preferredSecs = [durationSec, 30, 15, 45, 60].filter(
    (v, i, arr) => Number.isFinite(v) && arr.indexOf(v) === i
  );
  const wantBand = preferredDayBand
    ? normalizeDayBand(preferredDayBand)
    : null;

  for (const section of rateCard.sections) {
    for (const table of section.tables || []) {
      const columns = table.columns || [];
      const adTypeCol = columns.find(
        (c) => getColumnRole(c) === "ad_type_identifier"
      );
      const timeClassCol = columns.find(
        (c) => getColumnRole(c) === "time_class"
      );
      const dayBandCol = columns.find(
        (c) => getColumnRole(c) === "day_band"
      );
      const rateAdTypeCol = columns.find(
        (c) => getColumnRole(c) === "rate_ad_type"
      );
      const durationCols = preferredSecs
        .map((sec) =>
          columns.find((c) => getColumnRole(c) === `rate_${sec}s`)
        )
        .filter(Boolean);

      if (!adTypeCol) continue;
      if (!rateAdTypeCol && durationCols.length === 0) continue;

      for (const row of table.rows || []) {
        const adTypeVal = row.cells?.find(
          (c) => c.columnId === adTypeCol.id
        )?.value;
        if (norm(adTypeVal) !== targetId) continue;

        if (timeClassCol && selectedTimeClassForItem) {
          const tcVal = row.cells?.find(
            (c) => c.columnId === timeClassCol.id
          )?.value;
          const rowTc = tcVal && String(tcVal).trim();
          if (rowTc !== selectedTimeClassForItem) continue;
        }

        if (dayBandCol && wantBand) {
          const rowBand = normalizeDayBand(
            row.cells?.find((c) => c.columnId === dayBandCol.id)?.value
          );
          if (rowBand !== wantBand) continue;
        }

        const readRate = () => {
          for (const col of durationCols) {
            const rateVal = row.cells?.find(
              (c) => c.columnId === col.id
            )?.value;
            const num = parseFloat(rateVal);
            if (!isNaN(num) && num > 0) return num;
          }
          if (rateAdTypeCol) {
            const rateVal = row.cells?.find(
              (c) => c.columnId === rateAdTypeCol.id
            )?.value;
            const num = parseFloat(rateVal);
            if (!isNaN(num) && num > 0) return num;
          }
          return null;
        };

        const rate = readRate();
        if (rate == null) continue;
        return rate;
      }
    }
  }
  return null;
}

// Check if a section matches the ad type filter (for ad-type sections).
function sectionMatchesAdTypeFilter(section, selectedAdTypeFilter) {
  if (!selectedAdTypeFilter || selectedAdTypeFilter === "ALL") return true;
  const norm = (v) => (v && String(v).trim().toLowerCase()) || "";
  const target = norm(selectedAdTypeFilter);
  const titleNorm = norm(section.title);
  if (titleNorm === target || titleNorm.replace(/\s+/g, "-") === target) {
    return true;
  }

  let sawAdTypeTable = false;
  for (const table of section.tables || []) {
    const adTypeCol = table.columns?.find(
      (c) => getColumnRole(c) === "ad_type_identifier"
    );
    // Legacy / generic tables (no ad-type column) stay visible for any filter
    if (!adTypeCol) return true;
    sawAdTypeTable = true;
    for (const row of table.rows || []) {
      const val = row.cells?.find((c) => c.columnId === adTypeCol.id)?.value;
      if (norm(val) === target) return true;
    }
  }
  if (!sawAdTypeTable) return true;
  return false;
}

// Check if a row matches the currently selected time class filter.
const rowMatchesTimeClassFilter = (table, row, selectedTimeClass, getCellValueFn) => {
  if (selectedTimeClass === "ALL") return true;
  const timeClassColumn = getTimeClassColumn(table);
  if (!timeClassColumn) return true;

  const raw = getCellValueFn(row, timeClassColumn.id);
  const value = typeof raw === "string" ? raw.trim() : raw;
  return !!value && value === selectedTimeClass;
};

const rowMatchesDayBandFilter = (table, row, selectedDayBand, getCellValueFn) => {
  if (selectedDayBand === "ALL") return true;
  const dayBandColumn = getDayBandColumn(table);
  // No Days column → legacy sheet; show under every day filter
  if (!dayBandColumn) return true;
  const raw = getCellValueFn(row, dayBandColumn.id);
  const rowBand = normalizeDayBand(raw);
  // Empty / invalid Days cell does not match a specific filter
  if (!rowBand) return false;
  return rowBand === selectedDayBand;
};

// Cart item structure
const CART_STORAGE_KEY = "rateCardCart";

// Tax rates - Ghana standard
const VAT_RATE = 0.15;      // VAT 15%
const NHIL_GETFUND_RATE = 0.05;  // NHIL 2.5% + GETFund 2.5% = 5%

// Period calculation constants
const FREQUENCIES = [
  { id: "once", label: "Once" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
];

function getDaysBetween(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff + 1);
}

export function RateCardDisplay({
  rateCard,
  mediaStations = [],
  initialAdType = null,
  initialCampaignName = null,
  isDraftPreview = false,
}) {
  const mediaType = (rateCard?.listingType || "TV").toLowerCase();
  const adTypes = getAdTypesForMediaType(mediaType);

  // Track selected cells by "rowId-columnId" key
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [mediaCampaignName, setMediaCampaignName] = useState(
    () => (typeof initialCampaignName === "string" ? initialCampaignName : "")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTimeClass, setSelectedTimeClass] = useState("ALL");
  const [selectedDayBand, setSelectedDayBand] = useState(DAY_BAND_MON_FRI);
  const [selectedAdTypeFilter, setSelectedAdTypeFilter] = useState(() => {
    if (initialAdType && adTypes.some((t) => t.id === initialAdType)) return initialAdType;
    return "ALL";
  });
  const [selectedAdType, setSelectedAdType] = useState(() => {
    if (initialAdType && adTypes.some((t) => t.id === initialAdType)) return initialAdType;
    return adTypes[0]?.id || null;
  });

  // Period calculator state
  const [frequency, setFrequency] = useState("once");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  });
  const [timesPerFrequency, setTimesPerFrequency] = useState(1);
  const [isPeriodCalcOpen, setIsPeriodCalcOpen] = useState(false);

  // Ensure dialogs are properly closed on unmount
  useEffect(() => {
    return () => {
      setIsSummaryDialogOpen(false);
      setIsCartOpen(false);
    };
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Error loading cart:", e);
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  // Close period calculator drawer when all selections are cleared
  useEffect(() => {
    if (selectedCells.size === 0) setIsPeriodCalcOpen(false);
  }, [selectedCells.size]);

  const formatCellValue = (value, column) => {
    if (!value) return "-";

    switch (column.dataType) {
      case "CURRENCY":
        return `₵${parseFloat(value).toLocaleString()}`;
      case "NUMBER":
        return parseFloat(value).toLocaleString();
      case "BOOLEAN":
        return value === "true" ? "Yes" : "No";
      default:
        return value;
    }
  };

  const getCellValue = (row, columnId) => {
    const cell = row.cells?.find((c) => c.columnId === columnId);
    return cell?.value || "";
  };

  const isRowBookable = (row, table) => {
    if (!row.isBookable) return false;

    // Check if all required booking columns have values
    const requiredColumns = table.columns.filter((col) => col.isRequiredForBooking);
    for (const column of requiredColumns) {
      const value = getCellValue(row, column.id);
      if (!value || value.trim() === "") {
        return false;
      }
    }

    return true;
  };

  // Toggle cell selection
  const toggleCellSelection = (rowId, columnId) => {
    const cellKey = `${rowId}-${columnId}`;
    const newSelected = new Set(selectedCells);
    if (newSelected.has(cellKey)) {
      newSelected.delete(cellKey);
    } else {
      newSelected.add(cellKey);
    }
    setSelectedCells(newSelected);
  };

  // Check if a cell is selected
  const isCellSelected = (rowId, columnId) => {
    return selectedCells.has(`${rowId}-${columnId}`);
  };

  // Get all selected cell data with context
  const getSelectedCellsData = () => {
    const selectedData = [];
    
    rateCard.sections?.forEach((section) => {
      section.tables?.forEach((table) => {
        table.rows?.forEach((row) => {
          if (!isRowBookable(row, table)) return;
          
          table.columns.forEach((column) => {
            const cellKey = `${row.id}-${column.id}`;
            if (selectedCells.has(cellKey)) {
              const value = getCellValue(row, column.id);
              if (value && value.trim() !== "") {
                selectedData.push({
                  rowId: row.id,
                  columnId: column.id,
                  row,
                  column,
                  table,
                  section,
                  value,
                  formattedValue: formatCellValue(value, column),
                });
              }
            }
          });
        });
      });
    });
    
    return selectedData;
  };

  const selectedCellsData = useMemo(() => getSelectedCellsData(), [selectedCells, rateCard]);

  // Get time class for current selection: from filter if set, else from first selected row
  const selectedTimeClassForItem = useMemo(() => {
    if (selectedTimeClass !== "ALL") return selectedTimeClass;
    if (selectedCellsData.length === 0) return null;
    const first = selectedCellsData[0];
    const table = first?.table;
    if (!table) return null;
    const timeClassColumn = getTimeClassColumn(table);
    if (!timeClassColumn) return null;
    const val = getCellValue(first.row, timeClassColumn.id);
    return val && typeof val === "string" ? val.trim() : val;
  }, [selectedTimeClass, selectedCellsData]);

  // Collect distinct time class values across all tables that expose a time class column.
  const timeClassValues = useMemo(() => {
    const values = new Set();

    rateCard.sections?.forEach((section) => {
      section.tables?.forEach((table) => {
        const timeClassColumn = getTimeClassColumn(table);
        if (!timeClassColumn) return;

        table.rows?.forEach((row) => {
          const raw = getCellValue(row, timeClassColumn.id);
          const value = typeof raw === "string" ? raw.trim() : raw;
          if (value) {
            values.add(value);
          }
        });
      });
    });

    return Array.from(values);
  }, [rateCard]);

  const hasDayBandColumns = useMemo(() => {
    return (rateCard.sections || []).some((section) =>
      (section.tables || []).some((table) => Boolean(getDayBandColumn(table)))
    );
  }, [rateCard]);

  // Cost per spot: use the spot the user selected (sum of selected rate cells).
  // Only fall back to ad type rate when no rate cells are selected.
  // When Days = All, don't sum Mon–Fri + Sat–Sun for the same spot length.
  const costPerSpot = useMemo(() => {
    const rateCells = selectedCellsData.filter(
      ({ column, value }) =>
        ["CURRENCY", "NUMBER"].includes(column.dataType) &&
        !isNaN(parseFloat(value)) &&
        parseFloat(value) > 0
    );
    let cellsToSum = rateCells;
    if (hasDayBandColumns && rateCells.length > 1) {
      const bandOf = (entry) => {
        const col = getDayBandColumn(entry.table);
        if (!col) return null;
        return normalizeDayBand(getCellValue(entry.row, col.id));
      };
      const preferred =
        selectedDayBand !== "ALL"
          ? selectedDayBand
          : bandOf(rateCells[0]) || DAY_BAND_MON_FRI;
      const sameBand = rateCells.filter((entry) => {
        const band = bandOf(entry);
        return !band || band === preferred;
      });
      if (sameBand.length > 0) cellsToSum = sameBand;
    }

    let sum = 0;
    cellsToSum.forEach(({ value }) => {
      sum += parseFloat(value);
    });
    if (sum > 0) return sum;
    const adTypeRate = getAdTypeRateFromRateCard(
      rateCard,
      selectedAdType,
      selectedTimeClassForItem,
      30,
      selectedDayBand === "ALL" ? DAY_BAND_MON_FRI : selectedDayBand
    );
    if (adTypeRate != null && adTypeRate > 0) return adTypeRate;
    return 0;
  }, [
    rateCard,
    selectedAdType,
    selectedTimeClassForItem,
    selectedDayBand,
    selectedCellsData,
    hasDayBandColumns,
  ]);

  // Number of spots based on period (frequency, dates, times per period)
  const numSpots = useMemo(() => {
    const multiplier = Math.max(1, timesPerFrequency);
    if (frequency === "once") return 1 * multiplier;
    if (frequency === "daily" && startDate && endDate) {
      return getDaysBetween(startDate, endDate) * multiplier;
    }
    if (frequency === "weekly" && startDate && endDate) {
      const weeks = Math.ceil(getDaysBetween(startDate, endDate) / 7);
      return weeks * multiplier;
    }
    return 1;
  }, [frequency, startDate, endDate, timesPerFrequency]);

  // Period-calculated total: cost per spot × number of spots
  const periodTotal = useMemo(() => costPerSpot * numSpots, [costPerSpot, numSpots]);

  // Legacy: simple sum (for backward compatibility when numSpots = 1)
  const calculateTotal = () => periodTotal;

  // Add selected items to cart as a line item (ad type + time class)
  const addToCart = () => {
    if (selectedCells.size === 0) {
      toast.error("Please select at least one item to add to cart");
      return;
    }
    if (!mediaCampaignName?.trim()) {
      toast.error("Media campaign name is required");
      return;
    }
    if (timeClassValues.length > 0 && !selectedTimeClassForItem) {
      toast.error("Please filter by a time class above for this line item");
      return;
    }
    if (!selectedAdType) {
      toast.error("Please select an ad type for this line item");
      return;
    }

    const adTypeObj = getAdTypeById(mediaType, selectedAdType);

    const cartItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      rateCardId: rateCard.id,
      rateCardTitle: rateCard.title,
      agencyName: rateCard.agency.agencyName,
      adType: adTypeObj ? { id: adTypeObj.id, label: adTypeObj.label, fullName: adTypeObj.fullName } : null,
      timeClass: selectedTimeClassForItem,
      dayBand:
        selectedDayBand === "ALL"
          ? DAY_BAND_MON_FRI
          : selectedDayBand,
      selectedCells: Array.from(selectedCells),
      selectedCellsData: selectedCellsData.map(({ rowId, columnId, row, column, table, section, value, formattedValue }) => ({
        rowId,
        columnId,
        row: {
          id: row.id,
          isBookable: row.isBookable,
        },
        column: {
          id: column.id,
          name: column.name,
          dataType: column.dataType,
        },
        table: {
          id: table.id,
          title: table.title,
        },
        section: {
          id: section.id,
          title: section.title,
        },
        value,
        formattedValue,
      })),
      total: periodTotal,
      costPerSpot,
      numSpots,
      periodConfig: {
        frequency,
        startDate,
        endDate,
        timesPerFrequency,
      },
      mediaCampaignName: mediaCampaignName.trim(),
      createdAt: new Date().toISOString(),
    };

    setCart((prevCart) => [...prevCart, cartItem]);
    setSelectedCells(new Set());
    setIsSummaryDialogOpen(false);
    toast.success("Line item added! Add more ad types or time classes, or proceed to checkout.");
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    toast.success("Item removed from cart");
  };

  // Calculate cart subtotal (before tax)
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.total || 0), 0);
  }, [cart]);

  // Calculate cart VAT, NHIL & GETFund, and total
  const cartVat = useMemo(() => cartSubtotal * VAT_RATE, [cartSubtotal]);
  const cartNhilGetfund = useMemo(() => cartSubtotal * NHIL_GETFUND_RATE, [cartSubtotal]);
  const cartTotal = useMemo(() => cartSubtotal + cartVat + cartNhilGetfund, [cartSubtotal, cartVat, cartNhilGetfund]);

  // Get cart item count
  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.selectedCells.length, 0);
  }, [cart]);

  const handlePayment = async () => {
    if (selectedCells.size === 0) {
      toast.error("Please select at least one item to book");
      return;
    }

    if (!mediaCampaignName?.trim()) {
      toast.error("Media campaign name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare selected cells data for payment
      const selectedCellsForPayment = selectedCellsData.map(({ rowId, columnId, value }) => ({
        rowId,
        columnId,
        value,
      }));

      // Initialize Paystack payment (use periodTotal for period-based calculation)
      const response = await fetch("/api/paystack/initialize-media-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rateCardId: rateCard.id,
          selectedCells: selectedCellsForPayment,
          mediaCampaignName: mediaCampaignName.trim(),
          totalAmount: periodTotal * (1 + VAT_RATE + NHIL_GETFUND_RATE),
          periodConfig: numSpots > 1 ? { costPerSpot, numSpots, frequency, startDate, endDate, timesPerFrequency } : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment");
      }

      // Redirect to Paystack
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        throw new Error("No authorization URL received");
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error(error.message || "Failed to initialize payment. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleBooking = async () => {
    if (selectedCells.size === 0) {
      toast.error("Please select at least one item to book");
      return;
    }

    if (!mediaCampaignName?.trim()) {
      toast.error("Media campaign name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      // Group selected cells by row (each row becomes one booking)
      const rowsToBook = new Map();
      
      selectedCellsData.forEach(({ rowId, row, table, section }) => {
        if (!rowsToBook.has(rowId)) {
          rowsToBook.set(rowId, {
            row,
            table,
            section,
            selectedColumns: [],
          });
        }
        const rowData = rowsToBook.get(rowId);
        // Get all selected columns for this row
        table.columns.forEach((column) => {
          if (selectedCells.has(`${rowId}-${column.id}`)) {
            rowData.selectedColumns.push(column);
          }
        });
      });

      // Book each row that has selected cells
      const bookingPromises = Array.from(rowsToBook.values()).map((rowData) => {
        return fetch("/api/media-agency/rate-cards/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rowId: rowData.row.id,
            rateCardId: rateCard.id,
            mediaCampaignName: mediaCampaignName.trim(),
          }),
        });
      });

      const responses = await Promise.all(bookingPromises);
      const results = await Promise.all(responses.map((r) => r.json()));

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(
          `Successfully booked ${successCount} item${successCount > 1 ? "s" : ""}${
            failCount > 0 ? ` (${failCount} failed)` : ""
          }`
        );
        setSelectedCells(new Set());
        setMediaCampaignName("");
        setIsSummaryDialogOpen(false);
      } else {
        toast.error("Failed to submit bookings");
      }
    } catch (error) {
      console.error("Error submitting bookings:", error);
      toast.error("Failed to submit bookings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const agency = rateCard.agency || null;
  const agencyName = agency?.agencyName || "Media partner";
  const agencyLogo = agency?.logoUrl || null;
  const agencyId = agency?.id || null;
  const agencyPlace = [agency?.city || agency?.region, agency?.country]
    .filter(Boolean)
    .join(", ");
  const currentStation =
    mediaStations.find((s) => s.rateCard?.id === rateCard.id) ||
    mediaStations.find((s) => s.id === rateCard.listingId) ||
    null;
  const filterChipClass = (active) =>
    cn(
      "h-8 shrink-0 rounded-full border px-3 text-xs font-semibold transition",
      active
        ? "border-[#0055ff] bg-[#0055ff] text-white shadow-sm shadow-[#0055ff]/25 hover:bg-[#0046d4]"
        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
    );

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900">
      {isDraftPreview ? (
        <div className="border-b border-amber-200 bg-amber-50 text-amber-950">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm sm:px-6 lg:px-8">
            <p className="font-medium">
              Draft preview — only you can see this. Publish the card to make it public.
            </p>
            <Link
              href="/media-agency/smart-rate-card"
              className="text-sm font-semibold text-amber-800 underline-offset-4 hover:underline"
            >
              Back to editor
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 pb-36 pt-5 sm:px-6 sm:pt-7 lg:px-8">
        <Link
          href="/products"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Back to products
        </Link>

        {/* Media profile banner */}
        <header className="overflow-hidden rounded-2xl border border-white bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="h-1 bg-gradient-to-r from-[#0055ff] via-[#3b82f6] to-[#0055ff]" aria-hidden />
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
            <div className="flex min-w-0 flex-1 gap-4">
              {agencyLogo ? (
                <div className="shrink-0 self-start rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={agencyLogo}
                    alt={agencyName}
                    className="h-16 w-16 rounded-xl object-cover sm:h-[4.5rem] sm:w-[4.5rem]"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#0055ff] sm:h-[4.5rem] sm:w-[4.5rem]">
                  <Building2 className="h-7 w-7" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#0055ff]">
                    Media profile
                  </span>
                  {agency?.verificationStatus === "VERIFIED" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                      <BadgeCheck className="h-3 w-3" />
                      Verified
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-2.5 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  {agencyId ? (
                    <Link
                      href={`/media-agencies/${agencyId}`}
                      className="hover:text-[#0055ff]"
                    >
                      {agencyName}
                    </Link>
                  ) : (
                    agencyName
                  )}
                </h1>
                {(agency?.description || agencyPlace) && (
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-[15px]">
                    {agency.description ||
                      `Stations and rates from ${agencyName}`}
                  </p>
                )}
                <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                  {agencyPlace ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {agencyPlace}
                    </span>
                  ) : rateCard.location ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {rateCard.location}
                    </span>
                  ) : null}
                  {agency?.website ? (
                    <a
                      href={
                        agency.website.startsWith("http")
                          ? agency.website
                          : `https://${agency.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-[#0055ff] hover:underline"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {agency.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5" />
                    {mediaStations.length} station
                    {mediaStations.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </div>
            {agencyId ? (
              <Button
                asChild
                variant="outline"
                className="h-10 shrink-0 rounded-full border-slate-200 px-4 text-xs font-semibold"
              >
                <Link href={`/media-agencies/${agencyId}`}>
                  Full media profile
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : null}
          </div>
        </header>

        {/* Stations / listings */}
        {mediaStations.length > 0 ? (
          <section className="mt-5 overflow-hidden rounded-2xl border border-white bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <h2 className="text-sm font-semibold text-slate-950">Stations</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Pick a station to view its published rates
              </p>
            </div>
            <ul className="divide-y divide-slate-100">
              {mediaStations.map((station) => {
                const active =
                  station.rateCard?.id === rateCard.id ||
                  station.id === rateCard.listingId;
                const card = station.rateCard;
                return (
                  <li key={station.id}>
                    <div
                      className={cn(
                        "flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
                        active && "bg-[#f5f8ff]"
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-950">
                            {station.name}
                          </p>
                          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                            {String(station.listingType).replaceAll("_", " ")}
                          </span>
                          {active ? (
                            <span className="rounded-full bg-[#0055ff] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                              Viewing
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {[station.location, station.frequency, station.reach]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </p>
                        {card ? (
                          <p className="mt-1 text-xs font-medium text-[#0055ff]">
                            {card.title}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-slate-400">
                            No published rate card
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {card ? (
                          active ? (
                            <Button
                              type="button"
                              disabled
                              variant="outline"
                              className="h-9 rounded-full border-[#0055ff]/20 bg-white px-4 text-xs text-[#0055ff]"
                            >
                              Current rates
                            </Button>
                          ) : (
                            <Button
                              asChild
                              className="h-9 rounded-full bg-slate-950 px-4 text-xs text-white hover:bg-slate-800"
                            >
                              <Link href={`/rate-cards/${card.id}`}>
                                View rates
                                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          )
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {/* Current rate card context */}
        <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#0055ff]">
              Rate card
            </span>
            {rateCard.listingType ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                {rateCard.listingType}
              </span>
            ) : null}
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            {rateCard.title}
          </h2>
          {currentStation ? (
            <p className="mt-1 text-sm text-slate-500">
              Station: {currentStation.name}
              {rateCard.location ? ` · ${rateCard.location}` : ""}
            </p>
          ) : rateCard.location ? (
            <p className="mt-1 text-sm text-slate-500">{rateCard.location}</p>
          ) : null}
          {rateCard.description ? (
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              {rateCard.description}
            </p>
          ) : null}
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            Updated {format(new Date(rateCard.lastUpdated), "MMM d, yyyy")}
          </p>
        </div>

        {/* Filters */}
        <div className="sticky top-3 z-30 mt-5 rounded-2xl border border-white bg-white/95 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-md sm:p-5">
          <div className="mb-3 flex items-start gap-2.5">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eef2ff] text-[#0055ff]">
              <Filter className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-950">Refine rates</h2>
              <p className="text-xs text-slate-500">
                Pick ad type, weekdays or weekend, and time class — then tap a
                rate.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Ad type
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  type="button"
                  className={filterChipClass(selectedAdTypeFilter === "ALL")}
                  onClick={() => setSelectedAdTypeFilter("ALL")}
                >
                  All
                </button>
                {adTypes.map((at) => (
                  <button
                    key={at.id}
                    type="button"
                    className={filterChipClass(selectedAdTypeFilter === at.id)}
                    onClick={() => {
                      setSelectedAdTypeFilter(at.id);
                      setSelectedAdType(at.id);
                      setSelectedCells(new Set());
                    }}
                  >
                    {at.label}
                  </button>
                ))}
              </div>
            </div>

            {hasDayBandColumns ? (
              <div className="space-y-2 border-t border-slate-100 pt-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Days
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    className={filterChipClass(selectedDayBand === "ALL")}
                    onClick={() => {
                      setSelectedDayBand("ALL");
                      setSelectedCells(new Set());
                    }}
                  >
                    All
                  </button>
                  {DAY_BAND_FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={filterChipClass(selectedDayBand === opt.id)}
                      onClick={() => {
                        setSelectedDayBand(opt.id);
                        setSelectedCells(new Set());
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {timeClassValues.length > 0 ? (
              <div className="space-y-2 border-t border-slate-100 pt-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Time class
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    className={filterChipClass(selectedTimeClass === "ALL")}
                    onClick={() => setSelectedTimeClass("ALL")}
                  >
                    All
                  </button>
                  {timeClassValues.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={filterChipClass(selectedTimeClass === value)}
                      onClick={() => setSelectedTimeClass(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Period Calculator - drawer opens when a spot is clicked */}
        <Sheet open={isPeriodCalcOpen} onOpenChange={setIsPeriodCalcOpen}>
          <SheetContent side="right" elevated className="w-full sm:max-w-md overflow-y-auto p-0 border-l border-border/80">
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60 bg-muted/20">
                <SheetTitle className="text-lg">Period calculator</SheetTitle>
                <SheetDescription className="text-sm leading-relaxed">
                  Set frequency and dates to estimate your campaign total. Tap a rate in the table first.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
              {costPerSpot > 0 ? (
                <>
                  <div>
                    <Label className="text-sm font-medium">Ad type (line item)</Label>
                    <p className="text-sm mt-2 font-medium bg-white px-3 py-2 rounded w-fit text-black">
                      {selectedAdType ? getAdTypeById(mediaType, selectedAdType)?.label || selectedAdType : "—"}
                    </p>
                  </div>
                  {timeClassValues.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Time class (line item)</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedTimeClass === "ALL"
                          ? "Filter by time class above, or your selection will use the first row's class"
                          : `Selected: ${selectedTimeClass}`}
                      </p>
                    </div>
                  )}
                  {hasDayBandColumns ? (
                    <div>
                      <Label className="text-sm font-medium">Days</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedDayBand === "ALL"
                          ? "Using Mon–Fri rates by default — pick Days above to switch"
                          : selectedDayBand === DAY_BAND_SAT_SUN
                            ? "Sat–Sun rates"
                            : "Mon–Fri rates"}
                      </p>
                    </div>
                  ) : null}
                  <div>
                    <Label className="text-sm font-medium">Cost per spot</Label>
                    <p className="text-xl font-bold text-primary mt-1">
                      ₵{costPerSpot.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedCellsData.some((d) => ["CURRENCY", "NUMBER"].includes(d.column.dataType) && parseFloat(d.value) > 0)
                        ? "From selected spot"
                        : getAdTypeRateFromRateCard(
                            rateCard,
                            selectedAdType,
                            selectedTimeClassForItem,
                            30,
                            selectedDayBand === "ALL"
                              ? DAY_BAND_MON_FRI
                              : selectedDayBand
                          ) != null
                          ? "From ad type, time class, and days"
                          : "Select a spot or ad type"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Frequency</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {FREQUENCIES.map((f) => (
                        <Button
                          key={f.id}
                          size="sm"
                          variant={frequency === f.id ? "default" : "outline"}
                          onClick={() => setFrequency(f.id)}
                        >
                          {f.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {(frequency === "daily" || frequency === "weekly") && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="periodStartDate">Start date</Label>
                        <Input
                          id="periodStartDate"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="periodEndDate">End date</Label>
                        <Input
                          id="periodEndDate"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium">
                      Spots per {frequency === "once" ? "occurrence" : frequency === "daily" ? "day" : "week"}
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        disabled={timesPerFrequency <= 1}
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
                          const v = parseInt(e.target.value, 10);
                          if (!Number.isNaN(v)) setTimesPerFrequency(Math.max(1, Math.min(20, v)));
                        }}
                        className="w-20 h-9 text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        disabled={timesPerFrequency >= 20}
                        onClick={() => setTimesPerFrequency((n) => Math.min(20, n + 1))}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Number of spots</span>
                      <span>{numSpots}</span>
                    </div>
                    <div className="space-y-2 mt-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₵{periodTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">VAT (15%)</span>
                        <span>₵{(periodTotal * VAT_RATE).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">NHIL & GETFund (5%)</span>
                        <span>₵{(periodTotal * NHIL_GETFUND_RATE).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold mt-2 pt-2 border-t">
                      <span>Total</span>
                      <span className="text-2xl text-primary">
                        ₵{(periodTotal * (1 + VAT_RATE + NHIL_GETFUND_RATE)).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ₵{costPerSpot.toLocaleString()} × {numSpots} spots
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-xl bg-muted/30 border border-dashed border-border/80 mx-1">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                    <Clock className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground">No rate selected yet</p>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
                    Tap a price or rate cell in the table below. The calculator will open automatically when you select a numeric rate.
                  </p>
                </div>
              )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Sections */}
        <div className="mt-8 space-y-8">
          {rateCard.sections
            ?.filter((section) =>
              sectionMatchesAdTypeFilter(section, selectedAdTypeFilter)
            )
            ?.map((section) => (
            <section key={section.id} className="scroll-mt-28">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0055ff]">
                    Rates
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                    {section.title}
                  </h2>
                </div>
              </div>

              {section.tables?.map((table) => {
                // When filtering by a specific time class / day band, hide those columns
                const timeClassColumn = getTimeClassColumn(table);
                const dayBandColumn = getDayBandColumn(table);
                const displayColumns = table.columns.filter(
                  (col) => col.isVisibleOnFrontend !== false
                );
                let visibleColumns = displayColumns;
                if (selectedTimeClass !== "ALL" && timeClassColumn) {
                  visibleColumns = visibleColumns.filter(
                    (col) => col.id !== timeClassColumn.id
                  );
                }
                if (selectedDayBand !== "ALL" && dayBandColumn) {
                  visibleColumns = visibleColumns.filter(
                    (col) => col.id !== dayBandColumn.id
                  );
                }

                return (
                <div
                  key={table.id}
                  className="mb-5 overflow-hidden rounded-2xl border border-white bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                >
                  {table.title ? (
                    <div className="border-b border-slate-100 bg-[#fafbfd] px-4 py-3 sm:px-5">
                      <h3 className="text-sm font-semibold text-slate-900">{table.title}</h3>
                    </div>
                  ) : null}
                  <div className="overflow-x-auto">
                      <table className="w-full min-w-[32rem] border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 bg-[#f7f8fc]">
                            {visibleColumns.map((column) => (
                              <th
                                key={column.id}
                                className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:px-5"
                              >
                                {column.name}
                                {column.isRequiredForBooking && (
                                  <span className="ml-1 text-[#0055ff]">*</span>
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows
                            .filter((row) => isRowBookable(row, table))
                            .filter((row) =>
                              rowMatchesTimeClassFilter(
                                table,
                                row,
                                selectedTimeClass,
                                getCellValue
                              )
                            )
                            .filter((row) =>
                              rowMatchesDayBandFilter(
                                table,
                                row,
                                selectedDayBand,
                                getCellValue
                              )
                            )
                            .map((row) => (
                              <tr
                                key={row.id}
                                className="border-b border-slate-100 last:border-0 transition-colors hover:bg-[#f8faff]"
                              >
                                {visibleColumns.map((column) => {
                                  const cellValue = getCellValue(row, column.id);
                                  const isSelected = isCellSelected(row.id, column.id);
                                  const isEmpty = !cellValue || cellValue.trim() === "" || cellValue === "-";
                                  const isTimeClassCell = timeClassColumn && column.id === timeClassColumn.id;
                                  const isDayBandCell = dayBandColumn && column.id === dayBandColumn.id;
                                  const isFilterActive =
                                    (isTimeClassCell && selectedTimeClass === cellValue) ||
                                    (isDayBandCell &&
                                      normalizeDayBand(cellValue) === selectedDayBand);
                                  const isRateCell = ["CURRENCY", "NUMBER"].includes(column.dataType);

                                  return (
                                    <td
                                      key={column.id}
                                      className={cn(
                                        "px-4 py-3.5 transition sm:px-5",
                                        isEmpty
                                          ? "cursor-default text-slate-300"
                                          : "cursor-pointer",
                                        isSelected &&
                                          "bg-[#eef2ff] ring-2 ring-inset ring-[#0055ff]/20"
                                      )}
                                      onClick={() => {
                                        if (isEmpty) return;
                                        if (isTimeClassCell) {
                                          setSelectedTimeClass(cellValue);
                                          return;
                                        }
                                        if (isDayBandCell) {
                                          const band = normalizeDayBand(cellValue);
                                          if (band) setSelectedDayBand(band);
                                          return;
                                        }
                                        const wasSelected = isCellSelected(row.id, column.id);
                                        toggleCellSelection(row.id, column.id);
                                        if (!wasSelected && isRateCell) {
                                          setIsPeriodCalcOpen(true);
                                        }
                                      }}
                                    >
                                      {isTimeClassCell || isDayBandCell ? (
                                        <span
                                          className={cn(
                                            "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                                            isFilterActive
                                              ? "border-[#0055ff] bg-[#0055ff] text-white"
                                              : "border-slate-200 bg-slate-50 text-slate-700"
                                          )}
                                        >
                                          {formatCellValue(cellValue, column)}
                                        </span>
                                      ) : isSelected ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0055ff] px-2.5 py-1 text-xs font-semibold text-white">
                                          {formatCellValue(cellValue, column)}
                                          <X
                                            className="h-3 w-3 cursor-pointer opacity-80 hover:opacity-100"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleCellSelection(row.id, column.id);
                                            }}
                                          />
                                        </span>
                                      ) : isRateCell && !isEmpty ? (
                                        <span className="font-semibold tabular-nums text-slate-950">
                                          {formatCellValue(cellValue, column)}
                                        </span>
                                      ) : (
                                        <span className="text-slate-700">
                                          {formatCellValue(cellValue, column)}
                                        </span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      {table.rows
                        .filter((row) => isRowBookable(row, table))
                        .filter((row) =>
                          rowMatchesTimeClassFilter(
                            table,
                            row,
                            selectedTimeClass,
                            getCellValue
                          )
                        )
                        .filter((row) =>
                          rowMatchesDayBandFilter(
                            table,
                            row,
                            selectedDayBand,
                            getCellValue
                          )
                        ).length === 0 && (
                        <div className="px-4 py-10 text-center text-sm text-slate-400">
                          No bookable rows match your filters. Try &quot;All&quot; for
                          ad type, days, or time class.
                        </div>
                      )}
                  </div>
                </div>
                );
              })}
            </section>
          ))}

          {(rateCard.sections || []).filter((section) =>
            sectionMatchesAdTypeFilter(section, selectedAdTypeFilter)
          ).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
              <p className="text-sm font-semibold text-slate-900">No rates for this filter</p>
              <p className="mt-1 text-sm text-slate-500">
                Choose another ad type, or set the filter back to All.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Floating campaign cart */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetTrigger asChild>
          <Button
            className={cn(
              "fixed right-4 z-[100] h-12 w-12 rounded-full border border-slate-200 bg-white text-slate-900 shadow-lg shadow-slate-900/10 transition hover:scale-105 hover:bg-slate-50 active:scale-95 sm:right-6 sm:h-14 sm:w-14",
              cart.length > 0 && "border-[#0055ff]/30 bg-[#0055ff] text-white hover:bg-[#0046d4]",
              selectedCells.size > 0 ? "bottom-[7.5rem] sm:bottom-32" : "bottom-6"
            )}
            size="icon"
            variant="outline"
            aria-label="Open campaign cart"
          >
            <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
            {cartItemCount > 0 && (
              <Badge
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 p-0 text-[10px] text-white"
              >
                {cartItemCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
          <SheetContent elevated className="w-full sm:max-w-lg overflow-y-auto p-0 border-l border-border/80">
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60 bg-muted/20">
                <SheetTitle className="text-lg">Campaign cart</SheetTitle>
                <SheetDescription className="text-sm leading-relaxed">
                  {cart.length > 0
                    ? `${cart.length} line item${cart.length > 1 ? "s" : ""} in your campaign`
                    : "Add line items from the order summary after you select rates."}
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Your campaign is empty</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Select spots, choose ad type & time class, then add as line items
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{item.rateCardTitle}</h3>
                      <p className="text-xs text-muted-foreground">{item.agencyName}</p>
                      {item.mediaCampaignName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Campaign: {item.mediaCampaignName}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(item.adType || item.timeClass || item.dayBand) && (
                      <div className="flex flex-wrap gap-1">
                        {item.adType && (
                          <Badge variant="outline" className="text-xs">
                            {item.adType.label}
                          </Badge>
                        )}
                        {item.timeClass && (
                          <Badge variant="outline" className="text-xs">
                            {item.timeClass}
                          </Badge>
                        )}
                        {dayBandLabel(item.dayBand) && (
                          <Badge variant="outline" className="text-xs">
                            {dayBandLabel(item.dayBand)}
                          </Badge>
                        )}
                      </div>
                    )}
                    {item.selectedCellsData.slice(0, 3).map((cellData, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs mr-2">
                        {cellData.column.name}: {cellData.formattedValue}
                      </Badge>
                    ))}
                    {item.selectedCellsData.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{item.selectedCellsData.length - 3} more
                      </Badge>
                    )}
                    {item.numSpots > 1 && item.periodConfig && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.numSpots} spots ({item.periodConfig.frequency}
                        {item.periodConfig.startDate && ` • ${item.periodConfig.startDate} to ${item.periodConfig.endDate}`})
                      </p>
                    )}
                  </div>
                  {item.total > 0 && (
                    <div className="mt-3 pt-3 border-t flex justify-between items-center">
                      <span className="text-sm font-medium">Subtotal:</span>
                      <span className="font-bold">₵{item.total.toLocaleString()}</span>
                    </div>
                  )}
                </Card>
                ))
              )}
              {cart.length > 0 && (
                <div className="sticky bottom-0 bg-background pt-6 mt-4 border-t space-y-4 -mx-6 px-6 pb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>₵{cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">VAT (15%):</span>
                    <span>₵{cartVat.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">NHIL & GETFund (5%):</span>
                    <span>₵{cartNhilGetfund.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-lg pt-2 border-t">
                  <span className="font-bold">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    ₵{cartTotal.toLocaleString()}
                  </span>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    setIsCartOpen(false);
                    // TODO: Navigate to checkout or open payment dialog
                    toast.info("Checkout functionality coming soon!");
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setCart([]);
                    toast.success("Cart cleared");
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
              )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

      {/* Floating selection bar */}
      {selectedCells.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] rounded-t-2xl border-t border-slate-200 bg-white/95 shadow-[0_-12px_40px_-16px_rgba(15,23,42,0.2)] backdrop-blur-md sm:rounded-t-none">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-4 lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-center gap-2 text-slate-900">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef2ff] text-[#0055ff]">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold sm:text-[15px]">
                    {selectedCells.size} cell{selectedCells.size > 1 ? "s" : ""} selected
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {selectedAdType && (
                    <Badge variant="secondary" className="text-xs font-normal border-border/80">
                      <span className="font-medium text-foreground/90">Ad type:</span>{" "}
                      {getAdTypeById(mediaType, selectedAdType)?.label || selectedAdType}
                    </Badge>
                  )}
                  {selectedTimeClassForItem && (
                    <Badge variant="secondary" className="text-xs font-normal border-border/80">
                      <span className="font-medium text-foreground/90">Time class:</span> {selectedTimeClassForItem}
                    </Badge>
                  )}
                  {hasDayBandColumns && dayBandLabel(
                    selectedDayBand === "ALL" ? DAY_BAND_MON_FRI : selectedDayBand
                  ) && (
                    <Badge variant="secondary" className="text-xs font-normal border-border/80">
                      <span className="font-medium text-foreground/90">Days:</span>{" "}
                      {dayBandLabel(
                        selectedDayBand === "ALL"
                          ? DAY_BAND_MON_FRI
                          : selectedDayBand
                      )}
                    </Badge>
                  )}
                  {selectedCellsData.slice(0, 5).map(({ rowId, columnId, formattedValue, column }) => (
                    <Badge
                      key={`${rowId}-${columnId}`}
                      variant="outline"
                      className="text-xs font-normal max-w-[200px] truncate"
                    >
                      <span className="font-medium">{column.name}:</span> {formattedValue}
                    </Badge>
                  ))}
                  {selectedCellsData.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedCellsData.length - 5} more
                    </Badge>
                  )}
                </div>
                {periodTotal > 0 && (
                  <div className="text-sm">
                    <span className="text-slate-500">Estimate </span>
                    <span className="text-base font-semibold tabular-nums text-[#0055ff] sm:text-lg">
                      ₵{(periodTotal * (1 + VAT_RATE + NHIL_GETFUND_RATE)).toLocaleString()}
                    </span>
                    <span className="ml-1 text-xs text-slate-400">incl. taxes</span>
                  </div>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-full border-slate-200 bg-white text-slate-700"
                  onClick={() => setIsPeriodCalcOpen(true)}
                  title="Period calculator"
                >
                  <Calculator className="mr-1.5 h-4 w-4" />
                  Calculator
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-full border-slate-200 bg-white text-slate-700"
                  onClick={() => setSelectedCells(new Set())}
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Clear
                </Button>
                <Button
                  size="sm"
                  className="h-9 rounded-full bg-[#0055ff] px-4 text-white shadow-sm shadow-[#0055ff]/25 hover:bg-[#0046d4]"
                  onClick={() => setIsSummaryDialogOpen(true)}
                >
                  <Eye className="mr-1.5 h-4 w-4" />
                  View summary
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary View Dialog */}
      <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border-border/80 sm:rounded-2xl">
          <DialogHeader className="space-y-1 pb-2">
            <DialogTitle className="text-xl sm:text-2xl">Order summary</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Review this line item before adding to your campaign. You can add multiple ad types and time classes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Selected Items Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Selected Items</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedAdType && (
                    <Badge variant="outline" className="text-xs">
                      Ad type: {getAdTypeById(mediaType, selectedAdType)?.label || selectedAdType}
                    </Badge>
                  )}
                  {selectedTimeClassForItem && (
                    <Badge variant="outline" className="text-xs">
                      Time class: {selectedTimeClassForItem}
                    </Badge>
                  )}
                  {hasDayBandColumns && (
                    <Badge variant="outline" className="text-xs">
                      Days:{" "}
                      {dayBandLabel(
                        selectedDayBand === "ALL"
                          ? DAY_BAND_MON_FRI
                          : selectedDayBand
                      )}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {/* Group by row for better display */}
                  {Array.from(
                    new Map(
                      selectedCellsData.map((item) => [
                        item.rowId,
                        {
                          row: item.row,
                          table: item.table,
                          section: item.section,
                          selectedCells: [],
                        },
                      ])
                    ).values()
                  ).map(({ row, table, section }) => {
                    const rowSelectedCells = selectedCellsData.filter(
                      (item) => item.rowId === row.id
                    );
                    const priceCell = rowSelectedCells.find((item) =>
                      ["CURRENCY", "NUMBER"].includes(item.column.dataType)
                    );
                    const price = priceCell ? parseFloat(priceCell.value) : null;

                    return (
                      <div
                        key={row.id}
                        className="flex items-start justify-between p-4 bg-muted/30 rounded-lg border"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-base mb-2">
                            {section.title}
                          </div>
                          {table.title && (
                            <div className="text-sm text-muted-foreground mb-3">
                              {table.title}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {rowSelectedCells.map(({ column, formattedValue }) => (
                              <Badge key={column.id} variant="secondary" className="text-xs">
                                <span className="font-medium">{column.name}:</span> {formattedValue}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {price && !isNaN(price) && (
                          <div className="font-bold text-lg ml-4">
                            ₵{price.toLocaleString()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {periodTotal > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    {numSpots > 1 && (
                      <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
                        <span>Cost per spot × {numSpots} spots</span>
                        <span>₵{costPerSpot.toLocaleString()} × {numSpots}</span>
                      </div>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>₵{periodTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">VAT (15%):</span>
                        <span>₵{(periodTotal * VAT_RATE).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">NHIL & GETFund (5%):</span>
                        <span>₵{(periodTotal * NHIL_GETFUND_RATE).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-lg pt-2 border-t mt-2">
                      <span className="font-bold">Total:</span>
                      <span className="text-2xl font-bold text-primary">
                        ₵{(periodTotal * (1 + VAT_RATE + NHIL_GETFUND_RATE)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Campaign Name */}
            <Card>
              <CardContent className="pt-6">
                <Label htmlFor="summaryMediaCampaignName">
                  Media Campaign Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="summaryMediaCampaignName"
                  value={mediaCampaignName}
                  onChange={(e) => setMediaCampaignName(e.target.value)}
                  placeholder="e.g., Q1 Product Launch, Summer Promo"
                  className="mt-2"
                  required
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              {/* <Button
                variant="outline"
                onClick={() => {
                  setIsSummaryDialogOpen(false);
                }}
              >
                Cancel
              </Button> */}
              <Button
                variant="outline"
                onClick={addToCart}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Add as line item
              </Button>
              <Button
                variant="outline"
                onClick={handleBooking}
                disabled={isSubmitting || !mediaCampaignName?.trim()}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {isSubmitting ? "Booking..." : "Book Only"}
              </Button>
              <Button 
                onClick={handlePayment}
                disabled={isSubmitting || !mediaCampaignName?.trim()}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isSubmitting ? "Processing..." : "Make Payment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
