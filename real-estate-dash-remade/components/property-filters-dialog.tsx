"use client";

import { useState } from "react";
// import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// import Tickbox from "./tickbox";

export interface FilterItem {
  label: string;
  active: boolean;
}

export interface FilterState {
  priceRange: number[];
  propertyType: string;
  sortBy: string;
  selectedAmenities: string[];
  minRating: number[];
  filters: FilterItem[];
}

interface PropertyFiltersDialogProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

// FilterConfig describes the structure for each filter input in the dialog.
// This allows us to render filters dynamically and keep the code DRY.
type FilterConfig =
  | {
      type: "slider"; // Renders a slider input
      key: keyof FilterState; // Which key in FilterState this filter controls
      label: string; // Label to display
      min: number; // Min value for slider
      max: number; // Max value for slider
      step: number; // Step value for slider
      getValue: (filters: FilterState) => number[]; // How to get the value from state
      formatValue?: (value: number[]) => string; // Optional: how to display the value
    }
  | {
      type: "select"; // Renders a select dropdown
      key: keyof FilterState;
      label: string;
      options: { value: string; label: string }[]; // Dropdown options
      getValue: (filters: FilterState) => string;
    };

// Array of filter configs. Add new filters here to render them automatically.
const filterConfigs: FilterConfig[] = [
  {
    type: "slider",
    key: "priceRange",
    label: "Price Range",
    min: 0,
    max: 1000000,
    step: 500,
    getValue: (filters) => filters.priceRange,
    formatValue: (value) => `$${value[0]} - $${value[1]}`,
  },
  {
    type: "select",
    key: "propertyType",
    label: "Property Type",
    options: [
      { value: "all", label: "All Types" },
      { value: "apartment", label: "Apartment" },
      { value: "house", label: "House" },
      { value: "studio", label: "Studio" },
      { value: "penthouse", label: "Penthouse" },
      { value: "condo", label: "Condo" },
    ],
    getValue: (filters) => filters.propertyType,
  },
  {
    type: "slider",
    key: "minRating",
    label: "Minimum Rating",
    min: 0,
    max: 5,
    step: 0.1,
    getValue: (filters) => filters.minRating,
    formatValue: (value) => `${value[0].toFixed(1)}`,
  },
  {
    type: "select",
    key: "sortBy",
    label: "Sort By",
    options: [
      { value: "price", label: "Price (Low to High)" },
      { value: "rating", label: "Rating (High to Low)" },
    ],
    getValue: (filters) => filters.sortBy,
  },
];

export function PropertyFiltersDialog({
  filters,
  onFiltersChange,
}: PropertyFiltersDialogProps) {
  // Local state for the dialog, initialized from props
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  // Count how many filters are currently active (for "Clear all" button visibility)
  const activeFiltersCount = [
    localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 500,
    localFilters.propertyType !== "all",
    localFilters.minRating[0] > 0,
    localFilters.selectedAmenities.length > 0,
    localFilters.filters,
  ].filter(Boolean).length;

  // Handles updating a filter value in state and notifying parent
  const handleFilterChange = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
    // For debugging: log the updated filters
    // console.log("Updated filters:", newFilters);
  };

  // Resets all filters to their default values
  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      priceRange: [0, 500],
      propertyType: "all",
      sortBy: "price",
      selectedAmenities: [],
      minRating: [0],
      filters: [],
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-none h-[calc(100vh-6rem)] top-[3rem] left-[1rem] right-[1rem] translate-x-0 translate-y-0 rounded-lg">
        <DialogHeader className="px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="text-2xl">Filters</DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className={activeFiltersCount === 0 ? "invisible" : ""}
              >
                Clear all
              </Button>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-12rem)] px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pr-4">
            {/* Render each filter input dynamically based on config */}
            {filterConfigs.map((config) => {
              if (config.type === "slider") {
                // Render a slider input
                return (
                  <div className="space-y-4" key={config.key}>
                    <Label className="text-lg font-semibold">
                      {config.label}
                    </Label>
                    <div className="space-y-4">
                      <Slider
                        value={config.getValue(localFilters)}
                        onValueChange={(value) =>
                          handleFilterChange(
                            config.key,
                            value as FilterState[typeof config.key]
                          )
                        }
                        max={config.max}
                        min={config.min}
                        step={config.step}
                        className="w-full"
                      />
                      <div className="flex justify-between text-base text-muted-foreground">
                        <span>
                          {config.formatValue
                            ? config.formatValue(config.getValue(localFilters))
                            : config.getValue(localFilters).join(" - ")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              if (config.type === "select") {
                // Render a select dropdown
                return (
                  <div className="space-y-4" key={config.key}>
                    <Label className="text-lg font-semibold">
                      {config.label}
                    </Label>
                    <Select
                      value={config.getValue(localFilters)}
                      onValueChange={(value) =>
                        handleFilterChange(
                          config.key,
                          value as FilterState[typeof config.key]
                        )
                      }
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder={config.label} />
                      </SelectTrigger>
                      <SelectContent>
                        {config.options.map((option) => (
                          <SelectItem value={option.value} key={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }
              return null;
            })}
            {/* Add more filter types here as needed */}
            {/* Checkbox filters using tickbox component (commented out for now) */}
            {/* <Tickbox
              filters={localFilters.filters}
              filtersCategory="Filters"
              handleFilterChange={(category, checked) => {
                // Implement your filter change logic here, or pass a suitable handler
                // Example: update the filters array in localFilters
                const updatedFilters = localFilters.filters.map((filter) =>
                  filter.label === category
                    ? { ...filter, active: checked ?? !filter.active }
                    : filter
                );
                handleFilterChange("filters", updatedFilters);
              }}
            /> */}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
