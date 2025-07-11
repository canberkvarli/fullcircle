import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  useColorScheme,
  Platform,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import OnboardingProgressBar from "../../components/OnboardingProgressBar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "@/context/UserContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import RoundedCheckbox from "@/components/RoundedCheckbox";

const spiritualDraws = [
  { 
    label: "Healing & Restoration", 
    value: "healing", 
    description: "Energy work, trauma healing, emotional restoration",
    color: "#228B22" 
  },
  { 
    label: "Personal Growth", 
    value: "growth", 
    description: "Self-discovery, consciousness expansion, evolution",
    color: "#FF6B35" 
  },
  { 
    label: "Sacred Connection", 
    value: "connection", 
    description: "Community, relationships, divine communion",
    color: "#4169E1" 
  },
  { 
    label: "Spiritual Awakening", 
    value: "awakening", 
    description: "Enlightenment, transcendence, higher consciousness",
    color: "#8A2BE2" 
  },
];

function SpiritualDrawsScreen() {
  const {
    userData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
  } = useUserContext();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);

  const [selectedDraws, setSelectedDraws] = useState<string[]>(
    userData?.spiritualProfile?.draws || []
  );
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>(
    userData?.hiddenFields || {}
  );

  // Animation for staggered card entry
  const fadeAnimations = useRef(spiritualDraws.map(() => new Animated.Value(0))).current;
  const slideAnimations = useRef(spiritualDraws.map(() => new Animated.Value(50))).current;

  useEffect(() => {
    // Staggered animation for cards
    const animations = spiritualDraws.map((_, index) => 
      Animated.parallel([
        Animated.timing(fadeAnimations[index], {
          toValue: 1,
          duration: 600,
          delay: index * 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimations[index], {
          toValue: 0,
          duration: 600,
          delay: index * 150,
          useNativeDriver: true,
        })
      ])
    );

    Animated.stagger(50, animations).start();
  }, []);

  const handleDrawsSubmit = async () => {
    try {
      const userId = userData.userId;
      if (!userId || typeof userId !== "string") {
        Alert.alert("Connection Error", "Something went wrong. Please try again.");
        return;
      }

      await updateUserData({
        spiritualProfile: {
          ...userData.spiritualProfile,
          draws: selectedDraws,
        },
        hiddenFields,
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Error", "Unable to save your spiritual draws: " + error.message);
    }
  };

  const toggleHidden = (fieldName: string) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handleDrawSelect = (drawValue: string) => {
    setSelectedDraws((prev) =>
      prev.includes(drawValue)
        ? prev.filter((item) => item !== drawValue)
        : [...prev, drawValue]
    );
  };

  const renderDrawCard = (draw: any, index: number) => {
    const isSelected = selectedDraws.includes(draw.value);
    
    return (
      <Animated.View
        key={draw.value}
        style={{
          opacity: fadeAnimations[index],
          transform: [{ translateY: slideAnimations[index] }],
        }}
      >
        <TouchableOpacity
          style={[
            styles.drawCard,
            isSelected && styles.selectedDrawCard,
            { borderLeftColor: draw.color }
          ]}
          onPress={() => handleDrawSelect(draw.value)}
          activeOpacity={0.8}
        >
          {/* Color accent line */}
          <View style={[styles.colorAccent, { backgroundColor: draw.color }]} />
          
          <View style={styles.drawContent}>
            <View style={styles.drawHeader}>
              <Text style={[
                styles.drawLabel,
                { color: isSelected ? colors.primary : colors.textDark }
              ]}>
                {draw.label}
              </Text>
              {isSelected && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={24} 
                  color={colors.primary} 
                />
              )}
            </View>
            <Text style={styles.drawDescription}>
              {draw.description}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderSelectedPreview = () => {
    if (selectedDraws.length === 0) return null;

    return (
      <View style={styles.selectedPreview}>
        <Text style={styles.selectedTitle}>Your spiritual focus</Text>
        <View style={styles.selectedIndicators}>
          {selectedDraws.map((drawValue) => {
            const draw = spiritualDraws.find(d => d.value === drawValue);
            if (!draw) return null;
            
            return (
              <View 
                key={drawValue} 
                style={[
                  styles.selectedIndicator, 
                  { backgroundColor: draw.color }
                ]} 
              />
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigateToPreviousScreen()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>

        {/* Progress Bar */}
        <OnboardingProgressBar currentScreen="SpiritualDrawsScreen" />
        
        {/* Header */}
        <Text style={styles.title}>What draws you to spirituality?</Text>
        <Text style={styles.subtitle}>Select all the callings that resonate with your soul </Text>
        {/* Selected Preview */}
        {renderSelectedPreview()}

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Spiritual Draws Cards */}
          <View style={styles.drawsContainer}>
            {spiritualDraws.map((draw, index) => renderDrawCard(draw, index))}
          </View>

          {/* Hide Option */}
          <View style={styles.privacyContainer}>
            <Text style={styles.privacyText}>Keep my spiritual draws private</Text>
            <RoundedCheckbox
              value={hiddenFields["spiritualProfile"] || false}
              onValueChange={() => toggleHidden("spiritualProfile")}
            />
          </View>

          {/* Affirmation */}
          <Text style={styles.affirmation}>
            Your spiritual{' '}
            <Text style={styles.highlightedWord}>callings</Text>
            {' are the sacred threads that weave you to kindred souls'}
          </Text>
        </ScrollView>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleDrawsSubmit}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={colors.background} 
          />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const createStyles = (colorScheme: 'light' | 'dark', fonts: Record<string, any>) => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: Spacing.lg,
      marginTop: Platform.select({ ios: 0, android: Spacing.lg }),
    },
    backButton: {
      backgroundColor: colors.card,
      padding: Spacing.xs,
      borderRadius: BorderRadius.full,
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginLeft: Spacing.md,
      marginTop: Platform.select({ ios: Spacing.md, android: Spacing.lg }),
      marginBottom: 0,
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
    title: {
      ...fonts.spiritualTitleFont,
      color: colors.textDark,
      textAlign: "left",
      marginTop: Spacing.sm,
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.lg,
    },
    subtitle: {
      ...fonts.spiritualSubtitleFont,
      color: colors.textLight,
      textAlign: "left",
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.lg,
      fontStyle: "italic",
    },
    highlightedWord: {
      color: colors.textDark, // Keep text dark
      textShadowColor: '#FFD700', // Divine yellow glow
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      fontWeight: Typography.weights.medium, // Slightly bolder
      letterSpacing: 0.5, // More letter spacing for emphasis
    },
    selectedPreview: {
      alignItems: 'center',
      marginBottom: Spacing.lg,
      paddingHorizontal: Spacing.lg,
    },
    selectedTitle: {
      ...fonts.spiritualBodyFont,
      color: colors.primary,
      fontSize: Typography.sizes.base,
      fontStyle: 'italic',
      marginBottom: Spacing.sm,
    },
    selectedIndicators: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    selectedIndicator: {
      width: 32,
      height: 4,
      borderRadius: 2,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    scrollView: {
      flex: 1,
    },
    scrollContainer: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: 120, // Space for fixed submit button
    },
    drawsContainer: {
      gap: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    drawCard: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      borderWidth: 2,
      borderColor: colors.border,
      borderLeftWidth: 6,
      overflow: 'hidden',
      position: 'relative',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    selectedDrawCard: {
      borderColor: colors.primary,
      borderWidth: 3,
      backgroundColor: colors.primary + '10',
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOpacity: 0.3,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    colorAccent: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 6,
    },
    drawContent: {
      padding: Spacing.xl,
      paddingLeft: Spacing.xl + 12, // Extra space for color accent
    },
    drawHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    drawLabel: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.semibold,
      flex: 1,
    },
    drawDescription: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textLight,
      fontStyle: 'italic',
      lineHeight: Typography.sizes.base * 1.4,
    },
    privacyContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: Spacing.xl,
      marginBottom: Spacing.lg,
      backgroundColor: colors.card,
      padding: Spacing.lg,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    privacyText: {
      ...fonts.spiritualBodyFont,
      color: colors.textDark,
      fontSize: Typography.sizes.base,
      fontStyle: 'italic',
    },
    affirmation: {
      ...fonts.elegantItalicFont,
      textAlign: "center",
      fontStyle: "italic",
      color: colors.textLight,
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    submitButton: {
      position: "absolute",
      bottom: Platform.select({ ios: 50, android: 30 }),
      right: Spacing.xl,
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.full,
      width: 56,
      height: 56,
      justifyContent: "center",
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
      }),
    },
  });
};

export default SpiritualDrawsScreen;