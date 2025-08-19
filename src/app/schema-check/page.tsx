'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SchemaCheck() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const checkSchema = async () => {
    setLoading(true)
    setResults([])
    
    try {
      addResult('🔍 Checking database schema...')
      
      // Check if tables exist and their columns
      const tables = ['sessions', 'current_games', 'game_logs', 'session_participants']
      
      for (const tableName of tables) {
        addResult(`🔄 Checking table: ${tableName}`)
        
        try {
          // Try to get column info by doing a select with limit 0
          const { error } = await supabase
            .from(tableName)
            .select('*')
            .limit(0)
          
          if (error) {
            addResult(`❌ Table ${tableName}: ${error.message}`)
          } else {
            addResult(`✅ Table ${tableName} exists`)
          }
        } catch (err) {
          addResult(`❌ Table ${tableName} error: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      }

      // Try to add the missing column if it doesn't exist
      addResult('🔄 Attempting to add missing bgg_id column...')
      
      // First, check if we can query current_games with bgg_id
      const { error: testError } = await supabase
        .from('current_games')
        .select('bgg_id')
        .limit(1)
      
      if (testError && testError.code === 'PGRST204') {
        addResult('❌ bgg_id column missing from current_games table')
        addResult('💡 This column needs to be added to the database schema')
        addResult('💡 SQL to run: ALTER TABLE current_games ADD COLUMN bgg_id TEXT;')
      } else if (testError) {
        addResult(`❌ Error testing bgg_id column: ${testError.message}`)
      } else {
        addResult('✅ bgg_id column exists in current_games table')
      }

      addResult('🎉 Schema check complete!')
      
    } catch (error) {
      console.error('Schema check error:', error)
      addResult(`❌ Schema check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const fixSchema = async () => {
    setLoading(true)
    addResult('🔧 Attempting to fix schema...')
    
    try {
      // Try to add the missing column using SQL
      const { error } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE current_games ADD COLUMN IF NOT EXISTS bgg_id TEXT;'
      })
      
      if (error) {
        addResult(`❌ Failed to add column: ${error.message}`)
        addResult('💡 You may need to add this column manually in the Supabase dashboard')
      } else {
        addResult('✅ Successfully added bgg_id column')
      }
    } catch (error) {
      addResult(`❌ Fix failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      addResult('💡 Manual fix needed - see SQL command above')
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
            Schema Check
          </h1>
          <p className="text-lg" style={{ color: '#E6DDD4' }}>
            Verify and fix database schema
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={checkSchema}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded font-bold transition-all duration-200 disabled:opacity-50"
            style={{
              background: loading 
                ? 'linear-gradient(to bottom, #6C757D, #495057)'
                : 'linear-gradient(to bottom, #1E90FF, #0066CC)',
              color: '#F5F5DC',
              boxShadow: '0 2px 4px rgba(30, 144, 255, 0.3)'
            }}
          >
            {loading ? 'Checking...' : 'Check Schema'}
          </button>
          
          <button
            onClick={fixSchema}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded font-bold transition-all duration-200 disabled:opacity-50"
            style={{
              background: loading 
                ? 'linear-gradient(to bottom, #6C757D, #495057)'
                : 'linear-gradient(to bottom, #228B22, #006400)',
              color: '#F5F5DC',
              boxShadow: '0 2px 4px rgba(34, 139, 34, 0.3)'
            }}
          >
            {loading ? 'Fixing...' : 'Fix Schema'}
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
              Schema Check Results
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
                        : result.includes('💡')
                          ? '#FFD43B'
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
            href="/db-test"
            className="inline-block px-6 py-2 rounded transition-colors duration-200"
            style={{
              backgroundColor: 'rgba(184, 134, 11, 0.2)',
              color: '#B8860B',
              textDecoration: 'underline'
            }}
          >
            ← Back to Database Test
          </a>
        </div>
      </div>
    </div>
  )
}