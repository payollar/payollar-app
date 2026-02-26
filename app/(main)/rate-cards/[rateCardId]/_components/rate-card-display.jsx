"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { BookOpen, Building2, Clock, ShoppingCart, X, Eye, CreditCard, ShoppingBag, Trash2 } from "lucide-react";

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

export function RateCardDisplay({ rateCard }) {
  // Track selected cells by "rowId-columnId" key
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [mediaCampaignName, setMediaCampaignName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTimeClass, setSelectedTimeClass] = useState("ALL");

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

  // Calculate total price for selected cells
  const calculateTotal = () => {
    let total = 0;
    selectedCellsData.forEach(({ column, value }) => {
      if (["CURRENCY", "NUMBER"].includes(column.dataType)) {
        const price = parseFloat(value);
        if (!isNaN(price)) {
          total += price;
        }
      }
    });
    return total;
  };

  // Add selected items to cart
  const addToCart = () => {
    if (selectedCells.size === 0) {
      toast.error("Please select at least one item to add to cart");
      return;
    }
    if (!mediaCampaignName?.trim()) {
      toast.error("Media campaign name is required");
      return;
    }

    const cartItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      rateCardId: rateCard.id,
      rateCardTitle: rateCard.title,
      agencyName: rateCard.agency.agencyName,
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
      total: calculateTotal(),
      mediaCampaignName: mediaCampaignName.trim(),
      createdAt: new Date().toISOString(),
    };

    setCart((prevCart) => [...prevCart, cartItem]);
    setSelectedCells(new Set());
    setMediaCampaignName("");
    setIsSummaryDialogOpen(false);
    toast.success("Items added to cart!");
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    toast.success("Item removed from cart");
  };

  // Calculate cart total
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.total || 0), 0);
  }, [cart]);

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

      // Initialize Paystack payment
      const response = await fetch("/api/paystack/initialize-media-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rateCardId: rateCard.id,
          selectedCells: selectedCellsForPayment,
          mediaCampaignName: mediaCampaignName.trim(),
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{rateCard.title}</h1>
              {rateCard.description && (
                <p className="text-muted-foreground text-lg">{rateCard.description}</p>
              )}
            </div>
            {rateCard.agency.logoUrl && (
              <img
                src={rateCard.agency.logoUrl}
                alt={rateCard.agency.agencyName}
                className="h-16 w-16 rounded-lg object-cover"
              />
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>{rateCard.agency.agencyName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Last updated: {format(new Date(rateCard.lastUpdated), "PPP")}</span>
            </div>
          </div>
        </div>

        {/* Time class filter - sticky, interactive */}
        {timeClassValues.length > 0 && (
          <Card className="mt-6 sticky top-4 z-30 shadow-md">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground shrink-0">
                  Filter by time class:
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={selectedTimeClass === "ALL" ? "default" : "outline"}
                    onClick={() => setSelectedTimeClass("ALL")}
                  >
                    All
                  </Button>
                  {timeClassValues.map((value) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={selectedTimeClass === value ? "default" : "outline"}
                      onClick={() => setSelectedTimeClass(value)}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
                {selectedTimeClass !== "ALL" && (
                  <span className="text-sm text-muted-foreground ml-2">
                    Showing spots & prices for <strong>{selectedTimeClass}</strong>
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sections */}
        <div className="space-y-12">
          {rateCard.sections?.map((section) => (
            <div key={section.id}>
              <h2 className="text-2xl font-bold mb-6">{section.title}</h2>

              {section.tables?.map((table) => {
                // When filtering by a specific time class, hide the Time Class column
                // so users see only spots (durations) and prices
                const timeClassColumn = getTimeClassColumn(table);
                const visibleColumns =
                  selectedTimeClass !== "ALL" && timeClassColumn
                    ? table.columns.filter((col) => col.id !== timeClassColumn.id)
                    : table.columns;

                return (
                <Card key={table.id} className="mb-8">
                  {table.title && (
                    <CardHeader>
                      <CardTitle>{table.title}</CardTitle>
                    </CardHeader>
                  )}
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            {visibleColumns.map((column) => (
                              <th
                                key={column.id}
                                className="p-3 text-left font-semibold bg-muted/50"
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
                              <tr key={row.id} className="border-b">
                                {visibleColumns.map((column) => {
                                  const cellValue = getCellValue(row, column.id);
                                  const isSelected = isCellSelected(row.id, column.id);
                                  const isEmpty = !cellValue || cellValue.trim() === "" || cellValue === "-";
                                  const isTimeClassCell = timeClassColumn && column.id === timeClassColumn.id;
                                  const isFilterActive = isTimeClassCell && selectedTimeClass === cellValue;

                                  return (
                                    <td
                                      key={column.id}
                                      className={`p-3 transition-all ${
                                        isEmpty
                                          ? "cursor-default"
                                          : "cursor-pointer hover:bg-muted/30"
                                      } ${
                                        isSelected
                                          ? "bg-primary/10 ring-2 ring-primary/20"
                                          : ""
                                      }`}
                                      onClick={() => {
                                        if (isEmpty) return;
                                        if (isTimeClassCell) {
                                          setSelectedTimeClass(cellValue);
                                          return;
                                        }
                                        toggleCellSelection(row.id, column.id);
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
                        <div className="text-center py-8 text-muted-foreground">
                          No bookable services available
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

      {/* Floating Cart Bag Icon - Always visible */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetTrigger asChild>
          <Button
            className={`fixed right-6 h-14 w-14 rounded-full shadow-lg z-40 hover:scale-110 transition-transform ${
              selectedCells.size > 0 ? "bottom-32" : "bottom-6"
            }`}
            size="icon"
            variant={cart.length > 0 ? "default" : "outline"}
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
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Shopping Cart</SheetTitle>
              <SheetDescription>
                {cart.length > 0
                  ? `${cart.length} item${cart.length > 1 ? "s" : ""} in your cart`
                  : "Your cart is empty"}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Select items and click "Add to Cart" to add them here
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
                <div className="sticky bottom-0 bg-background pt-4 border-t space-y-3">
                <div className="flex justify-between items-center text-lg">
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
          </SheetContent>
        </Sheet>

      {/* Floating Cart Summary */}
      {selectedCells.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 overflow-x-auto">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-semibold">
                    {selectedCells.size} item{selectedCells.size > 1 ? "s" : ""} selected
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {selectedCellsData.slice(0, 5).map(({ rowId, columnId, formattedValue, column }) => (
                    <Badge
                      key={`${rowId}-${columnId}`}
                      variant="secondary"
                      className="text-xs flex items-center gap-1"
                    >
                      <span className="font-medium">{column.name}:</span> {formattedValue}
                    </Badge>
                  ))}
                  {selectedCellsData.length > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{selectedCellsData.length - 5} more
                    </Badge>
                  )}
                </div>
                {calculateTotal() > 0 && (
                  <div className="ml-auto text-lg font-bold">
                    Total: ₵{calculateTotal().toLocaleString()}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCells(new Set())}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button size="sm" onClick={() => setIsSummaryDialogOpen(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Summary
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary View Dialog */}
      <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Summary</DialogTitle>
            <DialogDescription>
              Review your selected items ({selectedCells.size} item{selectedCells.size > 1 ? "s" : ""})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Selected Items Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Selected Items</CardTitle>
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
                {calculateTotal() > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Subtotal:</span>
                      <span className="font-semibold">₵{calculateTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-bold">Total:</span>
                      <span className="text-2xl font-bold text-primary">
                        ₵{calculateTotal().toLocaleString()}
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
                Add to Cart
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
