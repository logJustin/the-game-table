// Simplified schema for the new approach
export interface AvailableGame {
  id: string
  game_name: string
  game_image?: string
  bgg_id?: string
  created_at: string
}

export interface GameLog {
  id: string
  game_name: string
  winner: string
  players: string[]
  duration_minutes: number | null
  played_at: string
  notes: string | null
}