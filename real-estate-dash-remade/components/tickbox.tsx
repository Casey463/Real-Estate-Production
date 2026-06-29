import { Label, SelectGroup } from "@radix-ui/react-select";
import React from "react";
import { FilterItem } from "./property-filters-dialog";

interface TickboxProps {
  filters: FilterItem[];
  filtersCategory: string;
  handleFilterChange: (category: string, checked?: boolean) => void;
}

export default function Tickbox({
  filters,
  filtersCategory,
  handleFilterChange,
}: TickboxProps) {
  return (
    <div>
      {/* Property Filters */}
      <SelectGroup className="flex flex-col space-y-2">
        <div className="space-y-4">
          <Label className="text-lg font-semibold">{filtersCategory}</Label>
          <div className="space-y-4">
            <div className="flex-col items-center space-x-3">
              {filters.map((filter: FilterItem) => (
                <div
                  key={filter.label}
                  className="flex items-center space-x-3 p-1"
                >
                  {/* Styled like Radix UI Checkbox */}
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={filter.active}
                    tabIndex={0}
                    onClick={() =>
                      handleFilterChange(filter.label, filter.active)
                    }
                    className={`h-5 w-5 rounded border transition-colors flex items-center justify-center
                    ${
                      filter.active
                        ? "bg-blue-600 border-blue-600"
                        : "bg-white border-gray-300"
                    }
                    focus:outline-none `}
                  >
                    {filter.active && (
                      <svg
                        className="w-3 h-3 text-white"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="4 8.5 7 11.5 12 5.5" />
                      </svg>
                    )}
                  </button>
                  <Label
                    className="text-base font-normal cursor-pointer"
                    onClick={() =>
                      handleFilterChange(filter.label, !filter.active)
                    }
                  >
                    {filter.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SelectGroup>
    </div>
  );
}

//<Label className="text-lg font-semibold">
