'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to spinner page as the primary entry point for collaborative game selection
    router.replace('/spinner')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ 
      backgroundColor: '#2C1810',
      backgroundImage: `
        linear-gradient(45deg, rgba(74, 52, 41, 0.1) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(74, 52, 41, 0.1) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(74, 52, 41, 0.1) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(74, 52, 41, 0.1) 75%)
      `,
      backgroundSize: '60px 60px'
    }}>
      <div className="text-center">
        <div className="text-4xl mb-4">🎲</div>
        <div style={{ color: '#F5F5DC' }}>Redirecting to Game Spinner...</div>
      </div>
    </div>
  )
}
