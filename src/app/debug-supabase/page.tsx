'use client'

import { supabase } from '@/lib/supabase'

export default function DebugSupabase() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
      `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 
      'NOT SET'
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#2C1810' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center" style={{ color: '#F5F5DC' }}>
          Supabase Debug Info
        </h1>
        
        <div className="space-y-6">
          {/* Environment Variables */}
          <div className="p-6 rounded-lg" style={{
            backgroundColor: 'rgba(92, 64, 51, 0.3)',
            border: '1px solid #5C4033'
          }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#F5F5DC' }}>
              Environment Variables
            </h2>
            <div className="space-y-2 font-mono text-sm" style={{ color: '#E6DDD4' }}>
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong> <span className="break-all">{value || 'NOT SET'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supabase Client Info */}
          <div className="p-6 rounded-lg" style={{
            backgroundColor: 'rgba(92, 64, 51, 0.3)',
            border: '1px solid #5C4033'
          }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#F5F5DC' }}>
              Supabase Client
            </h2>
            <div className="space-y-2 font-mono text-sm" style={{ color: '#E6DDD4' }}>
              <div><strong>Client exists:</strong> {supabase ? 'Yes' : 'No'}</div>
              {supabase && (
                <>
                  <div><strong>Client Type:</strong> SupabaseClient</div>
                  <div><strong>Status:</strong> Initialized</div>
                </>
              )}
            </div>
          </div>

          {/* Quick Test Button */}
          <div className="p-6 rounded-lg" style={{
            backgroundColor: 'rgba(92, 64, 51, 0.3)',
            border: '1px solid #5C4033'
          }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#F5F5DC' }}>
              Quick Actions
            </h2>
            <div className="flex gap-4 flex-wrap">
              <a
                href="/connectivity-test"
                className="px-4 py-2 rounded transition-colors duration-200"
                style={{
                  backgroundColor: 'rgba(30, 144, 255, 0.2)',
                  color: '#1E90FF',
                  textDecoration: 'none'
                }}
              >
                🔗 Test Connectivity
              </a>
              <a
                href="/env-test"
                className="px-4 py-2 rounded transition-colors duration-200"
                style={{
                  backgroundColor: 'rgba(184, 134, 11, 0.2)',
                  color: '#B8860B',
                  textDecoration: 'none'
                }}
              >
                ⚙️ Environment Test
              </a>
              <a
                href="/db-test"
                className="px-4 py-2 rounded transition-colors duration-200"
                style={{
                  backgroundColor: 'rgba(34, 139, 34, 0.2)',
                  color: '#228B22',
                  textDecoration: 'none'
                }}
              >
                💾 Full Database Test
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}