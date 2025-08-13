export interface Session {
  id: string
  host_name: string
  session_code: string
  status: 'active' | 'ended'
  created_at: string
  ended_at: string | null
  notes: string | null
}

export interface CurrentGame {
  id: string
  session_id: string
  game_name: string
  added_by: string
  created_at: string
}

export interface GameLog {
  id: string
  session_id: string
  game_name: string
  winner: string | null
  duration_minutes: number | null
  played_at: string
  notes: string | null
}

export interface SessionParticipant {
  id: string
  session_id: string
  participant_name: string
  joined_at: string
}