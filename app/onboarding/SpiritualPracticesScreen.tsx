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
import Checkbox from "expo-checkbox";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "@/context/UserContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

const spiritualPractices = [
  { name: "Meditation", icon: "🧘" },
  { name: "Yoga", icon: "🕉️" },
  { name: "Prayer", icon: "🙏" },
  { name: "Journaling", icon: "📝" },
  { name: "Energy Healing", icon: "✨" },
  { name: "Crystal Work", icon: "💎" },
  { name: "Tarot & Oracle", icon: "🔮" },
  { name: "Astrology", icon: "⭐" },
  { name: "Nature Rituals", icon: "🌿" },
  { name: "Sound Healing", icon: "🎵" },
  { name: "Breathwork", icon: "🌬️" },
  { name: "Sacred Dance", icon: "💃" },
  { name: "Plant Medicine", icon: "🍄" },
  { name: "Shamanic Journey", icon: "🥁" },
  { name: "Martial Arts", icon: "🥋" },
  { name: "Fasting", icon: "🌙" },
];

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
  const slideAnimations = useRef(spiritualPractices.map(() => new Animated.Value(30))).current;

  useEffect(() => {
    // Staggered animation for cards
    const animations = spiritualPractices.map((_, index) => 
      Animated.parallel([
        Animated.timing(fadeAnimations[index], {
          toValue: 1,
          duration: 500,
          delay: index * 50,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimations[index], {
          toValue: 0,
          duration: 500,
          delay: index * 50,
          useNativeDriver: true,
        })
      ])
    );

    Animated.stagger(30, animations).start();
  }, []);

  const handlePracticesSubmit = async () => {
    // if (selectedPractices.length === 0) {
    //   Alert.alert("Sacred Practices", "Please select at least one spiritual practice that resonates with you");
    //   return;
    // }

    try {
      const userId = userData.userId;
      if (!userId || typeof userId !== "string") {
        Alert.alert("Energy Disruption", "Something mystical went wrong. Please try again.");
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
      Alert.alert("Cosmic Interference", "The universe had trouble saving your spiritual practices: " + error.message);
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

  const renderPracticeButton = (practice: typeof spiritualPractices[0], index: number) => {
    const isSelected = selectedPractices.includes(practice.name);
    
    return (
      <TouchableOpacity
        key={practice.name}
        style={[
          styles.practiceButton,
          isSelected && styles.selectedPracticeButton
        ]}
        onPress={() => handlePracticeSelect(practice.name)}
        activeOpacity={0.7}
      >
        {/* Emoji */}
        <Text style={styles.practiceIcon}>{practice.icon}</Text>
        
        {/* Practice Name */}
        <Text style={styles.practiceName}>{practice.name}</Text>
        
        {/* Orb Space */}
        <View style={styles.orbSpace}>
          {isSelected && <View style={styles.selectedOrb} />}
        </View>
      </TouchableOpacity>
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
        <OnboardingProgressBar currentScreen="SpiritualPracticesScreen" />
        
        {/* Header */}
        <Text style={styles.title}>Your Spiritual Practices</Text>
        <Text style={styles.subtitle}>
          Choose the practices that nourish your soul
        </Text>

        {/* Practices List */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.practicesList}>
            {spiritualPractices.map((practice, index) => renderPracticeButton(practice, index))}
          </View>

          {/* Hide Option */}
          <View style={styles.hiddenContainer}>
            <Text style={styles.hiddenText}>Keep my spiritual practices private</Text>
            <Checkbox
              value={hiddenFields["spiritualProfile"] || false}
              onValueChange={() => toggleHidden("spiritualProfile")}
              style={styles.checkbox}
              color={hiddenFields["spiritualProfile"] ? colors.primary : undefined}
            />
          </View>

          {/* Affirmation */}
          <Text style={styles.affirmation}>
            Your practices are sacred pathways connecting you to kindred souls
          </Text>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              // selectedPractices.length === 0 && styles.submitButtonDisabled
            ]}
            onPress={handlePracticesSubmit}
            // disabled={selectedPractices.length === 0}
          >
            <Ionicons 
              name="chevron-forward" 
              size={24} 
              color={colors.background} 
            />
          </TouchableOpacity>
        </ScrollView>
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
    scrollView: {
      flex: 1,
    },
    scrollContainer: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.lg,
    },
    practicesList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
      justifyContent: 'flex-start',
    },
    practiceButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: BorderRadius.full,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: Spacing.sm,
    },
    selectedPracticeButton: {
      borderColor: '#FFD700',
      backgroundColor: '#FFD700' + '15',
    },
    practiceIcon: {
      fontSize: 18,
      marginRight: Spacing.sm,
    },
    practiceName: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.textDark,
      marginRight: Spacing.sm,
    },
    orbSpace: {
      width: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedOrb: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#FFD700',
      ...Platform.select({
        ios: {
          shadowColor: '#FFD700',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    hiddenContainer: {
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
    hiddenText: {
      ...fonts.spiritualBodyFont,
      color: colors.textDark,
      fontSize: Typography.sizes.base,
      fontStyle: 'italic',
    },
    checkbox: {
      width: 20,
      height: 20,
    },
    affirmation: {
      ...fonts.affirmationFont,
      textAlign: "center",
      fontStyle: "italic",
      color: colors.textLight,
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3,
      marginTop: Spacing.lg,
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.md,
    },
    submitButton: {
      alignSelf: 'flex-end',
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.full,
      width: 56,
      height: 56,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: Spacing.lg,
      marginTop: Spacing.lg,
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
    // submitButtonDisabled: {
    //   backgroundColor: colors.textMuted,
    //   opacity: 0.6,
    //   ...Platform.select({
    //     ios: {
    //       shadowColor: colors.textMuted,
    //       shadowOpacity: 0.15,
    //       shadowRadius: 3,
    //     },
    //     android: {
    //       elevation: 3,
    //     },
    //   }),
    // },
  });
};

export default SpiritualPracticesScreen;