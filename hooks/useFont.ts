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

  // Special function for Spirituality font with enhanced styling since it only has one weight
  const getSpiritualityStyle = (
    size: keyof typeof Typography.sizes,
    variant: 'default' | 'enhanced' | 'vibrant' | 'affirmation' = 'default'
  ) => {
    const fontSize = getScaledSize(size);
    const baseStyle = {
      fontSize,
      fontFamily: Typography.fonts.spirituality,
      lineHeight: fontSize * 1.3,
    };

    // Use different styling techniques to create visual hierarchy since we can't use font weights
    switch (variant) {
      case 'enhanced':
        return {
          ...baseStyle,
          letterSpacing: 0.8,
          textShadowColor: 'rgba(0, 0, 0, 0.1)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        };
      case 'vibrant':
        return {
          ...baseStyle,
          letterSpacing: 1.2,
          textShadowColor: 'rgba(0, 0, 0, 0.15)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 3,
        };
      case 'affirmation':
        return {
          ...baseStyle,
          letterSpacing: 1.5,
          textShadowColor: 'rgba(0, 0, 0, 0.2)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4,
        };
      default:
        return baseStyle;
    }
  };

  // Determine if we're on a small device to potentially adjust certain styles
  const isSmallDevice = screenHeight < 700;

  return {
    getFont,
    getFontStyle,
    getSpiritualityStyle,
    isSmallDevice,
    
    // 🎯 MAIN THEME: Spirituality Font - Primary spiritual content
    // Since Spirituality font only has one weight, we use size + styling variations
    spiritualityHeroFont: getSpiritualityStyle('7xl', 'affirmation'),
    spiritualityMegaTitleFont: getSpiritualityStyle('6xl', 'affirmation'),
    spiritualityLargeTitleFont: getSpiritualityStyle('5xl', 'affirmation'),
    spiritualityTitleFont: getSpiritualityStyle('4xl', 'vibrant'),
    
    // Bolder, more vibrant subtitles and affirmations using enhanced styling
    spiritualityBoldSubtitleFont: getSpiritualityStyle('3xl', 'enhanced'),
    spiritualitySubtitleFont: getSpiritualityStyle('2xl', 'enhanced'),
    spiritualityHeadingFont: getSpiritualityStyle('xl', 'enhanced'),
    
    // Body text with spiritual feel
    spiritualityBodyFont: getSpiritualityStyle('lg', 'default'),
    spiritualityBaseFont: getSpiritualityStyle('base', 'default'),
    spiritualityButtonFont: getSpiritualityStyle('base', 'enhanced'),
    
    // Caption and small text
    spiritualityCaptionFont: getSpiritualityStyle('sm', 'default'),
    spiritualitySmallFont: getSpiritualityStyle('xs', 'default'),
    
    // 🎨 ENHANCED: Bolder, more vibrant variants for subtitles and affirmations
    spiritualityVibrantTitleFont: getSpiritualityStyle('4xl', 'vibrant'),
    spiritualityVibrantSubtitleFont: getSpiritualityStyle('3xl', 'vibrant'),
    spiritualityVibrantHeadingFont: getSpiritualityStyle('2xl', 'vibrant'),
    spiritualityVibrantBodyFont: getSpiritualityStyle('lg', 'vibrant'),
    
    // 🌟 AFFIRMATION FONTS: Extra bold and vibrant for affirmations
    spiritualityAffirmationFont: getSpiritualityStyle('2xl', 'affirmation'),
    spiritualityAffirmationLargeFont: getSpiritualityStyle('3xl', 'affirmation'),
    spiritualityAffirmationHeroFont: getSpiritualityStyle('4xl', 'affirmation'),
    
    // Regular UI fonts (Nunito) - Secondary to Spirituality
    titleFont: getFontStyle('4xl', 'bold'),
    subtitleFont: getFontStyle('lg', 'light'),
    bodyFont: getFontStyle('base', 'regular'),
    buttonFont: getFontStyle('base', 'semibold'),
    captionFont: getFontStyle('sm', 'medium'),
    inputFont: getFontStyle('base', 'regular'),
    italicFont: getFontStyle('base', 'italic'),
    
    // Spiritual fonts (Quicksand) - Tertiary, for variety
    spiritualTitleFont: getFontStyle('4xl', 'spiritualBold'),
    spiritualLargeTitleFont: getFontStyle('3xl', 'spiritualBold'),
    spiritualSubtitleFont: getFontStyle('lg', 'spiritualLight'),
    affirmationFont: getFontStyle('lg', 'spiritualLight'),
    spiritualBodyFont: getFontStyle('base', 'spiritualRegular'),
    
    // Elegant fonts (Raleway) - For premium feel
    elegantTitleFont: getFontStyle('4xl', 'elegantBold'),
    elegantSubtitleFont: getFontStyle('lg', 'elegantLight'),
    elegantBodyFont: getFontStyle('base', 'elegantRegular'),
    elegantItalicFont: getFontStyle('base', 'elegantItalic'),
    
    // Modal fonts
    modalTitleFont: getFontStyle('xl', 'semibold'),
    modalBodyFont: getFontStyle('base', 'regular'),
    
    // Custom fonts (Jury Duty and High Empathy) - For special accents
    juryDutyLargeTitleFont: getFontStyle('7xl', 'juryDuty'),
    juryDutyTitleFont: getFontStyle('4xl', 'juryDuty'),
    juryDutySubtitleFont: getFontStyle('2xl', 'juryDuty'),
    juryDutyBodyFont: getFontStyle('lg', 'juryDuty'),
    juryDutyBaseFont: getFontStyle('base', 'juryDuty'),
    juryDutyButtonFont: getFontStyle('base', 'juryDuty'),
    juryDutyCaptionFont: getFontStyle('sm', 'juryDuty'),
    juryDutySmallFont: getFontStyle('xs', 'juryDuty'),

    highEmpathyLargeTitleFont: getFontStyle('7xl', 'highEmpathy'),
    highEmpathyTitleFont: getFontStyle('3xl', 'highEmpathy'),
    highEmpathyHeadingFont: getFontStyle('3xl', 'highEmpathy'),
    highEmpathySubtitleFont: getFontStyle('xl', 'highEmpathy'),
    highEmpathyBodyFont: getFontStyle('base', 'highEmpathy'),
    highEmpathyBaseFont: getFontStyle('base', 'highEmpathy'),
    highEmpathyButtonFont: getFontStyle('base', 'highEmpathy'),
    highEmpathyCaptionFont: getFontStyle('sm', 'highEmpathy'),
    highEmpathySmallFont: getFontStyle('xs', 'highEmpathy'),
  };
};