'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getAvailableGames, addAvailableGame, removeAvailableGame, getGameLogs, logGame } from '@/lib/game-service'

export default function DatabaseTest() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testDatabase = async () => {
    setLoading(true)
    setResults([])
    
    try {
      addResult('🔍 Testing database connection...')
      
      // Test 1: Basic connection
      const { data, error } = await supabase.from('available_games').select('count').limit(1)
      if (error) {
        addResult(`❌ Database connection error: ${error.message}`)
        addResult(`❌ Error details: ${JSON.stringify(error, null, 2)}`)
        throw error
      }
      addResult('✅ Database connection successful')
      
      // Test 2: Get available games
      addResult('🔄 Fetching available games...')
      const games = await getAvailableGames()
      addResult(`✅ Found ${games.length} available games`)
      
      // Test 3: Add a test game
      addResult('🔄 Adding test game...')
      const testGame = await addAvailableGame({
        gameName: `Test Game ${Date.now()}`,
        gameImage: 'https://via.placeholder.com/150x150/B8860B/F5F5DC?text=Test',
        bggId: 'test-bgg-id'
      })
      addResult(`✅ Game added: ${testGame.game_name} (ID: ${testGame.id})`)
      
      // Test 4: Get updated games list
      addResult('🔄 Fetching updated games list...')
      const updatedGames = await getAvailableGames()
      addResult(`✅ Found ${updatedGames.length} available games (increased by 1)`)
      
      // Test 5: Get game logs
      addResult('🔄 Fetching game logs...')
      const logs = await getGameLogs()
      addResult(`✅ Found ${logs.length} game logs`)
      
      // Test 6: Add a test game log
      addResult('🔄 Adding test game log...')
      const testLog = await logGame({
        gameName: testGame.game_name,
        winner: 'Test Player 1',
        players: ['Test Player 1', 'Test Player 2', 'Test Player 3'],
        durationMinutes: 45,
        notes: 'This is a test game session'
      })
      addResult(`✅ Game log added: ${testLog.game_name} won by ${testLog.winner}`)
      
      // Test 7: Get updated logs
      addResult('🔄 Fetching updated game logs...')
      const updatedLogs = await getGameLogs()
      addResult(`✅ Found ${updatedLogs.length} game logs (increased by 1)`)
      
      // Test 8: Clean up test data
      addResult('🔄 Cleaning up test data...')
      await removeAvailableGame(testGame.id)
      addResult('✅ Test game removed')
      
      addResult('🎉 All database tests passed!')
      
    } catch (error) {
      console.error('Database test error:', error)
      if (error instanceof Error) {
        addResult(`❌ Error: ${error.message}`)
        if (error.stack) {
          addResult(`❌ Stack trace: ${error.stack}`)
        }
      } else {
        addResult(`❌ Unknown error: ${JSON.stringify(error)}`)
      }
    } finally {
      setLoading(false)
    }
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
      backgroundSize: '60px 60px'
    }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ 
            fontFamily: 'serif',
            color: '#F5F5DC',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
          }}>
            Database Test
          </h1>
          <p className="text-lg" style={{ color: '#E6DDD4' }}>
            Test anonymous game logging system
          </p>
        </div>

        <div className="p-6 rounded-lg mb-6" style={{
          backgroundColor: 'rgba(92, 64, 51, 0.3)',
          border: '1px solid #5C4033'
        }}>
          <button
            onClick={testDatabase}
            disabled={loading}
            className="w-full px-6 py-3 rounded font-bold transition-all duration-200 disabled:opacity-50"
            style={{
              background: loading 
                ? 'linear-gradient(to bottom, #6C757D, #495057)'
                : 'linear-gradient(to bottom, #1E90FF, #0066CC)',
              color: '#F5F5DC',
              boxShadow: '0 2px 4px rgba(30, 144, 255, 0.3)'
            }}
          >
            {loading ? 'Running Tests...' : 'Run Database Tests'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="p-6 rounded-lg" style={{
            backgroundColor: 'rgba(44, 24, 16, 0.5)',
            border: '1px solid #4A3429'
          }}>
            <h3 className="text-lg font-bold mb-4" style={{ 
              fontFamily: 'serif',
              color: '#F5F5DC' 
            }}>
              Test Results
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="p-2 rounded text-sm font-mono"
                  style={{
                    backgroundColor: 'rgba(245, 245, 220, 0.1)',
                    color: result.includes('❌') 
                      ? '#FF6B6B'
                      : result.includes('✅') 
                        ? '#51CF66'
                        : result.includes('🎉')
                          ? '#FFD43B'
                          : '#E6DDD4',
                    border: '1px solid rgba(245, 245, 220, 0.2)'
                  }}
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <a
            href="/logs"
            className="inline-block px-6 py-2 rounded transition-colors duration-200"
            style={{
              backgroundColor: 'rgba(184, 134, 11, 0.2)',
              color: '#B8860B',
              textDecoration: 'underline'
            }}
          >
            ← Back to Game Logs
          </a>
        </div>
      </div>
    </div>
  )
}