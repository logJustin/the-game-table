'use client'

export default function EnvTest() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#2C1810' }}>
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8" style={{ color: '#F5F5DC' }}>
          Environment Variables Test
        </h1>
        
        <div className="space-y-4 p-6 rounded-lg" style={{
          backgroundColor: 'rgba(92, 64, 51, 0.3)',
          border: '1px solid #5C4033',
          color: '#F5F5DC'
        }}>
          <div>
            <strong>Supabase URL:</strong>
            <br />
            <code className="text-sm break-all">
              {supabaseUrl || 'NOT FOUND'}
            </code>
          </div>
          
          <div>
            <strong>Supabase Anon Key:</strong>
            <br />
            <code className="text-sm break-all">
              {supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT FOUND'}
            </code>
          </div>
          
          <div className="mt-6">
            <strong>Status:</strong>
            <br />
            <span className={supabaseUrl && supabaseKey ? 'text-green-400' : 'text-red-400'}>
              {supabaseUrl && supabaseKey ? '✅ Environment variables loaded' : '❌ Missing environment variables'}
            </span>
          </div>
        </div>
        
        <div className="mt-6">
          <a
            href="/session"
            className="inline-block px-6 py-2 rounded transition-colors duration-200"
            style={{
              backgroundColor: 'rgba(184, 134, 11, 0.2)',
              color: '#B8860B',
              textDecoration: 'underline'
            }}
          >
            ← Back to Session Page
          </a>
        </div>
      </div>
    </div>
  )
}