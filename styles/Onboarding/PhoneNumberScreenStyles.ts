import { StyleSheet, Platform } from "react-native";
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';

const createStyles = (colorScheme: 'light' | 'dark') => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: Spacing.lg,
      marginTop: Platform.select({ ios: 0, android: Spacing.lg }),
    },
    mainContent: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
    },
    bottomBar: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      padding: Spacing.lg,
      position: "absolute",
      bottom: 0,
      right: 0,
    },
    phoneContainer: {
      width: "100%",
      marginBottom: Spacing.xl,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    countryInputContainer: {
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      marginRight: Spacing.sm,
    },
    phoneInput: {
      backgroundColor: 'transparent',
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.xs,
    },
    textContainer: {
      backgroundColor: "transparent",
      paddingVertical: Spacing.sm,
    },
    phoneInputText: {
      fontSize: Typography.sizes.base,
      color: colors.text === '#FFFFFF' ? '#3D3B37' : colors.text, // Dark text for light backgrounds
      fontWeight: Typography.weights.medium,
    },
    codeText: {
      fontSize: Typography.sizes.base,
      color: colors.text === '#FFFFFF' ? '#3D3B37' : colors.text, // Dark text for light backgrounds
      fontWeight: Typography.weights.medium,
    },
    countryPicker: {
      backgroundColor: 'transparent',
    },
    phoneNumberInput: {
      flex: 1,
      height: 40,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      marginLeft: Spacing.sm,
      color: colors.text === '#FFFFFF' ? '#3D3B37' : colors.text,
      fontSize: Typography.sizes.base,
    },
    title: {
      fontSize: Typography.sizes['4xl'],
      fontWeight: Typography.weights.bold,
      color: colors.text === '#FFFFFF' ? '#3D3B37' : colors.text, // Use dark text for readability
      marginTop: Spacing.lg,
      marginLeft: Spacing.xl,
      textAlign: "left",
    },
    subtitle: {
      fontSize: Typography.sizes.lg,
      color: colors.text === '#FFFFFF' ? '#6B6560' : colors.textLight, // Use appropriate contrast
      textAlign: "center",
      marginTop: Spacing.xl,
      marginBottom: Spacing.xl,
      fontWeight: Typography.weights.light,
    },
    notificationText: {
      fontSize: Typography.sizes.sm,
      color: colors.text === '#FFFFFF' ? '#8B8580' : colors.textMuted, // Use muted but visible color
      textAlign: "center",
      marginTop: Spacing.lg,
      lineHeight: Typography.sizes.sm * 1.5,
      paddingHorizontal: Spacing.md,
    },
    affirmationContainer: {
      position: "absolute",
      bottom: 100, // Position above the nextButton
      left: 0,
      right: 0,
      paddingHorizontal: Spacing.lg,
    },
    affirmation: {
      fontSize: Typography.sizes.lg,
      color: colors.text === '#FFFFFF' ? '#6B6560' : colors.textLight, // Use appropriate contrast
      textAlign: "center",
      fontStyle: "italic",
      fontWeight: Typography.weights.light,
      lineHeight: Typography.sizes.lg * 1.4,
    },
    nextButton: {
      backgroundColor: colors.primary,
      padding: Spacing.md,
      borderRadius: BorderRadius.full,
      width: 56,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    backButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      padding: Spacing.sm,
      borderRadius: BorderRadius.full,
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: Spacing.xl,
      marginLeft: Spacing.lg,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
  });
};

export default createStyles;