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
  Dimensions,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import OnboardingProgressBar from "../../components/OnboardingProgressBar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "@/context/UserContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

const { width: screenWidth } = Dimensions.get('window');

const healingModalities = [
  { name: "Reiki", icon: "👐", color: "#E74C3C" },
  { name: "Acupuncture", icon: "📍", color: "#F39C12" },
  { name: "Sound Therapy", icon: "🎼", color: "#F1C40F" },
  { name: "Crystal Healing", icon: "💎", color: "#2ECC71" },
  { name: "Aromatherapy", icon: "🌸", color: "#3498DB" },
  { name: "Chakra Balancing", icon: "🌈", color: "#9B59B6" },
  { name: "Light Therapy", icon: "✨", color: "#E91E63" },
  { name: "Massage Therapy", icon: "💆", color: "#FF5722" },
  { name: "Hypnotherapy", icon: "🌀", color: "#607D8B" },
  { name: "Bach Flowers", icon: "🌺", color: "#795548" },
  { name: "Homeopathy", icon: "💧", color: "#009688" },
  { name: "Herbalism", icon: "🌿", color: "#4CAF50" },
  { name: "Ayahuasca", icon: "🍄", color: "#8E24AA" },
  { name: "Kambo", icon: "🐸", color: "#43A047" },
];

function HealingModalitiesScreen() {
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

  const [selectedModalities, setSelectedModalities] = useState<string[]>(
    userData?.spiritualProfile?.healingModalities || []
  );
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>(
    userData?.hiddenFields || {}
  );

  // Animations
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const modalityAnimations = useRef(
    healingModalities.map(() => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Start the gentle rotation of the center circle
    Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    // Gentle pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Staggered modality entrance
    const animations = modalityAnimations.map((anim, index) =>
      Animated.parallel([
        Animated.timing(anim.scale, {
          toValue: 1,
          duration: 600,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 600,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(80, animations).start();
  }, []);

  const handleModalitiesSubmit = async () => {
    if (selectedModalities.length === 0) {
      Alert.alert("Sacred Healing", "Please select at least one healing modality that calls to your soul");
      return;
    }

    try {
      const userId = userData.userId;
      if (!userId || typeof userId !== "string") {
        Alert.alert("Energy Disruption", "Something mystical went wrong. Please try again.");
        return;
      }

      await updateUserData({
        spiritualProfile: {
          ...userData.spiritualProfile,
          healingModalities: selectedModalities,
        },
        hiddenFields,
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Cosmic Interference", "The universe had trouble saving your healing modalities: " + error.message);
    }
  };

  const toggleHidden = (fieldName: string) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handleModalitySelect = (modalityName: string) => {
    setSelectedModalities((prev) =>
      prev.includes(modalityName)
        ? prev.filter((item) => item !== modalityName)
        : [...prev, modalityName]
    );
  };

  // Helper function to get orb color - divine gold when all selected
  const getOrbColor = (modalityColor: string) => {
    const allSelected = selectedModalities.length === healingModalities.length;
    return allSelected ? '#FFD700' : modalityColor;
  };

  // Calculate perfect circle positions with equal distribution
  const getCirclePosition = (index: number, totalItems: number, radius: number, centerX: number, centerY: number) => {
    const angle = (index * 2 * Math.PI) / totalItems - Math.PI / 2; // Start from top
    
    return {
      left: centerX + radius * Math.cos(angle) - 30, // -30 for half the orb container width
      top: centerY + radius * Math.sin(angle) - 30,   // -30 for half the orb container height
    };
  };

  const handleSelectAll = () => {
    if (selectedModalities.length === healingModalities.length) {
      // If all are selected, deselect all
      setSelectedModalities([]);
    } else {
      // Select all modalities
      setSelectedModalities(healingModalities.map(modality => modality.name));
    }
  };

  const renderCenterVisualization = () => {
    const rotation = rotationAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const allSelected = selectedModalities.length === healingModalities.length;

    return (
      <View style={styles.centerContainer}>
        {/* Divine Yellow Light Core */}
        <TouchableOpacity
          onPress={handleSelectAll}
          activeOpacity={0.8}
        >
          <Animated.View 
            style={[
              styles.centerCircle,
              {
                transform: [
                  { rotate: rotation },
                  { scale: pulseAnim }
                ]
              },
              allSelected && styles.centerCircleAllSelected
            ]}
          >
            <TouchableOpacity
              onPress={handleSelectAll}
              activeOpacity={0.8}
              style={styles.innerCoreButton}
            >
              <View style={[styles.innerCore, allSelected && styles.innerCoreAllSelected]} />
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
        
        {/* Energy waves */}
        <View style={styles.energyWaves}>
          <View style={[styles.wave, styles.wave1]} />
          <View style={[styles.wave, styles.wave2]} />
          <View style={[styles.wave, styles.wave3]} />
        </View>
      </View>
    );
  };

  const renderModalityOrb = (modality: typeof healingModalities[0], index: number) => {
    const isSelected = selectedModalities.includes(modality.name);
    const allSelected = selectedModalities.length === healingModalities.length;
    const orbColor = getOrbColor(modality.color);
    const containerSize = 450; // Even larger container for more spacing
    const centerX = containerSize / 2;
    const centerY = containerSize / 2;
    const radius = 180; // Increased radius for more spacing
    
    const position = getCirclePosition(index, healingModalities.length, radius, centerX, centerY);
    const animation = modalityAnimations[index];

    return (
      <Animated.View
        key={modality.name}
        style={[
          styles.modalityOrb,
          position,
          {
            transform: [{ scale: animation.scale }],
            opacity: animation.opacity,
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.orbTouchable,
            { 
              backgroundColor: orbColor + (isSelected ? 'FF' : '40'),
              borderColor: orbColor,
            },
            isSelected && {
              ...styles.selectedOrb,
              shadowColor: orbColor,
            }
          ]}
          onPress={() => handleModalitySelect(modality.name)}
          activeOpacity={0.8}
        >
          <Text style={styles.orbIcon}>{modality.icon}</Text>
        </TouchableOpacity>
        <Text style={[
          styles.modalityLabel,
          { color: isSelected ? orbColor : colors.textDark }
        ]}>
          {modality.name}
        </Text>
      </Animated.View>
    );
  };

  const renderSelectedCount = () => {
    if (selectedModalities.length === 0) return null;

    return (
      <View style={styles.selectedContainer}>
        <Text style={styles.selectedText}>
          {selectedModalities.length} healing modalities selected
        </Text>
        <View style={styles.selectedDots}>
          {selectedModalities.slice(0, 6).map((_, index) => (
            <View key={index} style={styles.selectedDot} />
          ))}
          {selectedModalities.length > 6 && (
            <Text style={styles.moreText}>+{selectedModalities.length - 6}</Text>
          )}
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
        <OnboardingProgressBar currentScreen="HealingModalitiesScreen" />
        
        {/* Header */}
        <Text style={styles.title}>Your Healing Journey</Text>
        <Text style={styles.subtitle}>
          Select the sacred modalities that resonate with your healing essence
        </Text>

        {/* Selected Count - Reserved Space */}
        <View style={styles.selectedCountSpace}>
          {renderSelectedCount()}
        </View>

        {/* Main Healing Circle */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.healingCircleContainer}>
            {/* Center Visualization */}
            {renderCenterVisualization()}
            
            {/* Modality Orbs */}
            {healingModalities.map((modality, index) => renderModalityOrb(modality, index))}
          </View>

          {/* Instructions */}
          <Text style={styles.instructions}>
            Tap the healing orbs that call to your soul. Tap the inner divine core to select all modalities.
          </Text>

          {/* Hide Option */}
          <View style={styles.hiddenContainer}>
            <Text style={styles.hiddenText}>Keep my healing modalities private</Text>
            <View style={styles.orbCheckboxContainer}>
              <TouchableOpacity 
                style={styles.orbCheckbox}
                onPress={() => toggleHidden("spiritualProfile")}
              >
                {hiddenFields["spiritualProfile"] && (
                  <View style={styles.selectedCheckboxOrb} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Affirmation */}
          <Text style={styles.affirmation}>
            Your healing journey is a sacred path that connects you to others walking similar roads of transformation
          </Text>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              selectedModalities.length === 0 && styles.submitButtonDisabled
            ]}
            onPress={handleModalitiesSubmit}
            disabled={selectedModalities.length === 0}
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
    innerCoreButton: {
      width: 70,
      height: 70,
      borderRadius: 35,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      ...fonts.spiritualTitleFont,
      color: colors.textDark,
      textAlign: "center",
      marginTop: Spacing.sm,
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.lg,
    },
    subtitle: {
      ...fonts.spiritualSubtitleFont,
      color: colors.textLight,
      textAlign: "center",
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.lg,
      fontStyle: "italic",
    },
    selectedCountSpace: {
      height: 60, // Reserved space for the selected count
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.lg,
    },
    selectedContainer: {
      alignItems: 'center',
    },
    selectedText: {
      ...fonts.spiritualBodyFont,
      color: colors.primary,
      fontSize: Typography.sizes.base,
      fontStyle: 'italic',
      marginBottom: Spacing.sm,
    },
    selectedDots: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    selectedDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    moreText: {
      ...fonts.spiritualBodyFont,
      color: colors.primary,
      fontSize: Typography.sizes.sm,
      marginLeft: Spacing.xs,
    },
    scrollView: {
      flex: 1,
    },
    scrollContainer: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.lg,
      alignItems: 'center',
    },
    healingCircleContainer: {
      width: 450,
      height: 450,
      position: 'relative',
      marginBottom: Spacing.xl,
      alignSelf: 'center',
    },
    centerContainer: {
      position: 'absolute',
      left: 225 - 50, // Perfect center horizontally (450/2 - 50)
      top: 225 - 50,  // Perfect center vertically (450/2 - 50)
      alignItems: 'center',
      justifyContent: 'center',
      width: 100,
      height: 100,
    },
    centerCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#FFD700' + '30', // Divine yellow with transparency
      borderWidth: 3,
      borderColor: '#FFD700',
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#FFD700',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 15,
        },
        android: {
          elevation: 10,
        },
      }),
    },
    centerCircleAllSelected: {
      borderWidth: 4,
      ...Platform.select({
        ios: {
          shadowOpacity: 0.9,
          shadowRadius: 25,
        },
        android: {
          elevation: 15,
        },
      }),
    },
    innerCore: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: '#FFD700', // Pure divine yellow light
      ...Platform.select({
        ios: {
          shadowColor: '#FFD700',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 20,
        },
        android: {
          elevation: 12,
        },
      }),
    },
    innerCoreAllSelected: {
      ...Platform.select({
        ios: {
          shadowOpacity: 1,
          shadowRadius: 30,
        },
        android: {
          elevation: 18,
        },
      }),
    },
    energyWaves: {
      position: 'absolute',
      width: 200,
      height: 200,
      left: -50,
      top: -50,
    },
    wave: {
      position: 'absolute',
      borderRadius: 120,
      borderWidth: 1,
      borderColor: '#FFD700' + '20',
    },
    wave1: {
      width: 140,
      height: 140,
      left: 30,
      top: 30,
    },
    wave2: {
      width: 170,
      height: 170,
      left: 15,
      top: 15,
    },
    wave3: {
      width: 200,
      height: 200,
      left: 0,
      top: 0,
    },
    modalityOrb: {
      position: 'absolute',
      alignItems: 'center',
      width: 60,
      height: 90,
    },
    orbTouchable: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      marginBottom: Spacing.xs,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    selectedOrb: {
      borderWidth: 3,
      ...Platform.select({
        ios: {
          shadowOpacity: 0.6,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
        },
        android: {
          elevation: 8,
        },
      }),
    },
    orbIcon: {
      fontSize: 20,
    },
    modalityLabel: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.xs,
      textAlign: 'center',
      maxWidth: 60,
      fontWeight: Typography.weights.medium,
    },
    instructions: {
      ...fonts.spiritualBodyFont,
      color: colors.textLight,
      textAlign: 'center',
      fontStyle: 'italic',
      marginBottom: Spacing.xl,
      lineHeight: Typography.sizes.base * 1.5,
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
    selectedCheckboxOrb: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: '#FFD700',
      ...Platform.select({
        ios: {
          shadowColor: '#FFD700',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 6,
        },
        android: {
          elevation: 6,
        },
      }),
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
    submitButtonDisabled: {
      backgroundColor: colors.textMuted,
      opacity: 0.6,
      ...Platform.select({
        ios: {
          shadowColor: colors.textMuted,
          shadowOpacity: 0.15,
          shadowRadius: 3,
        },
        android: {
          elevation: 3,
        },
      }),
    },
  });
};

export default HealingModalitiesScreen;