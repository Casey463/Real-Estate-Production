"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bookmark,
  X,
  Bed,
  Bath,
  Square,
  Calendar,
  MapPin,
  DollarSign,
  Home,
  Check,
} from "lucide-react";
import { useBookmarksContext } from "@/lib/hooks";
import { Listing } from "@/lib/types";

// interface Property {
//   id: string;
//   type: "Single Family" | "Condo" | "Townhouse";
//   price: number;
//   address: string;
//   bedrooms: number;
//   bathrooms: number;
//   sqft: number;
//   yearBuilt: number;
//   description: string;
//   lotSize: string;
//   parking: string;
//   heating: string;
//   flooring: string;
//   hoa: string;
//   roof: string;
// }

// const mockProperties: Property[] = [
//   {
//     id: "1",
//     type: "Single Family",
//     price: 450000,
//     address: "123 Oak Street, Austin, TX",
//     bedrooms: 3,
//     bathrooms: 2,
//     sqft: 1850,
//     yearBuilt: 2018,
//     description:
//       "Beautiful modern home in desirable East Austin neighborhood. Recently renovated with high-end finishes.",
//     lotSize: "0.25 acres",
//     parking: "2-car garage",
//     heating: "Central Air/Heat",
//     flooring: "Hardwood, Tile",
//     roof: "Composition Shingle",
//     hoa: "$0/month",
//   },
// {
//   id: "2",
//   type: "Condo",
//   price: 325000,
//   address: "456 Pine Avenue, Austin, TX",
//   bedrooms: 2,
//   bathrooms: 2,
//   sqft: 1200,
//   yearBuilt: 2020,
//   description:
//     "Modern condo with city views and premium amenities. Perfect for urban living.",
//   details: {
//     lotSize: "N/A",
//     parking: "1 assigned space",
//     heating: "Central Air/Heat",
//     flooring: "Luxury Vinyl, Tile",
//     roof: "Composition Shingle",
//     hoa: "$250/month",
//   },
//   isBookmarked: true,
// },
// {
//   id: "3",
//   type: "Single Family",
//   price: 675000,
//   address: "789 Maple Drive, Austin, TX",
//   bedrooms: 4,
//   bathrooms: 3,
//   sqft: 2400,
//   yearBuilt: 2015,
//   description:
//     "Spacious family home in quiet neighborhood with large backyard and mature trees.",
//   details: {
//     lotSize: "0.35 acres",
//     parking: "3-car garage",
//     heating: "Central Air/Heat",
//     flooring: "Hardwood, Carpet",
//     roof: "Composition Shingle",
//     hoa: "$0/month",
//   },
//   isBookmarked: true,
// };
// ];

export function PropertyComparison() {
  const { bookmarkedProperties } = useBookmarksContext();
  console.log("Bookmarked Properties:", bookmarkedProperties.length);
  const [selectedProperty, setSelectedProperty] = useState<Listing>(
    bookmarkedProperties[0]
  );

  const [compareMode, setCompareMode] = useState(false);
  const [compareProperties, setCompareProperties] = useState<Listing[]>([]);
  const { bookmarkedIds, handleToggleBookmark } = useBookmarksContext();
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const handlePropertyClick = (property: Listing) => {
    if (compareMode) {
      if (compareProperties.find((p) => p.id === property.id)) {
        // Remove from comparison
        setCompareProperties(
          compareProperties.filter((p) => p.id !== property.id)
        );
      } else if (compareProperties.length < 2) {
        // Add to comparison
        setCompareProperties([...compareProperties, property]);
      }
    } else {
      setSelectedProperty(property);
    }
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    if (!compareMode) {
      setCompareProperties([]);
    }
  };

  const exitCompareMode = () => {
    setCompareMode(false);
    setCompareProperties([]);
  };

  const isPropertySelected = (property: Listing) => {
    if (compareMode) {
      return compareProperties.find((p) => p.id === property.id) !== undefined;
    }
    return selectedProperty.id === property.id;
  };

  const getPropertyBorderClass = (property: Listing) => {
    if (compareMode) {
      return compareProperties.find((p) => p.id === property.id)
        ? "ring-3/4 ring-blue-500 border-blue-500"
        : "border-gray-200";
    }
    return selectedProperty.id === property.id
      ? "ring-3/4 ring-green-500 border-green-500"
      : "border-gray-200";
  };

  const renderSinglePropertyView = () =>
    bookmarkedProperties.length > 0 && (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold mb-1">Property Details</h2>
          <p className="text-sm text-muted-foreground">
            Complete information about the selected property
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Images and Description */}
          <div className="space-y-6">
            {/* Property Images */}
            <div>
              <h3 className="text-lg font-medium mb-3">Property Images</h3>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border">
                <div className="text-center text-gray-400">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Home className="h-8 w-8" />
                  </div>
                  <p className="text-sm">Property Images</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-medium mb-3">Description</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {" "}
                {selectedProperty.description}
              </p>
            </div>
          </div>

          {/* Right Column - Basic Info and Details */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="space-y-4">
                {/* Address */}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedProperty.address}</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedProperty.price)}
                  </span>
                </div>

                {/* Property Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {selectedProperty.bedrooms} Bedrooms
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {selectedProperty.bathrooms} Bathrooms
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {selectedProperty.sqft.toLocaleString()} sq ft
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Built {selectedProperty.yearBuilt}
                    </span>
                  </div>
                </div>

                {/* Property Details */}
                <div>
                  <h3 className="text-lg font-medium mb-4 mt-8.5">
                    Property Details
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {/* Row 1 */}
                    <div>
                      <div className="text-muted-foreground mb-1">Lot Size</div>
                      <div className="font-medium">
                        {selectedProperty.lotSize}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Parking</div>
                      <div className="font-medium">
                        {selectedProperty.parking}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Heating</div>
                      <div className="font-medium">
                        {selectedProperty.heating}
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div>
                      <div className="text-muted-foreground mb-1">Flooring</div>
                      <div className="font-medium">
                        {selectedProperty.flooring}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Roof</div>
                      <div className="font-medium">{selectedProperty.roof}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Hoa</div>
                      <div className="font-medium">{selectedProperty.hoa}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  const renderCompareView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold mb-1">Property Comparison</h2>
        <p className="text-sm text-muted-foreground">
          {compareProperties.length === 0 &&
            "Select up to 2 properties to compare"}
          {compareProperties.length === 1 &&
            "Select 1 more property to compare"}
          {compareProperties.length === 2 &&
            "Comparing 2 properties side by side"}
        </p>
      </div>

      {compareProperties.length === 0 && (
        <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="text-center text-gray-400">
            <Home className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">
              Select Properties to Compare
            </p>
            <p className="text-sm">
              Click on properties in the left panel to add them to comparison
            </p>
          </div>
        </div>
      )}

      {compareProperties.length > 0 && (
        <div
          className={`grid ${
            compareProperties.length === 2 ? "grid-cols-2" : "grid-cols-1"
          } gap-6`}
        >
          {compareProperties.map((property, index) => (
            <Card key={property.id} className="border-blue-200">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Property Images */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Property {index + 1}
                    </h4>
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border mb-4">
                      <div className="text-center text-gray-400">
                        <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Home className="h-6 w-6" />
                        </div>
                        <p className="text-xs">Property Images</p>
                      </div>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="space-y-3">
                    <Badge variant="outline" className="text-xs">
                      {property.type}
                    </Badge>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{property.address}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xl font-bold text-green-600">
                        {formatCurrency(property.price)}
                      </span>
                    </div>

                    {/* Property Stats */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Bed className="h-3 w-3 text-muted-foreground" />
                        <span>{property.bedrooms} Bedrooms</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-3 w-3 text-muted-foreground" />
                        <span>{property.bathrooms} Bathrooms</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="h-3 w-3 text-muted-foreground" />
                        <span>{property.sqft.toLocaleString()} sq ft</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>Built {property.yearBuilt}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Description</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {property.description}
                    </p>
                  </div>

                  <Separator />

                  {/* Property Details */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">
                      Property Details
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lot Size:</span>
                        <span className="font-medium">{property.lotSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Parking:</span>
                        <span className="font-medium">{property.parking}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Heating:</span>
                        <span className="font-medium">{property.heating}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Flooring:</span>
                        <span className="font-medium">{property.flooring}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Roof:</span>
                        <span className="font-medium">{property.roof}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">HOA:</span>
                        <span className="font-medium">{property.hoa}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-200px)] gap-6">
      {/* Left Sidebar - Bookmarked Properties */}
      <div className="w-1/4 min-w-[320px]">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bookmark className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Bookmarked Properties</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Properties you&apos;re considering for investment
            </p>
          </div>

          {/* Compare Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={compareMode ? "default" : "outline"}
              size="sm"
              onClick={toggleCompareMode}
              className="flex-1"
            >
              {compareMode ? "Exit Compare" : "Compare Mode"}
            </Button>
          </div>

          {/* Compare Mode Status */}
          {compareMode && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <span className="text-sm text-blue-700">
                Compare Mode ({compareProperties.length}/2)
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={exitCompareMode}
                className="h-6 w-6 p-0 text-blue-700 hover:bg-blue-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Properties List */}
          {bookmarkedProperties.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-3">
                {bookmarkedProperties.map((property) => (
                  <Card
                    key={property.id}
                    className={`cursor-pointer transition-all hover:shadow-sm ${getPropertyBorderClass(
                      property
                    )}`}
                    onClick={() => handlePropertyClick(property)}
                  >
                    <CardContent className="p-4 max-w-[290px] mx-auto">
                      <div className="space-y-3">
                        {/* Property Type and Price */}
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {property.type}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-bold text-green-600">
                              {formatCurrency(property.price)}
                            </span>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            {compareMode && isPropertySelected(property) && (
                              <Check className="h-4 w-4 text-blue-600 ml-1" />
                            )}
                          </div>
                        </div>

                        {/* Address */}
                        <div className="text-xs font-medium break-words">
                          {property.address}
                        </div>

                        {/* Property Details */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Bed className="h-3 w-3" />
                            <span>{property.bedrooms}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bath className="h-3 w-3" />
                            <span>{property.bathrooms}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Square className="h-3 w-3" />
                            <span>{property.sqft.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 ml-5">
                            <button
                              className="text-md ml-15"
                              onClick={() => handleToggleBookmark(property.id)}
                            >
                              {bookmarkedIds.includes(property.id) ? (
                                <Bookmark fill="#3858ba" color="#3858ba" />
                              ) : (
                                <Bookmark color="#3858ba" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <Home className="h-12 w-12 mb-4 text-gray-300" />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                No bookmarked properties found
              </p>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                Bookmark properties to compare and view details here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Property Details or Comparison */}
      <div className="flex-1">
        {compareMode ? renderCompareView() : renderSinglePropertyView()}
      </div>
    </div>
  );
}
