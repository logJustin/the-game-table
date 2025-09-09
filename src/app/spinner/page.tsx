'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import GameSpinner from '@/components/GameSpinner'
import BoardGameSearch from '@/components/BoardGameSearch'
import GameLogModal from '@/components/GameLogModal'
import { type BoardGame } from '@/lib/boardgamegeek'
import { getAvailableGames, addAvailableGame, removeAvailableGame, getCurrentSelection, setCurrentSelection, clearCurrentSelection } from '@/lib/game-service'
import type { AvailableGame } from '@/types/database'
import { colors, getBackgroundColor, getBorderColor, getTextColor, getButtonColors } from '@/styles/colors'

interface SpinnerGame {
  id: string
  name: string
  image?: string
  bggId?: string
}

export default function GameSpinnerPage() {
  const [games, setGames] = useState<AvailableGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<SpinnerGame | null>(null)
  const [showLogModal, setShowLogModal] = useState(false)

  useEffect(() => {
    loadGames()
    loadSelectedGame()
  }, [])

  const loadSelectedGame = async () => {
    try {
      const currentSelection = await getCurrentSelection()
      if (currentSelection && currentSelection.selected_game_id) {
        setSelectedGame({
          id: currentSelection.selected_game_id,
          name: currentSelection.selected_game_name || '',
          image: currentSelection.selected_game_image || undefined,
          bggId: currentSelection.selected_game_bgg_id || undefined
        })
        return
      }
    } catch (error) {
      console.warn('Failed to load selected game from database:', error)
    }
    
    // Fallback to localStorage if database not available
    try {
      const savedGame = localStorage.getItem('gameTableSelectedGame')
      if (savedGame) {
        const game = JSON.parse(savedGame)
        setSelectedGame(game)
      }
    } catch (error) {
      console.warn('Failed to load selected game from localStorage:', error)
    }
  }

  const loadGames = async () => {
    try {
      setLoading(true)
      setError(null)
      const availableGames = await getAvailableGames()
      setGames(availableGames)
    } catch (err) {
      console.error('Failed to load games:', err)
      setError(err instanceof Error ? err.message : 'Failed to load games')
    } finally {
      setLoading(false)
    }
  }

  const handleBoardGameSelected = async (boardGame: BoardGame) => {
    try {
      setError(null)
      await addAvailableGame({
        gameName: boardGame.name,
        gameImage: boardGame.image || boardGame.thumbnail,
        bggId: boardGame.id
      })
      await loadGames() // Refresh the list
    } catch (err) {
      console.error('Failed to add game:', err)
      setError(err instanceof Error ? err.message : 'Failed to add game')
    }
  }

  const handleRemoveGame = async (gameId: string) => {
    try {
      setError(null)
      await removeAvailableGame(gameId)
      await loadGames() // Refresh the list
    } catch (err) {
      console.error('Failed to remove game:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove game')
    }
  }

  const clearSelectedGame = async () => {
    setSelectedGame(null)
    try {
      await clearCurrentSelection()
    } catch (error) {
      console.warn('Failed to clear selected game from database:', error)
      // Fallback to localStorage
      try {
        localStorage.removeItem('gameTableSelectedGame')
      } catch (localError) {
        console.warn('Failed to clear selected game from localStorage:', localError)
      }
    }
  }

  const handleClearAllGames = async () => {
    try {
      setError(null)
      
      // Immediately clear UI for responsive feel
      const gamesToDelete = [...games]
      setGames([])
      
      // Remove all games in the background
      const deletePromises = gamesToDelete.map(game => removeAvailableGame(game.id))
      await Promise.all(deletePromises)
      
      // Clear selected game if there was one
      await clearSelectedGame()
    } catch (err) {
      console.error('Failed to clear all games:', err)
      setError(err instanceof Error ? err.message : 'Failed to clear all games')
      // If deletion failed, reload to get accurate state
      await loadGames()
    }
  }

  const handleGameSelected = async (game: SpinnerGame) => {
    setSelectedGame(game)
    // Persist to database for global access
    try {
      await setCurrentSelection({
        id: game.id,
        name: game.name,
        image: game.image,
        bggId: game.bggId
      })
    } catch (error) {
      console.warn('Failed to save selected game to database:', error)
      // Fallback to localStorage
      try {
        localStorage.setItem('gameTableSelectedGame', JSON.stringify(game))
      } catch (localError) {
        console.warn('Failed to save selected game to localStorage:', localError)
      }
    }
  }

  const startNewGame = async () => {
    // Immediately clear selected game from UI and persistence
    setSelectedGame(null)
    
    // Clear from database/localStorage immediately
    try {
      await clearCurrentSelection()
    } catch (error) {
      console.warn('Failed to clear selected game from database:', error)
    }
    
    try {
      localStorage.removeItem('gameTableSelectedGame')
    } catch (localError) {
      console.warn('Failed to clear selected game from localStorage:', localError)
    }
    
    // Clear all games from spinner
    await handleClearAllGames()
  }

  const handleLogModalSuccess = () => {
    // Clear the selected game after logging (but keep games in spinner)
    setSelectedGame(null)
    try {
      clearCurrentSelection()
    } catch (error) {
      console.warn('Failed to clear selected game:', error)
    }
  }

  // Convert AvailableGame to SpinnerGame format
  const spinnerGames: SpinnerGame[] = games.map(game => ({
    id: game.id,
    name: game.game_name,
    image: game.game_image,
    bggId: game.bgg_id
  }))

  return (
    <div className="min-h-screen p-3 sm:p-4" style={{ 
      backgroundColor: colors.wood.dark,
      backgroundImage: `
        linear-gradient(45deg, rgba(74, 52, 41, 0.1) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(74, 52, 41, 0.1) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(74, 52, 41, 0.1) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(74, 52, 41, 0.1) 75%)
      `,
      backgroundSize: '60px 60px',
      backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px'
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center my-8 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ 
            fontFamily: 'serif',
            color: getTextColor('primary'),
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
          }}>
            Game Spinner
          </h1>
          <p className="text-base sm:text-lg" style={{ color: getTextColor('secondary') }}>
            Spin the Wheel of Fate to Choose Your Adventure
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-lg text-center" style={{
            backgroundColor: colors.error.background,
            border: `2px solid ${colors.error.primary}`,
            color: colors.error.text
          }}>
            {error}
          </div>
        )}

        {/* Selected Game Display */}
        {selectedGame && (
          <div className="mb-8 p-6 rounded-lg text-center relative" style={{
            backgroundColor: `rgba(184, 134, 11, 0.2)`,
            border: `2px solid ${colors.brass.gold}`,
            color: getTextColor('primary')
          }}>
            {/* Close Button */}
            <button
              onClick={() => clearSelectedGame()}
              className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer"
              style={{
                ...getButtonColors('danger'),
                fontSize: '16px'
              }}
              title="Clear selected game"
            >
              ×
            </button>
            
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'serif' }}>
              🎲 Currently Selected 🎲
            </h2>
            <p className="text-xl font-bold mb-1">{selectedGame.name}</p>
            <p className="text-sm opacity-75 mb-4">Ready to play! Come back here after your game to log the results.</p>
            
            <div className="flex flex-col gap-3 justify-center">
              {/* Log Results - Primary Action */}
              <button
                onClick={() => setShowLogModal(true)}
                className="w-full px-6 py-4 rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                style={{
                  ...getButtonColors('success'),
                  boxShadow: '0 4px 8px rgba(34, 139, 34, 0.3)'
                }}
              >
                🏆 Log Results
              </button>
              
              {/* Secondary Action */}
              <button
                onClick={() => startNewGame()}
                className="w-full px-6 py-4 rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                style={{
                  ...getButtonColors('danger'),
                  boxShadow: '0 4px 8px rgba(139, 21, 56, 0.3)'
                }}
              >
                🔄 Start New Game
              </button>
            </div>
          </div>
        )}

        {/* Game Spinner */}
        <div className="flex justify-center mb-12 sm:mb-16">
          <div className="w-full max-w-sm flex flex-col items-center justify-center py-4">
            {loading ? (
              <div className="flex items-center justify-center w-80 h-80 rounded-full" style={{
                backgroundColor: `${getBackgroundColor(true)}33`,
                border: `2px solid ${getBorderColor()}`
              }}>
                <div className="text-center" style={{ color: getTextColor('primary') }}>
                  <div className="text-2xl mb-2">⏳</div>
                  <div>Loading games...</div>
                </div>
              </div>
            ) : games.length === 0 ? (
              <div className="flex items-center justify-center w-80 h-80 rounded-full" style={{
                backgroundColor: `${getBackgroundColor(true)}33`,
                border: `2px solid ${getBorderColor()}`
              }}>
                <div className="text-center" style={{ color: getTextColor('primary') }}>
                  <div className="text-4xl mb-4">🎲</div>
                  <div className="text-lg mb-2">No games yet!</div>
                  <div className="text-sm opacity-75">Add some games below to get started</div>
                </div>
              </div>
            ) : (
              <GameSpinner 
                games={spinnerGames} 
                onGameSelected={handleGameSelected}
              />
            )}
          </div>
        </div>

        {/* Game Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Add Game Form */}
          <div className="p-4 sm:p-6 rounded-lg" style={{
            backgroundColor: getBackgroundColor(true) + '4D',
            border: `1px solid ${getBorderColor()}`
          }}>
            <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ 
              fontFamily: 'serif',
              color: getTextColor('primary') 
            }}>
              🎲 Add New Game
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: getTextColor('primary') }}>
                  Search Board Games
                </label>
                <BoardGameSearch
                  onGameSelected={handleBoardGameSelected}
                  playerName="anonymous" // Not used in new system
                  placeholder="Search for board games..."
                  excludeGames={games.map(game => ({ 
                    id: game.id, 
                    name: game.game_name, 
                    bgg_id: game.bgg_id 
                  }))}
                />
              </div>
              
              <div className="text-sm" style={{ color: '#E6DDD4' }}>
                💡 Try: &quot;Settlers of Catan&quot;, &quot;Monopoly&quot;, or any game name. 
                Games are shared with everyone who uses the spinner!
              </div>
            </div>
          </div>

          {/* Game List */}
          <div className="p-4 sm:p-6 rounded-lg" style={{
            backgroundColor: 'rgba(92, 64, 51, 0.3)',
            border: '1px solid #5C4033'
          }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold" style={{ 
                fontFamily: 'serif',
                color: '#F5F5DC' 
              }}>
                Available Games ({games.length})
              </h3>
              {games.length > 0 && (
                <button
                  onClick={handleClearAllGames}
                  className="px-3 py-1 rounded text-sm font-bold transition-all duration-200 hover:scale-105 cursor-pointer"
                  style={{
                    background: 'linear-gradient(to bottom, #8B1538, #6B0F2A)',
                    color: '#F5F5DC',
                    boxShadow: '0 2px 4px rgba(139, 21, 56, 0.3)'
                  }}
                  title="Remove all games from the spinner"
                >
                  🗑️ Clear All
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {games.length === 0 ? (
                <p style={{ color: '#E6DDD4' }} className="text-center italic py-8">
                  No games available yet.<br />
                  Add some games to get started!
                </p>
              ) : (
                games.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center gap-3 p-3 rounded"
                    style={{
                      backgroundColor: 'rgba(245, 245, 220, 0.1)',
                      border: '1px solid rgba(245, 245, 220, 0.2)'
                    }}
                  >
                    {game.game_image && (
                      <div className="flex-shrink-0">
                        <Image 
                          src={game.game_image} 
                          alt={game.game_name}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded border-2"
                          style={{ borderColor: '#B8860B' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex-grow">
                      <div style={{ color: '#F5F5DC' }} className="font-medium">
                        {game.game_name}
                      </div>
                      <div style={{ color: '#E6DDD4' }} className="text-sm opacity-75">
                        {game.game_image && <span>📸 </span>}
                        Added {new Date(game.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveGame(game.id)}
                      className="flex-shrink-0 px-3 py-1 rounded text-sm font-bold transition-all duration-200 hover:scale-105 cursor-pointer"
                      style={{
                        background: 'linear-gradient(to bottom, #8B1538, #6B0F2A)',
                        color: '#F5F5DC',
                        boxShadow: '0 2px 4px rgba(139, 21, 56, 0.3)'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 rounded-lg text-center" style={{
          backgroundColor: 'rgba(44, 24, 16, 0.5)',
          border: '1px solid #4A3429',
          color: '#E6DDD4'
        }}>
          <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'serif' }}>
            How to Use
          </h3>
          <p className="text-sm">
            Add games that everyone can see and use. Spin the wheel to pick a game randomly.
            After playing, <a href="/logs" className="underline cursor-pointer" style={{ color: '#B8860B' }}>log your game session</a> to 
            track winners, duration, and players!
          </p>
        </div>
      </div>

      {/* Game Log Modal */}
      <GameLogModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        onSuccess={handleLogModalSuccess}
        availableGames={games}
        selectedGameName={selectedGame?.name}
      />
    </div>
  )
}