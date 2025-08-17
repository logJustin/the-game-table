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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ 
              fontFamily: 'serif',
              color: '#F5F5DC',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
            }}>
              Game Logs
            </h1>
            <p className="text-lg" style={{ color: '#E6DDD4' }}>
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
            className="px-6 py-3 rounded-lg font-bold transition-all duration-200 hover:scale-105 cursor-pointer"
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
                className="p-6 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                style={{
                  backgroundColor: 'rgba(92, 64, 51, 0.3)',
                  border: '1px solid #5C4033',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}
              >
                {/* Winner Prominence */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold" style={{ 
                        fontFamily: 'serif',
                        color: '#F5F5DC' 
                      }}>
                        {log.game_name}
                      </h3>
                      <div 
                        className="px-3 py-1 rounded-full text-sm font-bold"
                        style={{
                          background: 'linear-gradient(to right, #FFD700, #FFA500)',
                          color: '#2C1810'
                        }}
                      >
                        🏆 {log.winner} WON!
                      </div>
                    </div>
                    
                    {/* Game Details */}
                    <div className="space-y-1 text-sm" style={{ color: '#E6DDD4' }}>
                      <div className="flex items-center gap-2">
                        <span>⏱️</span>
                        <span>{formatDuration(log.duration_minutes)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{formatDatePlayed(log.played_at)}</span>
                      </div>
                      {log.notes && (
                        <div className="flex items-start gap-2 mt-2">
                          <span>📝</span>
                          <span className="italic">{log.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="ml-4 px-3 py-1 rounded text-sm font-bold transition-all duration-200 hover:scale-105 cursor-pointer"
                    style={{
                      background: 'linear-gradient(to bottom, #8B1538, #6B0F2A)',
                      color: '#F5F5DC',
                      boxShadow: '0 2px 4px rgba(139, 21, 56, 0.3)'
                    }}
                    title="Delete this game log"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 p-6 rounded-lg text-center" style={{
          backgroundColor: 'rgba(44, 24, 16, 0.5)',
          border: '1px solid #4A3429',
          color: '#E6DDD4'
        }}>
          <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'serif' }}>
            Quick Actions
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/spinner"
              className="px-6 py-2 rounded transition-all duration-200 hover:scale-105 cursor-pointer"
              style={{
                backgroundColor: 'rgba(30, 144, 255, 0.2)',
                color: '#1E90FF',
                textDecoration: 'none',
                border: '1px solid #1E90FF'
              }}
            >
              🎯 Spin for Next Game
            </a>
            <a
              href="/search-test"
              className="px-6 py-2 rounded transition-all duration-200 hover:scale-105 cursor-pointer"
              style={{
                backgroundColor: 'rgba(34, 139, 34, 0.2)',
                color: '#228B22',
                textDecoration: 'none',
                border: '1px solid #228B22'
              }}
            >
              🔍 Browse Game Library
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