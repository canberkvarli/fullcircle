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
    // Quick access to common combinations for your spiritual app
    titleFont: getFontStyle('5xl', 'bold'),
    subtitleFont: getFontStyle('lg', 'light'),
    bodyFont: getFontStyle('base', 'regular'),
    bodyMediumFont: getFontStyle('base', 'medium'),
    captionFont: getFontStyle('sm', 'medium'),
    smallFont: getFontStyle('xs', 'regular'),
    affirmationFont: getFontStyle('lg', 'light'),
    buttonFont: getFontStyle('base', 'semibold'),
    inputFont: getFontStyle('base', 'medium'),
    modalTitleFont: getFontStyle('2xl', 'bold'),
    modalBodyFont: getFontStyle('base', 'regular'),
  };
};