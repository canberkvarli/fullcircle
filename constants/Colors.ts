/**
 * Spiritual & Meditative Color Palette
 * Inspired by earthy, calming tones for a spiritual dating app
 * Updated with better contrast ratios for improved text visibility
 */

import { TextStyle } from 'react-native';

const tintColorLight = '#7B6B5C'; // Warm brown
const tintColorDark = '#F5E6D3'; // Warm cream

export const Colors = {
  light: {
    // Core colors
    text: '#FFFFFF', // Pure white for better contrast over video
    textDark: '#3D3B37', // Dark charcoal for light backgrounds
    background: '#FAF8F5', // Warm off-white
    tint: tintColorLight,
    icon: '#8B7B6B',
    tabIconDefault: '#A09080',
    tabIconSelected: tintColorLight,
    
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
    
    // Text variations - IMPROVED FOR BETTER VISIBILITY
    textLight: '#6B5B4F', // Much darker for better contrast against light backgrounds
    textMuted: '#8B7B6B', // Darker muted text that's actually readable
    textSubtle: '#A09080', // For very subtle text that still needs to be readable
    
    // Gradients (for special elements)
    gradientStart: '#7B6B5C',
    gradientEnd: '#C4A984',

    shadow: 'rgba(0, 0, 0, 0.1)', // Slightly darker shadow for better contrast
  },
  dark: {
    // Core colors
    text: '#F5E6D3', // Warm cream
    textDark: '#F5E6D3', // Light cream for dark backgrounds
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
    
    // Text variations - IMPROVED FOR BETTER VISIBILITY
    textLight: '#E5D4B1', // Much lighter for better contrast against dark backgrounds
    textMuted: '#C4A984', // Lighter muted text that's actually readable
    textSubtle: '#A09080', // For very subtle text that still needs to be readable
    
    // Gradients (for special elements)
    gradientStart: '#C4A984',
    gradientEnd: '#7B6B5C',

    shadow: 'rgba(255, 255, 255, 0.1)', // Slightly lighter shadow for better contrast
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
    '5xl': 48,
  },
  // Use proper TypeScript types for font weights
  weights: {
    light: '300' as TextStyle['fontWeight'],
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
  },
  fonts: {
    // Main UI fonts (Nunito)
    light: 'Nunito-Light',
    regular: 'Nunito-Regular',
    medium: 'Nunito-Medium',
    semibold: 'Nunito-SemiBold',
    bold: 'Nunito-Bold',
    
    // Spiritual fonts (Quicksand)
    spiritualLight: 'Quicksand-Light',
    spiritualRegular: 'Quicksand-Regular',
    spiritualMedium: 'Quicksand-Medium',
    spiritualSemiBold: 'Quicksand-SemiBold',
    spiritualBold: 'Quicksand-Bold',
    
    // Elegant fonts (Raleway)
    elegantLight: 'Raleway-Light',
    elegantRegular: 'Raleway-Regular',
    elegantMedium: 'Raleway-Medium',
    elegantSemiBold: 'Raleway-SemiBold',
    elegantBold: 'Raleway-Bold',
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

// USAGE GUIDE FOR BETTER TEXT VISIBILITY:
// 
// For subtitles, descriptions, and secondary text:
// - Use colors.textLight (now much more visible)
//
// For muted/helper text that still needs to be readable:
// - Use colors.textMuted (now properly readable)
//
// For very subtle text that should be barely visible:
// - Use colors.textSubtle (for disclaimers, etc.)
//
// For emphasis and important text:
// - Use colors.primary (always has good contrast)
//
// For main content text:
// - Use colors.textDark (optimal contrast)