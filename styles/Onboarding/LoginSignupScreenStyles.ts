import { StyleSheet, Platform } from "react-native";
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';

const createStyles = (colorScheme: 'light' | 'dark') => {
  const colors = Colors[colorScheme];
  
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
      justifyContent: "center",
      alignItems: "center",
      padding: Spacing.lg,
      backgroundColor: colors.overlay,
      ...StyleSheet.absoluteFillObject,
    },
    loadingIndicator: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: [{ translateX: -25 }, { translateY: -25 }],
    },
    headerContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.lg,
      position: 'relative',
    },
    logo: {
      width: 120,
      height: 120,
      tintColor: colors.text,
      marginBottom: Spacing.xl,
      opacity: 0.9,
    },
    affirmation: {
      fontSize: Typography.sizes.lg,
      color: colors.text,
      textAlign: "center",
      marginVertical: Spacing.md,
      fontWeight: Typography.weights.light,
      lineHeight: Typography.sizes.lg * 1.5,
      paddingHorizontal: Spacing.lg,
      opacity: 0.95,
    },
    infoText: {
      fontSize: Typography.sizes.xs,
      color: colors.textLight,
      textAlign: "center",
      marginVertical: Spacing.lg,
      paddingHorizontal: Spacing.xl,
      lineHeight: Typography.sizes.xs * 1.6,
      opacity: 0.85,
    },
    link: {
      color: colors.primary,
      textDecorationLine: "underline",
      fontWeight: Typography.weights.medium,
    },
    button: {
      borderRadius: BorderRadius.full,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      alignItems: 'center',
      marginTop: Spacing.md,
      minWidth: 200,
      // Softer shadows for a calming effect
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    buttonText: {
      color: colors.text,
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.medium,
      letterSpacing: 0.5,
    },
    secondaryButtonText: {
      color: colors.primary,
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
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    buttonContainer: {
      width: '100%',
      paddingHorizontal: Spacing.xl,
      gap: Spacing.sm,
    },
  });
};

export default createStyles;