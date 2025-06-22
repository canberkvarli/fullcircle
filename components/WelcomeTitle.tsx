import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { Colors, Typography, Spacing } from "@/constants/Colors";

function WelcomeTitle(): JSX.Element {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = createStyles(colorScheme);

  return (
    <View style={styles.titleContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Circle</Text>
        <Text style={styles.subTitle}>It starts with a swipe</Text>
      </View>
      <View style={styles.permissionsContainer}>
        <Text style={styles.permissions}>
          By tapping "Create Account" or "Sign In," you agree to our Terms.
          Learn how we process your data in our Privacy Policy and Cookies
          Policy.
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colorScheme: 'light' | 'dark') => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    titleContainer: {
      flex: 2,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: Spacing.xl,
    },
    textContainer: {
      alignItems: "center",
      marginBottom: Spacing.xl,
    },
    title: {
      fontSize: Typography.sizes['3xl'],
      fontFamily: Typography.fonts.bold,
      fontWeight: Typography.weights.bold,
      color: colors.text,
      letterSpacing: 2,
      marginBottom: Spacing.sm,
      // Add text shadow for better readability over video
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
    },
    subTitle: {
      fontSize: Typography.sizes.lg,
      color: colors.textLight,
      fontStyle: "italic",
      fontWeight: Typography.weights.light,
      // Add text shadow for better readability
      textShadowColor: 'rgba(0, 0, 0, 0.6)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    permissionsContainer: {
      flexGrow: 1,
      justifyContent: "flex-end",
      paddingBottom: 150,
      paddingHorizontal: Spacing.lg,
    },
    permissions: {
      fontSize: Typography.sizes.xs,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: Typography.sizes.xs * 1.5,
      // Add text shadow for better readability
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
  });
};

export default WelcomeTitle;