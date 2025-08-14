'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/contexts/SessionContext'
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

export default function SessionPage() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [sessionCodeInput, setSessionCodeInput] = useState('')
  const [playerNameInput, setPlayerNameInput] = useState('')

  const {
    session,
    games,
    participants,
    playerName,
    isHost,
    loading,
    error,
    createSession,
    joinSession,
    endSession,
    addGame,
    removeGame,
    clearGames,
    resetSession
  } = useSession()

  // Load saved player name on mount
  useEffect(() => {
    const saved = localStorage.getItem('gameTablePlayerName')
    if (saved) {
      setPlayerNameInput(saved)
    }
  }, [])

  const handleCreateSession = async () => {
    if (!playerNameInput.trim()) return
    await createSession(playerNameInput.trim())
  }

  const handleJoinSession = async () => {
    if (!sessionCodeInput.trim() || !playerNameInput.trim()) return
    await joinSession(sessionCodeInput.trim().toUpperCase(), playerNameInput.trim())
  }

  const handleBoardGameSelected = async (boardGame: BoardGame & { addedBy: string }) => {
    await addGame(
      boardGame.name,
      boardGame.image || boardGame.thumbnail,
      boardGame.id
    )
  }

  const handleGameSelected = (game: Game) => {
    setSelectedGame(game)
    setTimeout(() => setSelectedGame(null), 5000)
  }

  const convertGamesToSpinnerFormat = (): Game[] => {
    return games.map(game => ({
      id: game.id,
      name: game.game_name,
      addedBy: game.added_by,
      image: game.game_image,
      bggId: game.bgg_id || undefined
    }))
  }

  // If no session, show join/create form
  if (!session) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" style={{ 
        backgroundColor: '#2C1810',
        backgroundImage: `
          linear-gradient(45deg, rgba(74, 52, 41, 0.1) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(74, 52, 41, 0.1) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, rgba(74, 52, 41, 0.1) 75%),
          linear-gradient(-45deg, transparent 75%, rgba(74, 52, 41, 0.1) 75%)
        `,
        backgroundSize: '60px 60px'
      }}>
        <div className="max-w-md w-full space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2" style={{ 
              fontFamily: 'serif',
              color: '#F5F5DC',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
            }}>
              The Game Table
            </h1>
            <p className="text-lg" style={{ color: '#E6DDD4' }}>
              Create or join a game session
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 rounded-lg text-center" style={{
              backgroundColor: 'rgba(220, 53, 69, 0.2)',
              border: '2px solid #DC3545',
              color: '#F8D7DA'
            }}>
              {error}
            </div>
          )}

          {/* Player Name Input */}
          <div className="p-6 rounded-lg space-y-4" style={{
            backgroundColor: 'rgba(92, 64, 51, 0.3)',
            border: '1px solid #5C4033'
          }}>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5DC' }}>
                Your Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={playerNameInput}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                className="w-full px-4 py-2 rounded border-2"
                style={{
                  backgroundColor: '#F5F5DC',
                  borderColor: '#B8860B',
                  color: '#2F1B14'
                }}
              />
            </div>

            {/* Create Session Button */}
            <button
              onClick={handleCreateSession}
              disabled={loading || !playerNameInput.trim()}
              className="w-full px-6 py-3 rounded font-bold transition-all duration-200 disabled:opacity-50"
              style={{
                background: 'linear-gradient(to bottom, #228B22, #006400)',
                color: '#F5F5DC',
                boxShadow: '0 2px 4px rgba(34, 139, 34, 0.3)'
              }}
            >
              {loading ? 'Creating...' : 'Create New Session'}
            </button>

            {/* Join Session Toggle */}
            <div className="text-center">
              <button
                onClick={() => setShowJoinForm(!showJoinForm)}
                className="text-sm underline transition-colors duration-200"
                style={{ color: '#B8860B' }}
              >
                {showJoinForm ? 'Hide join form' : 'Join existing session'}
              </button>
            </div>

            {/* Join Session Form */}
            {showJoinForm && (
              <div className="space-y-4 pt-4 border-t" style={{ borderColor: '#5C4033' }}>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5DC' }}>
                    Session Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={sessionCodeInput}
                    onChange={(e) => setSessionCodeInput(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="w-full px-4 py-2 rounded border-2 text-center font-mono"
                    style={{
                      backgroundColor: '#F5F5DC',
                      borderColor: '#B8860B',
                      color: '#2F1B14'
                    }}
                  />
                </div>
                <button
                  onClick={handleJoinSession}
                  disabled={loading || !sessionCodeInput.trim() || !playerNameInput.trim()}
                  className="w-full px-6 py-3 rounded font-bold transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(to bottom, #1E90FF, #0066CC)',
                    color: '#F5F5DC',
                    boxShadow: '0 2px 4px rgba(30, 144, 255, 0.3)'
                  }}
                >
                  {loading ? 'Joining...' : 'Join Session'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Main session interface
  const spinnerGames = convertGamesToSpinnerFormat()

  return (
    <div className="min-h-screen p-4" style={{ 
      backgroundColor: '#2C1810',
      backgroundImage: `
        linear-gradient(45deg, rgba(74, 52, 41, 0.1) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(74, 52, 41, 0.1) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(74, 52, 41, 0.1) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(74, 52, 41, 0.1) 75%)
      `,
      backgroundSize: '60px 60px'
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2" style={{ 
            fontFamily: 'serif',
            color: '#F5F5DC',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
          }}>
            The Game Table
          </h1>
          <div className="flex items-center justify-center gap-4 text-lg" style={{ color: '#E6DDD4' }}>
            <span>Session: {session.session_code}</span>
            <span>•</span>
            <span>{participants.length} player{participants.length !== 1 ? 's' : ''}</span>
            {isHost && (
              <>
                <span>•</span>
                <button
                  onClick={endSession}
                  className="text-sm px-3 py-1 rounded transition-colors duration-200"
                  style={{
                    backgroundColor: 'rgba(220, 53, 69, 0.2)',
                    color: '#DC3545'
                  }}
                >
                  End Session
                </button>
              </>
            )}
            <button
              onClick={resetSession}
              className="text-sm px-3 py-1 rounded transition-colors duration-200"
              style={{
                backgroundColor: 'rgba(108, 117, 125, 0.2)',
                color: '#6C757D'
              }}
            >
              Leave
            </button>
          </div>
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
            games={spinnerGames} 
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
                  Search Board Games
                </label>
                <BoardGameSearch
                  onGameSelected={handleBoardGameSelected}
                  playerName={playerName}
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
                        by {game.added_by}
                        {game.game_image && <span className="ml-2">📸</span>}
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

        {/* Participants */}
        <div className="mt-6 p-4 rounded-lg" style={{
          backgroundColor: 'rgba(44, 24, 16, 0.5)',
          border: '1px solid #4A3429'
        }}>
          <h3 className="text-lg font-bold mb-2" style={{ 
            fontFamily: 'serif', 
            color: '#F5F5DC' 
          }}>
            Players ({participants.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {participants.map((participant) => (
              <span
                key={participant.id}
                className="px-3 py-1 rounded text-sm"
                style={{
                  backgroundColor: participant.participant_name === session.host_name 
                    ? 'rgba(255, 215, 0, 0.2)' 
                    : 'rgba(245, 245, 220, 0.2)',
                  color: '#F5F5DC',
                  border: participant.participant_name === session.host_name 
                    ? '1px solid #FFD700' 
                    : '1px solid rgba(245, 245, 220, 0.3)'
                }}
              >
                {participant.participant_name}
                {participant.participant_name === session.host_name && ' 👑'}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}