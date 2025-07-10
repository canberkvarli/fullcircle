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

const spiritualPractices = [
  { name: "Meditation", category: "mindfulness", icon: "flower-outline" },
  { name: "Yoga", category: "movement", icon: "body-outline" },
  { name: "Prayer", category: "devotion", icon: "heart-outline" },
  { name: "Journaling", category: "reflection", icon: "create-outline" },
  { name: "Energy Healing", category: "healing", icon: "hand-left-outline" },
  { name: "Crystal Work", category: "healing", icon: "diamond-outline" },
  { name: "Tarot & Oracle", category: "divination", icon: "library-outline" },
  { name: "Astrology", category: "divination", icon: "telescope-outline" },
  { name: "Nature Rituals", category: "earth", icon: "leaf-outline" },
  { name: "Sound Healing", category: "healing", icon: "musical-notes-outline" },
  { name: "Breathwork", category: "mindfulness", icon: "pulse-outline" },
  { name: "Sacred Dance", category: "movement", icon: "walk-outline" },
  { name: "Plant Medicine", category: "healing", icon: "flask-outline" },
  { name: "Shamanic Journey", category: "mystical", icon: "trail-sign-outline" },
  { name: "Martial Arts", category: "movement", icon: "fitness-outline" },
  { name: "Fasting", category: "purification", icon: "moon-outline" },
];

const categoryColors = {
  mindfulness: '#8B5CF6', // Purple
  movement: '#F59E0B', // Amber
  devotion: '#EC4899', // Pink
  reflection: '#06B6D4', // Cyan
  healing: '#10B981', // Emerald
  divination: '#6366F1', // Indigo
  earth: '#84CC16', // Lime
  mystical: '#8B5A2B', // Brown
  purification: '#64748B', // Slate
};

function SpiritualPracticesScreen() {
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

  const [selectedPractices, setSelectedPractices] = useState<string[]>(
    userData?.spiritualProfile?.practices || []
  );
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>(
    userData?.hiddenFields || {}
  );

  // Animation for staggered card entry
  const fadeAnimations = useRef(spiritualPractices.map(() => new Animated.Value(0))).current;
  const scaleAnimations = useRef(spiritualPractices.map(() => new Animated.Value(0.8))).current;

  useEffect(() => {
    // Staggered animation for cards
    const animations = spiritualPractices.map((_, index) => 
      Animated.parallel([
        Animated.timing(fadeAnimations[index], {
          toValue: 1,
          duration: 600,
          delay: index * 40,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnimations[index], {
          toValue: 1,
          delay: index * 40,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        })
      ])
    );

    Animated.stagger(20, animations).start();
  }, []);

  const handlePracticesSubmit = async () => {
    try {
      const userId = userData.userId;
      if (!userId || typeof userId !== "string") {
        Alert.alert("Connection Error", "Something went wrong. Please try again.");
        return;
      }

      await updateUserData({
        spiritualProfile: {
          ...userData.spiritualProfile,
          practices: selectedPractices,
        },
        hiddenFields,
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Error", "Unable to save your practices: " + error.message);
    }
  };

  const toggleHidden = (fieldName: string) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handlePracticeSelect = (practiceName: string) => {
    setSelectedPractices((prev) =>
      prev.includes(practiceName)
        ? prev.filter((item) => item !== practiceName)
        : [...prev, practiceName]
    );
  };

  const getPracticeColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || '#6B7280';
  };

  const renderPracticeCard = (practice: typeof spiritualPractices[0], index: number) => {
    const isSelected = selectedPractices.includes(practice.name);
    const practiceColor = getPracticeColor(practice.category);
    
    return (
      <Animated.View
        key={practice.name}
        style={[
          {
            opacity: fadeAnimations[index],
            transform: [{ scale: scaleAnimations[index] }],
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.practiceCard,
            isSelected && {
              ...styles.selectedPracticeCard,
              borderColor: practiceColor,
              backgroundColor: practiceColor + '15',
            }
          ]}
          onPress={() => handlePracticeSelect(practice.name)}
          activeOpacity={0.8}
        >
          {/* Icon Container */}
          <View style={[
            styles.iconContainer,
            { backgroundColor: practiceColor + '20' }
          ]}>
            <Ionicons 
              name={practice.icon as any} 
              size={24} 
              color={practiceColor} 
            />
          </View>
          
          {/* Practice Info */}
          <View style={styles.practiceInfo}>
            <Text style={[
              styles.practiceName,
              isSelected && { color: practiceColor }
            ]}>
              {practice.name}
            </Text>
            <Text style={[
              styles.practiceCategory,
              { color: practiceColor }
            ]}>
              {practice.category}
            </Text>
          </View>
          
          {/* Selection Indicator */}
          <View style={styles.selectionContainer}>
            {isSelected && (
              <View style={[
                styles.selectedIndicator,
                { backgroundColor: practiceColor }
              ]}>
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigateToPreviousScreen()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textDark} />
          </TouchableOpacity>

          {/* Progress Bar */}
          <OnboardingProgressBar currentScreen="SpiritualPracticesScreen" />
          
          {/* Header */}
          <Text style={styles.title}>Your Spiritual Practices</Text>
          <Text style={styles.subtitle}>
            Choose the practices that nourish your soul
          </Text>

          {/* Practices Grid */}
          <View style={styles.practicesGrid}>
            {spiritualPractices.map((practice, index) => renderPracticeCard(practice, index))}
          </View>

          {/* Privacy Toggle */}
          <View style={styles.privacyContainer}>
            <Text style={styles.privacyText}>Keep my spiritual practices private</Text>
            <View style={styles.orbCheckboxContainer}>
              <TouchableOpacity 
                style={styles.orbCheckbox}
                onPress={() => toggleHidden("spiritualProfile")}
              >
                {hiddenFields["spiritualProfile"] && (
                  <View style={styles.selectedOrb} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.affirmation}>
            Your{' '}
            <Text style={styles.highlightedWord}>practices</Text>
            {' are sacred pathways connecting you to kindred souls'}
          </Text>
        </ScrollView>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handlePracticesSubmit}
          activeOpacity={0.8}
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

const createStyles = (colorScheme: 'light' | 'dark', fonts: ReturnType<typeof useFont>) => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContainer: {
      paddingBottom: 120, // Space for fixed submit button
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
      marginLeft: Spacing.lg,
      marginTop: Platform.select({ ios: Spacing.md, android: Spacing.lg }),
      marginBottom: 0,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    headerContainer: {
      paddingHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
      marginBottom: Spacing.xl,
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
    selectedOrb: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: '#FFD700',
      ...Platform.select({
        ios: {
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 6,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    practicesGrid: {
      paddingHorizontal: Spacing.lg,
      gap: Spacing.md,
    },
    practiceCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.sm,
      borderWidth: 2,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    selectedPracticeCard: {
      transform: [{ scale: 1.02 }],
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    practiceInfo: {
      flex: 1,
    },
    practiceName: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.medium,
      color: colors.textDark,
      marginBottom: Spacing.xs,
    },
    practiceCategory: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      textTransform: 'capitalize',
      opacity: 0.8,
    },
    selectionContainer: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedIndicator: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    privacyContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginHorizontal: Spacing.lg,
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
      fontStyle: "italic",
    },
    orbCheckboxContainer: {
      marginLeft: Spacing.md,
    },
    orbCheckbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
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

export default SpiritualPracticesScreen;