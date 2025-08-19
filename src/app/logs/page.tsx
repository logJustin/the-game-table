'use client'

import { useState, useEffect } from 'react'
import GameLogModal from '@/components/GameLogModal'
import { getGameLogs, deleteGameLog, formatDuration, formatDatePlayed, getAvailableGames } from '@/lib/game-service'
import type { GameLog, AvailableGame } from '@/types/database'

export default function GameLogsPage() {
  const [logs, setLogs] = useState<GameLog[]>([])
  const [availableGames, setAvailableGames] = useState<AvailableGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const [gameLogs, games] = await Promise.all([
        getGameLogs(),
        getAvailableGames()
      ])
      setLogs(gameLogs)
      setAvailableGames(games)
    } catch (err) {
      console.error('Failed to load data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLog = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this game log?')) return

    try {
      await deleteGameLog(logId)
      await loadLogs() // Refresh the list
    } catch (err) {
      console.error('Failed to delete game log:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete game log')
    }
  }

  const handleModalSuccess = () => {
    loadLogs() // Refresh logs after successful submission
  }

  return (
    <div className="min-h-screen p-3 sm:p-4" style={{ 
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
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ 
              fontFamily: 'serif',
              color: '#F5F5DC',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
            }}>
              Game Logs
            </h1>
            <p className="text-base sm:text-lg" style={{ color: '#E6DDD4' }}>
              Track Your Gaming History & Champions
            </p>
            {logs.length > 0 && (
              <p className="text-sm mt-2" style={{ color: '#B8860B' }}>
                {logs.length} games played
              </p>
            )}
          </div>

          {/* Log Game Button */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto px-6 py-4 sm:py-3 rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105 cursor-pointer flex-shrink-0"
            style={{
              background: 'linear-gradient(to bottom, #228B22, #006400)',
              color: '#F5F5DC',
              boxShadow: '0 4px 8px rgba(34, 139, 34, 0.3)'
            }}
          >
            📝 Log New Game
          </button>
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

        {/* Game Logs */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <div style={{ color: '#F5F5DC' }}>Loading game logs...</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎲</div>
            <h2 className="text-2xl font-bold mb-4" style={{ 
              fontFamily: 'serif', 
              color: '#F5F5DC' 
            }}>
              No games logged yet!
            </h2>
            <p className="text-lg mb-6" style={{ color: '#E6DDD4' }}>
              Start logging your game sessions to track winners and build your gaming history.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-4 rounded-lg font-bold transition-all duration-200 hover:scale-105 cursor-pointer"
              style={{
                background: 'linear-gradient(to bottom, #228B22, #006400)',
                color: '#F5F5DC',
                boxShadow: '0 4px 8px rgba(34, 139, 34, 0.3)'
              }}
            >
              📝 Log Your First Game
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl transition-all duration-200 hover:scale-[1.02] overflow-hidden"
                style={{
                  backgroundColor: 'rgba(92, 64, 51, 0.4)',
                  border: '1px solid #5C4033',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                }}
              >
                {/* Card Header */}
                <div className="px-4 py-4 border-b" style={{ 
                  backgroundColor: 'rgba(44, 24, 16, 0.6)',
                  borderColor: '#5C4033'
                }}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold truncate pr-2" style={{ 
                      fontFamily: 'serif',
                      color: '#F5F5DC' 
                    }}>
                      {log.game_name}
                    </h3>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="w-9 h-9 rounded-full transition-all duration-200 hover:scale-110 cursor-pointer flex-shrink-0 flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(to bottom, #8B1538, #6B0F2A)',
                        color: '#F5F5DC',
                        boxShadow: '0 2px 8px rgba(139, 21, 56, 0.4)'
                      }}
                      title="Delete this game log"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Card Body - Mobile-First Vertical Layout */}
                <div className="p-6 space-y-6">
                  {/* Winner Section - Most Prominent */}
                  <div className="text-center">
                    <div 
                      className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl text-xl font-bold shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                        color: '#2C1810',
                        boxShadow: '0 6px 20px rgba(255, 215, 0, 0.4)'
                      }}
                    >
                      <span className="text-2xl">🏆</span>
                      <span>{log.winner} WON!</span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Date Card */}
                    <div 
                      className="p-4 rounded-xl text-center"
                      style={{
                        background: 'rgba(184, 134, 11, 0.15)',
                        border: '1px solid rgba(184, 134, 11, 0.3)',
                      }}
                    >
                      <div className="text-2xl mb-2">📅</div>
                      <div className="text-sm font-medium" style={{ color: '#B8860B' }}>
                        WIN DATE
                      </div>
                      <div className="text-base font-bold" style={{ color: '#F5F5DC' }}>
                        {formatDatePlayed(log.played_at)}
                      </div>
                    </div>

                    {/* Duration Card */}
                    <div 
                      className="p-4 rounded-xl text-center"
                      style={{
                        background: 'rgba(92, 64, 51, 0.3)',
                        border: '1px solid rgba(92, 64, 51, 0.5)',
                      }}
                    >
                      <div className="text-2xl mb-2">⏱️</div>
                      <div className="text-sm font-medium" style={{ color: '#B8860B' }}>
                        DURATION
                      </div>
                      <div className="text-base font-bold" style={{ color: '#F5F5DC' }}>
                        {formatDuration(log.duration_minutes)}
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {log.notes && (
                    <div 
                      className="p-4 rounded-xl"
                      style={{
                        background: 'rgba(245, 245, 220, 0.05)',
                        border: '1px solid rgba(245, 245, 220, 0.1)',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl flex-shrink-0">📝</span>
                        <div>
                          <div className="text-sm font-medium mb-1" style={{ color: '#B8860B' }}>
                            NOTES
                          </div>
                          <div className="text-sm italic leading-relaxed" style={{ color: '#E6DDD4' }}>
                            {log.notes}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 p-4 sm:p-6 rounded-lg text-center" style={{
          backgroundColor: 'rgba(44, 24, 16, 0.5)',
          border: '1px solid #4A3429',
          color: '#E6DDD4'
        }}>
          <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'serif' }}>
            Quick Actions
          </h3>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <a
              href="/spinner"
              className="w-full sm:w-auto px-6 py-3 rounded transition-all duration-200 hover:scale-105 cursor-pointer"
              style={{
                backgroundColor: 'rgba(30, 144, 255, 0.2)',
                color: '#1E90FF',
                textDecoration: 'none',
                border: '1px solid #1E90FF'
              }}
            >
              🎯 Spin for Next Game
            </a>
          </div>
        </div>
      </div>

      {/* Game Log Modal */}
      <GameLogModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
        availableGames={availableGames}
      />
    </div>
  )
}