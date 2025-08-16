import { supabase } from './supabase'
import type { AvailableGame, GameLog } from '@/types/database'

export interface AddGameData {
  gameName: string
  gameImage?: string
  bggId?: string
}

export interface LogGameData {
  gameName: string
  winner: string
  players: string[]
  durationMinutes?: number
  notes?: string
}

// Available Games Management (persistent shared games)
export async function getAvailableGames(): Promise<AvailableGame[]> {
  const { data, error } = await supabase
    .from('available_games')
    .select('*')
    .order('game_name', { ascending: true })

  if (error) throw error
  return data || []
}

export async function addAvailableGame({ gameName, gameImage, bggId }: AddGameData): Promise<AvailableGame> {
  // Check if game already exists
  const { data: existing } = await supabase
    .from('available_games')
    .select('*')
    .eq('game_name', gameName)
    .single()

  if (existing) {
    throw new Error(`"${gameName}" is already in the game library`)
  }

  const insertData: Record<string, unknown> = {
    game_name: gameName,
    game_image: gameImage
  }
  
  if (bggId) {
    insertData.bgg_id = bggId
  }

  const { data, error } = await supabase
    .from('available_games')
    .insert([insertData])
    .select()
    .single()

  if (error) throw error
  return data as AvailableGame
}

export async function removeAvailableGame(gameId: string): Promise<void> {
  const { error } = await supabase
    .from('available_games')
    .delete()
    .eq('id', gameId)

  if (error) throw error
}

// Game Logs Management
export async function getGameLogs(): Promise<GameLog[]> {
  const { data, error } = await supabase
    .from('game_logs')
    .select('*')
    .order('played_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function logGame({ gameName, winner, players, durationMinutes, notes }: LogGameData): Promise<GameLog> {
  const { data, error } = await supabase
    .from('game_logs')
    .insert([
      {
        game_name: gameName,
        winner,
        players,
        duration_minutes: durationMinutes,
        notes,
        played_at: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data as GameLog
}

export async function deleteGameLog(logId: string): Promise<void> {
  const { error } = await supabase
    .from('game_logs')
    .delete()
    .eq('id', logId)

  if (error) throw error
}

// Utility functions
export function formatDuration(minutes: number | null): string {
  if (!minutes) return 'Duration not recorded'
  
  if (minutes < 60) {
    return `${minutes} min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours} hr`
  }
  
  return `${hours} hr ${remainingMinutes} min`
}

export function formatPlayersText(players: string[]): string {
  if (players.length <= 2) {
    return players.join(' & ')
  }
  
  const lastPlayer = players[players.length - 1]
  const otherPlayers = players.slice(0, -1)
  return `${otherPlayers.join(', ')} & ${lastPlayer}`
}

export function formatDatePlayed(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) {
    return 'Today'
  } else if (diffInDays === 1) {
    return 'Yesterday'
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`
  } else {
    return date.toLocaleDateString()
  }
}