'use client'

import { useState, useEffect } from 'react'
import { logGame } from '@/lib/game-service'
import { getBackgroundColor, getBorderColor } from '@/styles/colors'

interface AvailableGame {
  id: string
  game_name: string
  game_image?: string
  bgg_id?: string
  created_at: string
}

interface GameLogModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  availableGames?: AvailableGame[]
  selectedGameName?: string
}

export default function GameLogModal({ isOpen, onClose, onSuccess, availableGames = [], selectedGameName = '' }: GameLogModalProps) {
  const [gameName, setGameName] = useState('')
  const [winner, setWinner] = useState('')
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCustomMode, setIsCustomMode] = useState(false)

  const resetForm = () => {
    setGameName(selectedGameName)
    setWinner('')
    setDuration('')
    setNotes('')
    setError(null)
    setIsCustomMode(false)
  }

  // Update game name when selectedGameName changes
  useEffect(() => {
    if (selectedGameName) {
      setGameName(selectedGameName)
    }
  }, [selectedGameName])

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!winner.trim()) {
        throw new Error('Please select a winner')
      }

      if (!gameName.trim()) {
        throw new Error('Please enter the game name')
      }

      // Parse duration to number
      const durationMinutes = duration ? parseInt(duration) : undefined
      if (duration && (isNaN(durationMinutes!) || durationMinutes! <= 0)) {
        throw new Error('Duration must be a positive number')
      }

      await logGame({
        gameName: gameName.trim(),
        winner: winner.trim(),
        players: [winner.trim()],
        durationMinutes,
        notes: notes.trim() || undefined
      })

      resetForm()
      onSuccess()
      onClose()
      
      // Navigate to logs page after successful submission
      window.location.href = '/logs'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log game')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div 
        className="w-full max-w-md rounded-lg shadow-xl"
        style={{
          backgroundColor: getBackgroundColor(),
          border: `2px solid ${getBorderColor()}`,
          maxHeight: '95vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b" style={{ borderColor: '#5C4033' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold" style={{ 
              fontFamily: 'serif',
              color: '#F5F5DC' 
            }}>
              🏆 Log Game Results
            </h2>
            <button
              onClick={handleClose}
              className="text-2xl transition-colors duration-200 cursor-pointer"
              style={{ color: '#E6DDD4' }}
            >
              ×
            </button>
          </div>
          <p className="text-sm mt-1" style={{ color: '#E6DDD4' }}>
            Who won and how long did it take?
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Error Display */}
          {error && (
            <div className="p-3 rounded text-sm" style={{
              backgroundColor: 'rgba(220, 53, 69, 0.2)',
              border: '1px solid #DC3545',
              color: '#F8D7DA'
            }}>
              {error}
            </div>
          )}

          {/* Game Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5DC' }}>
              Game Name *
            </label>
            {availableGames.length > 0 ? (
              <select
                value={isCustomMode ? "__custom__" : gameName}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setIsCustomMode(true)
                    setGameName('')
                  } else {
                    setIsCustomMode(false)
                    setGameName(e.target.value)
                  }
                }}
                required
                className="w-full p-3 rounded border cursor-pointer"
                style={{
                  backgroundColor: 'rgba(245, 245, 220, 0.1)',
                  border: '1px solid #5C4033',
                  color: '#F5F5DC'
                }}
              >
                <option value="" style={{ backgroundColor: '#2C1810', color: '#F5F5DC' }} className="cursor-pointer">
                  Select a game from the spinner...
                </option>
                {availableGames.map((game) => (
                  <option 
                    key={game.id} 
                    value={game.game_name}
                    style={{ backgroundColor: '#2C1810', color: '#F5F5DC' }}
                    className="cursor-pointer"
                  >
                    {game.game_name}
                  </option>
                ))}
                <option value="__custom__" style={{ backgroundColor: '#2C1810', color: '#B8860B' }} className="cursor-pointer">
                  ✏️ Enter custom game name...
                </option>
              </select>
            ) : (
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="e.g., Settlers of Catan"
                required
                className="w-full p-3 rounded border"
                style={{
                  backgroundColor: 'rgba(245, 245, 220, 0.1)',
                  border: '1px solid #5C4033',
                  color: '#F5F5DC'
                }}
              />
            )}
            
            {/* Custom game name input (shown when "custom" is selected) */}
            {isCustomMode && (
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="Enter custom game name..."
                required
                className="w-full p-3 rounded border mt-2"
                style={{
                  backgroundColor: 'rgba(245, 245, 220, 0.1)',
                  border: '1px solid #5C4033',
                  color: '#F5F5DC'
                }}
                autoFocus
              />
            )}
          </div>

          {/* Winner */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: '#F5F5DC' }}>
              Who won? *
            </label>
            <div className="space-y-2">
              {['Holly', 'Tori', 'Nash', 'Justin'].map((player) => (
                <label
                  key={player}
                  className="flex items-center gap-3 p-4 rounded border cursor-pointer transition-colors duration-200"
                  style={{
                    backgroundColor: winner === player ? 'rgba(184, 134, 11, 0.2)' : 'rgba(245, 245, 220, 0.1)',
                    border: winner === player ? '2px solid #B8860B' : '1px solid #5C4033',
                    color: '#F5F5DC'
                  }}
                >
                  <input
                    type="radio"
                    name="winner"
                    value={player}
                    checked={winner === player}
                    onChange={(e) => setWinner(e.target.value)}
                    className="sr-only"
                  />
                  <div 
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: winner === player ? '#B8860B' : '#5C4033',
                      backgroundColor: winner === player ? '#B8860B' : 'transparent'
                    }}
                  >
                    {winner === player && (
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: '#2C1810' }}
                      />
                    )}
                  </div>
                  <span className="font-medium text-lg">{player}</span>
                  {winner === player && <span className="ml-auto text-lg">🏆</span>}
                </label>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5DC' }}>
              How long did it take? (minutes, optional)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 90"
              min="1"
              className="w-full p-3 rounded border"
              style={{
                backgroundColor: 'rgba(245, 245, 220, 0.1)',
                border: '1px solid #5C4033',
                color: '#F5F5DC'
              }}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5DC' }}>
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about the game..."
              rows={3}
              className="w-full p-3 rounded border resize-none"
              style={{
                backgroundColor: 'rgba(245, 245, 220, 0.1)',
                border: '1px solid #5C4033',
                color: '#F5F5DC'
              }}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="w-full py-4 px-4 rounded font-medium transition-all duration-200 disabled:opacity-50 cursor-pointer"
              style={{
                backgroundColor: 'rgba(108, 117, 125, 0.2)',
                border: '1px solid #6C757D',
                color: '#E6DDD4'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded font-bold transition-all duration-200 disabled:opacity-50 cursor-pointer"
              style={{
                background: loading 
                  ? 'linear-gradient(to bottom, #6C757D, #495057)'
                  : 'linear-gradient(to bottom, #228B22, #006400)',
                color: '#F5F5DC',
                boxShadow: '0 2px 4px rgba(34, 139, 34, 0.3)'
              }}
            >
              {loading ? 'Logging...' : '🏆 Log Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}