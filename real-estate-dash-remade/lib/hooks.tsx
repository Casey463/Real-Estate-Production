// Fetch Properties
"use client";
import { zipData } from "../components/map/data/zipData/zipdata";
import { BookmarksContext } from "@/providers/BookmarksContextProvider";
import { BackendListing, Listing, ZipItem } from "./types";
import React, { useEffect, useState } from "react";
import { PropertiesContext } from "@/providers/PropertiesContextProvider";
import { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";
import { flattenCoordinates } from "./utils";
import { useQuery } from "@tanstack/react-query";

export const useProperties = (zipcodes: string[]) => {
  const [properties, setProperties] = React.useState<Listing[]>([]);
  const [firstLoad, setFirstLoad] = React.useState(true);

  //Fetch featured properties for homepage on initial load, only if no zipcodes are selected and no properties are loaded yet
  const fetchFeaturedProperties = async () => {
    const BASEAPIURL =
      (process.env.NEXT_PUBLIC_BASE_API_URL as string) ||
      "http://localhost:8000";
    const res = await fetch(
      `${BASEAPIURL}/api/listings/?format=json&page=99&`,
      {
        method: "GET",
      },
    );

    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }
    const res2 = await res.json();

    const listings = mapBackendListingToListing(res2.results);

    setProperties(listings as Listing[]);
  };

  // Use react-query to fetch and cache properties by zipcodes
  const fetchPropertiesByZipcodes = async (zipcodes: string[]) => {
    const BASEAPIURL =
      (process.env.NEXT_PUBLIC_BASE_API_URL as string) ||
      "http://localhost:8000";
    const raw = JSON.stringify(zipcodes);
    const res = await fetch(
      `${BASEAPIURL}/api/listings/zipcodes/?format=json`,
      {
        method: "POST",
        body: raw,
      },
    );

    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }
    const res2 = await res.json();

    const listings = mapBackendListingToListing(res2);
    return listings as Listing[];
  };

  if (zipcodes.length === 0 && properties.length === 0) {
    fetchFeaturedProperties();
  } else if (zipcodes.length > 0 && firstLoad) {
    setProperties([]);
    setFirstLoad(false);
  }

  // Track which zipcodes have already been fetched to avoid duplicate API calls
  const [allQueriedZips, setAllQueriedZips] = React.useState<Set<string>>(
    new Set(),
  );

  // Filter out zipcodes that have already been queried, keeping only new ones
  const newZips = React.useMemo(() => {
    const zipsSet = new Set(zipcodes);
    return Array.from(zipsSet).filter((zip) => !allQueriedZips.has(zip));
  }, [zipcodes, allQueriedZips]);

  // Fetch properties for new zipcodes using react-query for caching
  const { data: cachedData, error } = useQuery({
    queryKey: ["properties", newZips],
    queryFn: () => fetchPropertiesByZipcodes(newZips),
    enabled: newZips.length > 0, // Only run query if there are new zipcodes
  });

  // Update the set of queried zipcodes after successful fetch
  React.useEffect(() => {
    if (cachedData && !error) {
      setAllQueriedZips((prev) => new Set([...prev, ...newZips]));
    }
  }, [cachedData, error, newZips]);

  // Transform and set properties once data is available and no error occurred
  React.useEffect(() => {
    if (!cachedData || error) return;
    try {
      setProperties((prev) => [...prev, ...cachedData]);
    } catch (error) {
      console.error(error);
    }
  }, [cachedData, error]);

  return { properties };
};

const getZipJson = async (url: string): Promise<ZipItem[]> => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

export const mapBackendListingToListing = (
  listings: BackendListing[],
): Listing[] => {
  const newListings: Listing[] = listings.map((item) => {
    return {
      id: item.id,
      name: item.street_name,
      price: parseFloat(item.listing_price),
      address: item.geocoded_address,
      type: "House",
      bedrooms: item.bedrooms,
      bathrooms: parseFloat(item.bathrooms),
      sqft: parseFloat(item.square_footage),
      yearBuilt: item.year_built,
      description: item.marketing_remarks,
      lotSize: item.lot_sqft,
      parking: item.parking_type,
      heating: item.heating_cooling_type,
      flooring: item.floor_covering,
      hoa: item.association_dues,
      roof: item.roof,
      rating: 8,
      coordinates: {
        lat: parseFloat(item.latitude),
        lng: parseFloat(item.longitude),
      },
      imageUrl: "/download.png",
    };
  });
  return newListings;
};

export const useActiveZipCode = (states: string[]) => {
  const [zipCodeData, setZipCodeData] = React.useState<ZipItem[] | null>(null);

  React.useEffect(() => {
    if (states.length === 0) {
      setZipCodeData(null);
      return;
    }

    const fetchZipData = async () => {
      const stateKey = states[0].toLowerCase() as keyof typeof zipData;
      if (zipData[stateKey]) {
        const data = await getZipJson(zipData[stateKey]);

        setZipCodeData(data);
      }
    };

    fetchZipData();
  }, [states]);

  return zipCodeData;
};

export const useZipsOnScreen = (
  zip: ZipItem[] | null,
  bounds: L.LatLngBounds | null,
  zoom: number,
) => {
  const [zipsOnScreen, setZipsOnScreen] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!bounds || !zip || zoom < 16) {
      setZipsOnScreen([]);
      return;
    }

    let isMounted = true;

    const processZips = async () => {
      const flattenedZipcodes = (await flattenCoordinates({
        data: zip as unknown as FeatureCollection<Geometry, GeoJsonProperties>,
        type: false,
      })) as [L.LatLngBounds, string][];
      if (!isMounted) return;
      const filtered = flattenedZipcodes
        .filter((zip) => {
          if ((zip[0] as L.LatLngBounds).intersects(bounds)) return true;
          return false;
        })
        .map((zip) => zip[1] as string);
      setZipsOnScreen(filtered);
    };

    processZips();

    return () => {
      isMounted = false;
    };
  }, [zip, bounds, zoom]);

  return zipsOnScreen;
};

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState(() =>
    JSON.parse(localStorage.getItem(key) || JSON.stringify(initialValue)),
  );
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue] as const;
}
//Context hooks

export const useBookmarksContext = () => {
  const context = React.useContext(BookmarksContext);
  if (!context) {
    throw new Error(
      "useBookmarks must be used within a BookmarksContextProvider",
    );
  }
  return context;
};

export const usePropertiesContext = () => {
  const context = React.useContext(PropertiesContext);
  if (!context) {
    throw new Error(
      "usePropertiesContext must be used within a PropertiesContextProvider",
    );
  }
  return context;
};
