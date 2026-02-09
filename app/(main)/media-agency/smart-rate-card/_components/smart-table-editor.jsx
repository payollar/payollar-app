"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  GripVertical,
  Edit,
  X,
  Check,
  Settings,
  Type,
  Hash,
  DollarSign,
  List,
  ToggleLeft,
  FileText,
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  Search,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const COLUMN_DATA_TYPES = [
  { value: "TEXT", label: "Text", icon: Type },
  { value: "NUMBER", label: "Number", icon: Hash },
  { value: "CURRENCY", label: "Currency", icon: DollarSign },
  { value: "DROPDOWN", label: "Dropdown", icon: List },
  { value: "BOOLEAN", label: "Boolean", icon: ToggleLeft },
  { value: "NOTES", label: "Notes", icon: FileText },
];

// Color palette for dropdown tags (like in the screenshot)
const DROPDOWN_COLORS = [
  "bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30",
  "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30",
  "bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30",
  "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
  "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
  "bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30",
  "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
];

const getColumnIcon = (dataType) => {
  const type = COLUMN_DATA_TYPES.find((t) => t.value === dataType);
  return type?.icon || Type;
};

const getDropdownColor = (index) => {
  return DROPDOWN_COLORS[index % DROPDOWN_COLORS.length];
};

export function SmartTableEditor({ table, onUpdate }) {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [editingCellValue, setEditingCellValue] = useState("");
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState("TEXT");
  const [newColumnOptions, setNewColumnOptions] = useState("");
  const [editingColumn, setEditingColumn] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [pendingUpdates, setPendingUpdates] = useState(new Map()); // Track pending cell updates
  const inputRef = useRef(null);

  useEffect(() => {
    if (table) {
      setColumns(table.columns || []);
      // Update rows from server, but preserve any local optimistic updates
      setRows((currentRows) => {
        const serverRows = table.rows || [];
        if (currentRows.length === 0) {
          return serverRows;
        }
        
        // Merge server data with current rows, preserving optimistic cell updates
        return serverRows.map((serverRow) => {
          const currentRow = currentRows.find((r) => r.id === serverRow.id);
          if (!currentRow) {
            return serverRow;
          }
          
          // Merge cells: prefer current cell values if they exist
          // This preserves optimistic updates until server confirms them
          const serverCellMap = new Map((serverRow.cells || []).map((c) => [c.columnId, c]));
          const currentCellMap = new Map((currentRow.cells || []).map((c) => [c.columnId, c]));
          
          // Build merged cells: prefer current over server for the same column
          const mergedCells = [];
          const processedColumnIds = new Set();
          
          // First, add all current cells (optimistic updates take priority)
          // This ensures typed content persists even when server data refreshes
          currentCellMap.forEach((currentCell, columnId) => {
            const updateKey = `${serverRow.id}-${columnId}`;
            // If there's a pending update for this cell, ALWAYS use that value
            if (pendingUpdates.has(updateKey)) {
              const pendingValue = pendingUpdates.get(updateKey);
              mergedCells.push({ 
                ...currentCell, 
                value: pendingValue,
                columnId: columnId 
              });
            } else {
              // Prefer current cell value if it's non-empty
              // This handles the case where we've updated locally but it's not pending anymore
              if (currentCell.value !== null && currentCell.value !== undefined && String(currentCell.value).trim() !== "") {
                mergedCells.push(currentCell);
              } else {
                // Use server cell if it has a value, otherwise keep current (even if empty)
                const serverCell = serverCellMap.get(columnId);
                if (serverCell && serverCell.value) {
                  mergedCells.push(serverCell);
                } else {
                  mergedCells.push(currentCell);
                }
              }
            }
            processedColumnIds.add(columnId);
          });
          
          // Then, add server cells that don't exist in current (new cells from server)
          serverCellMap.forEach((serverCell, columnId) => {
            if (!processedColumnIds.has(columnId)) {
              mergedCells.push(serverCell);
            }
          });
          
          return {
            ...serverRow,
            cells: mergedCells,
          };
        });
      });
    }
  }, [table, pendingUpdates]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) {
      toast.error("Column name is required");
      return;
    }

    // Build config for dropdown columns
    let config = null;
    if (newColumnType === "DROPDOWN" && newColumnOptions.trim()) {
      const options = newColumnOptions
        .split(",")
        .map((opt) => opt.trim())
        .filter((opt) => opt.length > 0);
      if (options.length > 0) {
        config = { options };
      }
    }

    try {
      const response = await fetch(`/api/media-agency/rate-cards/tables/${table.id}/columns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newColumnName,
          dataType: newColumnType,
          isVisibleOnFrontend: true,
          isRequiredForBooking: false,
          config,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Column added");
        setNewColumnName("");
        setNewColumnType("TEXT");
        setNewColumnOptions("");
        setShowAddColumn(false);
        if (onUpdate) onUpdate();
      } else {
        toast.error(data.error || "Failed to add column");
      }
    } catch (error) {
      console.error("Error adding column:", error);
      toast.error("Failed to add column");
    }
  };

  const handleAddRow = async () => {
    try {
      const response = await fetch(`/api/media-agency/rate-cards/tables/${table.id}/rows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isBookable: true,
          cells: columns.map((col) => ({
            columnId: col.id,
            value: "",
          })),
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Optimistically add the row to local state immediately
        // This ensures the row is visible right away
        setRows((currentRows) => {
          const newRow = {
            ...data.row,
            cells: data.row.cells || columns.map((col) => ({
              columnId: col.id,
              value: "",
            })),
          };
          return [...currentRows, newRow];
        });
        
        toast.success("Row added");
        // Refresh after a delay to sync with server
        if (onUpdate) {
          setTimeout(() => {
            onUpdate();
          }, 500);
        }
      } else {
        toast.error(data.error || "Failed to add row");
      }
    } catch (error) {
      console.error("Error adding row:", error);
      toast.error("Failed to add row");
    }
  };

  const handleCellUpdate = async (rowId, columnId, value) => {
    const finalValue = value || "";
    const updateKey = `${rowId}-${columnId}`;

    try {
      const response = await fetch(
        `/api/media-agency/rate-cards/tables/rows/${rowId}/cells`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cells: [{ columnId, value: finalValue }],
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        // Update local state with server response to ensure consistency
        // But preserve the value we just saved
        setRows((currentRows) => {
          return currentRows.map((r) => {
            if (r.id === rowId) {
              const existingCells = r.cells || [];
              const cellIndex = existingCells.findIndex((c) => c.columnId === columnId);
              
              // Always use the value we just saved, not server response
              // Server response might be stale or missing
              const updatedCells = cellIndex >= 0
                ? existingCells.map((c) =>
                    c.columnId === columnId 
                      ? { ...c, value: finalValue } 
                      : c
                  )
                : [...existingCells, { columnId, value: finalValue }];
              
              return {
                ...r,
                cells: updatedCells,
              };
            }
            return r;
          });
        });
        
        // Keep pending update for a while to ensure it persists through any refreshes
        // Remove after a delay
        setTimeout(() => {
          setPendingUpdates((prev) => {
            const next = new Map(prev);
            next.delete(updateKey);
            return next;
          });
        }, 3000);
        
        // Don't refresh immediately - the optimistic update is already in local state
        // Only refresh after a long delay to sync with server, and only if no pending updates
        // This prevents the refresh from overwriting what the user just typed
        if (onUpdate) {
          setTimeout(() => {
            setPendingUpdates((currentPending) => {
              // Only refresh if this specific update is no longer pending
              // This ensures we don't overwrite the user's input
              if (!currentPending.has(updateKey)) {
                onUpdate();
              }
              return currentPending;
            });
          }, 2000);
        }
      } else {
        // Remove from pending on error
        setPendingUpdates((prev) => {
          const next = new Map(prev);
          next.delete(updateKey);
          return next;
        });
        toast.error(data.error || "Failed to update cell");
        // Refresh on error to get correct state
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      // Remove from pending on error
      setPendingUpdates((prev) => {
        const next = new Map(prev);
        next.delete(updateKey);
        return next;
      });
      console.error("Error updating cell:", error);
      toast.error("Failed to update cell");
      // Refresh on error to get correct state
      if (onUpdate) onUpdate();
    }
  };

  const handleToggleRowBookable = async (rowId, isBookable) => {
    try {
      const response = await fetch(`/api/media-agency/rate-cards/tables/${table.id}/rows`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: [{ id: rowId, isBookable: !isBookable }],
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error("Error updating row:", error);
      toast.error("Failed to update row");
    }
  };

  const getCellValue = (row, columnId) => {
    // Check pending updates first (most recent)
    const updateKey = `${row.id}-${columnId}`;
    if (pendingUpdates.has(updateKey)) {
      return pendingUpdates.get(updateKey);
    }
    
    // Then try to get from the row passed in
    const cell = row.cells?.find((c) => c.columnId === columnId);
    if (cell?.value !== undefined && cell?.value !== null) {
      return cell.value;
    }
    // Fallback to empty string
    return "";
  };

  const renderCell = (row, column) => {
    // Always get the latest value from current state, not just the row prop
    // This ensures we see optimistic updates even if the row prop is stale
    const latestRow = rows.find((r) => r.id === row.id) || row;
    const value = getCellValue(latestRow, column.id);
    const cellKey = `${row.id}-${column.id}`;
    const isEditing = editingCell === cellKey;

    const startEditing = () => {
      setEditingCell(cellKey);
      setEditingCellValue(value || "");
    };

    const handleSave = async (newValue) => {
      const finalValue = newValue !== null && newValue !== undefined ? String(newValue) : "";
      
      // Always update local state immediately (optimistic update) BEFORE clearing editing state
      // This ensures the value is visible when we switch from edit to display mode
      setRows((currentRows) => {
        return currentRows.map((r) => {
          if (r.id === row.id) {
            const existingCells = r.cells || [];
            const cellIndex = existingCells.findIndex((c) => c.columnId === column.id);
            const updatedCells = cellIndex >= 0
              ? existingCells.map((c) =>
                  c.columnId === column.id ? { ...c, value: finalValue } : c
                )
              : [...existingCells, { columnId: column.id, value: finalValue }];
            
            return {
              ...r,
              cells: updatedCells,
            };
          }
          return r;
        });
      });
      
      // Mark as pending update BEFORE clearing editing state
      const updateKey = `${row.id}-${column.id}`;
      setPendingUpdates((prev) => new Map(prev).set(updateKey, finalValue));
      
      // Clear editing state - the value is already in rows state
      setEditingCell(null);
      setEditingCellValue("");
      
      // Always save to server, even if value appears unchanged
      // This ensures new rows get their cells properly saved
      handleCellUpdate(row.id, column.id, finalValue);
    };

    const handleCancel = () => {
      setEditingCell(null);
      setEditingCellValue("");
    };

    // Render based on column type
    if (isEditing) {
      switch (column.dataType) {
      case "BOOLEAN":
        const boolValue = editingCellValue !== null && editingCellValue !== undefined
          ? editingCellValue === "true"
          : (value === "true");
        return (
          <div className="px-3 py-2 min-h-[36px] flex items-center gap-2">
            <Switch
              checked={boolValue}
              onCheckedChange={async (checked) => {
                setEditingCellValue(checked.toString());
                await handleSave(checked.toString());
              }}
              size="sm"
            />
          </div>
        );

      case "DROPDOWN":
        const options = column.config?.options || [];
        const currentDropdownValue = editingCellValue !== null && editingCellValue !== undefined 
          ? editingCellValue 
          : (value || "");
        return (
          <Select
            value={currentDropdownValue}
            onValueChange={async (selectedValue) => {
              setEditingCellValue(selectedValue);
              await handleSave(selectedValue);
            }}
            onOpenChange={(open) => {
              if (!open) {
                // If dropdown closes without selection, keep current value
                if (editingCellValue === null || editingCellValue === undefined) {
                  handleCancel();
                }
              }
            }}
          >
            <SelectTrigger className="h-auto border-0 shadow-none focus:ring-0 px-3 py-2 min-h-[36px]">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt, idx) => {
                const colorClass = getDropdownColor(idx);
                return (
                  <SelectItem key={idx} value={opt}>
                    <Badge variant="outline" className={`${colorClass} border`}>
                      {opt}
                    </Badge>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );

        default:
          // Always use editingCellValue if we're editing, otherwise use the current value
          const inputValue = isEditing 
            ? (editingCellValue !== null && editingCellValue !== undefined ? editingCellValue : (value || ""))
            : (value || "");
          return (
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                const newValue = e.target.value;
                setEditingCellValue(newValue);
              }}
              onBlur={async (e) => {
                // Use the current input value, not state (which might be stale)
                const currentValue = e.target.value || "";
                await handleSave(currentValue);
              }}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const currentValue = e.currentTarget.value || "";
                  await handleSave(currentValue);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  handleCancel();
                } else if (e.key === "Tab") {
                  e.preventDefault();
                  const currentValue = e.currentTarget.value || "";
                  await handleSave(currentValue);
                  // Move to next cell
                  const currentColIndex = columns.findIndex((c) => c.id === column.id);
                  if (currentColIndex < columns.length - 1) {
                    const nextCol = columns[currentColIndex + 1];
                    const nextRow = rows.find((r) => r.id === row.id) || row;
                    setEditingCell(`${row.id}-${nextCol.id}`);
                    setEditingCellValue(getCellValue(nextRow, nextCol.id) || "");
                  }
                }
              }}
              className="h-auto border-0 shadow-none focus-visible:ring-0 px-3 py-2 min-h-[36px] text-sm"
              type={column.dataType === "NUMBER" || column.dataType === "CURRENCY" ? "number" : "text"}
              placeholder=""
            />
          );
      }
    }

    // Display mode - no borders, clean look
    // Check if value is truly empty (not just whitespace or empty string)
    const isEmpty = !value || (typeof value === 'string' && value.trim() === '');
    if (isEmpty) {
      return (
        <div
          className="px-3 py-2 min-h-[36px] flex items-center text-muted-foreground/50 text-sm cursor-text hover:bg-muted/30 rounded"
          onClick={startEditing}
        >
          <span className="opacity-30">—</span>
        </div>
      );
    }

    switch (column.dataType) {
      case "BOOLEAN":
        return (
          <div
            className="px-3 py-2 min-h-[36px] flex items-center cursor-text hover:bg-muted/30 rounded"
            onClick={startEditing}
          >
            <Switch checked={value === "true"} disabled size="sm" />
          </div>
        );

      case "DROPDOWN":
        const options = column.config?.options || [];
        const optionIndex = options.indexOf(value);
        const colorClass = getDropdownColor(optionIndex);
        return (
          <div
            className="px-3 py-2 min-h-[36px] flex items-center cursor-text hover:bg-muted/30 rounded"
            onClick={startEditing}
          >
            <Badge
              variant="outline"
              className={`${colorClass} border px-2 py-0.5 text-xs font-medium`}
            >
              {value}
            </Badge>
          </div>
        );

      case "CURRENCY":
        const numValue = parseFloat(value);
        return (
          <div
            className="px-3 py-2 min-h-[36px] flex items-center cursor-text hover:bg-muted/30 rounded text-sm"
            onClick={startEditing}
          >
            {!isNaN(numValue) ? `₵${numValue.toLocaleString()}` : value}
          </div>
        );

      case "NUMBER":
        const num = parseFloat(value);
        return (
          <div
            className="px-3 py-2 min-h-[36px] flex items-center cursor-text hover:bg-muted/30 rounded text-sm"
            onClick={startEditing}
          >
            {!isNaN(num) ? num.toLocaleString() : value}
          </div>
        );

      default:
        return (
          <div
            className="px-3 py-2 min-h-[36px] flex items-center cursor-text hover:bg-muted/30 rounded text-sm"
            onClick={startEditing}
          >
            {value}
          </div>
        );
    }
  };

  if (!table) return null;

  return (
    <div className="w-full bg-background rounded-lg border overflow-hidden">
      {/* Table Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowAddColumn(true)}>
                Add Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Column Settings Dialog */}
      {editingColumn && (
        <Dialog open={!!editingColumn} onOpenChange={() => setEditingColumn(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Column: {editingColumn.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Column Name</Label>
                <Input
                  value={editingColumn.name}
                  onChange={(e) =>
                    setEditingColumn({ ...editingColumn, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Data Type</Label>
                <Select
                  value={editingColumn.dataType}
                  onValueChange={(value) =>
                    setEditingColumn({ ...editingColumn, dataType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLUMN_DATA_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              {editingColumn.dataType === "DROPDOWN" && (
                <div>
                  <Label>Dropdown Options (comma-separated)</Label>
                  <Input
                    value={
                      editingColumn.config?.options
                        ? Array.isArray(editingColumn.config.options)
                          ? editingColumn.config.options.join(", ")
                          : ""
                        : ""
                    }
                    onChange={(e) => {
                      const options = e.target.value
                        .split(",")
                        .map((opt) => opt.trim())
                        .filter((opt) => opt.length > 0);
                      setEditingColumn({
                        ...editingColumn,
                        config: options.length > 0 ? { options } : null,
                      });
                    }}
                    placeholder="e.g., Option 1, Option 2, Option 3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate options with commas
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingColumn.isVisibleOnFrontend}
                  onCheckedChange={(checked) =>
                    setEditingColumn({
                      ...editingColumn,
                      isVisibleOnFrontend: checked,
                    })
                  }
                />
                <Label>Visible on frontend</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingColumn.isRequiredForBooking}
                  onCheckedChange={(checked) =>
                    setEditingColumn({
                      ...editingColumn,
                      isRequiredForBooking: checked,
                    })
                  }
                />
                <Label>Required for booking</Label>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        `/api/media-agency/rate-cards/tables/columns/${editingColumn.id}`,
                        {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name: editingColumn.name,
                            dataType: editingColumn.dataType,
                            isVisibleOnFrontend: editingColumn.isVisibleOnFrontend,
                            isRequiredForBooking: editingColumn.isRequiredForBooking,
                            config: editingColumn.config,
                          }),
                        }
                      );

                      const data = await response.json();
                      if (data.success) {
                        toast.success("Column updated");
                        setEditingColumn(null);
                        if (onUpdate) onUpdate();
                      } else {
                        toast.error(data.error || "Failed to update column");
                      }
                    } catch (error) {
                      console.error("Error updating column:", error);
                      toast.error("Failed to update column");
                    }
                  }}
                >
                  Save
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (
                      !confirm(
                        "Are you sure you want to delete this column? All cell data in this column will be lost."
                      )
                    ) {
                      return;
                    }

                    try {
                      const response = await fetch(
                        `/api/media-agency/rate-cards/tables/columns/${editingColumn.id}`,
                        {
                          method: "DELETE",
                        }
                      );

                      const data = await response.json();
                      if (data.success) {
                        toast.success("Column deleted");
                        setEditingColumn(null);
                        if (onUpdate) onUpdate();
                      } else {
                        toast.error(data.error || "Failed to delete column");
                      }
                    } catch (error) {
                      console.error("Error deleting column:", error);
                      toast.error("Failed to delete column");
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setEditingColumn(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/10">
              {/* Checkbox column */}
              <th className="w-12 p-0">
                <div className="flex items-center justify-center h-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                    checked={selectedRows.size === rows.length && rows.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(new Set(rows.map((r) => r.id)));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                  />
                </div>
              </th>
              {columns.map((column) => {
                const Icon = getColumnIcon(column.dataType);
                return (
                  <th
                    key={column.id}
                    className="px-3 py-2 text-left text-xs font-medium text-muted-foreground min-w-[150px]"
                  >
                    <div className="flex items-center gap-2 group">
                      <Icon className="h-3.5 w-3.5" />
                      <span className="font-medium">{column.name}</span>
                      {column.isRequiredForBooking && (
                        <span className="text-red-500 text-xs">*</span>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingColumn(column)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Edit Column
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={async () => {
                              if (
                                !confirm(
                                  "Are you sure you want to delete this column? All cell data in this column will be lost."
                                )
                              ) {
                                return;
                              }

                              try {
                                const response = await fetch(
                                  `/api/media-agency/rate-cards/tables/columns/${column.id}`,
                                  {
                                    method: "DELETE",
                                  }
                                );

                                const data = await response.json();
                                if (data.success) {
                                  toast.success("Column deleted");
                                  if (onUpdate) onUpdate();
                                } else {
                                  toast.error(data.error || "Failed to delete column");
                                }
                              } catch (error) {
                                console.error("Error deleting column:", error);
                                toast.error("Failed to delete column");
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Column
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </th>
                );
              })}
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground w-24">
                Bookable
              </th>
              <th className="w-12 p-0"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b hover:bg-muted/20 transition-colors group"
              >
                {/* Checkbox */}
                <td className="p-0">
                  <div className="flex items-center justify-center h-[36px]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                      checked={selectedRows.has(row.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedRows);
                        if (e.target.checked) {
                          newSelected.add(row.id);
                        } else {
                          newSelected.delete(row.id);
                        }
                        setSelectedRows(newSelected);
                      }}
                    />
                  </div>
                </td>
                {columns.map((column) => (
                  <td key={column.id} className="p-0">
                    {renderCell(row, column)}
                  </td>
                ))}
                <td className="px-3 py-2">
                  <Switch
                    checked={row.isBookable}
                    onCheckedChange={() =>
                      handleToggleRowBookable(row.id, row.isBookable)
                    }
                    size="sm"
                  />
                </td>
                <td className="p-0">
                  <div className="flex items-center justify-center h-[36px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={async () => {
                            if (
                              !confirm(
                                "Are you sure you want to delete this row? This action cannot be undone."
                              )
                            ) {
                              return;
                            }

                            try {
                              const response = await fetch(
                                `/api/media-agency/rate-cards/tables/rows/${row.id}`,
                                {
                                  method: "DELETE",
                                }
                              );

                              const data = await response.json();
                              if (data.success) {
                                toast.success("Row deleted");
                                if (onUpdate) onUpdate();
                              } else {
                                toast.error(
                                  data.error ||
                                    (data.bookingsCount
                                      ? `Cannot delete row with ${data.bookingsCount} booking(s)`
                                      : "Failed to delete row")
                                );
                              }
                            } catch (error) {
                              console.error("Error deleting row:", error);
                              toast.error("Failed to delete row");
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Column */}
      {showAddColumn && (
        <div className="border-t p-3 bg-muted/10 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Column name"
              className="flex-1 h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target === e.currentTarget) {
                  handleAddColumn();
                } else if (e.key === "Escape") {
                  setShowAddColumn(false);
                  setNewColumnName("");
                  setNewColumnOptions("");
                }
              }}
              autoFocus
            />
            <Select value={newColumnType} onValueChange={setNewColumnType}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLUMN_DATA_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleAddColumn} className="h-9">
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowAddColumn(false);
                setNewColumnName("");
                setNewColumnOptions("");
              }}
              className="h-9"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {newColumnType === "DROPDOWN" && (
            <div>
              <Input
                value={newColumnOptions}
                onChange={(e) => setNewColumnOptions(e.target.value)}
                placeholder="Options (comma-separated): e.g., Option 1, Option 2, Option 3"
                className="h-9 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddColumn();
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Add Row Button - Like Notion's "New page" */}
      <div className="border-t p-3 bg-muted/5">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/30 font-normal"
          onClick={handleAddRow}
        >
          <Plus className="h-4 w-4 mr-2" />
          New page
        </Button>
      </div>
    </div>
  );
}
