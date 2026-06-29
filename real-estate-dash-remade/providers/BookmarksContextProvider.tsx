"use client";

import React, { useState } from "react";
import { usePropertiesContext } from "../lib/hooks";
import { Listing } from "@/lib/types";

type BookmarksContextProviderProps = {
  children: React.ReactNode;
};

type BookmarksContext = {
  bookmarkedIds: number[];
  handleToggleBookmark: (id: number) => void;
  bookmarkedProperties: Listing[];
};

export const BookmarksContext = React.createContext<BookmarksContext | null>(
  null,
);

export default function BookmarksContextProvider({
  children,
}: BookmarksContextProviderProps) {
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);

  const { properties } = usePropertiesContext();
  const [bookmarkedProperties, setBookmarkedProperties] = useState<Listing[]>(
    [],
  );

  React.useEffect(() => {
    if (properties && Array.isArray(properties)) {
      // Add new bookmarked properties
      const newBookmarked = properties.filter(
        (property: Listing) =>
          bookmarkedIds.includes(property.id) &&
          !bookmarkedProperties.some((p) => p.id === property.id),
      );
      // Remove unbookmarked properties
      const filteredBookmarkedProperties = bookmarkedProperties.filter((p) =>
        bookmarkedIds.includes(p.id),
      );

      if (
        newBookmarked.length > 0 ||
        filteredBookmarkedProperties.length !== bookmarkedProperties.length
      ) {
        setBookmarkedProperties([
          ...filteredBookmarkedProperties,
          ...newBookmarked,
        ]);
      }
    }
  }, [bookmarkedIds, properties, bookmarkedProperties]);

  const handleToggleBookmark = (id: number) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds((prev: number[]) =>
        prev.filter((bookmarkId) => bookmarkId !== id),
      );
    } else {
      setBookmarkedIds((prev: number[]) => [...prev, id]);
    }
  };

  return (
    <BookmarksContext.Provider
      value={{
        bookmarkedIds,
        handleToggleBookmark,
        bookmarkedProperties,
      }}
    >
      {children}
    </BookmarksContext.Provider>
  );
}
