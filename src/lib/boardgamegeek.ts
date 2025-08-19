// BoardGameGeek API integration for fetching board game data and images

export interface BoardGame {
  id: string
  name: string
  image?: string
  thumbnail?: string
  yearPublished?: number
  minPlayers?: number
  maxPlayers?: number
  playingTime?: number
  description?: string
  aliases?: string[] // Alternative names for better search
}

export interface BGGSearchResult {
  id: string
  name: string
  yearPublished?: number
  image?: string
  thumbnail?: string
}

// BGG XML API endpoints for fallback search
const BGG_SEARCH_URL = 'https://boardgamegeek.com/xmlapi2/search'
const BGG_THING_URL = 'https://boardgamegeek.com/xmlapi2/thing'

// CORS proxy for development (try multiple options)
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://thingproxy.freeboard.io/fetch/'
]

// Try multiple CORS proxies with fallback
async function fetchWithCORSFallback(url: string, options: RequestInit = {}): Promise<Response> {
  const errors: string[] = []
  
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxy = CORS_PROXIES[i]
    const proxyUrl = `${proxy}${encodeURIComponent(url)}`
    
    try {
      console.log(`Trying CORS proxy ${i + 1}/${CORS_PROXIES.length}: ${proxy}`)
      const response = await fetch(proxyUrl, {
        ...options,
        signal: AbortSignal.timeout(10000) // 10 second timeout per proxy
      })
      
      if (response.ok) {
        console.log(`CORS proxy ${i + 1} succeeded`)
        return response
      } else {
        errors.push(`Proxy ${i + 1} returned ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`Proxy ${i + 1} failed: ${errorMsg}`)
      console.warn(`CORS proxy ${i + 1} failed:`, error)
    }
  }
  
  throw new Error(`All CORS proxies failed: ${errors.join('; ')}`)
}

// Comprehensive board games database - images loaded dynamically via BGG API
export const POPULAR_GAMES: BoardGame[] = [
  { 
    id: '13', 
    name: 'Catan', 
    aliases: ['Settlers of Catan', 'The Settlers of Catan'],
    minPlayers: 3,
    maxPlayers: 4,
    playingTime: 60,
    yearPublished: 1995
  },
  { 
    id: '9209', 
    name: 'Ticket to Ride', 
    minPlayers: 2,
    maxPlayers: 5,
    playingTime: 60,
    yearPublished: 2004
  },
  { 
    id: '68448', 
    name: 'Azul', 
    minPlayers: 2,
    maxPlayers: 4,
    playingTime: 45,
    yearPublished: 2017
  },
  { 
    id: '148228', 
    name: 'Splendor', 
    minPlayers: 2,
    maxPlayers: 4,
    playingTime: 30,
    yearPublished: 2014
  },
  { 
    id: '30549', 
    name: 'Pandemic', 
    minPlayers: 2,
    maxPlayers: 4,
    playingTime: 45,
    yearPublished: 2008
  },
  { 
    id: '70323', 
    name: 'King of Tokyo', 
    aliases: ['King of New York'],
    minPlayers: 2,
    maxPlayers: 6,
    playingTime: 30,
    yearPublished: 2011
  },
  { 
    id: '167791', 
    name: 'Terraforming Mars', 
    minPlayers: 1,
    maxPlayers: 5,
    playingTime: 120,
    yearPublished: 2016
  },
  { 
    id: '174430', 
    name: 'Gloomhaven', 
    minPlayers: 1,
    maxPlayers: 4,
    playingTime: 120,
    yearPublished: 2017
  },
  { 
    id: '36218', 
    name: 'Dominion', 
    minPlayers: 2,
    maxPlayers: 4,
    playingTime: 30,
    yearPublished: 2008
  },
  { 
    id: '31260', 
    name: '7 Wonders', 
    minPlayers: 2,
    maxPlayers: 7,
    playingTime: 30,
    yearPublished: 2010
  },
  { 
    id: '1406', 
    name: 'Monopoly', 
    aliases: ['Monopoly Classic', 'The Monopoly Game'],
    minPlayers: 2,
    maxPlayers: 8,
    playingTime: 180,
    yearPublished: 1935
  },
  { 
    id: '822', 
    name: 'Scrabble', 
    minPlayers: 2,
    maxPlayers: 4,
    playingTime: 90,
    yearPublished: 1948
  },
  { 
    id: '15987', 
    name: 'Arkham Horror', 
    minPlayers: 1,
    maxPlayers: 8,
    playingTime: 240,
    yearPublished: 2005
  },
  { 
    id: '120677', 
    name: 'Terra Mystica', 
    minPlayers: 2,
    maxPlayers: 5,
    playingTime: 150,
    yearPublished: 2012
  },
  { 
    id: '169786', 
    name: 'Scythe', 
    minPlayers: 1,
    maxPlayers: 5,
    playingTime: 115,
    yearPublished: 2016
  }
]

// Dynamic cache for API-fetched games (persisted in localStorage)
let dynamicGameCache: BoardGame[] = []

// Load cached games from localStorage on startup
function loadCachedGames(): BoardGame[] {
  if (typeof window === 'undefined') return []
  
  try {
    const cached = localStorage.getItem('bgg-game-cache')
    if (cached) {
      const parsed = JSON.parse(cached)
      console.log(`Loaded ${parsed.length} games from cache`)
      return parsed
    }
  } catch (error) {
    console.warn('Failed to load game cache:', error)
  }
  return []
}

// Save games to localStorage cache
function saveCachedGames(games: BoardGame[]) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('bgg-game-cache', JSON.stringify(games))
    console.log(`Saved ${games.length} games to cache`)
  } catch (error) {
    console.warn('Failed to save game cache:', error)
  }
}

// Add a game to the dynamic cache
function addToCache(game: BoardGame) {
  // Avoid duplicates
  if (!dynamicGameCache.find(cached => cached.id === game.id)) {
    dynamicGameCache.push(game)
    saveCachedGames(dynamicGameCache)
    console.log(`Added "${game.name}" to cache (total: ${dynamicGameCache.length})`)
  }
}

// Initialize cache on module load
if (typeof window !== 'undefined') {
  dynamicGameCache = loadCachedGames()
}

// Extended game database for search (static + dynamic)
export const ALL_GAMES: BoardGame[] = [
  ...POPULAR_GAMES,
  { id: 'chess', name: 'Chess', aliases: ['Classic Chess'], minPlayers: 2, maxPlayers: 2, playingTime: 60 },
  { id: 'checkers', name: 'Checkers', minPlayers: 2, maxPlayers: 2, playingTime: 30 },
  { id: 'uno', name: 'UNO', aliases: ['Uno Card Game'], minPlayers: 2, maxPlayers: 10, playingTime: 30 },
  { id: 'risk', name: 'Risk', minPlayers: 2, maxPlayers: 6, playingTime: 180 },
  { id: 'clue', name: 'Clue', minPlayers: 3, maxPlayers: 6, playingTime: 60 },
  { id: 'yahtzee', name: 'Yahtzee', minPlayers: 1, maxPlayers: 8, playingTime: 30 },
  { id: 'connect4', name: 'Connect Four', minPlayers: 2, maxPlayers: 2, playingTime: 15 },
  { id: 'battleship', name: 'Battleship', minPlayers: 2, maxPlayers: 2, playingTime: 30 },
  { id: 'munchkin', name: 'Munchkin', minPlayers: 3, maxPlayers: 6, playingTime: 90 },
  { id: 'carcassonne', name: 'Carcassonne', minPlayers: 2, maxPlayers: 5, playingTime: 45 },
  { id: 'wingspan', name: 'Wingspan', minPlayers: 1, maxPlayers: 5, playingTime: 70 },
  { id: 'everdell', name: 'Everdell', minPlayers: 1, maxPlayers: 4, playingTime: 80 },
  { id: 'spirit-island', name: 'Spirit Island', minPlayers: 1, maxPlayers: 4, playingTime: 120 },
  { id: 'betrayal', name: 'Betrayal at House on the Hill', minPlayers: 3, maxPlayers: 6, playingTime: 90 },
  { id: 'dead-of-winter', name: 'Dead of Winter', minPlayers: 2, maxPlayers: 5, playingTime: 120 },
  { id: '25063', name: 'Zooloretto', aliases: ['Zoo Loretto'], minPlayers: 2, maxPlayers: 5, playingTime: 45, yearPublished: 2007 },
  { id: '265736', name: 'Tiny Towns', aliases: ['Tiny Town'], minPlayers: 1, maxPlayers: 6, playingTime: 45, yearPublished: 2019 },
  { id: '96848', name: 'Mage Knight Board Game', aliases: ['Mage Knight'], minPlayers: 1, maxPlayers: 4, playingTime: 150, yearPublished: 2011 },
  { id: '123260', name: 'Suburbia', aliases: ['Suburb'], minPlayers: 1, maxPlayers: 4, playingTime: 90, yearPublished: 2012 },
  { id: '40692', name: 'Small World', minPlayers: 2, maxPlayers: 5, playingTime: 80, yearPublished: 2009 },
  { id: '4098', name: 'Lords of Waterdeep', aliases: ['Lords of W', 'Waterdeep'], minPlayers: 2, maxPlayers: 5, playingTime: 60, yearPublished: 2012 },
  { id: '68369', name: 'Splendor', minPlayers: 2, maxPlayers: 4, playingTime: 30, yearPublished: 2014 },
  { id: '129622', name: 'Love Letter', minPlayers: 2, maxPlayers: 4, playingTime: 15, yearPublished: 2012 }
]

// Parse XML response from BGG API
function parseXMLResponse(xmlText: string): Document {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
  return xmlDoc
}

// External BGG API search (used as fallback when local search returns no results)
async function searchBGGExternal(query: string): Promise<BGGSearchResult[]> {
  try {
    // BGG search works better with longer terms, so if query is very short, try adding common suffixes
    const searchQuery = query.trim()
    if (searchQuery.length <= 4) {
      console.log(`[BGG] Short query "${searchQuery}" - BGG may not return good results for very short searches`)
    }
    
    const bggUrl = `${BGG_SEARCH_URL}?query=${encodeURIComponent(searchQuery)}&type=boardgame`
    console.log('BGG API URL:', bggUrl)
    console.log('Searching for:', searchQuery)
    console.log('Encoded query in URL:', encodeURIComponent(searchQuery))
    
    const response = await fetchWithCORSFallback(bggUrl)
    
    console.log('BGG Response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`BGG API responded with ${response.status}: ${response.statusText}`)
    }
    
    const xmlText = await response.text()
    console.log('BGG XML Response length:', xmlText.length)
    console.log('BGG XML Response preview:', xmlText.substring(0, 500))
    
    // Log full XML for debugging specific searches
    if (query.toLowerCase().includes('tiny') || query.toLowerCase().includes('mage')) {
      console.log(`FULL BGG XML for "${query}" search:`, xmlText)
    }
    
    const xmlDoc = parseXMLResponse(xmlText)
    
    // Check for errors in XML
    const errorElement = xmlDoc.querySelector('error')
    if (errorElement) {
      console.warn('BGG API returned error:', errorElement.textContent)
      return []
    }
    
    const items = xmlDoc.getElementsByTagName('item')
    console.log('BGG found items:', items.length)
    
    const allResults: BGGSearchResult[] = []
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const id = item.getAttribute('id')
      const nameElement = item.querySelector('name[type="primary"]') || item.querySelector('name')
      const yearElement = item.querySelector('yearpublished')
      
      if (id && nameElement) {
        const name = nameElement.getAttribute('value') || ''
        const year = yearElement ? parseInt(yearElement.getAttribute('value') || '0') : undefined
        
        console.log(`BGG Game ${i + 1}:`, { id, name, year })
        
        allResults.push({
          id,
          name,
          yearPublished: year,
          image: undefined, // BGG search API doesn't include images
          thumbnail: undefined // BGG search API doesn't include images
        })
      }
    }
    
    // Filter and prioritize results to show base games before expansions
    const expansionKeywords = ['expansion', 'extend', 'promo', 'mini', 'bonus', 'pack', 'addon', 'add-on', 'supplement']
    
    const baseGames = allResults.filter(result => {
      const nameLower = result.name.toLowerCase()
      return !expansionKeywords.some(keyword => nameLower.includes(keyword))
    })
    
    const expansions = allResults.filter(result => {
      const nameLower = result.name.toLowerCase()
      return expansionKeywords.some(keyword => nameLower.includes(keyword))
    })
    
    // Prioritize exact matches in base games
    const exactMatches = baseGames.filter(result => 
      result.name.toLowerCase() === query.toLowerCase()
    )
    
    const otherBaseGames = baseGames.filter(result => 
      result.name.toLowerCase() !== query.toLowerCase()
    )
    
    // Return results in priority order: exact matches, other base games, then expansions
    const results = [...exactMatches, ...otherBaseGames, ...expansions].slice(0, 8)
    
    console.log('BGG final results:', results)
    return results
  } catch (error) {
    console.error('BGG external search failed:', error)
    return []
  }
}

// Get detailed board game info from BGG API
async function getBGGGameDetails(id: string): Promise<BoardGame | null> {
  try {
    const bggUrl = `${BGG_THING_URL}?id=${id}`
    const response = await fetchWithCORSFallback(bggUrl)
    
    if (!response.ok) {
      throw new Error(`BGG API responded with ${response.status}`)
    }
    
    const xmlText = await response.text()
    const xmlDoc = parseXMLResponse(xmlText)
    
    const item = xmlDoc.querySelector('item')
    if (!item) return null
    
    const nameElement = item.querySelector('name[type="primary"]') || item.querySelector('name')
    const imageElement = item.querySelector('image')
    const thumbnailElement = item.querySelector('thumbnail')
    const yearElement = item.querySelector('yearpublished')
    const minPlayersElement = item.querySelector('minplayers')
    const maxPlayersElement = item.querySelector('maxplayers')
    const playingTimeElement = item.querySelector('playingtime')
    
    return {
      id,
      name: nameElement?.getAttribute('value') || '',
      image: imageElement?.textContent || undefined,
      thumbnail: thumbnailElement?.textContent || undefined,
      yearPublished: yearElement ? parseInt(yearElement.getAttribute('value') || '0') : undefined,
      minPlayers: minPlayersElement ? parseInt(minPlayersElement.getAttribute('value') || '0') : undefined,
      maxPlayers: maxPlayersElement ? parseInt(maxPlayersElement.getAttribute('value') || '0') : undefined,
      playingTime: playingTimeElement ? parseInt(playingTimeElement.getAttribute('value') || '0') : undefined
    }
  } catch (error) {
    console.warn(`BGG details fetch failed for ID ${id}:`, error)
    return null
  }
}

// Get combined game database (static + cached)
function getCombinedGameDatabase(): BoardGame[] {
  return [...ALL_GAMES, ...dynamicGameCache]
}

// Search for board games by name (local first, then external API fallback)
export async function searchBoardGames(query: string, includeExternal: boolean = false): Promise<BGGSearchResult[]> {
  if (!query.trim()) return []
  
  console.log(`[searchBoardGames] Original query: "${query}" -> searchTerm: "${query.toLowerCase()}"`)
  
  // First: Search local database + cache for instant results
  const searchTerm = query.toLowerCase()
  const allGames = getCombinedGameDatabase()
  const localResults = allGames.filter(game => {
    // Search in main name
    if (game.name.toLowerCase().includes(searchTerm)) {
      return true
    }
    
    // Search in aliases
    if (game.aliases) {
      return game.aliases.some(alias => 
        alias.toLowerCase().includes(searchTerm)
      )
    }
    
    return false
  })
  
  // If we found local results, return them
  if (localResults.length > 0) {
    return localResults.slice(0, 10).map(game => ({
      id: game.id,
      name: game.name,
      yearPublished: game.yearPublished
    }))
  }
  
  // If no local results and external search requested, try BGG API
  if (includeExternal) {
    const externalResults = await searchBGGExternal(query)
    return externalResults
  }
  
  return []
}

// Separate function for external search only (used by search component)
export async function searchBoardGamesExternal(query: string): Promise<BGGSearchResult[]> {
  if (!query.trim()) return []
  console.log(`[searchBoardGamesExternal] Searching for: "${query}" (length: ${query.length})`)
  
  // Try the exact query first
  let results = await searchBGGExternal(query)
  console.log(`[searchBoardGamesExternal] Found ${results.length} results for exact query "${query}"`)
  
  // If no results and query is long enough, try partial search
  if (results.length === 0 && query.length > 6) {
    const partialQuery = query.substring(0, Math.ceil(query.length * 0.7)) // Use 70% of the query
    console.log(`[searchBoardGamesExternal] Trying partial search: "${partialQuery}"`)
    const partialResults = await searchBGGExternal(partialQuery)
    
    // Filter partial results to only include ones that actually contain the full query
    const filteredResults = partialResults.filter(result => 
      result.name.toLowerCase().includes(query.toLowerCase())
    )
    console.log(`[searchBoardGamesExternal] Found ${filteredResults.length} filtered results from ${partialResults.length} partial results`)
    results = filteredResults
  }
  
  console.log(`[searchBoardGamesExternal] Final results for "${query}":`, results)
  return results
}

// Get detailed board game information including images (local first, then external)
export async function getBoardGameDetails(id: string): Promise<BoardGame | null> {
  // First: Check local database + cache
  const allGames = getCombinedGameDatabase()
  const localGame = allGames.find(game => game.id === id)
  if (localGame) {
    return localGame
  }
  
  // If not found locally, try BGG API and cache the result
  const externalGame = await getBGGGameDetails(id)
  if (externalGame) {
    addToCache(externalGame)
  }
  return externalGame
}

// Get a random selection of popular games
export function getPopularGames(count: number = 5): BoardGame[] {
  const shuffled = [...POPULAR_GAMES].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Create a board game object from search result
export async function createBoardGameFromSearch(searchResult: BGGSearchResult): Promise<BoardGame> {
  const details = await getBoardGameDetails(searchResult.id)
  if (details) {
    return details
  }
  
  // If no detailed info available, create basic game object and cache it
  // Prioritize image over thumbnail, but use thumbnail as fallback for image field
  const basicGame: BoardGame = {
    id: searchResult.id,
    name: searchResult.name,
    yearPublished: searchResult.yearPublished,
    image: searchResult.image || searchResult.thumbnail, // Use thumbnail as image fallback
    thumbnail: searchResult.thumbnail
  }
  
  // Cache this basic info for future searches
  addToCache(basicGame)
  console.log(`Created basic game for "${basicGame.name}" with image:`, basicGame.image)
  return basicGame
}

// Load images for search results progressively
export async function loadSearchResultImages(results: BGGSearchResult[]): Promise<BGGSearchResult[]> {
  const imagePromises = results.map(async (result, index) => {
    // Add delay to stagger requests (prevent overwhelming BGG API)
    await new Promise(resolve => setTimeout(resolve, index * 200))
    
    try {
      const details = await getBGGGameDetails(result.id)
      if (details?.thumbnail) {
        return {
          ...result,
          thumbnail: details.thumbnail,
          image: details.image
        }
      }
    } catch (error) {
      console.warn(`Failed to load image for ${result.name}:`, error)
    }
    
    return result
  })
  
  return Promise.all(imagePromises)
}

// Cache management functions
export function getCacheStats() {
  return {
    cached: dynamicGameCache.length,
    static: ALL_GAMES.length,
    total: getCombinedGameDatabase().length
  }
}

export function clearGameCache() {
  dynamicGameCache = []
  if (typeof window !== 'undefined') {
    localStorage.removeItem('bgg-game-cache')
  }
  console.log('Game cache cleared')
}

export function exportGameCache(): BoardGame[] {
  return [...dynamicGameCache]
}

// Create a custom game and add it to cache
export function createCustomGame(name: string): BoardGame {
  const customGame: BoardGame = {
    id: `custom-${Date.now()}`, // Unique ID for custom games
    name: name.trim(),
    image: undefined, // No image for custom games
    thumbnail: undefined,
    yearPublished: new Date().getFullYear(), // Current year
    minPlayers: 1, // Default values
    maxPlayers: 8,
    playingTime: 60
  }
  
  // Add to cache so it's available for future searches
  addToCache(customGame)
  console.log(`Created custom game: "${customGame.name}" with ID: ${customGame.id}`)
  
  return customGame
}

// Load images for popular games dynamically while maintaining order
export async function loadPopularGameImages(
  games: BoardGame[], 
  onUpdate?: (updatedGames: BoardGame[]) => void
): Promise<BoardGame[]> {
  // Create a results array to maintain order
  const results = [...games]
  
  // Process each game sequentially to maintain order
  for (let i = 0; i < games.length; i++) {
    const game = games[i]
    
    // Skip if already has image
    if (game.image) {
      continue
    }
    
    // Add delay to stagger requests (prevent overwhelming BGG API)
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    try {
      const details = await getBGGGameDetails(game.id)
      if (details?.thumbnail) {
        // Update the specific game in the results array
        results[i] = {
          ...game,
          thumbnail: details.thumbnail,
          image: details.image
        }
        
        // Call update callback if provided (for progressive updates)
        if (onUpdate) {
          onUpdate([...results])
        }
      }
    } catch (error) {
      console.warn(`Failed to load image for ${game.name}:`, error)
    }
  }
  
  console.log(`Loaded images for ${results.filter(g => g.image).length}/${games.length} popular games`)
  return results
}