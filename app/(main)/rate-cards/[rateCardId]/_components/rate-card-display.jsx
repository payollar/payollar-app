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
import { BookOpen, Building2, Calculator, Clock, ShoppingCart, X, Eye, CreditCard, ShoppingBag, Trash2, ArrowLeft, MapPin, Radio, Users, Filter, Sparkles } from "lucide-react";
import { getAdTypesForMediaType, getAdTypeById } from "@/lib/ad-types";

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

// Find ad type rates table and get rate for selected ad type + time class.
// Returns the rate (number) or null if not found.
// Requires both ad type and time class when using ad-type-by-time-class sections.
function getAdTypeRateFromRateCard(rateCard, selectedAdTypeId, selectedTimeClassForItem) {
  if (!rateCard?.sections || !selectedAdTypeId) return null;
  const norm = (v) => (v && String(v).trim().toLowerCase()) || "";
  const targetId = norm(selectedAdTypeId);

  for (const section of rateCard.sections) {
    for (const table of section.tables || []) {
      const adTypeCol = table.columns?.find((c) => getColumnRole(c) === "ad_type_identifier");
      const timeClassCol = table.columns?.find((c) => getColumnRole(c) === "time_class");
      const rateCol = table.columns?.find((c) => getColumnRole(c) === "rate_ad_type");
      if (!adTypeCol || !rateCol) continue;

      for (const row of table.rows || []) {
        const adTypeVal = row.cells?.find((c) => c.columnId === adTypeCol.id)?.value;
        if (norm(adTypeVal) !== targetId) continue;

        // When table has time_class column, require match
        if (timeClassCol && selectedTimeClassForItem) {
          const tcVal = row.cells?.find((c) => c.columnId === timeClassCol.id)?.value;
          const rowTc = tcVal && String(tcVal).trim();
          if (rowTc !== selectedTimeClassForItem) continue;
        }

        const rateVal = row.cells?.find((c) => c.columnId === rateCol.id)?.value;
        const num = parseFloat(rateVal);
        if (!isNaN(num) && num > 0) return num;
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

  for (const table of section.tables || []) {
    const adTypeCol = table.columns?.find((c) => getColumnRole(c) === "ad_type_identifier");
    if (!adTypeCol) continue; // Table has no ad type - this is a generic section
    for (const row of table.rows || []) {
      const val = row.cells?.find((c) => c.columnId === adTypeCol.id)?.value;
      if (norm(val) === target) return true;
    }
  }
  // Section has no ad-type tables, or no matching rows - hide when filter is specific
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

export function RateCardDisplay({ rateCard, initialAdType = null, initialCampaignName = null }) {
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

  // Cost per spot: use the spot the user selected (sum of selected rate cells).
  // Only fall back to ad type rate when no rate cells are selected.
  const costPerSpot = useMemo(() => {
    let sum = 0;
    selectedCellsData.forEach(({ column, value }) => {
      if (["CURRENCY", "NUMBER"].includes(column.dataType)) {
        const price = parseFloat(value);
        if (!isNaN(price)) sum += price;
      }
    });
    if (sum > 0) return sum;
    // Fallback: ad type rate when no rate cells selected (e.g. ad-type-only flow)
    const adTypeRate = getAdTypeRateFromRateCard(
      rateCard,
      selectedAdType,
      selectedTimeClassForItem
    );
    if (adTypeRate != null && adTypeRate > 0) return adTypeRate;
    return 0;
  }, [rateCard, selectedAdType, selectedTimeClassForItem, selectedCellsData]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 pb-36 sm:pb-32">
        {/* Header */}
        <div className="mb-8 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" aria-hidden />
          <div className="p-6 sm:p-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 rounded-full px-3 py-1.5 -ml-1 hover:bg-muted/60"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              Back to Products
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary/80 mb-2">
                  Rate card
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                  {rateCard.title}
                </h1>
                {rateCard.description && (
                  <p className="text-muted-foreground text-base sm:text-lg mt-3 leading-relaxed max-w-3xl">
                    {rateCard.description}
                  </p>
                )}
              </div>
              {rateCard.agency.logoUrl && (
                <div className="shrink-0 rounded-xl border border-border/80 bg-background p-2 shadow-sm">
                  <img
                    src={rateCard.agency.logoUrl}
                    alt={rateCard.agency.agencyName}
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg object-cover"
                  />
                </div>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground border-t border-border/50 pt-6">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 shrink-0 text-primary/70" />
                <span className="font-medium text-foreground/90">{rateCard.agency.agencyName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                <span>Updated {format(new Date(rateCard.lastUpdated), "PPP")}</span>
              </div>
              {rateCard.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{rateCard.location}</span>
                </div>
              )}
              {rateCard.reach && (
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 shrink-0" />
                  <span>{rateCard.reach}</span>
                </div>
              )}
              {rateCard.demographics?.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                  <Users className="h-4 w-4 shrink-0" />
                  {rateCard.demographics.map((d, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-xs font-medium"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters - ad type first, then time class */}
        <Card className="mt-6 sticky top-3 z-30 rounded-2xl border-border/80 shadow-md shadow-black/5 dark:shadow-black/20">
          <CardHeader className="pb-2 pt-5 px-5 sm:px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Filter className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Refine rates</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Narrow down by ad type and time class; then tap rates to select and build your campaign.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-5 px-5 sm:px-6 space-y-5">
            {/* Ad type filter - comes first */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ad type
              </span>
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:overflow-visible">
                <Button
                  size="sm"
                  className="rounded-full h-9 px-4"
                  variant={selectedAdTypeFilter === "ALL" ? "default" : "outline"}
                  onClick={() => setSelectedAdTypeFilter("ALL")}
                >
                  All
                </Button>
                {adTypes.map((at) => (
                  <Button
                    key={at.id}
                    size="sm"
                    className="rounded-full h-9 px-4"
                    variant={selectedAdTypeFilter === at.id ? "default" : "outline"}
                    onClick={() => {
                      setSelectedAdTypeFilter(at.id);
                      setSelectedAdType(at.id);
                      setSelectedCells(new Set());
                    }}
                  >
                    {at.label}
                  </Button>
                ))}
              </div>
              {selectedAdTypeFilter !== "ALL" && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                  Showing rates for{" "}
                  <span className="font-medium text-foreground">
                    {getAdTypeById(mediaType, selectedAdTypeFilter)?.label || selectedAdTypeFilter}
                  </span>
                </p>
              )}
            </div>

            {/* Time class filter */}
            {timeClassValues.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border/60">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Time class
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="rounded-full h-9 px-4"
                    variant={selectedTimeClass === "ALL" ? "default" : "outline"}
                    onClick={() => setSelectedTimeClass("ALL")}
                  >
                    All
                  </Button>
                  {timeClassValues.map((value) => (
                    <Button
                      key={value}
                      size="sm"
                      className="rounded-full h-9 px-4"
                      variant={selectedTimeClass === value ? "default" : "outline"}
                      onClick={() => setSelectedTimeClass(value)}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
                {selectedTimeClass !== "ALL" && (
                  <p className="text-sm text-muted-foreground">
                    Spots & prices for{" "}
                    <span className="font-medium text-foreground">{selectedTimeClass}</span>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
                  <div>
                    <Label className="text-sm font-medium">Cost per spot</Label>
                    <p className="text-xl font-bold text-primary mt-1">
                      ₵{costPerSpot.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedCellsData.some((d) => ["CURRENCY", "NUMBER"].includes(d.column.dataType) && parseFloat(d.value) > 0)
                        ? "From selected spot"
                        : getAdTypeRateFromRateCard(rateCard, selectedAdType, selectedTimeClassForItem) != null
                          ? "Ad type + time class rate"
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

        {/* Sections - filtered by ad type when filter is active */}
        <div className="space-y-10 sm:space-y-14">
          {rateCard.sections
            ?.filter((section) =>
              sectionMatchesAdTypeFilter(section, selectedAdTypeFilter)
            )
            ?.map((section) => (
            <div key={section.id} className="scroll-mt-28">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                  Section
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-6">{section.title}</h2>

              {section.tables?.map((table) => {
                // When filtering by a specific time class, hide the Time Class column
                // so users see only spots (durations) and prices
                const timeClassColumn = getTimeClassColumn(table);
                const displayColumns = table.columns.filter(
                  (col) => col.isVisibleOnFrontend !== false
                );
                const visibleColumns =
                  selectedTimeClass !== "ALL" && timeClassColumn
                    ? displayColumns.filter((col) => col.id !== timeClassColumn.id)
                    : displayColumns;

                return (
                <Card key={table.id} className="mb-8 rounded-2xl border-border/80 shadow-sm overflow-hidden">
                  {table.title && (
                    <CardHeader className="bg-muted/30 border-b border-border/60 py-4">
                      <CardTitle className="text-lg font-semibold">{table.title}</CardTitle>
                    </CardHeader>
                  )}
                  <CardContent className="px-0 pt-0 pb-4">
                    <div className="overflow-x-auto px-4 sm:px-6">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-border/80 bg-muted/40">
                            {visibleColumns.map((column) => (
                              <th
                                key={column.id}
                                className="p-3 sm:p-4 text-left font-semibold text-foreground text-xs uppercase tracking-wide sm:text-sm"
                              >
                                {column.name}
                                {column.isRequiredForBooking && (
                                  <span className="text-red-500 ml-1">*</span>
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
                            .map((row) => (
                              <tr key={row.id} className="border-b border-border/80 last:border-0 hover:bg-muted/20 transition-colors">
                                {visibleColumns.map((column) => {
                                  const cellValue = getCellValue(row, column.id);
                                  const isSelected = isCellSelected(row.id, column.id);
                                  const isEmpty = !cellValue || cellValue.trim() === "" || cellValue === "-";
                                  const isTimeClassCell = timeClassColumn && column.id === timeClassColumn.id;
                                  const isFilterActive = isTimeClassCell && selectedTimeClass === cellValue;

                                  return (
                                    <td
                                      key={column.id}
                                      className={`p-3 sm:p-4 transition-all ${
                                        isEmpty
                                          ? "cursor-default text-muted-foreground/70"
                                          : "cursor-pointer hover:bg-primary/5 active:bg-primary/10"
                                      } ${
                                        isSelected
                                          ? "bg-primary/10 ring-2 ring-inset ring-primary/25"
                                          : ""
                                      }`}
                                      onClick={() => {
                                        if (isEmpty) return;
                                        if (isTimeClassCell) {
                                          setSelectedTimeClass(cellValue);
                                          return;
                                        }
                                        const wasSelected = isCellSelected(row.id, column.id);
                                        toggleCellSelection(row.id, column.id);
                                        if (!wasSelected && ["CURRENCY", "NUMBER"].includes(column.dataType)) {
                                          setIsPeriodCalcOpen(true);
                                        }
                                      }}
                                    >
                                      {isTimeClassCell ? (
                                        <Badge
                                          variant={isFilterActive ? "default" : "outline"}
                                          className="inline-flex cursor-pointer hover:bg-primary/10 transition-colors"
                                        >
                                          {formatCellValue(cellValue, column)}
                                        </Badge>
                                      ) : isSelected ? (
                                        <Badge
                                          variant="default"
                                          className="inline-flex items-center gap-1.5 px-2 py-1"
                                        >
                                          {formatCellValue(cellValue, column)}
                                          <X
                                            className="h-3 w-3 cursor-pointer hover:bg-primary/20 rounded"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleCellSelection(row.id, column.id);
                                            }}
                                          />
                                        </Badge>
                                      ) : (
                                        <span>{formatCellValue(cellValue, column)}</span>
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
                        ).length === 0 && (
                        <div className="text-center py-10 px-4 text-muted-foreground text-sm">
                          No bookable rows match your filters. Try &quot;All&quot; for ad type or time class.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Floating campaign cart */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetTrigger asChild>
          <Button
            className={`fixed right-4 sm:right-6 h-14 w-14 rounded-full shadow-lg z-[100] border border-border/80 hover:scale-105 active:scale-95 transition-transform ${
              selectedCells.size > 0 ? "bottom-[7.5rem] sm:bottom-32" : "bottom-6"
            }`}
            size="icon"
            variant={cart.length > 0 ? "default" : "outline"}
            aria-label="Open campaign cart"
          >
            <ShoppingBag className="h-6 w-6" />
            {cartItemCount > 0 && (
              <Badge
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center p-0 text-xs"
                variant="destructive"
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
                    {(item.adType || item.timeClass) && (
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
        <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-primary/20 bg-background/95 backdrop-blur-md shadow-[0_-8px_30px_-8px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_30px_-8px_rgba(0,0,0,0.4)] rounded-t-2xl sm:rounded-t-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-4 sm:py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 min-w-0 flex-1">
                <div className="flex items-center gap-2 text-foreground">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-sm sm:text-base">
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
                  <div className="text-sm sm:text-right lg:text-left">
                    <span className="text-muted-foreground">Estimate total </span>
                    <span className="font-bold text-primary text-base sm:text-lg tabular-nums">
                      ₵{(periodTotal * (1 + VAT_RATE + NHIL_GETFUND_RATE)).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-xs block sm:inline sm:ml-1"> incl. VAT & NHIL/GETFund</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setIsPeriodCalcOpen(true)}
                  title="Period calculator"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculator
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setSelectedCells(new Set())}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button
                  size="sm"
                  className="rounded-full shadow-md"
                  onClick={() => setIsSummaryDialogOpen(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
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
