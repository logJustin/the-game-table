'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ConnectivityTest() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testConnectivity = async () => {
    setLoading(true)
    setResults([])
    
    try {
      addResult('🔍 Testing basic Supabase connectivity...')
      
      // Check if client is created
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      addResult('✅ Supabase client initialized')

      // Check environment variables
      addResult(`🔗 Supabase URL configured: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Yes' : 'No'}`)
      
      // Test simple query - just check if we can connect
      addResult('🔄 Attempting basic query...')
      const { data, error, status, statusText } = await supabase
        .from('sessions')
        .select('*')
        .limit(1)

      addResult(`📊 Response status: ${status} ${statusText}`)
      
      if (error) {
        addResult(`❌ Query error: ${error.message}`)
        addResult(`❌ Error code: ${error.code}`)
        addResult(`❌ Error details: ${error.details}`)
        addResult(`❌ Error hint: ${error.hint}`)
        throw error
      }

      addResult(`✅ Query successful - returned ${data ? data.length : 0} rows`)
      addResult('🎉 Basic connectivity test passed!')
      
    } catch (error) {
      console.error('Connectivity test error:', error)
      addResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
            Connectivity Test
          </h1>
          <p className="text-lg" style={{ color: '#E6DDD4' }}>
            Test basic Supabase connection
          </p>
        </div>

        <div className="p-6 rounded-lg mb-6" style={{
          backgroundColor: 'rgba(92, 64, 51, 0.3)',
          border: '1px solid #5C4033'
        }}>
          <button
            onClick={testConnectivity}
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
            {loading ? 'Testing...' : 'Test Connectivity'}
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
            href="/db-test"
            className="inline-block px-6 py-2 rounded transition-colors duration-200 mr-4"
            style={{
              backgroundColor: 'rgba(184, 134, 11, 0.2)',
              color: '#B8860B',
              textDecoration: 'underline'
            }}
          >
            Full DB Test →
          </a>
          <a
            href="/env-test"
            className="inline-block px-6 py-2 rounded transition-colors duration-200"
            style={{
              backgroundColor: 'rgba(184, 134, 11, 0.2)',
              color: '#B8860B',
              textDecoration: 'underline'
            }}
          >
            Env Test →
          </a>
        </div>
      </div>
    </div>
  )
}