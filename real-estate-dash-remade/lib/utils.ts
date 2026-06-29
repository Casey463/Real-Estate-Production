"use client";
import { nationData } from "@/components/map/data/nation-data";
import { QueryClient } from "@tanstack/react-query";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// import L from "leaflet"; // Moved import inside function to avoid SSR issues

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const queryClient = new QueryClient();

export function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export async function flattenCoordinates({
  data,
  type,
}: {
  data: GeoJSON.FeatureCollection;
  type: boolean;
}) {
  // Import leaflet only on the client side to avoid SSR issues
  // Use dynamic import to avoid SSR issues and require() style import
  const L = await import("leaflet");

  type CoordPair = [number, number];

  const stateFlatBoundsNamed = data.features.map((coords, i) => {
    // console.log(nationData.features[i].geometry.type);
    if (data.features[i].geometry.type === "Polygon") {
      //can you convert the polygon coordinates to a flat array of coordinate pairs?
      const flatCoords = (coords.geometry as GeoJSON.Polygon).coordinates[0]; // Get the first ring of the polygon
      const coordPairs = flatCoords.filter(
        (coord: unknown): coord is CoordPair =>
          Array.isArray(coord) &&
          coord.length === 2 &&
          typeof coord[0] === "number" &&
          typeof coord[1] === "number",
      );

      const statesFlatBound = L.latLngBounds(
        (coordPairs as [number, number][]).map((coord) => [coord[1], coord[0]]),
      );

      return [
        statesFlatBound,
        type
          ? data.features[i].properties?.NAME
          : (data.features[i].properties?.ZCTA5CE10 ?? ""),
      ] as [L.LatLngBounds, string];
    } else if (data.features[i].geometry.type === "MultiPolygon") {
      const flatCoords = (
        coords.geometry as GeoJSON.MultiPolygon
      ).coordinates.flat(2);
      const coordPairs = flatCoords.filter(
        (coord: unknown): coord is CoordPair =>
          Array.isArray(coord) &&
          coord.length === 2 &&
          typeof coord[0] === "number" &&
          typeof coord[1] === "number",
      );

      const statesFlatBound = L.latLngBounds(
        (coordPairs as [number, number][]).map((coord) => [coord[1], coord[0]]),
      );

      return [
        statesFlatBound,
        type
          ? data.features[i].properties?.NAME
          : (data.features[i].properties?.ZCTA5CE10 ?? ""),
      ] as [L.LatLngBounds, string];
    } else {
      console.warn(
        `Unsupported geometry type for state ${i}: ${nationData.features[i].geometry.type}`,
      );
      return [{}, nationData.features[i].properties.NAME]; // Handle unsupported types gracefully
    }
  });

  const flattenedStates = stateFlatBoundsNamed.filter(
    (entry): entry is [L.LatLngBounds, string] =>
      Array.isArray(entry) &&
      entry.length === 2 &&
      entry[0] instanceof L.LatLngBounds &&
      typeof entry[1] === "string",
  );

  return flattenedStates;
}
