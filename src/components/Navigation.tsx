'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: string
  isSubItem?: boolean
}

interface NavGroup {
  label: string
  icon: string
  items: NavItem[]
  isExpanded?: boolean
}

const mainNavItems: NavItem[] = [
  { href: '/logs', label: 'Game Logs', icon: '📋' },
  { href: '/spinner', label: 'Game Spinner', icon: '🎯' },
  { href: '/search-test', label: 'Game Library', icon: '🔍' }
]

const testNavGroup: NavGroup = {
  label: 'Development Tools',
  icon: '🧪',
  items: [
    { href: '/connectivity-test', label: 'Connectivity', icon: '🔗', isSubItem: true },
    { href: '/db-test', label: 'Database Test', icon: '💾', isSubItem: true },
    { href: '/schema-check', label: 'Schema Check', icon: '🏗️', isSubItem: true },
    { href: '/schema-fix', label: 'Schema Fix', icon: '🔧', isSubItem: true },
    { href: '/env-test', label: 'Env Test', icon: '⚙️', isSubItem: true },
    { href: '/debug-supabase', label: 'Debug Info', icon: '🐛', isSubItem: true }
  ]
}

// Check if we're in development/local environment (server-safe)
const isDevelopment = process.env.NODE_ENV === 'development'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isTestGroupExpanded, setIsTestGroupExpanded] = useState(false)
  const pathname = usePathname()
  
  // Check if current path is in test group
  const isInTestGroup = testNavGroup.items.some(item => item.href === pathname)
  
  // Auto-expand test group if we're on a test page
  React.useEffect(() => {
    if (isInTestGroup && isDevelopment) {
      setIsTestGroupExpanded(true)
    }
  }, [isInTestGroup, isDevelopment])

  return (
    <>
      {/* Mobile Menu Button - Fixed top-left */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-3 rounded-lg transition-all duration-200 md:hidden"
        style={{
          backgroundColor: 'rgba(92, 64, 51, 0.9)',
          border: '1px solid #5C4033',
          color: '#F5F5DC',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="w-6 h-6 flex flex-col justify-center">
          <div
            className={`w-full h-0.5 bg-current transition-all duration-200 ${
              isOpen ? 'rotate-45 translate-y-1' : ''
            }`}
            style={{ backgroundColor: '#F5F5DC' }}
          />
          <div
            className={`w-full h-0.5 bg-current mt-1 transition-all duration-200 ${
              isOpen ? 'opacity-0' : ''
            }`}
            style={{ backgroundColor: '#F5F5DC' }}
          />
          <div
            className={`w-full h-0.5 bg-current mt-1 transition-all duration-200 ${
              isOpen ? '-rotate-45 -translate-y-1' : ''
            }`}
            style={{ backgroundColor: '#F5F5DC' }}
          />
        </div>
      </button>

      {/* Desktop Sidebar - Hidden on mobile */}
      <nav className="hidden md:fixed md:top-0 md:left-0 md:h-full md:w-64 md:flex md:flex-col z-40"
        style={{
          backgroundColor: 'rgba(44, 24, 16, 0.95)',
          borderRight: '1px solid #5C4033',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: '#5C4033' }}>
          <h2 className="text-xl font-bold" style={{ 
            fontFamily: 'serif',
            color: '#F5F5DC'
          }}>
            The Game Table
          </h2>
          <p className="text-sm mt-1" style={{ color: '#E6DDD4' }}>
            Navigation
          </p>
        </div>

        <div className="flex-1 py-6">
          {/* Main navigation items */}
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 transition-all duration-200 ${
                  isActive ? 'border-r-2' : 'hover:translate-x-1'
                }`}
                style={{
                  color: isActive ? '#DAA520' : '#F5F5DC',
                  backgroundColor: isActive ? 'rgba(218, 165, 32, 0.1)' : 'transparent',
                  borderColor: isActive ? '#DAA520' : 'transparent'
                }}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}

          {/* Development Tools - Only show in development */}
          {isDevelopment && (
            <>
              <button
                onClick={() => setIsTestGroupExpanded(!isTestGroupExpanded)}
                className={`w-full flex items-center gap-3 px-6 py-3 transition-all duration-200 hover:translate-x-1 ${
                  isInTestGroup ? 'border-r-2' : ''
                }`}
                style={{
                  color: isInTestGroup ? '#DAA520' : '#F5F5DC',
                  backgroundColor: isInTestGroup ? 'rgba(218, 165, 32, 0.1)' : 'transparent',
                  borderColor: isInTestGroup ? '#DAA520' : 'transparent'
                }}
              >
                <span className="text-lg">{testNavGroup.icon}</span>
                <span className="font-medium flex-1 text-left">{testNavGroup.label}</span>
                <span className={`transition-transform duration-200 ${isTestGroupExpanded ? 'rotate-90' : ''}`}>
                  ▶
                </span>
              </button>

              {/* Development tools items */}
              {isTestGroupExpanded && testNavGroup.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 pl-12 pr-6 py-2 transition-all duration-200 ${
                      isActive ? 'border-r-2' : 'hover:translate-x-1'
                    }`}
                    style={{
                      color: isActive ? '#DAA520' : '#E6DDD4',
                      backgroundColor: isActive ? 'rgba(218, 165, 32, 0.1)' : 'transparent',
                      borderColor: isActive ? '#DAA520' : 'transparent'
                    }}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                )
              })}
            </>
          )}
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Slide-out Menu */}
      <nav
        className={`fixed top-0 left-0 h-full w-80 max-w-[80vw] flex flex-col z-40 transform transition-transform duration-300 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: 'rgba(44, 24, 16, 0.98)',
          borderRight: '1px solid #5C4033',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: '#5C4033' }}>
          <h2 className="text-xl font-bold" style={{ 
            fontFamily: 'serif',
            color: '#F5F5DC'
          }}>
            The Game Table
          </h2>
          <p className="text-sm mt-1" style={{ color: '#E6DDD4' }}>
            Navigation Menu
          </p>
        </div>

        <div className="flex-1 py-6 overflow-y-auto">
          {/* Main navigation items */}
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 transition-all duration-200 ${
                  isActive ? 'border-r-2' : ''
                }`}
                style={{
                  color: isActive ? '#DAA520' : '#F5F5DC',
                  backgroundColor: isActive ? 'rgba(218, 165, 32, 0.1)' : 'transparent',
                  borderColor: isActive ? '#DAA520' : 'transparent'
                }}
              >
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  {item.href === '/logs' && (
                    <div className="text-xs opacity-75">Game History & Winners</div>
                  )}
                  {item.href === '/spinner' && (
                    <div className="text-xs opacity-75">Interactive Game Wheel</div>
                  )}
                  {item.href === '/search-test' && (
                    <div className="text-xs opacity-75">Browse & Search Games</div>
                  )}
                </div>
                {isActive && (
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#DAA520' }} />
                )}
              </Link>
            )
          })}

          {/* Development Tools - Only show in development */}
          {isDevelopment && (
            <>
              <button
                onClick={() => setIsTestGroupExpanded(!isTestGroupExpanded)}
                className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-200 ${
                  isInTestGroup ? 'border-r-2' : ''
                }`}
                style={{
                  color: isInTestGroup ? '#DAA520' : '#F5F5DC',
                  backgroundColor: isInTestGroup ? 'rgba(218, 165, 32, 0.1)' : 'transparent',
                  borderColor: isInTestGroup ? '#DAA520' : 'transparent'
                }}
              >
                <span className="text-xl">{testNavGroup.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{testNavGroup.label}</div>
                  <div className="text-xs opacity-75">Development Tools</div>
                </div>
                <span className={`transition-transform duration-200 ${isTestGroupExpanded ? 'rotate-90' : ''}`}>
                  ▶
                </span>
              </button>

              {/* Development tools items */}
              {isTestGroupExpanded && testNavGroup.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 pl-12 pr-6 py-3 transition-all duration-200 ${
                      isActive ? 'border-r-2' : ''
                    }`}
                    style={{
                      color: isActive ? '#DAA520' : '#E6DDD4',
                      backgroundColor: isActive ? 'rgba(218, 165, 32, 0.1)' : 'transparent',
                      borderColor: isActive ? '#DAA520' : 'transparent'
                    }}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs opacity-75">Dev Tool</div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#DAA520' }} />
                    )}
                  </Link>
                )
              })}
            </>
          )}
        </div>

        <div className="p-6 border-t" style={{ borderColor: '#5C4033' }}>
          <div className="text-xs" style={{ color: '#E6DDD4' }}>
            📋 View game logs and winners
            <br />
            🎯 Spin the wheel to choose games
            <br />
            🔍 Browse the game library
            {isDevelopment && (
              <>
                <br />
                🧪 Development tools available
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}