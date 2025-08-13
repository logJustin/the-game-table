'use client'

import { useState } from 'react'

export default function APITest() {
  const [query, setQuery] = useState('Zooloretto')
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testBGGAPI = async () => {
    setLoading(true)
    setResult('')
    
    try {
      // Test direct BGG API call
      const corsProxy = 'https://api.allorigins.win/raw?url='
      const searchUrl = `${corsProxy}${encodeURIComponent(`https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(query)}&type=boardgame`)}`
      
      console.log('Testing URL:', searchUrl)
      
      const response = await fetch(searchUrl, { 
        signal: AbortSignal.timeout(10000)
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      if (!response.ok) {
        throw new Error(`API responded with ${response.status}: ${response.statusText}`)
      }
      
      const xmlText = await response.text()
      console.log('Raw XML:', xmlText)
      
      setResult(`Status: ${response.status}\n\nXML Response:\n${xmlText}`)
      
      // Parse XML
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
      const items = xmlDoc.getElementsByTagName('item')
      
      console.log('Found items:', items.length)
      
      const games: Array<{ id: string | null; name: string }> = []
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const id = item.getAttribute('id')
        const nameElement = item.querySelector('name[type="primary"]') || item.querySelector('name')
        const name = nameElement?.getAttribute('value') || 'Unknown'
        games.push({ id, name })
      }
      
      setResult(prev => prev + `\n\nParsed Games (${games.length}):\n${JSON.stringify(games, null, 2)}`)
      
    } catch (error) {
      console.error('BGG API Test Error:', error)
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">BGG API Test</h1>
      
      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Game to search..."
            className="border p-2 w-full"
          />
          <button 
            onClick={testBGGAPI}
            disabled={loading}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test BGG API'}
          </button>
        </div>

        <div>
          <h2 className="text-lg font-bold">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
            {result || 'Click "Test BGG API" to see results'}
          </pre>
        </div>
      </div>
    </div>
  )
}