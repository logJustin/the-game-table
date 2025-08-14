'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import type { Session, CurrentGame, SessionParticipant } from '@/types/database'
import * as sessionService from '@/lib/session-service'

interface SessionState {
  session: Session | null
  games: CurrentGame[]
  participants: SessionParticipant[]
  playerName: string
  isHost: boolean
  loading: boolean
  error: string | null
}

interface SessionContextType extends SessionState {
  createSession: (hostName: string) => Promise<void>
  joinSession: (sessionCode: string, playerName: string) => Promise<void>
  endSession: () => Promise<void>
  addGame: (gameName: string, gameImage?: string, bggId?: string) => Promise<void>
  removeGame: (gameId: string) => Promise<void>
  clearGames: () => Promise<void>
  setPlayerName: (name: string) => void
  resetSession: () => void
}

type SessionAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SESSION'; payload: Session }
  | { type: 'SET_GAMES'; payload: CurrentGame[] }
  | { type: 'ADD_GAME'; payload: CurrentGame }
  | { type: 'REMOVE_GAME'; payload: string }
  | { type: 'CLEAR_GAMES' }
  | { type: 'SET_PARTICIPANTS'; payload: SessionParticipant[] }
  | { type: 'ADD_PARTICIPANT'; payload: SessionParticipant }
  | { type: 'SET_PLAYER_NAME'; payload: string }
  | { type: 'SET_IS_HOST'; payload: boolean }
  | { type: 'RESET_SESSION' }

const initialState: SessionState = {
  session: null,
  games: [],
  participants: [],
  playerName: '',
  isHost: false,
  loading: false,
  error: null
}

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SET_SESSION':
      return { ...state, session: action.payload }
    case 'SET_GAMES':
      return { ...state, games: action.payload }
    case 'ADD_GAME':
      return { ...state, games: [...state.games, action.payload] }
    case 'REMOVE_GAME':
      return { ...state, games: state.games.filter(game => game.id !== action.payload) }
    case 'CLEAR_GAMES':
      return { ...state, games: [] }
    case 'SET_PARTICIPANTS':
      return { ...state, participants: action.payload }
    case 'ADD_PARTICIPANT':
      return { ...state, participants: [...state.participants, action.payload] }
    case 'SET_PLAYER_NAME':
      return { ...state, playerName: action.payload }
    case 'SET_IS_HOST':
      return { ...state, isHost: action.payload }
    case 'RESET_SESSION':
      return initialState
    default:
      return state
  }
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState)

  // Load player name from localStorage on mount
  useEffect(() => {
    const savedPlayerName = localStorage.getItem('gameTablePlayerName')
    if (savedPlayerName) {
      dispatch({ type: 'SET_PLAYER_NAME', payload: savedPlayerName })
    }
  }, [])

  const createSession = async (hostName: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const sessionCode = await sessionService.generateUniqueSessionCode()
      const session = await sessionService.createSession({ hostName, sessionCode })
      
      // Join as host
      await sessionService.joinSession({ sessionId: session.id, participantName: hostName })
      
      dispatch({ type: 'SET_SESSION', payload: session })
      dispatch({ type: 'SET_PLAYER_NAME', payload: hostName })
      dispatch({ type: 'SET_IS_HOST', payload: true })
      
      localStorage.setItem('gameTablePlayerName', hostName)
      localStorage.setItem('gameTableSessionId', session.id)
      localStorage.setItem('gameTableSessionCode', session.session_code)
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create session' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const joinSession = async (sessionCode: string, playerName: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const session = await sessionService.getSession(sessionCode)
      if (!session) {
        throw new Error('Session not found or has ended')
      }

      await sessionService.joinSession({ sessionId: session.id, participantName: playerName })
      
      // Load existing games and participants
      const [games, participants] = await Promise.all([
        sessionService.getSessionGames(session.id),
        sessionService.getSessionParticipants(session.id)
      ])

      dispatch({ type: 'SET_SESSION', payload: session })
      dispatch({ type: 'SET_GAMES', payload: games })
      dispatch({ type: 'SET_PARTICIPANTS', payload: participants })
      dispatch({ type: 'SET_PLAYER_NAME', payload: playerName })
      dispatch({ type: 'SET_IS_HOST', payload: session.host_name === playerName })
      
      localStorage.setItem('gameTablePlayerName', playerName)
      localStorage.setItem('gameTableSessionId', session.id)
      localStorage.setItem('gameTableSessionCode', session.session_code)
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to join session' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const endSession = async () => {
    if (!state.session || !state.isHost) return

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      await sessionService.endSession(state.session.id)
      resetSession()
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to end session' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const addGame = async (gameName: string, gameImage?: string, bggId?: string) => {
    if (!state.session || !state.playerName) return

    try {
      const game = await sessionService.addGameToSession({
        sessionId: state.session.id,
        gameName,
        addedBy: state.playerName,
        gameImage,
        bggId
      })
      
      dispatch({ type: 'ADD_GAME', payload: game })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add game' })
    }
  }

  const removeGame = async (gameId: string) => {
    try {
      await sessionService.removeGameFromSession(gameId)
      dispatch({ type: 'REMOVE_GAME', payload: gameId })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to remove game' })
    }
  }

  const clearGames = async () => {
    if (!state.session) return

    try {
      await sessionService.clearSessionGames(state.session.id)
      dispatch({ type: 'CLEAR_GAMES' })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to clear games' })
    }
  }

  const setPlayerName = (name: string) => {
    dispatch({ type: 'SET_PLAYER_NAME', payload: name })
    localStorage.setItem('gameTablePlayerName', name)
  }

  const resetSession = () => {
    dispatch({ type: 'RESET_SESSION' })
    localStorage.removeItem('gameTableSessionId')
    localStorage.removeItem('gameTableSessionCode')
  }

  return (
    <SessionContext.Provider
      value={{
        ...state,
        createSession,
        joinSession,
        endSession,
        addGame,
        removeGame,
        clearGames,
        setPlayerName,
        resetSession
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}