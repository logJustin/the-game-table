'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Game {
  id: string
  name: string
  addedBy: string
  image?: string
  bggId?: string
}

interface GameSpinnerProps {
  games: Game[]
  onGameSelected?: (game: Game) => void | Promise<void>
  disabled?: boolean
}

export default function GameSpinner({ 
  games, 
  onGameSelected, 
  disabled = false 
}: GameSpinnerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [rotation, setRotation] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Canvas dimensions
  const CANVAS_SIZE = 400
  const WHEEL_RADIUS = 180
  const CENTER_RADIUS = 20
  const RIM_WIDTH = 8

  // Color palette from the implementation guide
  const colors = {
    woodBrown: '#4A3429',
    leatherDark: '#2C1810', 
    leatherLight: '#5C4033',
    brassGold: '#B8860B',
    brassDark: '#996F00',
    parchment: '#F5F5DC',
    inkDark: '#2F1B14'
  }

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    
    const centerX = CANVAS_SIZE / 2
    const centerY = CANVAS_SIZE / 2

    // Only draw if we have games
    if (games.length === 0) {
      // Draw empty wheel
      drawEmptyWheel(ctx, centerX, centerY)
      return
    }

    const segmentAngle = (2 * Math.PI) / games.length

    // Draw game segments
    games.forEach((game, index) => {
      const startAngle = (index * segmentAngle) + (rotation * Math.PI / 180)
      const endAngle = ((index + 1) * segmentAngle) + (rotation * Math.PI / 180)
      
      drawGameSegment(ctx, centerX, centerY, startAngle, endAngle, game, index)
    })

    // Draw brass rim
    drawBrassRim(ctx, centerX, centerY)
    
    // Draw center hub
    drawCenterHub(ctx, centerX, centerY)
    
    // Draw pointer
    drawPointer(ctx, centerX, centerY)

  }, [games, rotation])

  const drawEmptyWheel = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    // Draw base wooden circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, WHEEL_RADIUS, 0, 2 * Math.PI)
    ctx.fillStyle = colors.woodBrown
    ctx.fill()

    // Add wood grain texture effect
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, WHEEL_RADIUS)
    gradient.addColorStop(0, 'rgba(92, 64, 51, 0.3)')
    gradient.addColorStop(0.5, 'rgba(44, 24, 16, 0.1)')
    gradient.addColorStop(1, 'rgba(44, 24, 16, 0.4)')
    
    ctx.fillStyle = gradient
    ctx.fill()

    // Add text indicating empty state
    ctx.fillStyle = colors.parchment
    ctx.font = '18px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Add games to spin!', centerX, centerY)
  }

  const drawGameSegment = (
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    startAngle: number, 
    endAngle: number, 
    game: Game, 
    index: number
  ) => {
    // Alternating wood stain colors
    const isLightWood = index % 2 === 0
    const baseColor = isLightWood ? colors.leatherLight : colors.woodBrown
    
    // Draw segment background
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, WHEEL_RADIUS, startAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = baseColor
    ctx.fill()

    // Add wood grain effect
    const gradient = ctx.createRadialGradient(centerX, centerY, CENTER_RADIUS, centerX, centerY, WHEEL_RADIUS)
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    gradient.addColorStop(0.7, isLightWood ? 'rgba(92, 64, 51, 0.2)' : 'rgba(44, 24, 16, 0.2)')
    gradient.addColorStop(1, isLightWood ? 'rgba(92, 64, 51, 0.4)' : 'rgba(44, 24, 16, 0.4)')
    
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw segment border
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(
      centerX + Math.cos(startAngle) * WHEEL_RADIUS,
      centerY + Math.sin(startAngle) * WHEEL_RADIUS
    )
    ctx.strokeStyle = colors.leatherDark
    ctx.lineWidth = 1
    ctx.stroke()

    // Calculate position for text content
    const contentAngle = (startAngle + endAngle) / 2
    const textRadius = WHEEL_RADIUS * 0.6  // Optimal position for text readability
    const textX = centerX + Math.cos(contentAngle) * textRadius
    const textY = centerY + Math.sin(contentAngle) * textRadius

    // Text-only rendering with smart wrapping
    ctx.save()
    ctx.translate(textX, textY)
    ctx.rotate(contentAngle + (contentAngle > Math.PI / 2 && contentAngle < 3 * Math.PI / 2 ? Math.PI : 0))
    
    ctx.fillStyle = colors.parchment
    ctx.font = 'bold 14px serif'  // Larger font for better readability
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Add text shadow for better readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    ctx.shadowBlur = 3
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1
    
    // Smart text wrapping and display
    const words = game.name.split(' ')
    const maxLineLength = 20  // Increased character limit for single line
    
    if (game.name.length <= maxLineLength) {
      // Single line if it fits
      ctx.fillText(game.name, 0, 0)
    } else if (words.length > 1) {
      // Try to wrap on word boundaries
      let line1 = ''
      let line2 = ''
      
      for (const word of words) {
        if (line1.length === 0) {
          line1 = word
        } else if ((line1 + ' ' + word).length <= maxLineLength) {
          line1 += ' ' + word
        } else {
          line2 = words.slice(words.indexOf(word)).join(' ')
          break
        }
      }
      
      // Truncate second line if too long
      if (line2.length > maxLineLength) {
        line2 = line2.substring(0, maxLineLength - 3) + '...'
      }
      
      // Draw two lines with proper spacing
      ctx.fillText(line1, 0, -9)
      ctx.fillText(line2, 0, 9)
    } else {
      // Single long word - truncate with ellipsis
      const displayName = game.name.substring(0, maxLineLength - 3) + '...'
      ctx.fillText(displayName, 0, 0)
    }
    
    ctx.restore()
  }

  const drawBrassRim = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    // Outer brass rim
    ctx.beginPath()
    ctx.arc(centerX, centerY, WHEEL_RADIUS + RIM_WIDTH, 0, 2 * Math.PI)
    ctx.arc(centerX, centerY, WHEEL_RADIUS, 0, 2 * Math.PI, true)
    
    // Brass gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, WHEEL_RADIUS, centerX, centerY, WHEEL_RADIUS + RIM_WIDTH)
    gradient.addColorStop(0, colors.brassGold)
    gradient.addColorStop(0.5, '#DAA520')
    gradient.addColorStop(1, colors.brassDark)
    
    ctx.fillStyle = gradient
    ctx.fill()
  }

  const drawCenterHub = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    // Brass center hub
    ctx.beginPath()
    ctx.arc(centerX, centerY, CENTER_RADIUS, 0, 2 * Math.PI)
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, CENTER_RADIUS)
    gradient.addColorStop(0, '#DAA520')
    gradient.addColorStop(0.7, colors.brassGold)
    gradient.addColorStop(1, colors.brassDark)
    
    ctx.fillStyle = gradient
    ctx.fill()

    // Add shine highlight
    ctx.beginPath()
    ctx.arc(centerX - 8, centerY - 8, CENTER_RADIUS * 0.4, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.fill()
  }

  const drawPointer = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    const pointerLength = 60  // Made longer for better visibility
    const pointerWidth = 30   // Made wider for prominence
    const pointerTipLength = 35  // Length of the pointed tip

    ctx.save()
    // Position at right side of wheel (90 degrees), pointing left into segments
    ctx.translate(centerX + WHEEL_RADIUS + 5, centerY)
    ctx.rotate(Math.PI / 2)  // Rotate 90 degrees to point left

    // Main pointer body with clean shape
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(pointerWidth / 2, pointerLength - pointerTipLength)
    ctx.lineTo(8, pointerLength - pointerTipLength)  // Create narrower tip
    ctx.lineTo(0, pointerLength)  // Sharp point
    ctx.lineTo(-8, pointerLength - pointerTipLength)
    ctx.lineTo(-pointerWidth / 2, pointerLength - pointerTipLength)
    ctx.closePath()
    
    // Clean gold gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, pointerLength)
    gradient.addColorStop(0, '#FFD700')  // Bright gold at base
    gradient.addColorStop(0.5, colors.brassGold)
    gradient.addColorStop(1, colors.brassDark)  // Darker gold at tip
    
    ctx.fillStyle = gradient
    ctx.fill()

    // Clean outline for definition
    ctx.strokeStyle = colors.brassDark
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.restore()
  }

  const spin = useCallback(() => {
    if (games.length === 0 || disabled || isAnimating) return

    setIsAnimating(true)
    
    // Random spin: 3-6 full rotations plus random final position
    const fullRotations = 3 + Math.random() * 3
    const finalPosition = Math.random() * 360
    const totalRotation = fullRotations * 360 + finalPosition
    
    const currentRotation = rotation
    const duration = 3000 + Math.random() * 2000 // 3-5 seconds
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for realistic spin-down
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      const newRotation = currentRotation + (totalRotation * easeOut)
      setRotation(newRotation % 360)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
        
        // Determine selected game
        const normalizedRotation = (360 - (newRotation % 360)) % 360
        const segmentAngle = 360 / games.length
        const selectedIndex = Math.floor(normalizedRotation / segmentAngle)
        const selectedGame = games[selectedIndex % games.length]
        
        if (onGameSelected && selectedGame) {
          // Handle both sync and async callbacks
          const result = onGameSelected(selectedGame)
          if (result instanceof Promise) {
            result.catch(error => console.warn('Error in game selection callback:', error))
          }
        }
      }
    }

    animate()
  }, [games, rotation, disabled, isAnimating, onGameSelected])

  // Handle touch/click
  const handleInteraction = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    // Only prevent default for touch events to avoid passive listener issues
    if ('touches' in event) {
      event.preventDefault()
    }
    spin()
  }, [spin])

  // Draw wheel whenever dependencies change
  useEffect(() => {
    drawWheel()
  }, [drawWheel])

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="w-full flex flex-col items-center justify-center gap-6">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className={`
          ${disabled ? 'opacity-50' : 'cursor-pointer'} 
          ${isAnimating ? 'pointer-events-none' : ''}
          transition-opacity duration-200
        `}
        onMouseDown={handleInteraction}
        onTouchStart={handleInteraction}
        style={{ 
          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
          width: '320px',
          height: '320px'
        }}
      />
      
      <button
        onClick={spin}
        disabled={disabled || isAnimating || games.length === 0}
        className={`
          px-6 py-3 rounded-lg font-serif font-bold text-base
          transition-all duration-200 transform
          ${disabled || isAnimating || games.length === 0
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-b from-yellow-400 to-yellow-600 text-yellow-900 hover:from-yellow-300 hover:to-yellow-500 active:scale-95 shadow-lg hover:shadow-xl'
          }
        `}
        style={{
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
          boxShadow: disabled || isAnimating ? 'none' : '0 4px 8px rgba(184, 134, 11, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
        }}
      >
        {isAnimating ? 'Spinning...' : games.length === 0 ? 'Add Games First' : 'Spin the Wheel!'}
      </button>
    </div>
  )
}