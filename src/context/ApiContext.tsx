import { createContext, useState } from 'react'
import { useSettingsApi } from '../features/settings/hooks/useSettingsApi'
import type { UseMutateFunction } from '@tanstack/react-query'
import type { PathItem } from '../features/settings/Settings'
import type { ReactNode} from 'react';


interface FileResult {
  name: string
  path: string
  size: number
  type: string
}

interface SearchResponse {
  intent: 'search' | 'open' | 'confirm'
  response: string
  files?: Array<FileResult>
  requiresConfirmation: boolean
  suggestedAction?: string
}

type ApiContextType = {
  paths: Array<PathItem>
  addPath: UseMutateFunction<unknown, Error, PathItem, unknown>
  addPathError: Error | null
  updatePath: UseMutateFunction<unknown, Error, Partial<PathItem>, unknown>
  deletePath: UseMutateFunction<unknown, Error, string, unknown>
  isPending: boolean
  isError: boolean
  searchResults: SearchResponse | null
  setSearchResults: (results: SearchResponse | null) => void
}

export const ApiContext = createContext<ApiContextType>({
  paths: [],
  addPath: () => {},
  addPathError: null,
  updatePath: () => {},
  deletePath: () => {},
  isPending: false,
  isError: false,
  searchResults: null,
  setSearchResults: () => {},
})

export const ApiContextProvider = ({ children }: { children: ReactNode }) => {
  const {
    pathsData,
    addPath,
    addPathError,
    updatePath,
    deletePath,
    isPending,
    isError,
  } = useSettingsApi()
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null,
  )

  const paths = pathsData?.map((item) => ({
    ...item,
    name: item.name ?? '',
    description: item.description ?? '',
  })) || []

  return (
    <ApiContext.Provider
      value={{
        paths,
        addPath,
        addPathError,
        updatePath,
        deletePath,
        isPending,
        isError,
        searchResults,
        setSearchResults,
      }}
    >
      {children}
    </ApiContext.Provider>
  )
}
