import { useColorScheme, Appearance, Platform, StatusBar } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useEffect, useState } from 'react';

// Enhanced theme hook with device appearance monitoring
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  // Use state to track the theme and update components when it changes
  const [theme, setTheme] = useState(useColorScheme() ?? 'light');
  
  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme ?? 'light');
      
      // Update StatusBar when theme changes
      if (Platform.OS === 'android') {
        StatusBar.setBarStyle(colorScheme === 'dark' ? 'light-content' : 'dark-content');
      }
    });
    
    return () => subscription.remove();
  }, []);

  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

// Convenience hook to get all theme colors at once with reactive updates
export function useTheme() {
  const [colorScheme, setColorScheme] = useState(useColorScheme() ?? 'light');
  
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
      setColorScheme(newColorScheme ?? 'light');
    });
    
    return () => subscription.remove();
  }, []);
  
  return {
    colors: Colors[colorScheme],
    colorScheme,
    isDark: colorScheme === 'dark',
    
    // Add convenient access to common color combinations
    text: {
      primary: Colors[colorScheme].text,
      secondary: Colors[colorScheme].textLight,
      muted: Colors[colorScheme].textMuted,
      subtle: Colors[colorScheme].textSubtle,
    },
    
    background: {
      primary: Colors[colorScheme].background,
      secondary: Colors[colorScheme].tertiary,
      card: Colors[colorScheme].card,
    },
    
    // Helper for creating alpha versions of colors
    alpha: (color: string, opacity: number) => {
      // Extract RGB components
      let r, g, b;
      if (color.startsWith('#')) {
        // Handle hex
        const hex = color.replace('#', '');
        if (hex.length === 3) {
          r = parseInt(hex[0] + hex[0], 16);
          g = parseInt(hex[1] + hex[1], 16);
          b = parseInt(hex[2] + hex[2], 16);
        } else {
          r = parseInt(hex.substring(0, 2), 16);
          g = parseInt(hex.substring(2, 4), 16);
          b = parseInt(hex.substring(4, 6), 16);
        }
      } else if (color.startsWith('rgb')) {
        // Handle rgb/rgba
        const components = color.match(/\d+/g);
        if (components && components.length >= 3) {
          r = parseInt(components[0], 10);
          g = parseInt(components[1], 10);
          b = parseInt(components[2], 10);
        } else {
          return color; // Fallback if format is unrecognized
        }
      } else {
        return color; // Fallback for other formats
      }
      
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  };
}