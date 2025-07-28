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
import { CustomIcon } from "@/components/CustomIcon"; // Import your CustomIcon component
import OnboardingProgressBar from "../../components/OnboardingProgressBar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "@/context/UserContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import RoundedCheckbox from "@/components/RoundedCheckbox";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const healingModalities = [
  { name: "Reiki", icon: "reiki", iconType: "custom", color: "#E74C3C" },
  { name: "Acupuncture", icon: "acupuncture", iconType: "custom", color: "#F39C12" },
  { name: "Sound Therapy", icon: "sound-healing", iconType: "custom", color: "#F1C40F" },
  { name: "Crystal Healing", icon: "crystal", iconType: "custom", color: "#2ECC71" },
  { name: "Aromatherapy", icon: "aromatherapy", iconType: "custom", color: "#3498DB" },
  { name: "Light Therapy", icon: "light-therapy", iconType: "custom", color: "#E91E63" },
  { name: "Massage Therapy", icon: "massage", iconType: "custom", color: "#FF5722" },
  { name: "Hypnotherapy", icon: "hypnotherapy", iconType: "custom", color: "#607D8B" },
  { name: "Homeopathy", icon: "homeopathy", iconType: "custom", color: "#009688" },
  { name: "Herbalism", icon: "herbalism", iconType: "custom", color: "#4CAF50" },
  { name: "Plant Medicine", icon: "leaf", iconType: "custom", color: "#8E24AA" },
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

  // Enhanced responsive dimensions - slightly bigger for better icon visibility
  const getResponsiveDimensions = () => {
    const isTablet = screenWidth > 768;
    const isSmallDevice = screenWidth < 375;
    const isVerySmall = screenWidth < 350;
    
    // More conservative sizing that works on all devices
    let containerSize;
    if (isVerySmall) {
      containerSize = screenWidth * 0.90; // Increased for better visibility
    } else if (isSmallDevice) {
      containerSize = screenWidth * 0.93; 
    } else if (isTablet) {
      containerSize = Math.min(screenWidth * 0.75, 540); 
    } else {
      containerSize = screenWidth * 0.95; 
    }
    
    // Ensure minimum viable size
    containerSize = Math.max(containerSize, 340);
    
    // Radius proportional to container but with safety margins
    const radius = containerSize * 0.37; 
    
    // Orb and center sizes based on available space - bigger for custom icons
    const orbSize = Math.max(Math.min(containerSize * 0.095, 58), 42); // Increased for better icon visibility
    const centerSize = Math.max(Math.min(containerSize * 0.17, 100), 70); 
    
    // Label container size based on spacing between orbs
    const circumference = 2 * Math.PI * radius;
    const spaceBetweenOrbs = circumference / healingModalities.length;
    const labelContainerSize = Math.max(Math.min(spaceBetweenOrbs * 0.90, 90), 70); 
    
    return {
      containerSize,
      radius,
      orbSize,
      centerSize,
      labelContainerSize,
      isTablet,
      isSmallDevice,
      isVerySmall,
    };
  };

  const dimensions = getResponsiveDimensions();

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
    try {
      const userId = userData.userId;
      if (!userId || typeof userId !== "string") {
        Alert.alert("Connection Error", "Something went wrong. Please try again.");
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
      Alert.alert("Error", "Unable to save your healing modalities: " + error.message);
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

  // Icon renderer function
  const renderIcon = (iconName: string, iconType: string, size: number, color: string) => {
    if (iconType === "custom") {
      return <CustomIcon name={iconName} size={size} color={color} />;
    } else {
      return <Ionicons name={iconName as any} size={size} color={color} />;
    }
  };

  // Helper function to get orb color - divine gold when all selected
  const getOrbColor = (modalityColor: string) => {
    const allSelected = selectedModalities.length === healingModalities.length;
    return allSelected ? '#FFD700' : modalityColor;
  };

  // Calculate perfect circle positions with equal distribution
  const getCirclePosition = (index: number, totalItems: number, radius: number, centerX: number, centerY: number) => {
    const angle = (index * 2 * Math.PI) / totalItems - Math.PI / 2; // Start from top
    const { orbSize } = dimensions;
    
    return {
      left: centerX + radius * Math.cos(angle) - orbSize / 2,
      top: centerY + radius * Math.sin(angle) - orbSize / 2,
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
    const { centerSize, containerSize, radius } = dimensions;

    const centerX = containerSize / 2;
    const centerY = containerSize / 2;

    return (
      <View style={[styles.centerContainer, { 
        left: centerX - centerSize / 2,
        top: centerY - centerSize / 2,
        width: centerSize,
        height: centerSize,
      }]}>
        {/* Clickable Overlay - This ensures the touch works */}
        <TouchableOpacity
          onPress={handleSelectAll}
          activeOpacity={0.7}
          style={[styles.centerTouchable, {
            width: centerSize,
            height: centerSize,
            borderRadius: centerSize / 2,
          }]}
        >
          {/* Visual Circle with Animation */}
          <Animated.View 
            style={[
              styles.centerCircle,
              {
                width: centerSize,
                height: centerSize,
                borderRadius: centerSize / 2,
                transform: [
                  { rotate: rotation },
                  { scale: pulseAnim }
                ]
              },
              allSelected && styles.centerCircleAllSelected
            ]}
          >
            <View style={[
              styles.innerCore, 
              {
                width: centerSize * 0.7,
                height: centerSize * 0.7,
                borderRadius: centerSize * 0.35,
              },
              allSelected && styles.innerCoreAllSelected
            ]} />
          </Animated.View>
        </TouchableOpacity>
        
        {/* Energy waves - Behind the touchable area */}
        <View style={[styles.energyWaves, {
          width: centerSize * 2,
          height: centerSize * 2,
          left: -centerSize / 2,
          top: -centerSize / 2,
        }]}>
          <View style={[styles.wave, styles.wave1, {
            width: centerSize * 1.4,
            height: centerSize * 1.4,
            borderRadius: centerSize * 0.7,
            left: centerSize * 0.3,
            top: centerSize * 0.3,
          }]} />
          <View style={[styles.wave, styles.wave2, {
            width: centerSize * 1.7,
            height: centerSize * 1.7,
            borderRadius: centerSize * 0.85,
            left: centerSize * 0.15,
            top: centerSize * 0.15,
          }]} />
          <View style={[styles.wave, styles.wave3, {
            width: centerSize * 2,
            height: centerSize * 2,
            borderRadius: centerSize,
            left: 0,
            top: 0,
          }]} />
        </View>
      </View>
    );
  };

  const renderModalityOrb = (modality: typeof healingModalities[0], index: number) => {
    const isSelected = selectedModalities.includes(modality.name);
    const allSelected = selectedModalities.length === healingModalities.length;
    const { containerSize, radius, orbSize, labelContainerSize } = dimensions;
    
    // Use the exact same center calculation
    const centerX = containerSize / 2;
    const centerY = containerSize / 2;
    
    // Get orb position (this positions the orb center, not the label container)
    const orbPosition = getCirclePosition(index, healingModalities.length, radius, centerX, centerY);
    const animation = modalityAnimations[index];

    // Calculate font size based on container size
    const fontSize = Math.max(Math.min(labelContainerSize * 0.16, Typography.sizes.xs), 10);
    
    // Calculate icon size - bigger for better visibility
    const iconSize = Math.max(Math.min(orbSize * 0.50, 28), 18); // Increased from 0.45 to 0.50

    // Better color logic for readability
    let orbColor, textColor, iconColor, backgroundColor;
    
    if (allSelected) {
      // When all selected - golden theme with better contrast
      orbColor = '#FFD700';
      backgroundColor = '#FFD700' + 'DD';
      iconColor = '#1A1A1A';
      textColor = '#B8860B';
    } else if (isSelected) {
      // Individual selection - original colors
      orbColor = modality.color;
      backgroundColor = modality.color + 'FF';
      iconColor = '#FFFFFF';
      textColor = modality.color;
    } else {
      // Unselected state
      orbColor = modality.color;
      backgroundColor = modality.color + '40';
      iconColor = modality.color;
      textColor = colors.textDark;
    }

    return (
      <Animated.View
        key={modality.name}
        style={[
          styles.modalityOrb,
          {
            left: orbPosition.left - (labelContainerSize - orbSize) / 2,
            top: orbPosition.top,
            width: labelContainerSize,
            height: labelContainerSize,
            transform: [{ scale: animation.scale }],
            opacity: animation.opacity,
          }
        ]}
      >
        
        <TouchableOpacity
          style={[
            styles.orbTouchable,
            {
              width: orbSize,
              height: orbSize,
              borderRadius: orbSize / 2,
              backgroundColor: backgroundColor,
              borderColor: orbColor,
              borderWidth: allSelected ? 3 : 2,
              alignSelf: 'center',
            },
            (isSelected || allSelected) && {
              ...styles.selectedOrb,
              shadowColor: orbColor,
            }
          ]}
          onPress={() => handleModalitySelect(modality.name)}
          activeOpacity={0.8}
        >
          {renderIcon(
            modality.icon,
            modality.iconType,
            iconSize,
            iconColor
          )}
        </TouchableOpacity>
        <Text 
          style={[
            styles.modalityLabel,
            { 
              color: textColor,
              fontSize: fontSize,
              fontWeight: (allSelected || isSelected) ? Typography.weights.semibold : Typography.weights.regular,
              width: labelContainerSize,
            }
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.75}
        >
          {modality.name}
        </Text>
      </Animated.View>
    );
  };

  const renderSelectedCount = () => {
    if (selectedModalities.length === 0) return null;

    const allSelected = selectedModalities.length === healingModalities.length;

    return (
      <View style={styles.selectedContainer}>
        <Text style={[
          styles.selectedText,
          allSelected && { color: '#B8860B' } // Darker golden text for better readability
        ]}>
          {allSelected ? 'All healing modalities selected! ✨' : `${selectedModalities.length} healing modalit${selectedModalities.length === 1 ? 'y' : 'ies'} selected`}
        </Text>
        <View style={styles.selectedDots}>
          {selectedModalities.slice(0, 6).map((_, index) => (
            <View key={index} style={[
              styles.selectedDot,
              allSelected && { backgroundColor: '#B8860B' } // Darker golden dots
            ]} />
          ))}
          {selectedModalities.length > 6 && (
            <Text style={[
              styles.moreText,
              allSelected && { color: '#B8860B' } // Darker golden text
            ]}>
              +{selectedModalities.length - 6}
            </Text>
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
          Select the modalities that resonate with your healing essence ✨
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
          <View style={[styles.healingCircleContainer, {
            width: dimensions.containerSize,
            height: dimensions.containerSize,
          }]}>
            {/* Center Visualization */}
            {renderCenterVisualization()}
            
            {/* Modality Orbs */}
            {healingModalities.map((modality, index) => renderModalityOrb(modality, index))}
          </View>

          {/* Hide Option */}
          <View style={styles.privacyContainer}>
            <Text style={styles.privacyText}>Keep my healing modalities private  </Text>
            <RoundedCheckbox
              value={hiddenFields["spiritualProfile"] || false}
              onValueChange={() => toggleHidden("spiritualProfile")}
            />
          </View>

          {/* Affirmation */}
          <Text style={styles.affirmation}>
            Your healing journey is a sacred path that connects you to others walking similar roads of
            <Text style={styles.highlightedWord}> transformation</Text>
          </Text>
        </ScrollView>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleModalitiesSubmit}
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
      marginTop: Platform.select({ ios: 0, android: Spacing.sm }),
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
      color: colors.textDark,
      textShadowColor: '#FFD700',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      fontWeight: Typography.weights.medium,
      letterSpacing: 0.5,
    },
    selectedCountSpace: {
      height: 45,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.xs,
    },
    selectedContainer: {
      alignItems: 'center',
    },
    selectedText: {
      ...fonts.spiritualBodyFont,
      color: colors.primary,
      fontSize: Typography.sizes.base,
      fontStyle: 'italic',
      marginBottom: Spacing.xs,
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
      paddingBottom: 120,
      alignItems: 'center',
    },
    healingCircleContainer: {
      position: 'relative',
      marginBottom: Spacing.xs,
      alignSelf: 'center',
    },
    centerContainer: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerCircle: {
      backgroundColor: '#FFD700' + '30',
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
    centerTouchable: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    innerCore: {
      backgroundColor: '#FFD700',
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
      zIndex: 1,
    },
    wave: {
      position: 'absolute',
      borderWidth: 1,
      borderColor: '#FFD700' + '20',
    },
    wave1: {},
    wave2: {},
    wave3: {},
    modalityOrb: {
      position: 'absolute',
      alignItems: 'center',
    },
    orbTouchable: {
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
    modalityLabel: {
      ...fonts.spiritualBodyFont,
      textAlign: 'center',
      fontWeight: Typography.weights.medium,
      lineHeight: Typography.sizes.xs * 1.2,
      marginTop: Spacing.xs / 2,
    },
    privacyContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: Spacing["3xl"],
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
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
      color: colors.textDark,
      opacity: 0.8,
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

export default HealingModalitiesScreen;