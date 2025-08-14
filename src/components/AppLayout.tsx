'use client'

import { ReactNode } from 'react'
import Navigation from './Navigation'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Main content with proper spacing */}
      <main className="md:pl-64">
        <div className="pt-16 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  )
}