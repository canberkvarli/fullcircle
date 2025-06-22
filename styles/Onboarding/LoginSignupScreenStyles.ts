import { StyleSheet, Platform } from "react-native";
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { useFont } from '@/hooks/useFont';

const createStyles = (colorScheme: 'light' | 'dark') => {
  const colors = Colors[colorScheme];
  const { titleFont, subtitleFont, affirmationFont, buttonFont, captionFont } = useFont();
  
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    backgroundVideo: {
      ...StyleSheet.absoluteFillObject,
      resizeMode: "cover",
    },
    overlay: {
      flex: 1,
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: Platform.select({ ios: 60, android: 40 }),
      paddingHorizontal: Spacing.lg,
      backgroundColor: colors.overlay,
      ...StyleSheet.absoluteFillObject,
    },
    loadingIndicator: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: [{ translateX: -25 }, { translateY: -25 }],
    },
    logo: {
      width: 100,
      height: 100,
      tintColor: colors.text,
    },
    titleSection: {
      alignItems: 'center',
      marginTop: -50,
    },
    title: {
      ...titleFont,
      color: colors.text,
      letterSpacing: 2,
      marginBottom: Spacing.xs,
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
    },
    subTitle: {
      ...subtitleFont,
      color: colors.textLight,
      fontStyle: "italic",
      textShadowColor: 'rgba(0, 0, 0, 0.6)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    affirmation: {
      ...affirmationFont,
      color: colors.text,
      textAlign: "center",
      lineHeight: Typography.sizes.lg * 1.4,
      paddingHorizontal: Spacing.lg,
      textShadowColor: 'rgba(0, 0, 0, 0.7)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    buttonSection: {
      width: '100%',
      paddingTop: Spacing.lg,
    },
    buttonContainer: {
      width: '100%',
      paddingHorizontal: Spacing.xl,
      gap: Spacing.sm,
    },
    button: {
      borderRadius: BorderRadius.full,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      alignItems: 'center',
      minWidth: 200,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    secondaryButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    buttonText: {
      ...buttonFont,
      color: colors.text,
      letterSpacing: 0.5,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    secondaryButtonText: {
      color: colors.text,
      textShadowColor: 'rgba(0, 0, 0, 0.4)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    termsContainer: {
      paddingHorizontal: Spacing.md,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.sm,
    },
    infoText: {
      ...captionFont,
      color: colors.textLight,
      textAlign: "center",
      lineHeight: Typography.sizes.xs * 1.6,
      textShadowColor: 'rgba(0, 0, 0, 0.6)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    link: {
      ...buttonFont,
      color: '#87CEEB',
      textDecorationLine: "underline",
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    backIcon: {
      position: 'absolute',
      top: Platform.select({ ios: 50, android: 30 }),
      left: Spacing.lg,
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: BorderRadius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
        },
        android: {
          elevation: 4,
        },
      }),
    },
  });
};

export default createStyles;