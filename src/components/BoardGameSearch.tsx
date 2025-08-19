'use client'

import { useState, useEffect, useRef } from 'react'
import { searchBoardGames, searchBoardGamesExternal, createBoardGameFromSearch, getPopularGames, loadSearchResultImages, loadPopularGameImages, createCustomGame, type BGGSearchResult, type BoardGame } from '@/lib/boardgamegeek'

interface BoardGameSearchProps {
  onGameSelected: (game: BoardGame & { addedBy: string }) => void
  playerName: string
  placeholder?: string
  excludeGames?: { id?: string, name: string, bgg_id?: string }[] // Games to filter out
}

export default function BoardGameSearch({ onGameSelected, playerName, placeholder = "Search for a board game...", excludeGames = [] }: BoardGameSearchProps) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<BGGSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchingExternal, setIsSearchingExternal] = useState(false)
  const [hasTriedExternal, setHasTriedExternal] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [popularGames, setPopularGames] = useState<BoardGame[]>([])
  const [popularGamesLoading, setPopularGamesLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Helper function to check if a game is already added
  const isGameAlreadyAdded = (gameId: string, gameName: string, bggId?: string): boolean => {
    return excludeGames.some(excludedGame => {
      // Match by BGG ID first (most reliable)
      if (bggId && excludedGame.bgg_id && bggId === excludedGame.bgg_id) {
        return true
      }
      // Match by internal ID
      if (excludedGame.id && excludedGame.id === gameId) {
        return true
      }
      // Match by name (case-insensitive)
      return excludedGame.name.toLowerCase() === gameName.toLowerCase()
    })
  }

  // Load popular games on mount and filter out already added ones
  useEffect(() => {
    async function loadPopularGames() {
      const allPopularGames = getPopularGames(12) // Get more to account for filtering
      const filteredPopularGames = allPopularGames.filter(game => 
        !isGameAlreadyAdded(game.id, game.name, game.id)
      ).slice(0, 8) // Take first 8 after filtering
      
      setPopularGames(filteredPopularGames)
      setPopularGamesLoading(true)
      
      // Load images for popular games in the background
      try {
        await loadPopularGameImages(
          filteredPopularGames,
          (updatedGames) => {
            // Progressive update callback - maintains order
            setPopularGames(updatedGames)
          }
        )
      } catch (error) {
        console.warn('Failed to load popular game images:', error)
        // Keep the games without images if image loading fails
      } finally {
        setPopularGamesLoading(false)
      }
    }
    
    loadPopularGames()
  }, [excludeGames]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle search with debouncing and external fallback
  useEffect(() => {
    // Cancel any ongoing search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    if (!query.trim()) {
      setSearchResults([])
      setSearchError(null)
      setIsSearching(false)
      setIsSearchingExternal(false)
      setHasTriedExternal(false)
      return
    }

    const searchTimeout = setTimeout(async () => {
      // Create new AbortController for this search
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      setIsSearching(true)
      setSearchError(null)
      setHasTriedExternal(false)
      
      try {
        // First: Try local search
        const localResults = await searchBoardGames(query, false)
        
        // Check if search was cancelled
        if (abortController.signal.aborted) return
        
        if (localResults.length > 0) {
          // Filter out already added games
          const filteredLocalResults = localResults.filter(result => 
            !isGameAlreadyAdded(result.id, result.name, result.id)
          )
          setSearchResults(filteredLocalResults)
          setIsSearching(false)
          return
        }
        
        // If no local results, try external API
        setIsSearchingExternal(true)
        setSearchResults([]) // Clear previous results during external search
        const externalResults = await searchBoardGamesExternal(query)
        
        // Check if search was cancelled
        if (abortController.signal.aborted) return
        
        // Filter out already added games from external results
        const filteredExternalResults = externalResults.filter(result => 
          !isGameAlreadyAdded(result.id, result.name, result.id)
        )
        
        setSearchResults(filteredExternalResults)
        setIsSearchingExternal(false)
        setHasTriedExternal(true)
        
        if (filteredExternalResults.length === 0) {
          if (externalResults.length > 0) {
            setSearchError(`All matching games for "${query}" are already in your spinner. Try a different search term.`)
          } else {
            setSearchError(`No games found for "${query}". Try a different search term.`)
          }
        } else {
          // Load images progressively for external results (don't block UI)
          loadSearchResultImages(filteredExternalResults).then(resultsWithImages => {
            // Only update if this search wasn't cancelled and results still exist
            if (!abortController.signal.aborted && setSearchResults) {
              setSearchResults(prev => prev.length > 0 ? resultsWithImages : prev)
            }
          }).catch(error => {
            if (!abortController.signal.aborted) {
              console.warn('Failed to load images for search results:', error)
            }
          })
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Search error:', error)
          setSearchResults([])
          setSearchError('Search failed. Please try again.')
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsSearching(false)
          setIsSearchingExternal(false)
        }
      }
    }, 600)

    return () => {
      clearTimeout(searchTimeout)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [query]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle clicking outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleGameSelect = async (searchResult: BGGSearchResult) => {
    try {
      console.log('Selecting game with search result:', searchResult)
      const boardGame = await createBoardGameFromSearch(searchResult)
      console.log('Created board game:', boardGame)
      onGameSelected({
        ...boardGame,
        addedBy: playerName
      } as BoardGame & { addedBy: string })
      setQuery('')
      setShowResults(false)
      setSearchResults([])
    } catch (error) {
      console.error('Error selecting game:', error)
    }
  }

  const handlePopularGameSelect = (game: BoardGame) => {
    onGameSelected({
      ...game,
      addedBy: playerName
    } as BoardGame & { addedBy: string })
    setQuery('')
    setShowResults(false)
  }

  const handleCreateCustomGame = () => {
    try {
      const customGame = createCustomGame(query)
      onGameSelected({
        ...customGame,
        addedBy: playerName
      } as BoardGame & { addedBy: string })
      setQuery('')
      setShowResults(false)
      setSearchResults([])
      setSearchError(null)
      setHasTriedExternal(false)
    } catch (error) {
      console.error('Error creating custom game:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setShowResults(true)
  }

  const handleInputFocus = () => {
    setShowResults(true)
  }

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        className="w-full px-4 py-4 rounded-lg border-2 text-base sm:text-lg"
        style={{
          backgroundColor: '#F5F5DC',
          borderColor: '#B8860B',
          color: '#2F1B14',
          fontFamily: 'serif'
        }}
      />

      {/* Loading indicator */}
      {isSearching && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-b-transparent" style={{ borderColor: '#B8860B' }}></div>
        </div>
      )}

      {/* Search Results Dropdown */}
      {showResults && (query.trim() || !query) && (
        <div 
          className="absolute z-50 w-full mt-2 rounded-lg border-2 overflow-y-auto shadow-xl"
          style={{
            backgroundColor: '#F5F5DC',
            borderColor: '#B8860B',
            maxHeight: '240px'
          }}
        >
          {/* Loading state for external search */}
          {query.trim() && isSearchingExternal && (
            <div className="px-4 py-6 text-center" style={{ color: '#2F1B14' }}>
              <div className="flex items-center justify-center mb-2">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-b-transparent mr-3" style={{ borderColor: '#B8860B' }}></div>
                <span className="text-lg">🌐</span>
              </div>
              <div className="font-medium">Searching online database...</div>
              <div className="text-sm opacity-75 mt-1">Looking for &quot;{query}&quot; in BoardGameGeek</div>
            </div>
          )}

          {/* Search Results */}
          {query.trim() && searchResults.length > 0 && !isSearchingExternal && (
            <div>
              <div className="px-4 py-2 text-sm font-bold border-b" style={{ 
                color: '#2F1B14', 
                borderColor: '#B8860B',
                backgroundColor: 'rgba(184, 134, 11, 0.1)'
              }}>
                Search Results
              </div>
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleGameSelect(result)}
                  className="w-full text-left px-4 py-3 hover:bg-opacity-20 transition-colors border-b last:border-b-0 flex items-center gap-3 cursor-pointer"
                  style={{ 
                    color: '#2F1B14',
                    borderColor: 'rgba(184, 134, 11, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(184, 134, 11, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <div className="w-12 h-12 flex-shrink-0 rounded border" style={{ borderColor: '#B8860B' }}>
                    {result.thumbnail ? (
                      <img 
                        src={result.thumbnail} 
                        alt={result.name}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div 
                        className="w-full h-full rounded flex items-center justify-center text-lg"
                        style={{ 
                          backgroundColor: 'rgba(184, 134, 11, 0.15)',
                          color: 'rgba(184, 134, 11, 0.8)'
                        }}
                      >
                        🎲
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{result.name}</div>
                    {result.yearPublished && (
                      <div className="text-sm opacity-75">({result.yearPublished})</div>
                    )}
                    {result.thumbnail && (
                      <div className="text-xs opacity-60 mt-1">📸 BGG Image</div>
                    )}
                  </div>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ 
                    backgroundColor: '#B8860B',
                    color: '#2F1B14'
                  }}>
                    <span className="text-lg font-bold">+</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Error Message */}
          {query.trim() && !isSearching && !isSearchingExternal && hasTriedExternal && searchError && (
            <div className="px-4 py-6 text-center" style={{ color: '#2F1B14' }}>
              <div className="text-lg mb-2">❌</div>
              <div className="font-medium">{searchError}</div>
              <div className="text-sm opacity-75 mt-1">Try checking your spelling or try a different search term</div>
            </div>
          )}

          {/* No Results Message with Custom Game Option */}
          {query.trim() && !isSearching && !isSearchingExternal && hasTriedExternal && !searchError && searchResults.length === 0 && (
            <div className="px-4 py-6 text-center" style={{ color: '#2F1B14' }}>
              <div className="text-lg mb-2">🎲</div>
              <div className="font-medium mb-3">No games found for &quot;{query}&quot;</div>
              <div className="text-sm opacity-75 mb-4">Try a different search term, or create a custom game:</div>
              
              <button
                onClick={handleCreateCustomGame}
                className="px-4 py-2 rounded font-bold transition-all duration-200 transform hover:scale-105 cursor-pointer"
                style={{
                  background: 'linear-gradient(to bottom, #228B22, #006400)',
                  color: '#F5F5DC',
                  boxShadow: '0 2px 4px rgba(34, 139, 34, 0.3)',
                  fontFamily: 'serif'
                }}
              >
                ✨ Create &quot;{query}&quot; as Custom Game
              </button>
              
              <div className="text-xs opacity-60 mt-2" style={{ color: '#2F1B14' }}>
                This will add it to your game library and current session
              </div>
            </div>
          )}

          {/* Popular Games Section */}
          {!query.trim() && popularGames.length > 0 && (
            <div>
              <div className="px-4 py-2 text-sm font-bold border-b" style={{ 
                color: '#2F1B14', 
                borderColor: '#B8860B',
                backgroundColor: 'rgba(184, 134, 11, 0.1)'
              }}>
                Popular Games - Click to Add
                {popularGamesLoading && (
                  <span className="font-normal opacity-75 ml-2">(loading images...)</span>
                )}
                {!popularGamesLoading && excludeGames.length > 0 && (
                  <span className="font-normal opacity-75 ml-2">(filtered)</span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-1">
                {popularGames.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => handlePopularGameSelect(game)}
                    className="w-full text-left px-4 py-3 hover:bg-opacity-20 transition-colors border-b last:border-b-0 flex items-center gap-3 cursor-pointer"
                    style={{ 
                      color: '#2F1B14',
                      borderColor: 'rgba(184, 134, 11, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(184, 134, 11, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <div className="w-12 h-12 flex-shrink-0 rounded border" style={{ borderColor: '#B8860B' }}>
                      {game.image ? (
                        <img 
                          src={game.image} 
                          alt={game.name}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div 
                          className="w-full h-full rounded flex items-center justify-center text-lg"
                          style={{ 
                            backgroundColor: 'rgba(184, 134, 11, 0.15)',
                            color: 'rgba(184, 134, 11, 0.8)'
                          }}
                        >
                          🎲
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{game.name}</div>
                      {game.yearPublished && (
                        <div className="text-sm opacity-75">({game.yearPublished})</div>
                      )}
                      {game.minPlayers && game.maxPlayers && (
                        <div className="text-sm opacity-75">
                          {game.minPlayers === game.maxPlayers ? 
                            `${game.minPlayers} player${game.minPlayers > 1 ? 's' : ''}` :
                            `${game.minPlayers}-${game.maxPlayers} players`
                          }
                          {game.playingTime && ` • ${game.playingTime} min`}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ 
                      backgroundColor: '#B8860B',
                      color: '#2F1B14'
                    }}>
                      <span className="text-lg font-bold">+</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state when no popular games */}
          {!query.trim() && popularGames.length === 0 && !isSearching && (
            <div className="px-4 py-6 text-center" style={{ color: '#2F1B14' }}>
              <div className="text-lg mb-2">🎯</div>
              <div>Start typing to search for board games</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}