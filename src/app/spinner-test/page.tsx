'use client'

import { useState } from 'react'
import GameSpinner from '@/components/GameSpinner'
import BoardGameSearch from '@/components/BoardGameSearch'
import { type BoardGame } from '@/lib/boardgamegeek'

interface Game {
  id: string
  name: string
  addedBy: string
  image?: string
  bggId?: string
}

export default function SpinnerTest() {
  const [games, setGames] = useState<Game[]>([])

  const [newPlayerName, setNewPlayerName] = useState('Demo Player')
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  const handleBoardGameSelected = (boardGame: BoardGame & { addedBy: string }) => {
    console.log('Received board game:', boardGame)
    const newGame: Game = {
      id: boardGame.id || Date.now().toString(),
      name: boardGame.name,
      addedBy: boardGame.addedBy,
      image: boardGame.image || boardGame.thumbnail,
      bggId: boardGame.id
    }
    console.log('Created session game:', newGame)
    setGames([...games, newGame])
  }

  const removeGame = (gameId: string) => {
    setGames(games.filter(game => game.id !== gameId))
  }

  const clearGames = () => {
    setGames([])
    setSelectedGame(null)
  }

  const handleGameSelected = (game: Game) => {
    setSelectedGame(game)
    // Auto-clear selection after 5 seconds
    setTimeout(() => setSelectedGame(null), 5000)
  }

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
            The Game Table
          </h1>
          <p className="text-lg" style={{ color: '#E6DDD4' }}>
            Spin the Wheel of Fate to Choose Your Adventure
          </p>
        </div>

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
            <p className="text-sm opacity-75">Added by {selectedGame.addedBy}</p>
          </div>
        )}

        {/* Game Spinner */}
        <div className="flex justify-center mb-8">
          <GameSpinner 
            games={games} 
            onGameSelected={handleGameSelected}
          />
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
              🎲 Search & Add Games
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5DC' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full px-4 py-2 rounded border-2"
                  style={{
                    backgroundColor: '#F5F5DC',
                    borderColor: '#B8860B',
                    color: '#2F1B14'
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5DC' }}>
                  Search Board Games
                </label>
                <BoardGameSearch
                  onGameSelected={handleBoardGameSelected}
                  playerName={newPlayerName.trim() || 'Anonymous'}
                  placeholder="Search for board games with images..."
                />
              </div>
              
              <div className="text-sm" style={{ color: '#E6DDD4' }}>
                💡 Try: &quot;Settlers of Catan&quot;, &quot;Monopoly&quot;, or any game name. If not found locally, we&apos;ll search BoardGameGeek online!
              </div>
            </div>
          </div>

          {/* Game List */}
          <div className="p-6 rounded-lg" style={{
            backgroundColor: 'rgba(92, 64, 51, 0.3)',
            border: '1px solid #5C4033'
          }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ 
                fontFamily: 'serif',
                color: '#F5F5DC' 
              }}>
                Games ({games.length})
              </h3>
              
              {games.length > 0 && (
                <button
                  onClick={clearGames}
                  className="px-4 py-2 rounded text-sm font-bold transition-all duration-200"
                  style={{
                    background: 'linear-gradient(to bottom, #8B1538, #6B0F2A)',
                    color: '#F5F5DC',
                    boxShadow: '0 2px 4px rgba(139, 21, 56, 0.3)'
                  }}
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {games.length === 0 ? (
                <p style={{ color: '#E6DDD4' }} className="text-center italic py-8">
                  No games added yet.<br />
                  Add some games to spin the wheel!
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
                    {game.image && (
                      <div className="flex-shrink-0">
                        <img 
                          src={game.image} 
                          alt={game.name}
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
                        {game.name}
                      </div>
                      <div style={{ color: '#E6DDD4' }} className="text-sm opacity-75">
                        by {game.addedBy}
                        {game.image && <span className="ml-2">📸</span>}
                        {game.id.startsWith('custom-') && <span className="ml-2">✨ Custom</span>}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeGame(game.id)}
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
            How to Play
          </h3>
          <p className="text-sm">
            Search for any board game! Our database includes 30+ popular games with images. 
            If your game isn&apos;t found locally, we&apos;ll automatically search BoardGameGeek&apos;s massive database online.
            Games with images will display as pictures in the wheel segments.
          </p>
        </div>
      </div>
    </div>
  )
}