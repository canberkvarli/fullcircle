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
import { CustomIcon } from "@/components/CustomIcon";
import OnboardingProgressBar from "../../components/OnboardingProgressBar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "@/context/UserContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import RoundedCheckbox from "@/components/RoundedCheckbox";

const spiritualPractices = [
  { name: "Meditation", category: "mindfulness", icon: "meditation", iconType: "custom" },
  { name: "Yoga", category: "movement", icon: "yoga", iconType: "custom" },
  { name: "Prayer", category: "devotion", icon: "prayer", iconType: "custom" },
  { name: "Journaling", category: "reflection", icon: "journal", iconType: "custom" },
  { name: "Energy Healing", category: "healing", icon: "energy-healing", iconType: "custom" },
  { name: "Crystal Work", category: "healing", icon: "crystal", iconType: "custom" },
  { name: "Tarot & Oracle", category: "divination", icon: "tarot", iconType: "custom" },
  { name: "Astrology", category: "divination", icon: "aries", iconType: "custom" },
  { name: "Nature Rituals", category: "earth", icon: "hiking", iconType: "custom" },
  { name: "Sound Healing", category: "healing", icon: "gong", iconType: "custom" },
  { name: "Breathwork", category: "mindfulness", icon: "breathwork", iconType: "custom" },
  { name: "Ecstatic Dance", category: "movement", icon: "dance", iconType: "custom" },
  { name: "Plant Medicine", category: "healing", icon: "leaf", iconType: "custom" },
  { name: "Shamanic Journey", category: "mystical", icon: "shaman", iconType: "custom" },
  { name: "Martial Arts", category: "movement", icon: "martial-arts", iconType: "custom" },
  { name: "Fasting", category: "purification", icon: "fasting", iconType: "custom" },
];

// Enhanced color palette with better spiritual vibes
const categoryColors = {
  mindfulness: '#8B5CF6', // Purple - for meditation, breathwork
  movement: '#F59E0B', // Amber - for yoga, dance, martial arts
  devotion: '#EC4899', // Pink - for prayer
  reflection: '#8B4513', // Saddle Brown - for journaling (more brownish!)
  healing: '#10B981', // Emerald - for energy healing, crystals, sound, plant medicine
  divination: '#6366F1', // Indigo - for tarot, astrology
  earth: '#22C55E', // Green - for nature rituals
  mystical: '#7C2D12', // Dark brown - for shamanic journey
  purification: '#64748B', // Slate - for fasting
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
          delay: index * 30,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnimations[index], {
          toValue: 1,
          delay: index * 30,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        })
      ])
    );

    Animated.stagger(15, animations).start();
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

  // Icon renderer function
  const renderIcon = (iconName: string, iconType: string, size: number, color: string) => {
    if (iconType === "custom") {
      return <CustomIcon name={iconName} size={size} color={color} />;
    } else {
      return <Ionicons name={iconName as any} size={size} color={color} />;
    }
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
              backgroundColor: practiceColor + '08', // More subtle background
              shadowColor: practiceColor,
            }
          ]}
          onPress={() => handlePracticeSelect(practice.name)}
          activeOpacity={0.7}
        >
          {/* Icon Container - Much Bigger! */}
          <View style={[
            styles.iconContainer,
            { 
              backgroundColor: isSelected ? practiceColor + '20' : practiceColor + '10',
              borderWidth: isSelected ? 2 : 1,
              borderColor: isSelected ? practiceColor : practiceColor + '30',
            }
          ]}>
            {renderIcon(
              practice.icon,
              practice.iconType,
              32, // Much bigger icons!
              practiceColor
            )}
          </View>
          
          {/* Practice Info - Better Typography */}
          <View style={styles.practiceInfo}>
            <Text style={[
              styles.practiceName,
              { 
                color: isSelected ? practiceColor : colors.textDark,
                fontWeight: isSelected ? Typography.weights.bold : Typography.weights.medium 
              }
            ]}>
              {practice.name}
            </Text>
            <Text style={[
              styles.practiceCategory,
              { 
                color: practiceColor,
                opacity: isSelected ? 0.9 : 0.7,
                fontWeight: isSelected ? Typography.weights.medium : Typography.weights.medium
              }
            ]}>
              {practice.category}
            </Text>
          </View>
          
          {/* Enhanced Selection Indicator */}
          <View style={styles.selectionContainer}>
            {isSelected ? (
              <View style={[
                styles.selectedIndicator,
                { 
                  backgroundColor: practiceColor,
                  shadowColor: practiceColor,
                }
              ]}>
                <Ionicons name="checkmark" size={18} color="white" />
              </View>
            ) : (
              <View style={[
                styles.unselectedIndicator,
                { borderColor: practiceColor + '40' }
              ]} />
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
            Choose the practices that nourish your soul ✨
          </Text>

          {/* Practices Grid */}
          <View style={styles.practicesGrid}>
            {spiritualPractices.map((practice, index) => renderPracticeCard(practice, index))}
          </View>

          {/* Privacy Toggle */}
          <View style={styles.privacyContainer}>
            <Text style={styles.privacyText}>Keep my spiritual practices private</Text>
              <RoundedCheckbox
                value={hiddenFields["spiritualProfile"] || false}
                onValueChange={() => toggleHidden("spiritualProfile")}
              />
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
      color: colors.textDark,
      textShadowColor: '#FFD700',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      fontWeight: Typography.weights.medium,
      letterSpacing: 0.5,
    },
    practicesGrid: {
      paddingHorizontal: Spacing.lg,
      gap: Spacing.sm,
    },
    practiceCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      borderWidth: 2,
      borderColor: colors.border,
      minHeight: 88, // Consistent height for better alignment
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    selectedPracticeCard: {
      transform: [{ scale: 1.03 }],
      ...Platform.select({
        ios: {
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    iconContainer: {
      width: 64, // Much bigger container
      height: 64,
      borderRadius: BorderRadius.xl,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.lg,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    practiceInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    practiceName: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.medium,
      marginBottom: Spacing.xs,
      lineHeight: Typography.sizes.lg * 1.2,
    },
    practiceCategory: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      textTransform: 'capitalize',
      letterSpacing: 0.5,
    },
    selectionContainer: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedIndicator: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    unselectedIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      backgroundColor: 'transparent',
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
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
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
    privacyText: {
      ...fonts.spiritualBodyFont,
      color: colors.textDark,
      fontSize: Typography.sizes.base,
      fontStyle: "italic",
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