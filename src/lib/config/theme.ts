/**
 * Professional DeFi Design System Configuration
 * Based on leading DeFi platforms like Uniswap, Aave, and Compound
 */

export const professionalTheme = {
  colors: {
    // Primary dark theme based on leading DeFi platforms
    background: {
      primary: '#0B0E11',      // Deep dark background
      secondary: '#161B22',    // Card backgrounds
      tertiary: '#21262D'      // Elevated surfaces
    },
    
    // Professional blue/purple accent system
    accent: {
      primary: '#2E5BFF',      // Primary blue (similar to Uniswap)
      secondary: '#7C3AED',    // Purple accent
      tertiary: '#06FFA5'      // Success green
    },
    
    // Professional text hierarchy
    text: {
      primary: '#F0F6FF',      // High contrast white
      secondary: '#8B949E',    // Muted text
      tertiary: '#6E7681'      // Subtle text
    },
    
    // Status colors for crypto data
    status: {
      success: '#06FFA5',      // Positive metrics
      warning: '#FFB800',      // Neutral/warning
      error: '#FF4747',        // Negative/error
      info: '#2E5BFF'          // Information
    }
  },
  
  typography: {
    // Professional font stack
    fontFamily: {
      primary: 'var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      mono: 'var(--font-jetbrains-mono), JetBrains Mono, Consolas, monospace'
    },
    
    // Professional sizing scale
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem'
    },
    
    // Professional font weights
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    
    // Professional line heights
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },
  
  // Professional spacing and layout
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  
  // Professional border radius
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem'
  },
  
  // Professional shadows for depth
  boxShadow: {
    professional: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    'professional-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    'professional-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    'glow-blue': '0 0 20px rgba(46, 91, 255, 0.3)',
    'glow-purple': '0 0 20px rgba(124, 58, 237, 0.3)'
  },
  
  // Professional animation timings
  animation: {
    duration: {
      fast: '0.15s',
      normal: '0.2s',
      slow: '0.3s'
    },
    easing: {
      easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
      easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
    }
  }
} as const;

// Type definitions for theme
export type ProfessionalTheme = typeof professionalTheme;
export type ThemeColors = typeof professionalTheme.colors;
export type ThemeTypography = typeof professionalTheme.typography;

// Utility functions for theme usage
export const getThemeColor = (path: string): string => {
  const keys = path.split('.');
  let value: unknown = professionalTheme.colors;
  
  for (const key of keys) {
    if (typeof value === 'object' && value !== null && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return '';
    }
  }
  
  return typeof value === 'string' ? value : '';
};

// CSS variable helpers
export const cssVar = (name: string): string => `var(--${name})`;

// Professional gradient utilities
export const gradients = {
  primary: 'linear-gradient(135deg, #2E5BFF 0%, #7C3AED 100%)',
  secondary: 'linear-gradient(135deg, #7C3AED 0%, #2E5BFF 100%)',
  success: 'linear-gradient(135deg, #06FFA5 0%, #2E5BFF 100%)',
  card: 'linear-gradient(135deg, rgba(22, 27, 34, 0.8) 0%, rgba(33, 38, 45, 0.6) 100%)'
} as const;

// Professional breakpoints for responsive design
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// Professional z-index scale
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060
} as const;