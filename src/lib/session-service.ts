import { supabase } from './supabase'
import type { Session, CurrentGame, SessionParticipant } from '@/types/database'

export interface CreateSessionData {
  hostName: string
  sessionCode: string
}

export interface AddGameData {
  sessionId: string
  gameName: string
  addedBy: string
  gameImage?: string
  bggId?: string
}

export interface JoinSessionData {
  sessionId: string
  participantName: string
}

// Session Management
export async function createSession({ hostName, sessionCode }: CreateSessionData) {
  const { data, error } = await supabase
    .from('sessions')
    .insert([
      {
        host_name: hostName,
        session_code: sessionCode,
        status: 'active'
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data as Session
}

export async function getSession(sessionCode: string) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('session_code', sessionCode)
    .eq('status', 'active')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw error
  }
  return data as Session
}

export async function endSession(sessionId: string) {
  const { data, error } = await supabase
    .from('sessions')
    .update({ 
      status: 'ended',
      ended_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) throw error
  return data as Session
}

// Game Management
export async function addGameToSession({ sessionId, gameName, addedBy, gameImage, bggId }: AddGameData) {
  // Create insert object - only include bgg_id if supported
  const insertData: Record<string, unknown> = {
    session_id: sessionId,
    game_name: gameName,
    added_by: addedBy,
    game_image: gameImage
  }
  
  // Only add bgg_id if it's provided (database might not have this column yet)
  if (bggId) {
    insertData.bgg_id = bggId
  }

  const { data, error } = await supabase
    .from('current_games')
    .insert([insertData])
    .select()
    .single()

  if (error) throw error
  return data as CurrentGame
}

export async function getSessionGames(sessionId: string) {
  const { data, error } = await supabase
    .from('current_games')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as CurrentGame[]
}

export async function removeGameFromSession(gameId: string) {
  const { error } = await supabase
    .from('current_games')
    .delete()
    .eq('id', gameId)

  if (error) throw error
}

export async function clearSessionGames(sessionId: string) {
  const { error } = await supabase
    .from('current_games')
    .delete()
    .eq('session_id', sessionId)

  if (error) throw error
}

// Participant Management
export async function joinSession({ sessionId, participantName }: JoinSessionData) {
  // Check if participant already exists in this session
  const { data: existing } = await supabase
    .from('session_participants')
    .select('*')
    .eq('session_id', sessionId)
    .eq('participant_name', participantName)
    .single()

  if (existing) {
    return existing as SessionParticipant
  }

  // Add new participant
  const { data, error } = await supabase
    .from('session_participants')
    .insert([
      {
        session_id: sessionId,
        participant_name: participantName
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data as SessionParticipant
}

export async function getSessionParticipants(sessionId: string) {
  const { data, error } = await supabase
    .from('session_participants')
    .select('*')
    .eq('session_id', sessionId)
    .order('joined_at', { ascending: true })

  if (error) throw error
  return data as SessionParticipant[]
}

// Utility Functions
export function generateSessionCode(): string {
  // Generate a 6-character alphanumeric code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function isSessionCodeAvailable(sessionCode: string): Promise<boolean> {
  const session = await getSession(sessionCode)
  return session === null
}

export async function generateUniqueSessionCode(): Promise<string> {
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    const code = generateSessionCode()
    const isAvailable = await isSessionCodeAvailable(code)
    
    if (isAvailable) {
      return code
    }
    
    attempts++
  }
  
  // Fallback: generate a longer code with timestamp
  return generateSessionCode() + Date.now().toString().slice(-3)
}