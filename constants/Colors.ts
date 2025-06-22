/**
 * Spiritual & Meditative Color Palette
 * Inspired by earthy, calming tones for a spiritual dating app
 */

const tintColorLight = '#7B6B5C'; // Warm brown
const tintColorDark = '#F5E6D3'; // Warm cream

export const Colors = {
  light: {
    // Core colors
    text: '#FFFFFF', // Pure white for better contrast over video
    background: '#FAF8F5', // Warm off-white
    tint: tintColorLight,
    icon: '#8B7B6B',
    tabIconDefault: '#A09080',
    tabIconSelected: tintColorLight,
    textDark: '#3D3B37', // Dark text for better readability
    
    // Primary palette - earthy & calming
    primary: '#7B6B5C', // Warm brown (main CTA)
    secondary: '#C4A984', // Soft tan
    tertiary: '#E5D4B1', // Light beige
    
    // Accent colors
    accent: '#9B8F7F', // Muted taupe
    accentLight: '#D4C8B8', // Light taupe
    
    // Semantic colors
    success: '#7D8471', // Sage green
    warning: '#D4A574', // Warm amber
    error: '#C17767', // Dusty rose
    info: '#8B95A7', // Soft blue-gray
    
    // UI elements
    border: '#E8E0D5',
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.4)', // Lighter overlay for better text visibility
    
    // Text variations
    textLight: '#F5F5F5', // Very light for better readability
    textMuted: '#E0E0E0', // Lighter muted text
    
    // Gradients (for special elements)
    gradientStart: '#7B6B5C',
    gradientEnd: '#C4A984',
  },
  dark: {
    // Core colors
    text: '#F5E6D3', // Warm cream
    background: '#1A1815', // Deep charcoal
    tint: tintColorDark,
    icon: '#C4A984',
    tabIconDefault: '#8B7B6B',
    tabIconSelected: tintColorDark,
    
    // Primary palette - earthy & calming
    primary: '#C4A984', // Soft tan (main CTA)
    secondary: '#7B6B5C', // Warm brown
    tertiary: '#3D3B37', // Dark charcoal
    
    // Accent colors
    accent: '#D4C8B8', // Light taupe
    accentLight: '#9B8F7F', // Muted taupe
    
    // Semantic colors
    success: '#9BA88C', // Light sage
    warning: '#E5C399', // Light amber
    error: '#D49A8C', // Light dusty rose
    info: '#A5AFBF', // Light blue-gray
    
    // UI elements
    border: '#2D2B27',
    card: '#252320',
    overlay: 'rgba(0, 0, 0, 0.6)', // Balanced overlay for dark mode
    
    // Text variations
    textLight: '#F0F0F0', // Brighter for better visibility
    textMuted: '#D0D0D0', // Lighter muted text
    
    // Gradients (for special elements)
    gradientStart: '#C4A984',
    gradientEnd: '#7B6B5C',
  },
};

// Typography scale for consistent sizing
export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  // Recommended fonts for spiritual/meditative feel:
  // iOS: 'Avenir Next', 'Helvetica Neue'
  // Android: 'Roboto', 'sans-serif'
  // Or use custom fonts like 'Nunito', 'Montserrat', 'Poppins'
  fonts: {
    light: 'System',
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  }
};

// Spacing scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

// Border radius scale
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};