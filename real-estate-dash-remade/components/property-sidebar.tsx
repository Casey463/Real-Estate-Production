"use client";

import React, { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bookmark, MapPin, Star } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PropertyFiltersDialog,
  type FilterState,
} from "./property-filters-dialog";

import { styleGeoJSON } from "./map/map-components/color-zone";
import Image from "next/image";
import { useBookmarksContext, usePropertiesContext } from "@/lib/hooks";

export function PropertySidebar() {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 10000000],
    propertyType: "all",
    sortBy: "price",
    selectedAmenities: [],
    minRating: [0],
    filters: [
      { label: "filter1", active: false },
      { label: "filter2", active: false },
      { label: "filter3", active: false },
    ],
  });

  const { properties } = usePropertiesContext();
  const { bookmarkedIds, handleToggleBookmark } = useBookmarksContext();

  // Fetch properties from backend with filters
  // React.useEffect(() => {
  // const params = new URLSearchParams({
  //   price_min: filters.priceRange[0].toString(),
  //   price_max: filters.priceRange[1].toString(),
  //   property_type: filters.propertyType,
  //   min_rating: filters.minRating[0].toString(),
  //   // Add more filters here if needed
  // });

  //   const fetchProperties = async () => {
  //     const BASEAPIURL =
  //       (process.env.NEXT_PUBLIC_BASE_API_URL as string) ||
  //       "http://localhost:8000";

  //     console.log("Base API URL:", BASEAPIURL);

  //     try {
  //       const res = await fetch(
  //         `${BASEAPIURL}/api/listings/?format=json&page=99`,
  //         {
  //           method: "GET",
  //         }
  //       );
  //       console.log("Fetched data1:", res);
  //       const res2 = await res.json();

  //       const data = res2.results as BackendListing[];
  //       const transformed: Listing[] = data.map((item) => {
  //         return {
  //           id: item.id,
  //           name: item.street_name,
  //           price: parseFloat(item.listing_price),
  //           address: item.geocoded_address,
  //           type:
  //             filters.propertyType !== "all" ? filters.propertyType : "House",
  //           rating: Math.floor(Math.random() * 5) + 1, // dummy rating
  //           coordinates: {
  //             lat: parseFloat(item.latitude),
  //             lng: parseFloat(item.longitude),
  //           },
  //           imageUrl: "/download.png",
  //         };
  //       });

  //       setProperties(transformed);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   fetchProperties();
  // }, []);

  //Passing params to backend currently doesn't filter results, so filtering on frontend for now.

  const filteredProperties = properties.filter((property) => {
    const matchesPrice =
      property.price >= filters.priceRange[0] &&
      property.price <= filters.priceRange[1];
    const matchesType =
      filters.propertyType === "all" ||
      property.type.toLowerCase() === filters.propertyType;
    const matchesRating = property.rating >= filters.minRating[0];

    return matchesPrice && matchesType && matchesRating;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (filters.sortBy) {
      case "price":
        return a.price - b.price;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const activeFiltersCount = [
    filters.priceRange[0] > 0 || filters.priceRange[1] < 500,
    filters.propertyType !== "all",
    filters.minRating[0] > 0,
    filters.selectedAmenities.length > 0,
    filters.filters.filter((f) => f.active).length,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, 500],
      propertyType: "all",
      sortBy: "price",
      selectedAmenities: [],
      minRating: [0],
      filters: [
        { label: "filter1", active: false },
        { label: "filter2", active: false },
        { label: "filter3", active: false },
      ],
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Compact Filter Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Properties</h2>
          <PropertyFiltersDialog
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        {/* Quick Sort */}
        <Select
          value={filters.sortBy}
          onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price">Price (Low to High)</SelectItem>
            <SelectItem value="rating">Rating (High to Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Properties List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              {sortedProperties.length} properties found
            </h3>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Clear filters
              </Button>
            )}
          </div>
          <div className="h-150 overflow-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {sortedProperties.map((property) => (
              <Card
                key={property.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg">
                    <Image
                      width={400}
                      height={300}
                      src={property.imageUrl}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-background/90 text-foreground">
                      {property.type}
                    </Badge>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm leading-tight">
                        {property.name}
                      </h4>
                      <div className="flex items-center gap-1 text-sm">
                        <Star
                          className="h-3 w-3"
                          fill={styleGeoJSON({ name: property.name }).fill}
                          color={styleGeoJSON({ name: property.name }).fill}
                        />
                        <span className="font-medium">{property.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" />
                      <span>{property.address}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex justify-between">
                        <span className="font-bold text-lg">
                          ${property.price}
                        </span>
                        <button
                          className="text-md  ml-45"
                          onClick={() => handleToggleBookmark(property.id)}
                        >
                          {bookmarkedIds.includes(property.id) ? (
                            <Bookmark fill="#3858ba" color="#3858ba" />
                          ) : (
                            <Bookmark color="#3858ba" />
                          )}
                        </button>
                      </div>
                      {/* <span className="text-xs text-muted-foreground">
                      {property.reviews} reviews
                    </span> */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
