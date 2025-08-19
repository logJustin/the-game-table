// Centralized color palette for The Game Table
// Based on tabletop gaming aesthetic with warm wood, leather, and brass tones

export const colors = {
  // Primary Colors - Burgundy for destructive actions
  burgundy: {
    primary: '#8B1538',
    dark: '#6B0F2A', 
    light: '#A5486B'
  },

  // Wood & Leather Tones - Main backgrounds and surfaces
  wood: {
    brown: '#4A3429',
    dark: '#2C1810',    // leather-dark - main background
    light: '#5C4033'    // leather-light - elevated surfaces
  },

  // Accent Colors - Brass for highlights and interactive elements
  brass: {
    gold: '#B8860B',    // Primary accent
    light: '#DAA520',   // Active states, selections
    dark: '#996F00'     // Darker variant
  },

  // Text & Content Colors
  text: {
    primary: '#F5F5DC',    // parchment - main text
    secondary: '#E6DDD4',  // parchment-aged - secondary text
    dark: '#2F1B14'        // ink-dark - dark text on light backgrounds
  },

  // Semantic Colors
  success: {
    primary: '#228B22',
    dark: '#006400'
  },

  error: {
    primary: '#DC3545',
    background: 'rgba(220, 53, 69, 0.2)',
    text: '#F8D7DA'
  },

  // Utility Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  disabled: {
    background: '#6C757D',
    backgroundDark: '#495057',
    text: '#E6DDD4'
  }
} as const

// Helper functions for consistent color usage
export const getBackgroundColor = (elevated = false) => 
  elevated ? colors.wood.light : colors.wood.dark

export const getBorderColor = () => colors.wood.light

export const getTextColor = (variant: 'primary' | 'secondary' | 'dark' = 'primary') => 
  colors.text[variant]

export const getAccentColor = (state: 'default' | 'active' | 'dark' = 'default') => {
  switch (state) {
    case 'active': return colors.brass.light
    case 'dark': return colors.brass.dark
    default: return colors.brass.gold
  }
}

export const getButtonColors = (variant: 'primary' | 'success' | 'danger' | 'secondary' = 'primary') => {
  switch (variant) {
    case 'success':
      return {
        background: `linear-gradient(to bottom, ${colors.success.primary}, ${colors.success.dark})`,
        color: colors.text.primary
      }
    case 'danger':
      return {
        background: `linear-gradient(to bottom, ${colors.burgundy.primary}, ${colors.burgundy.dark})`,
        color: colors.text.primary
      }
    case 'secondary':
      return {
        background: `rgba(108, 117, 125, 0.2)`,
        border: '1px solid #6C757D',
        color: colors.text.secondary
      }
    default:
      return {
        background: `linear-gradient(to bottom, ${colors.brass.gold}, ${colors.brass.dark})`,
        color: colors.text.dark
      }
  }
}