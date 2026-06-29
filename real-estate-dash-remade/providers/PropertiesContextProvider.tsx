"use client";
import { useProperties } from "@/lib/hooks";
import { Listing } from "@/lib/types";
import React, { createContext, useMemo } from "react";

// import { useSearchQuery, useSearchTextContext } from "../lib/hooks";

type PropertiesProps = {
  children: React.ReactNode;
};

type PropertiesContext = {
  properties: Listing[];
  zipcodes: string[];
  setZipCodes: React.Dispatch<React.SetStateAction<string[]>>;
};

export const PropertiesContext = createContext<PropertiesContext | null>(null);

export default function PropertiesContextProvider({
  children,
}: PropertiesProps) {
  const [zipcodes, setZipCodes] = React.useState<string[]>([]);

  const { properties } = useProperties(zipcodes);

  const contextValue = useMemo(
    () => ({
      properties,
      zipcodes,
      setZipCodes,
    }),
    [properties, zipcodes, setZipCodes],
  );
  return (
    <PropertiesContext.Provider value={contextValue}>
      {children}
    </PropertiesContext.Provider>
  );
}
