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

export interface CurrentSelection {
  id: number
  selected_game_id: string | null
  selected_game_name: string | null
  selected_game_image: string | null
  selected_game_bgg_id: string | null
  updated_at: string
}