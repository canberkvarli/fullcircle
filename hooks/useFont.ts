// hooks/useFont.ts
import { Typography } from '@/constants/Colors';

export const useFont = () => {
  const getFont = (weight: keyof typeof Typography.fonts) => ({
    fontFamily: Typography.fonts[weight],
  });

  const getFontStyle = (
    size: keyof typeof Typography.sizes,
    weight: keyof typeof Typography.fonts
  ) => ({
    fontSize: Typography.sizes[size],
    fontFamily: Typography.fonts[weight],
  });

  return {
    getFont,
    getFontStyle,
    
    // Regular UI fonts (Nunito)
    titleFont: getFontStyle('4xl', 'bold'),
    subtitleFont: getFontStyle('lg', 'light'),
    bodyFont: getFontStyle('base', 'regular'),
    buttonFont: getFontStyle('base', 'semibold'),
    captionFont: getFontStyle('sm', 'medium'),
    inputFont: getFontStyle('base', 'regular'),
    
    // Spiritual fonts (Quicksand) - for affirmations, special text
    spiritualTitleFont: getFontStyle('4xl', 'spiritualBold'),
    spiritualSubtitleFont: getFontStyle('lg', 'spiritualLight'),
    affirmationFont: getFontStyle('lg', 'spiritualLight'),
    spiritualBodyFont: getFontStyle('base', 'spiritualRegular'),
    
    // Elegant fonts (Raleway) - for premium feel
    elegantTitleFont: getFontStyle('4xl', 'elegantBold'),
    elegantSubtitleFont: getFontStyle('lg', 'elegantLight'),
    elegantBodyFont: getFontStyle('base', 'elegantRegular'),
    
    // Modal fonts
    modalTitleFont: getFontStyle('xl', 'semibold'),
    modalBodyFont: getFontStyle('base', 'regular'),
    
    // Special logo font (for "Circle" title)
    logoFont: getFontStyle('5xl', 'spiritualRegular'),
  };
};