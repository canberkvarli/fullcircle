import { Typography } from '@/constants/Colors';
import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');
const screenWidth = Math.min(width, height);
const screenHeight = Math.max(width, height);

// Base sizes are calibrated for a medium-sized device (iPhone 11 Pro/X - 375pt width)
const baseWidth = 375;

export const useFont = () => {
  // Calculate scale factor based on screen width
  const scale = screenWidth / baseWidth;
  
  // Normalize font size with a gentle curve for different screen sizes
  const normalize = (size: number): number => {
    const newSize = size * scale;
    
    // Different scaling for iOS and Android
    if (Platform.OS === 'ios') {
      // Less aggressive scaling for iOS
      return Math.round(PixelRatio.roundToNearestPixel(newSize));
    } else {
      // More capped scaling for Android
      return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1;
    }
  };

  // Get scaled font size from Typography.sizes
  const getScaledSize = (size: keyof typeof Typography.sizes): number => {
    const baseSize = Typography.sizes[size];
    
    // Apply gentle scaling only to screens significantly smaller or larger than base
    if (screenWidth < 320) {
      // Extra small screens (iPhone SE 1st gen, etc)
      return normalize(baseSize * 0.85);
    } else if (screenWidth > 480) {
      // Tablets or large phones
      // Cap the maximum size to avoid overly large text on tablets
      return Math.min(normalize(baseSize * 1.1), baseSize * 1.3);
    }
    
    // For mid-sized screens, keep closer to original size
    return baseSize;
  };

  const getFont = (weight: keyof typeof Typography.fonts) => ({
    fontFamily: Typography.fonts[weight],
  });

  const getFontStyle = (
    size: keyof typeof Typography.sizes,
    weight: keyof typeof Typography.fonts
  ) => ({
    fontSize: getScaledSize(size),
    fontFamily: Typography.fonts[weight],
    // Add a consistent line height relative to font size for better text layout
    lineHeight: getScaledSize(size) * 1.3,
  });

  // Determine if we're on a small device to potentially adjust certain styles
  const isSmallDevice = screenHeight < 700;

  return {
    getFont,
    getFontStyle,
    isSmallDevice,
    
    // Regular UI fonts (Nunito)
    titleFont: getFontStyle('4xl', 'bold'),
    subtitleFont: getFontStyle('lg', 'light'),
    bodyFont: getFontStyle('base', 'regular'),
    buttonFont: getFontStyle('base', 'semibold'),
    captionFont: getFontStyle('sm', 'medium'),
    inputFont: getFontStyle('base', 'regular'),
    italicFont: getFontStyle('base', 'italic'),
    
    // Spiritual fonts (Quicksand) - for affirmations, special text
    spiritualTitleFont: getFontStyle('4xl', 'spiritualBold'),
    spiritualSubtitleFont: getFontStyle('lg', 'spiritualLight'),
    affirmationFont: getFontStyle('lg', 'spiritualLight'),
    spiritualBodyFont: getFontStyle('base', 'spiritualRegular'),
    
    // Elegant fonts (Raleway) - for premium feel
    elegantTitleFont: getFontStyle('4xl', 'elegantBold'),
    elegantSubtitleFont: getFontStyle('lg', 'elegantLight'),
    elegantBodyFont: getFontStyle('base', 'elegantRegular'),
    elegantItalicFont: getFontStyle('base', 'elegantItalic'),
    
    // Modal fonts
    modalTitleFont: getFontStyle('xl', 'semibold'),
    modalBodyFont: getFontStyle('base', 'regular'),
    
    // Special logo font (for "Circle" title)
    logoTitleFont: getFontStyle('6xl', 'main'),

    // New custom title fonts using Jury Duty and High Empathy
    // More Jury Duty font options (all sizes)
    juryDutyLargeTitleFont: getFontStyle('7xl', 'juryDuty'),
    juryDutyTitleFont: getFontStyle('4xl', 'juryDuty'),
    juryDutySubtitleFont: getFontStyle('2xl', 'juryDuty'),
    juryDutyBodyFont: getFontStyle('lg', 'juryDuty'),
    juryDutyBaseFont: getFontStyle('base', 'juryDuty'),
    juryDutyButtonFont: getFontStyle('base', 'juryDuty'),
    juryDutyCaptionFont: getFontStyle('sm', 'juryDuty'),
    juryDutySmallFont: getFontStyle('xs', 'juryDuty'),

    // More High Empathy font options (all sizes)
    highEmpathyLargeTitleFont: getFontStyle('7xl', 'highEmpathy'),
    highEmpathyTitleFont: getFontStyle('3xl', 'highEmpathy'),
    highEmpathySubtitleFont: getFontStyle('xl', 'highEmpathy'),
    highEmpathyBodyFont: getFontStyle('base', 'highEmpathy'),
    highEmpathyBaseFont: getFontStyle('base', 'highEmpathy'),
    highEmpathyButtonFont: getFontStyle('base', 'highEmpathy'),
    highEmpathyCaptionFont: getFontStyle('sm', 'highEmpathy'),
    highEmpathySmallFont: getFontStyle('xs', 'highEmpathy'),

    logoSubtitleFont: getFontStyle('xl', 'main'),
    logoTextFont: getFontStyle('3xl', 'main'),
    logoBodyFont: getFontStyle('base', 'main'),
    logoButtonFont: getFontStyle('base', 'main'),
  };
};