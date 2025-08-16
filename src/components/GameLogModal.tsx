'use client'

import { useState } from 'react'
import { logGame } from '@/lib/game-service'

interface GameLogModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function GameLogModal({ isOpen, onClose, onSuccess }: GameLogModalProps) {
  const [gameName, setGameName] = useState('')
  const [winner, setWinner] = useState('')
  const [players, setPlayers] = useState('')
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setGameName('')
    setWinner('')
    setPlayers('')
    setDuration('')
    setNotes('')
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Parse players from comma-separated string
      const playerArray = players
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0)

      if (playerArray.length === 0) {
        throw new Error('Please enter at least one player')
      }

      if (!winner.trim()) {
        throw new Error('Please enter the winner')
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
        players: playerArray,
        durationMinutes,
        notes: notes.trim() || undefined
      })

      resetForm()
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log game')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="w-full max-w-md rounded-lg shadow-xl"
        style={{
          backgroundColor: '#2C1810',
          border: '2px solid #5C4033',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: '#5C4033' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold" style={{ 
              fontFamily: 'serif',
              color: '#F5F5DC' 
            }}>
              📝 Log Game Session
            </h2>
            <button
              onClick={handleClose}
              className="text-2xl transition-colors duration-200"
              style={{ color: '#E6DDD4' }}
            >
              ×
            </button>
          </div>
          <p className="text-sm mt-1" style={{ color: '#E6DDD4' }}>
            Record your game session details
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
          </div>

          {/* Winner */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5DC' }}>
              Winner *
            </label>
            <input
              type="text"
              value={winner}
              onChange={(e) => setWinner(e.target.value)}
              placeholder="e.g., Alice"
              required
              className="w-full p-3 rounded border"
              style={{
                backgroundColor: 'rgba(245, 245, 220, 0.1)',
                border: '1px solid #5C4033',
                color: '#F5F5DC'
              }}
            />
          </div>

          {/* Players */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5DC' }}>
              All Players *
            </label>
            <input
              type="text"
              value={players}
              onChange={(e) => setPlayers(e.target.value)}
              placeholder="e.g., Alice, Bob, Charlie"
              required
              className="w-full p-3 rounded border"
              style={{
                backgroundColor: 'rgba(245, 245, 220, 0.1)',
                border: '1px solid #5C4033',
                color: '#F5F5DC'
              }}
            />
            <p className="text-xs mt-1" style={{ color: '#E6DDD4' }}>
              Separate multiple players with commas
            </p>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#F5F5DC' }}>
              Duration (minutes)
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
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded font-medium transition-all duration-200 disabled:opacity-50"
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
              className="flex-1 py-3 px-4 rounded font-bold transition-all duration-200 disabled:opacity-50"
              style={{
                background: loading 
                  ? 'linear-gradient(to bottom, #6C757D, #495057)'
                  : 'linear-gradient(to bottom, #228B22, #006400)',
                color: '#F5F5DC',
                boxShadow: '0 2px 4px rgba(34, 139, 34, 0.3)'
              }}
            >
              {loading ? 'Logging...' : '📝 Log Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}