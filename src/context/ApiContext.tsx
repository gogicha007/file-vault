import { createContext, ReactNode, useState } from "react";
import { useSettingsApi } from "../features/settings/hooks/useSettingsApi";
import { PathItem } from "../features/settings/Settings";

import { UseMutateFunction } from "@tanstack/react-query";

interface FileResult {
  name: string;
  path: string;
  size: number;
  type: string;
}

interface SearchResponse {
  intent: "search" | "open" | "confirm";
  response: string;
  files?: FileResult[];
  requiresConfirmation: boolean;
  suggestedAction?: string;
}

type ApiContextType = {
  paths: PathItem[];
  addPath: UseMutateFunction<unknown, Error, PathItem, unknown>;
  updatePath: UseMutateFunction<unknown, Error, Partial<PathItem>, unknown>;
  deletePath: UseMutateFunction<unknown, Error, string, unknown>;
  isPending: boolean;
  searchResults: SearchResponse | null;
  setSearchResults: (results: SearchResponse | null) => void;
};

export const ApiContext = createContext<ApiContextType>({
  paths: [],
  addPath: () => {},
  updatePath: () => {},
  deletePath: () => {},
  isPending: false,
  searchResults: null,
  setSearchResults: () => {},
});

export const ApiContextProvider = ({ children }: { children: ReactNode }) => {
  const { pathsData, addPath, updatePath, deletePath, isPending } = useSettingsApi();
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);

  return (
    <ApiContext.Provider
      value={{ 
        paths: pathsData || [], 
        addPath, 
        updatePath, 
        deletePath, 
        isPending,
        searchResults,
        setSearchResults,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};