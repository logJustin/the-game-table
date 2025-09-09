import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Perform lightweight queries to keep database active
    const startTime = Date.now()
    
    // Query multiple tables to ensure full database activity
    const [
      availableGamesResult,
      gameLogsResult,
      currentGamesResult
    ] = await Promise.all([
      supabase.from('available_games').select('count', { count: 'exact', head: true }),
      supabase.from('game_logs').select('count', { count: 'exact', head: true }),
      supabase.from('current_games').select('count', { count: 'exact', head: true })
    ])

    const endTime = Date.now()
    const responseTime = endTime - startTime

    // Check for any errors
    const errors = [
      availableGamesResult.error,
      gameLogsResult.error,
      currentGamesResult.error
    ].filter(Boolean)

    if (errors.length > 0) {
      return NextResponse.json({
        status: 'error',
        message: 'Database health check failed',
        errors: errors.map(e => e?.message),
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    // Return success response
    return NextResponse.json({
      status: 'healthy',
      message: 'Database connection active',
      tables: {
        available_games: availableGamesResult.count || 0,
        game_logs: gameLogsResult.count || 0,
        current_games: currentGamesResult.count || 0
      },
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Also support HEAD requests for even lighter checks
export async function HEAD() {
  try {
    // Just test basic connectivity
    const { error } = await supabase
      .from('available_games')
      .select('count', { count: 'exact', head: true })

    if (error) {
      return new NextResponse(null, { status: 500 })
    }

    return new NextResponse(null, { status: 200 })
  } catch {
    return new NextResponse(null, { status: 500 })
  }
}