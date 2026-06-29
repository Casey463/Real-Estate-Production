import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/lib/utils";
import BookmarksContextProvider from "./BookmarksContextProvider";
import PropertiesContextProvider from "./PropertiesContextProvider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <PropertiesContextProvider>
        <BookmarksContextProvider>{children}</BookmarksContextProvider>
      </PropertiesContextProvider>
    </QueryClientProvider>
  );
}
