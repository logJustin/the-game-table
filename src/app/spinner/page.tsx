'use client'

import { useState, useEffect } from 'react'
import GameSpinner from '@/components/GameSpinner'
import BoardGameSearch from '@/components/BoardGameSearch'
import { type BoardGame } from '@/lib/boardgamegeek'
import { getAvailableGames, addAvailableGame, removeAvailableGame } from '@/lib/game-service'
import type { AvailableGame } from '@/types/database'

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

  useEffect(() => {
    loadGames()
  }, [])

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

  const handleGameSelected = (game: SpinnerGame) => {
    setSelectedGame(game)
    // Auto-clear selection after 5 seconds
    setTimeout(() => setSelectedGame(null), 5000)
  }

  // Convert AvailableGame to SpinnerGame format
  const spinnerGames: SpinnerGame[] = games.map(game => ({
    id: game.id,
    name: game.game_name,
    image: game.game_image,
    bggId: game.bgg_id
  }))

  return (
    <div className="min-h-screen p-4" style={{ 
      backgroundColor: '#2C1810',
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ 
            fontFamily: 'serif',
            color: '#F5F5DC',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
          }}>
            Game Spinner
          </h1>
          <p className="text-lg" style={{ color: '#E6DDD4' }}>
            Spin the Wheel of Fate to Choose Your Adventure
          </p>
          {games.length > 0 && (
            <p className="text-sm mt-2" style={{ color: '#B8860B' }}>
              {games.length} games available • Anyone can add or remove games
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-lg text-center" style={{
            backgroundColor: 'rgba(220, 53, 69, 0.2)',
            border: '2px solid #DC3545',
            color: '#F8D7DA'
          }}>
            {error}
          </div>
        )}

        {/* Selected Game Display */}
        {selectedGame && (
          <div className="mb-8 p-6 rounded-lg text-center animate-pulse" style={{
            backgroundColor: 'rgba(184, 134, 11, 0.2)',
            border: '2px solid #B8860B',
            color: '#F5F5DC'
          }}>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'serif' }}>
              🎲 Selected Game 🎲
            </h2>
            <p className="text-xl">{selectedGame.name}</p>
            <div className="mt-4">
              <a
                href="/logs"
                className="inline-block px-6 py-2 rounded transition-all duration-200"
                style={{
                  background: 'linear-gradient(to bottom, #228B22, #006400)',
                  color: '#F5F5DC',
                  textDecoration: 'none'
                }}
              >
                📝 Log This Game →
              </a>
            </div>
          </div>
        )}

        {/* Game Spinner */}
        <div className="flex justify-center mb-8">
          {loading ? (
            <div className="flex items-center justify-center w-80 h-80 rounded-full" style={{
              backgroundColor: 'rgba(92, 64, 51, 0.3)',
              border: '2px solid #5C4033'
            }}>
              <div className="text-center" style={{ color: '#F5F5DC' }}>
                <div className="text-2xl mb-2">⏳</div>
                <div>Loading games...</div>
              </div>
            </div>
          ) : games.length === 0 ? (
            <div className="flex items-center justify-center w-80 h-80 rounded-full" style={{
              backgroundColor: 'rgba(92, 64, 51, 0.3)',
              border: '2px solid #5C4033'
            }}>
              <div className="text-center" style={{ color: '#F5F5DC' }}>
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

        {/* Game Management */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Add Game Form */}
          <div className="p-6 rounded-lg" style={{
            backgroundColor: 'rgba(92, 64, 51, 0.3)',
            border: '1px solid #5C4033'
          }}>
            <h3 className="text-xl font-bold mb-4" style={{ 
              fontFamily: 'serif',
              color: '#F5F5DC' 
            }}>
              🎲 Add New Game
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5DC' }}>
                  Search Board Games
                </label>
                <BoardGameSearch
                  onGameSelected={handleBoardGameSelected}
                  playerName="anonymous" // Not used in new system
                  placeholder="Search for board games..."
                />
              </div>
              
              <div className="text-sm" style={{ color: '#E6DDD4' }}>
                💡 Try: &quot;Settlers of Catan&quot;, &quot;Monopoly&quot;, or any game name. 
                Games are shared with everyone who uses the spinner!
              </div>
            </div>
          </div>

          {/* Game List */}
          <div className="p-6 rounded-lg" style={{
            backgroundColor: 'rgba(92, 64, 51, 0.3)',
            border: '1px solid #5C4033'
          }}>
            <h3 className="text-xl font-bold mb-4" style={{ 
              fontFamily: 'serif',
              color: '#F5F5DC' 
            }}>
              Available Games ({games.length})
            </h3>

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
                        <img 
                          src={game.game_image} 
                          alt={game.game_name}
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
                      className="flex-shrink-0 px-3 py-1 rounded text-sm font-bold transition-all duration-200 hover:scale-105"
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
            After playing, <a href="/logs" className="underline" style={{ color: '#B8860B' }}>log your game session</a> to 
            track winners, duration, and players!
          </p>
        </div>
      </div>
    </div>
  )
}