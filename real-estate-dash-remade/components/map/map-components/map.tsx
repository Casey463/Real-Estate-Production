"use client";

import { useEffect, useState, useRef, JSX } from "react";

import {
  GeoJSON,
  MapContainer,
  Popup,
  useMapEvents,
  Marker,
} from "react-leaflet";
import type {
  Feature,
  Geometry,
  GeoJsonProperties,
  FeatureCollection,
} from "geojson";
import L from "leaflet"; // Import Leaflet for custom icon and bounds
import { Icon, type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import { TileLayer } from "react-leaflet";
import { flattenCoordinates } from "@/lib/utils";

// Import GeoJSON data directly (not dynamically) for client-side usage
import { nationData } from "../data/nation-data";
import { countyData } from "../data/county-data";

// import { seattleHouses } from "../data/dummy";
import { styleGeoJSON } from "./color-zone";
import {
  useActiveZipCode,
  usePropertiesContext,
  useZipsOnScreen,
} from "@/lib/hooks";
import { Listing, ZipItem } from "@/lib/types";

const makeIcon = (rating: number) => {
  let url;
  if (rating < 2.5) {
    url = "/red.png";
  } else if (rating < 5) {
    url = "/yellow.png";
  } else if (rating < 7.5) {
    url = "/orange.png";
  } else {
    url = "/green.png";
  }

  const customIcon = new Icon({
    iconUrl: url,
    iconSize: [30, 30],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return customIcon;
};
//Properties type

// type Property = {
//   id: string;
//   name: string;
//   address: string;
//   coordinates: [number, number]; // [latitude, longitude]}
//   rating: number;
//   price: number;
// };

// Zone coloring data type
interface ZoneData {
  [key: string]: {
    color: string;
  };
}

function StatesOnScreen(
  flattenedStates: [L.LatLngBounds, string][],
  bounds: L.LatLngBounds,
): string[] {
  return flattenedStates
    .filter((state) => {
      if ((state[0] as L.LatLngBounds).intersects(bounds)) return true;
      return false;
    })
    .map((state) => state[1] as string);
}

//

function MapEventsLogger({
  onZoom,
  onMove,
}: {
  onZoom?: (
    zoom: number,
    center: LatLngExpression,
    states: string[],
    zipcodes: string[],
  ) => void;
  onMove?: (
    center: LatLngExpression,
    states: string[],
    zipcodes: string[],
  ) => void;
}) {
  // const latestEventRef = useRef<{
  //   center: LatLngExpression;
  //   states: string[];
  //   zipcodes: string[];
  // } | null>(null);
  // const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  // const lastEmittedStatesRef = useRef<string[]>([]);
  // const zoomDebounceTimeout = useRef<NodeJS.Timeout | null>(null);
  // const lastEmittedZoomRef = useRef<{ zoom: number; states: string[] }>({
  //   zoom: -1,
  //   states: [],
  // });
  // const lastEmittedZipcodesRef = useRef<string[]>([]);

  const zipCodesRef = useRef<string[]>([]);

  const [mapState, setMapState] = useState<{
    zoom: number;
    center: LatLngExpression;
    states: string[];
    bounds: L.LatLngBounds | null;
  }>({
    zoom: 3,
    center: [37.7749, -122.4194], // Default center (San Francisco)
    states: [],
    bounds: null,
  });

  const zip = useActiveZipCode(mapState.states);

  const zipsOnScreen = useZipsOnScreen(zip, mapState.bounds, mapState.zoom);

  const { setZipCodes } = usePropertiesContext();

  const [localFlattenedStates, setLocalFlattenedStates] = useState<
    [L.LatLngBounds, string][]
  >([]);

  useEffect(() => {
    zipCodesRef.current = zipsOnScreen;
    setZipCodes(zipsOnScreen);
  }, [zipsOnScreen, setZipCodes]);

  useEffect(() => {
    const getFlattenedStates = async () => {
      const result = await flattenCoordinates({
        data: nationData as FeatureCollection<Geometry, GeoJsonProperties>,
        type: true,
      });
      setLocalFlattenedStates(result);
    };
    getFlattenedStates();
  }, []);

  // Helper to compare arrays

  // const emitMove = useCallback(
  //   (center: LatLngExpression, states: string[], zipcodes: string[]) => {
  //     // Sort for deduplication
  //     const sortedStates = [...states].sort();
  //     const sortedZipcodes = [...zipcodes].sort();
  //     if (!arraysEqual(sortedStates, lastEmittedStatesRef.current)) {
  //       lastEmittedStatesRef.current = sortedStates;
  //       if (onMove) onMove(center, sortedStates, []);
  //     } else if (!arraysEqual(sortedZipcodes, lastEmittedZipcodesRef.current)) {
  //       lastEmittedZipcodesRef.current = sortedZipcodes;
  //       if (onMove) onMove(center, [], sortedZipcodes);
  //     } else return; // No changes, do not emit
  //   },
  //   [onMove],
  // );

  useMapEvents({
    zoomend: (e) => {
      const map = e.target;
      if (onZoom) {
        setTimeout(() => {}, 400);
        const zoom = map.getZoom();
        let states: string[] = [];
        let zipcodes: string[] = [];

        if (zoom >= 8) {
          const bounds = map.getBounds();
          states = StatesOnScreen(localFlattenedStates, bounds) || [];
        }
        if (zoom >= 11) {
          zipcodes = zipCodesRef.current;
        }
        // Only trigger debounce if zoom or states actually changed
        const sortedStates = [...states].sort();
        // const lastZoom = lastEmittedZoomRef.current.zoom;
        // const lastStates = lastEmittedZoomRef.current.states;
        // if (zoom !== lastZoom || !arraysEqual(sortedStates, lastStates)) {
        //   if (zoomDebounceTimeout.current)
        //     clearTimeout(zoomDebounceTimeout.current);
        //   zoomDebounceTimeout.current = setTimeout(() => {
        //     lastEmittedZoomRef.current = { zoom, states: sortedStates };
        setMapState((prev) => ({
          ...prev,
          zoom,
          states: sortedStates,
          bounds: map.getBounds(),
          center: [map.getCenter().lat, map.getCenter().lng],
        }));
        onZoom(
          zoom,
          [map.getCenter().lat, map.getCenter().lng],
          sortedStates,
          zipcodes,
        );
        // }, 200); // 200ms debounce
        // } else {
        //   // Optionally, log that zoom debounce was skipped
        //   // console.log("[MapEventsLogger] Zoom debounce skipped, no change:", zoom, sortedStates);
        // }
      }
    },
    moveend: (e) => {
      const map = e.target;

      const zoom = map.getZoom();
      let states: string[] = [];
      let zipcodes: string[] = [];
      if (onMove) {
        setTimeout(() => {}, 400);
        if (zoom >= 8) {
          const bounds = map.getBounds();
          states = StatesOnScreen(localFlattenedStates, bounds) || [];
        }
        //Get active zip codes within bounds
        if (zoom >= 11) {
          zipcodes = zipCodesRef.current;
        }

        const center: LatLngExpression = [
          map.getCenter().lat,
          map.getCenter().lng,
        ];
        // Only trigger debounce if states actually changed
        const sortedStates = [...states].sort();
        const sortedZipcodes = [...zipcodes].sort();

        // if (
        //   !arraysEqual(sortedStates, lastEmittedStatesRef.current) &&
        //   !arraysEqual(sortedZipcodes, lastEmittedZipcodesRef.current)
        // ) {
        //   latestEventRef.current = { center, states, zipcodes };
        //   if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        //   debounceTimeout.current = setTimeout(() => {
        //     if (latestEventRef.current) {
        setMapState((prev) => ({
          ...prev,
          zoom,
          states: sortedStates,
          bounds: map.getBounds(),
        }));
        // emitMove(center, sortedStates, sortedZipcodes);
        onMove(center, sortedStates, sortedZipcodes);
        //     }
        //   // }, 200); // 200ms debounce
        // } else {
        //   // Optionally, log that debounce was skipped
        //   // console.log("[MapEventsLogger] Debounce skipped, no state change:", sortedStates);
        // }
      }
    },
  });
  return null;
}

export default function Map() {
  // const [markers] = useState<Property[]>(seattleHouses);

  const [stateColors, setStateColors] = useState<ZoneData>({});
  const [countyColors, setCountyColors] = useState<ZoneData>({});
  const [zipColors] = useState<ZoneData>({});
  const [activeStates, setActiveStates] = useState<string[]>([]);
  const [activeZipCodes, setActiveZipCodes] = useState<ZipItem[] | null>(null);
  const [markers, setMarkers] = useState<JSX.Element[]>([]);

  const [zoomLevel, setZoomLevel] = useState(6);
  const center: LatLngExpression = [39.8283, -98.5795];

  const activeZip = useActiveZipCode(activeStates);
  const { properties } = usePropertiesContext();

  useEffect(() => {
    setActiveZipCodes(activeZip);
  }, [activeZip]);

  useEffect(() => {
    setMarkers(
      properties.map((properties: Listing) => (
        <Marker
          key={properties.id}
          position={properties.coordinates}
          icon={makeIcon(properties.rating)}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold">{properties.name}</h3>
              <p className="text-sm">{properties.address}</p>
              <p className="text-sm">Rating: {properties.rating}</p>
            </div>
          </Popup>
        </Marker>
      )),
    );
  }, [properties]);

  // Initialize state colors
  useEffect(() => {
    const colorMap = ({ type }: { type: string }) => {
      let data;
      let state;
      if (type === "states") {
        data = nationData;
        state = setStateColors;
      } else if (type === "counties") {
        data = countyData;
        state = setCountyColors;
      }
      if (!data || !data.features) {
        return;
      }
      const Colors: ZoneData[] = data.features.map((feature) => {
        // Construct a ZoneData entry for this state
        return {
          [feature.properties.NAME]: {
            color: styleGeoJSON({ name: feature.properties.NAME }).fill,
          },
        };
      });

      if (state) {
        state(Colors.reduce((acc, curr) => ({ ...acc, ...curr }), {}));
      }
    };
    colorMap({ type: "states" });
    colorMap({ type: "counties" });
  }, []);

  const stateStyle = (
    feature: Feature<Geometry, GeoJsonProperties> | undefined,
  ) => {
    if (!feature) {
      return {
        fillColor: "#f1f5f9",
        weight: 0.05,
        opacity: 0.03,
        color: "#4b4d6b",
        fillOpacity: 0.5,
      };
    }
    const stateName = feature.properties?.NAME;
    if (stateName && stateColors[stateName]) {
      return {
        fillColor: stateColors[stateName].color,
        weight: 0.05,
        opacity: 0.03,
        color: "white",
        fillOpacity: zoomLevel <= 7 && zoomLevel >= 5 ? 0.5 : 0,
      };
    }
    return {
      fillColor: "#f1f5f9",
      weight: 0.05,
      opacity: 0.03,
      color: "#4b4d6b",
      fillOpacity: zoomLevel <= 7 && zoomLevel >= 5 ? 0.5 : 0,
    };
  };

  const countyStyle = (
    feature: Feature<Geometry, GeoJsonProperties> | undefined,
  ) => {
    if (!feature) {
      console.log("No feature for county style");
      return {
        fillColor: "#f1f5f9",
        weight: 1,
        opacity: 1,
        color: "#4b4d6b",
        fillOpacity: 0.5,
      };
    }
    const countyId = feature.properties?.NAME;
    if (countyId && countyColors[countyId]) {
      return {
        fillColor: countyColors[countyId].color,
        weight: 1,
        opacity: zoomLevel <= 10 && zoomLevel >= 8 ? 1 : 0,
        color: "white",
        fillOpacity: zoomLevel <= 10 && zoomLevel >= 8 ? 0.4 : 0,
      };
    }
    return {
      fillColor: "#f1f5f9",
      weight: 1,
      opacity: zoomLevel <= 10 && zoomLevel >= 8 ? 1 : 0,
      color: "#4b4d6b",
      fillOpacity: zoomLevel <= 10 && zoomLevel >= 8 ? 0.4 : 0,
    };
  };

  const zipStyle = (
    feature: Feature<Geometry, GeoJsonProperties> | undefined,
  ) => {
    if (!feature) {
      return {
        fillColor: "#f1f5f9",
        weight: 1,
        opacity: 1,
        color: "#4b4d6b",
        fillOpacity: 0.4,
      };
    }
    const zipId = feature.properties?.GEOID;
    if (zipId && zipColors[zipId]) {
      return {
        fillColor: "#f1f5f9",
        weight: 1,
        opacity: 1,
        color: zipColors[zipId].color,
        fillOpacity: 0.4,
      };
    }
    // Always return a fallback style
    return {
      fillColor: "#f1f5f9",
      weight: 1,
      opacity: 1, // zoomLevel <= 14 && zoomLevel >= 11 ? 1 : 0,
      color: "#4b4d6b",
      fillOpacity: 0.4, // zoomLevel <= 14 && zoomLevel >= 11 ? 0.4 : 0,
    };
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={3}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <MapEventsLogger
          onZoom={(
            zoom: number,
            _center: LatLngExpression,
            states: string[],
            // zipcodes: string[],
          ) => {
            setZoomLevel(zoom);
            // Uncomment for debugging or testing
            console.log("Map zoom level:", zoom);
            console.log("[MapEventsLogger] onZoom states:", states);
            setActiveStates(states);
          }}
          onMove={(
            _center: LatLngExpression,
            states: string[],
            zipcodes: string[],
          ) => {
            if (zipcodes.length > 0) {
            }
            if (states.length > 0) {
              setActiveStates(states);
            }

            // Uncomment for debugging or testing
            console.log("[MapEventsLogger] onMove states:", states);
          }}
        />

        {/* Load once then just update styles based on active states/zip codes */}

        {/* States Layer */}
        <GeoJSON
          data={nationData as unknown as GeoJSON.FeatureCollection}
          style={stateStyle}
        />

        {/* Counties Layer */}
        <GeoJSON
          data={countyData as unknown as GeoJSON.FeatureCollection}
          style={countyStyle}
        />

        {/* Zip Layer */}
        {zoomLevel <= 15 && zoomLevel >= 11 ? (
          <GeoJSON
            data={activeZipCodes as unknown as GeoJSON.FeatureCollection}
            style={zipStyle}
          />
        ) : (
          ""
        )}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Markers */}
        {zoomLevel >= 15 && markers}
        {/* {markerMode && <AddMarkerOnClick addMarker={addMarker} />} */}
      </MapContainer>
    </div>
  );
}
