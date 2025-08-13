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
  onGameSelected?: (game: Game) => void
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
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map())

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

    // Calculate position for content (image or text)
    const contentAngle = (startAngle + endAngle) / 2
    const imageRadius = WHEEL_RADIUS * 0.65
    const textRadius = WHEEL_RADIUS * 0.8
    const imageX = centerX + Math.cos(contentAngle) * imageRadius
    const imageY = centerY + Math.sin(contentAngle) * imageRadius
    const textX = centerX + Math.cos(contentAngle) * textRadius
    const textY = centerY + Math.sin(contentAngle) * textRadius

    // Try to draw game image
    const gameImage = game.image ? loadedImages.get(game.image) : null
    
    if (gameImage) {
      ctx.save()
      
      // Create clipping path for the image area
      const imageSize = 60
      ctx.beginPath()
      ctx.arc(imageX, imageY, imageSize / 2, 0, 2 * Math.PI)
      ctx.clip()
      
      // Draw image
      ctx.drawImage(
        gameImage, 
        imageX - imageSize / 2, 
        imageY - imageSize / 2, 
        imageSize, 
        imageSize
      )
      
      ctx.restore()
      
      // Draw image border
      ctx.beginPath()
      ctx.arc(imageX, imageY, imageSize / 2, 0, 2 * Math.PI)
      ctx.strokeStyle = colors.brassGold
      ctx.lineWidth = 2
      ctx.stroke()
      
      // Draw game name below image
      ctx.save()
      ctx.translate(textX, textY)
      ctx.rotate(contentAngle + (contentAngle > Math.PI / 2 && contentAngle < 3 * Math.PI / 2 ? Math.PI : 0))
      
      ctx.fillStyle = colors.parchment
      ctx.font = 'bold 11px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Add text shadow for better readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'
      ctx.shadowBlur = 3
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1
      
      // Truncate long game names
      const maxLength = 12
      const displayName = game.name.length > maxLength 
        ? game.name.substring(0, maxLength) + '...' 
        : game.name
      
      ctx.fillText(displayName, 0, 0)
      ctx.restore()
    } else {
      // Fallback: draw text only (original behavior)
      ctx.save()
      ctx.translate(textX, textY)
      ctx.rotate(contentAngle + (contentAngle > Math.PI / 2 && contentAngle < 3 * Math.PI / 2 ? Math.PI : 0))
      
      ctx.fillStyle = colors.parchment
      ctx.font = 'bold 14px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Add text shadow for better readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'
      ctx.shadowBlur = 3
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1
      
      // Truncate long game names
      const maxLength = 15
      const displayName = game.name.length > maxLength 
        ? game.name.substring(0, maxLength) + '...' 
        : game.name
      
      ctx.fillText(displayName, 0, 0)
      ctx.restore()
    }
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

    // Add metallic shine effect
    ctx.beginPath()
    ctx.arc(centerX - 20, centerY - 20, WHEEL_RADIUS + RIM_WIDTH - 2, 0, Math.PI / 3)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 3
    ctx.stroke()
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
    const pointerLength = 40
    const pointerWidth = 20

    ctx.save()
    ctx.translate(centerX, centerY - WHEEL_RADIUS - 10)

    // Pointer shadow
    ctx.beginPath()
    ctx.moveTo(2, 2)
    ctx.lineTo(pointerWidth / 2 + 2, -pointerLength + 2)
    ctx.lineTo(-pointerWidth / 2 + 2, -pointerLength + 2)
    ctx.closePath()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fill()

    // Main pointer
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(pointerWidth / 2, -pointerLength)
    ctx.lineTo(-pointerWidth / 2, -pointerLength)
    ctx.closePath()
    
    const gradient = ctx.createLinearGradient(0, 0, 0, -pointerLength)
    gradient.addColorStop(0, colors.brassDark)
    gradient.addColorStop(0.5, colors.brassGold)
    gradient.addColorStop(1, '#DAA520')
    
    ctx.fillStyle = gradient
    ctx.fill()

    // Pointer outline
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
          onGameSelected(selectedGame)
        }
      }
    }

    animate()
  }, [games, rotation, disabled, isAnimating, onGameSelected])

  // Handle touch/click
  const handleInteraction = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault()
    spin()
  }, [spin])

  // Load images when games change
  useEffect(() => {
    const loadImages = async () => {
      const newLoadedImages = new Map<string, HTMLImageElement>()
      
      for (const game of games) {
        if (game.image && !loadedImages.has(game.image)) {
          try {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            
            await new Promise<void>((resolve) => {
              img.onload = () => {
                newLoadedImages.set(game.image!, img)
                resolve()
              }
              img.onerror = () => {
                console.warn(`Failed to load image for ${game.name}:`, game.image)
                resolve() // Don't reject, just skip this image
              }
              img.src = game.image!
            })
          } catch (error) {
            console.warn(`Error loading image for ${game.name}:`, error)
          }
        }
      }
      
      if (newLoadedImages.size > 0) {
        setLoadedImages(prev => new Map([...prev, ...newLoadedImages]))
      }
    }

    loadImages()
  }, [games, loadedImages])

  // Draw wheel whenever dependencies change
  useEffect(() => {
    drawWheel()
  }, [drawWheel, loadedImages])

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className={`
            max-w-full h-auto 
            ${disabled ? 'opacity-50' : 'cursor-pointer'} 
            ${isAnimating ? 'pointer-events-none' : ''}
            transition-opacity duration-200
          `}
          onMouseDown={handleInteraction}
          onTouchStart={handleInteraction}
          style={{ 
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
            maxWidth: '90vw',
            maxHeight: '90vw'
          }}
        />
        
        {isAnimating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg font-serif">
              Spinning...
            </div>
          </div>
        )}
      </div>
      
      <button
        onClick={spin}
        disabled={disabled || isAnimating || games.length === 0}
        className={`
          mt-6 px-8 py-3 rounded-lg font-serif font-bold text-lg
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