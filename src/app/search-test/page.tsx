'use client'

import { useState } from 'react'
import { searchBoardGames, searchBoardGamesExternal, getCacheStats, clearGameCache } from '@/lib/boardgamegeek'

// Top 100 board games for testing (BGG top ranked games) - kept for future expansion
const TOP_GAMES_TEST_CASES = [
  'Gloomhaven',
  'Pandemic Legacy Season 1',
  'Brass Birmingham',
  'Terraforming Mars',
  'Spirit Island',
  'Wingspan',
  'Azul',
  'Ticket to Ride',
  'Splendor',
  'Catan',
  'Tiny Towns',
  '7 Wonders',
  'King of Tokyo',
  'Dominion',
  'Scythe',
  'Pandemic',
  'Agricola',
  'Puerto Rico',
  'Power Grid',
  'Le Havre'
]

// Common search variations that should work
const SEARCH_VARIATIONS = [
  { query: 'tiny town', expected: 'Tiny Towns' },
  { query: 'tiny towns', expected: 'Tiny Towns' },
  { query: 'gloom', expected: 'Gloomhaven' },
  { query: 'pandemic', expected: 'Pandemic' },
  { query: 'terra', expected: 'Terraforming Mars' },
  { query: 'wing', expected: 'Wingspan' },
  { query: 'ticket', expected: 'Ticket to Ride' },
  { query: 'catan', expected: 'Catan' },
  { query: 'settlers', expected: 'Catan' },
  { query: 'spirit', expected: 'Spirit Island' },
  { query: 'small world', expected: 'Small World' },
  { query: 'my custom game', expected: 'My Custom Game' }
]

interface TestResult {
  query: string
  expected: string
  localFound: boolean
  externalFound: boolean
  localResults: unknown[]
  externalResults: unknown[]
  error?: string
}

export default function SearchTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState('')
  const [cacheStats, setCacheStats] = useState(getCacheStats())

  const runSingleTest = async (query: string, expected: string): Promise<TestResult> => {
    try {
      console.log(`Testing: "${query}" (expecting: ${expected})`)
      
      // Test local search
      const localResults = await searchBoardGames(query, false)
      const localFound = localResults.some(result => 
        result.name.toLowerCase().includes(expected.toLowerCase()) ||
        expected.toLowerCase().includes(result.name.toLowerCase())
      )
      
      // Test external search
      const externalResults = await searchBoardGamesExternal(query)
      const externalFound = externalResults.some(result => 
        result.name.toLowerCase().includes(expected.toLowerCase()) ||
        expected.toLowerCase().includes(result.name.toLowerCase())
      )
      
      return {
        query,
        expected,
        localFound,
        externalFound,
        localResults,
        externalResults
      }
    } catch (error) {
      return {
        query,
        expected,
        localFound: false,
        externalFound: false,
        localResults: [],
        externalResults: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])
    
    const results: TestResult[] = []
    
    for (const testCase of SEARCH_VARIATIONS) {
      setCurrentTest(`${testCase.query} → ${testCase.expected}`)
      
      try {
        const result = await runSingleTest(testCase.query, testCase.expected)
        results.push(result)
        setTestResults([...results])
        
        // Add delay between tests to avoid overwhelming BGG API
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Test failed for ${testCase.query}:`, error)
        results.push({
          query: testCase.query,
          expected: testCase.expected,
          localFound: false,
          externalFound: false,
          localResults: [],
          externalResults: [],
          error: error instanceof Error ? error.message : 'Test execution failed'
        })
      }
    }
    
    setIsRunning(false)
    setCurrentTest('')
    setCacheStats(getCacheStats()) // Update cache stats after tests
  }

  const getResultIcon = (result: TestResult) => {
    if (result.error) return '❌'
    if (result.localFound) return '✅'
    if (result.externalFound) return '🌐'
    return '❌'
  }

  const getResultText = (result: TestResult) => {
    if (result.error) return `Error: ${result.error}`
    if (result.localFound) return `Found locally (${result.localResults.length} results)`
    if (result.externalFound) return `Found externally (${result.externalResults.length} results)`
    return 'Not found'
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
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ 
            fontFamily: 'serif',
            color: '#F5F5DC',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
          }}>
            Board Game Search Test Suite
          </h1>
          <p className="text-lg" style={{ color: '#E6DDD4' }}>
            Test and debug the search functionality
          </p>
        </div>
      
        <div className="mb-6 p-6 rounded-lg" style={{
          backgroundColor: 'rgba(92, 64, 51, 0.3)',
          border: '1px solid #5C4033'
        }}>
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="px-6 py-3 rounded-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isRunning ? 'rgba(184, 134, 11, 0.5)' : 'linear-gradient(to bottom, #B8860B, #9A7209)',
                color: '#F5F5DC',
                boxShadow: '0 2px 4px rgba(184, 134, 11, 0.3)',
                fontFamily: 'serif'
              }}
            >
              {isRunning ? '⏳ Running Tests...' : '🎯 Run Search Tests'}
            </button>
            
            <button
              onClick={() => {
                clearGameCache()
                setCacheStats(getCacheStats())
              }}
              className="px-4 py-2 rounded font-bold transition-all duration-200"
              style={{
                background: 'linear-gradient(to bottom, #8B1538, #6B0F2A)',
                color: '#F5F5DC',
                boxShadow: '0 2px 4px rgba(139, 21, 56, 0.3)',
                fontFamily: 'serif'
              }}
            >
              🗑️ Clear Cache
            </button>
            
            <div className="px-4 py-2 rounded text-sm font-medium" style={{
              backgroundColor: 'rgba(245, 245, 220, 0.1)',
              border: '1px solid rgba(245, 245, 220, 0.2)',
              color: '#F5F5DC',
              fontFamily: 'serif'
            }}>
              📊 Database: {cacheStats.static} static + {cacheStats.cached} cached = {cacheStats.total} total
            </div>
          </div>
        
          {isRunning && (
            <div className="mt-4 p-4 rounded-lg" style={{
              backgroundColor: 'rgba(184, 134, 11, 0.2)',
              border: '2px solid #B8860B'
            }}>
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-b-transparent" style={{ borderColor: '#B8860B' }}></div>
                <span style={{ color: '#F5F5DC', fontFamily: 'serif' }}>⚔️ Testing: {currentTest}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4">
          <h2 className="text-xl font-bold mb-4" style={{ 
            fontFamily: 'serif',
            color: '#F5F5DC',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
          }}>
            🎲 Test Results ({testResults.length}/{SEARCH_VARIATIONS.length})
          </h2>
        
          {testResults.map((result, index) => (
            <div key={index} className="rounded-lg p-4 shadow-sm" style={{
              backgroundColor: 'rgba(92, 64, 51, 0.3)',
              border: '1px solid #5C4033'
            }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getResultIcon(result)}</span>
                  <div>
                    <span className="font-medium" style={{ color: '#F5F5DC', fontFamily: 'serif' }}>&quot;{result.query}&quot;</span>
                    <span className="mx-2" style={{ color: '#E6DDD4' }}>→</span>
                    <span style={{ color: '#B8860B', fontWeight: 'bold' }}>{result.expected}</span>
                  </div>
                </div>
                <span className="text-sm" style={{ color: '#E6DDD4' }}>
                  {getResultText(result)}
                </span>
              </div>
              
              {(result.localResults.length > 0 || result.externalResults.length > 0) && (
                <details className="mt-2">
                  <summary className="text-sm cursor-pointer" style={{ color: '#E6DDD4', fontFamily: 'serif' }}>
                    🔍 View Results Details
                  </summary>
                  <div className="mt-2 p-3 rounded text-xs" style={{
                    backgroundColor: 'rgba(44, 24, 16, 0.5)',
                    border: '1px solid #4A3429'
                  }}>
                    <div className="mb-2">
                      <strong style={{ color: '#F5F5DC' }}>Local Results ({result.localResults.length}):</strong>
                      <pre className="mt-1 overflow-auto p-2 rounded" style={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        color: '#E6DDD4',
                        fontSize: '10px'
                      }}>
                        {JSON.stringify(result.localResults, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <strong style={{ color: '#F5F5DC' }}>External Results ({result.externalResults.length}):</strong>
                      <pre className="mt-1 overflow-auto p-2 rounded" style={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        color: '#E6DDD4',
                        fontSize: '10px'
                      }}>
                        {JSON.stringify(result.externalResults, null, 2)}
                      </pre>
                    </div>
                  </div>
                </details>
              )}
            </div>
          ))}

          {testResults.length > 0 && (
            <div className="mt-8 p-6 rounded-lg" style={{
              backgroundColor: 'rgba(44, 24, 16, 0.5)',
              border: '1px solid #4A3429'
            }}>
              <h3 className="font-bold mb-4" style={{ 
                fontFamily: 'serif',
                color: '#F5F5DC',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
              }}>
                📊 Summary
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 rounded" style={{
                  backgroundColor: 'rgba(184, 134, 11, 0.2)',
                  border: '1px solid rgba(184, 134, 11, 0.3)'
                }}>
                  <span className="font-medium" style={{ color: '#F5F5DC', fontFamily: 'serif' }}>⚡ Local Found:</span>
                  <div className="text-lg font-bold mt-1" style={{ color: '#B8860B' }}>
                    {testResults.filter(r => r.localFound).length}/{testResults.length}
                  </div>
                </div>
                <div className="p-3 rounded" style={{
                  backgroundColor: 'rgba(92, 64, 51, 0.3)',
                  border: '1px solid #5C4033'
                }}>
                  <span className="font-medium" style={{ color: '#F5F5DC', fontFamily: 'serif' }}>🌐 External Found:</span>
                  <div className="text-lg font-bold mt-1" style={{ color: '#E6DDD4' }}>
                    {testResults.filter(r => r.externalFound && !r.localFound).length}/{testResults.length}
                  </div>
                </div>
                <div className="p-3 rounded" style={{
                  backgroundColor: 'rgba(139, 21, 56, 0.2)',
                  border: '1px solid rgba(139, 21, 56, 0.3)'
                }}>
                  <span className="font-medium" style={{ color: '#F5F5DC', fontFamily: 'serif' }}>❌ Not Found:</span>
                  <div className="text-lg font-bold mt-1" style={{ color: '#FF6B6B' }}>
                    {testResults.filter(r => !r.localFound && !r.externalFound).length}/{testResults.length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}