import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Sparkles } from 'lucide-react'
import { useContext, useState } from 'react'
import { ApiContext } from '@/context/ApiContext'
import { useTranslation } from 'react-i18next'

interface FileResult {
  name: string
  path: string
  size: number
  type: string
}

const Home = () => {
  const { i18n, t: tFS } = useTranslation('translation', {
    keyPrefix: 'FileSearch',
  })
  const locale = i18n.language
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileResult | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const { paths, searchResults, setSearchResults } = useContext(ApiContext)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)

    try {
      const response = await fetch('/api/find-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: searchQuery, paths }),
      })

      const result = await response.json()
      setSearchResults(result)
    } catch (error) {
      console.error('Search failed', error)
      setSearchResults({
        intent: 'search',
        response: tFS('handle_search.error.search_results_response'),
        requiresConfirmation: false,
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleFileSelect = (file: FileResult) => {
    setSelectedFile(file)
    setShowConfirmation(true)
  }

  const handleConfirmOpen = async () => {
    if (!selectedFile) return

    setIsSearching(true)
    try {
      const response = await fetch('/api/find-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'open',
          filePath: selectedFile.path,
        }),
      })

      const result = await response.json()
      setSearchResults({
        intent: 'open',
        response:
          result.response ||
          tFS('handle_confirm_open.success.search_results_response'),
        requiresConfirmation: false,
      })
      setShowConfirmation(false)
      setSelectedFile(null)
    } catch (error) {
      console.error('Failed to open file:', error)
      setSearchResults({
        intent: 'open',
        response: tFS('handle_confirm_open.error.search_results_response'),
        requiresConfirmation: false,
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleOpenFolder = async (file: FileResult) => {
    setIsSearching(true)
    try {
      const response = await fetch('/api/find-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'openFolder',
          filePath: file.path,
        }),
      })

      const result = await response.json()
      setSearchResults({
        intent: 'open',
        response:
          result.response ||
          tFS('handle_open_folder.success.search_results_response'),
        requiresConfirmation: false,
      })
    } catch (error) {
      console.error('Failed to open folder:', error)
      setSearchResults({
        intent: 'open',
        response: tFS('handle_open_folder.error.search_results_response'),
        requiresConfirmation: false,
      })
    } finally {
      setIsSearching(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="container py-12">
      {/* search input*/}
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            AI-Powered
          </div>
          <h1
            className={`${locale === 'ka' ? 'text-2xl md:text-3xl' : 'text-4xl sm:text-5xl'} font-bold tracking-tight"`}
          >
            {tFS('find_tagline')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {tFS('find_subtagline')}
          </p>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={tFS('search_input.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 h-12 text-base"
            />
          </div>
          <Button
            size="lg"
            onClick={handleSearch}
            disabled={isSearching}
            className="px-8"
          >
            {isSearching
              ? tFS('search_input.button.searching')
              : tFS('search_input.button.search')}
          </Button>
        </div>
      </div>

      {/* search results */}
      {searchResults && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-300">
              {searchResults.response}
            </p>
          </div>

          {searchResults.files && searchResults.files.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {tFS('search_results.found_files')}
              </h3>
              <div className="space-y-3">
                {searchResults.files.map((file, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          {file.type === 'folder' ? '📁' : '📄'} {file.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {file.path}
                        </p>
                        <div className="flex gap-4 text-xs text-gray-400 mt-2">
                          <span>
                            Type:{' '}
                            {file.type === 'folder'
                              ? 'FOLDER'
                              : file.type.toUpperCase()}
                          </span>
                          {file.type !== 'folder' && (
                            <span>Size: {formatFileSize(file.size)}</span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex gap-2">
                        {file.type === 'folder' ? (
                          // For folders, just show "Open Folder" button
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenFolder(file)
                            }}
                            disabled={isSearching}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
                          >
                            📁 {tFS('search_results.open_folder')}
                          </button>
                        ) : (
                          // For files, show both options
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenFolder(file)
                              }}
                              disabled={isSearching}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
                            >
                              📁 {tFS('search_results.open_folder')}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleFileSelect(file)
                              }}
                              disabled={isSearching}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
                            >
                              📄 {tFS('search_results.open_file')}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {tFS('confirmation_modal.choose_action')}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              How would you like to open this file?
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-4">
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedFile.path}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirmation(false)
                  setSelectedFile(null)
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                disabled={isSearching}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (selectedFile) {
                    await handleOpenFolder(selectedFile)
                    setShowConfirmation(false)
                    setSelectedFile(null)
                  }
                }}
                disabled={isSearching}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded font-medium transition-colors"
              >
                {isSearching ? 'Opening...' : '📁 Open Folder'}
              </button>
              <button
                onClick={handleConfirmOpen}
                disabled={isSearching}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded font-medium transition-colors"
              >
                {isSearching ? 'Opening...' : '📄 Open with Excel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
