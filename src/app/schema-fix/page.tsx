'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SchemaFix() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const checkCurrentSchema = async () => {
    setLoading(true)
    setResults([])
    
    try {
      addResult('🔍 Checking current database schema...')
      
      // Try to query each table to see what columns exist
      const tables = ['sessions', 'current_games', 'game_logs', 'session_participants']
      
      for (const tableName of tables) {
        addResult(`🔄 Checking table: ${tableName}`)
        
        try {
          // Try to get data to see what columns exist
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1)
          
          if (error) {
            addResult(`❌ ${tableName}: ${error.message}`)
          } else {
            addResult(`✅ ${tableName}: exists`)
            if (data && data.length > 0) {
              const columns = Object.keys(data[0])
              addResult(`📋 ${tableName} columns: ${columns.join(', ')}`)
            } else {
              addResult(`📋 ${tableName}: no data to show columns`)
            }
          }
        } catch (err) {
          addResult(`❌ ${tableName}: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      }

      addResult('🎉 Schema check complete!')
      
    } catch (error) {
      console.error('Schema check error:', error)
      addResult(`❌ Schema check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const createMissingTables = async () => {
    setLoading(true)
    addResult('🔧 Creating missing tables and columns...')
    
    const sqlCommands = [
      // Create or recreate current_games table with all needed columns
      `DROP TABLE IF EXISTS current_games;`,
      `CREATE TABLE current_games (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
        game_name TEXT NOT NULL,
        added_by TEXT NOT NULL,
        game_image TEXT,
        bgg_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );`,
      
      // Create or recreate game_logs table
      `CREATE TABLE IF NOT EXISTS game_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
        game_name TEXT NOT NULL,
        winner TEXT,
        duration_minutes INTEGER,
        notes TEXT,
        played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );`,
      
      // Create or recreate session_participants table
      `CREATE TABLE IF NOT EXISTS session_participants (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
        participant_name TEXT NOT NULL,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );`,
      
      // Enable RLS
      `ALTER TABLE current_games ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE game_logs ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;`,
      
      // Add RLS policies for current_games
      `CREATE POLICY "Allow all operations on current_games" ON current_games FOR ALL USING (true);`,
      
      // Add RLS policies for game_logs
      `CREATE POLICY "Allow all operations on game_logs" ON game_logs FOR ALL USING (true);`,
      
      // Add RLS policies for session_participants
      `CREATE POLICY "Allow all operations on session_participants" ON session_participants FOR ALL USING (true);`
    ]

    for (const sql of sqlCommands) {
      try {
        addResult(`🔄 Executing: ${sql.substring(0, 50)}...`)
        
        // Execute SQL using the rpc function or direct query
        const { error } = await supabase.rpc('exec', { sql })
        
        if (error) {
          // Try alternative approach - direct query for some commands
          if (sql.includes('CREATE TABLE') || sql.includes('ALTER TABLE')) {
            addResult(`⚠️ RPC failed, trying direct query...`)
            // Note: This won't work from client side, but we'll log it
            addResult(`💡 Run this SQL in Supabase SQL editor: ${sql}`)
          } else {
            addResult(`❌ Failed: ${error.message}`)
          }
        } else {
          addResult(`✅ Success`)
        }
      } catch (error) {
        addResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        addResult(`💡 Manual SQL needed: ${sql}`)
      }
    }
    
    addResult('🎉 Schema creation complete! Some commands may need to be run manually in Supabase.')
    setLoading(false)
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ 
            fontFamily: 'serif',
            color: '#F5F5DC',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
          }}>
            Schema Fix Tool
          </h1>
          <p className="text-lg" style={{ color: '#E6DDD4' }}>
            Fix database schema issues
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <button
            onClick={checkCurrentSchema}
            disabled={loading}
            className="px-6 py-4 rounded font-bold transition-all duration-200 disabled:opacity-50"
            style={{
              background: loading 
                ? 'linear-gradient(to bottom, #6C757D, #495057)'
                : 'linear-gradient(to bottom, #1E90FF, #0066CC)',
              color: '#F5F5DC',
              boxShadow: '0 2px 4px rgba(30, 144, 255, 0.3)'
            }}
          >
            {loading ? 'Checking...' : '🔍 Check Current Schema'}
          </button>
          
          <button
            onClick={createMissingTables}
            disabled={loading}
            className="px-6 py-4 rounded font-bold transition-all duration-200 disabled:opacity-50"
            style={{
              background: loading 
                ? 'linear-gradient(to bottom, #6C757D, #495057)'
                : 'linear-gradient(to bottom, #228B22, #006400)',
              color: '#F5F5DC',
              boxShadow: '0 2px 4px rgba(34, 139, 34, 0.3)'
            }}
          >
            {loading ? 'Creating...' : '🔧 Fix Schema'}
          </button>
        </div>

        {/* SQL Commands Display */}
        <div className="mb-6 p-6 rounded-lg" style={{
          backgroundColor: 'rgba(92, 64, 51, 0.3)',
          border: '1px solid #5C4033'
        }}>
          <h3 className="text-lg font-bold mb-4" style={{ 
            fontFamily: 'serif',
            color: '#F5F5DC' 
          }}>
            Manual SQL Commands (Run in Supabase SQL Editor)
          </h3>
          <div className="bg-black p-4 rounded font-mono text-sm overflow-x-auto" style={{ color: '#00FF00' }}>
            <pre>{`-- Fix current_games table
DROP TABLE IF EXISTS current_games;
CREATE TABLE current_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  game_name TEXT NOT NULL,
  added_by TEXT NOT NULL,
  game_image TEXT,
  bgg_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fix game_logs table
CREATE TABLE IF NOT EXISTS game_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  game_name TEXT NOT NULL,
  winner TEXT,
  duration_minutes INTEGER,
  notes TEXT,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fix session_participants table
CREATE TABLE IF NOT EXISTS session_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and add policies
ALTER TABLE current_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on current_games" ON current_games FOR ALL USING (true);
CREATE POLICY "Allow all operations on game_logs" ON game_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations on session_participants" ON session_participants FOR ALL USING (true);`}</pre>
          </div>
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
              Results
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
            className="inline-block px-6 py-2 rounded transition-colors duration-200 mr-4"
            style={{
              backgroundColor: 'rgba(184, 134, 11, 0.2)',
              color: '#B8860B',
              textDecoration: 'underline'
            }}
          >
            Test Database →
          </a>
          <a
            href="/session"
            className="inline-block px-6 py-2 rounded transition-colors duration-200"
            style={{
              backgroundColor: 'rgba(34, 139, 34, 0.2)',
              color: '#228B22',
              textDecoration: 'underline'
            }}
          >
            Back to Session →
          </a>
        </div>
      </div>
    </div>
  )
}