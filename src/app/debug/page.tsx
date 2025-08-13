'use client'

import { useState } from 'react'
import { searchBoardGames, searchBoardGamesExternal } from '@/lib/boardgamegeek'

export default function Debug() {
  const [query, setQuery] = useState('suburbia')
  const [results, setResults] = useState<unknown[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    try {
      setError(null)
      console.log('Testing local search for:', query)
      const localResults = await searchBoardGames(query, false)
      console.log('Local results:', localResults)
      console.log('Local results count:', localResults.length)
      
      console.log('Testing external search for:', query)
      const externalResults = await searchBoardGamesExternal(query)
      console.log('External results:', externalResults)
      
      // Also test partial version if this is a full word
      const partialQuery = query.length > 6 ? query.substring(0, 6) : query + 'ia'
      console.log('Testing external search for partial:', partialQuery)
      const partialResults = await searchBoardGamesExternal(partialQuery)
      console.log('Partial external results:', partialResults)
      
      setResults([
        { type: 'local', count: localResults.length, results: localResults },
        { type: 'external-full', count: externalResults.length, results: externalResults },
        { type: 'external-partial', count: partialResults.length, results: partialResults }
      ])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Search error:', err)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Board Game Search</h1>
      
      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for games..."
            className="border p-2 w-full"
          />
          <button 
            onClick={handleSearch}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold">Results ({results.length}):</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}