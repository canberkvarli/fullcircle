import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Platform,
  StatusBar,
  Alert,
  Animated,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

export default function ConnectionPreferences() {
  const router = useRouter();
  const { userData, updateUserData } = useUserContext();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  const fullCircleSubscription = userData?.fullCircleSubscription || false;

  // Animation values for smooth transitions
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));

  const formatValue = (value: any, defaultValue = "Open to All") => {
    if (Array.isArray(value)) {
      return value.length === 0
        ? defaultValue
        : value.length > 3
          ? `${value.slice(0, 3).join(", ")} +${value.length - 3} more`
          : value.join(", ");
    }

    if (typeof value === "string" && /[\d]+(\s*[\w]+)?/.test(value)) {
      const match = value.match(/[\d]+/);
      if (match) {
        return `${match[0]} ${value.replace(match[0], "").trim()}`;
      }
    }

    return value || defaultValue;
  };

  // Get connection intent to show appropriate title
  const connectionIntent = userData?.matchPreferences?.connectionIntent || "romantic";
  const isRomantic = connectionIntent === "romantic";

  // Updated preferences based on new connection structure
  const preferences = [
    {
      label: "Connection Type",
      value: connectionIntent === "romantic" ? "Dating" : "Friendship",
      isSubscriberField: false,
      fieldName: "connectionIntent",
      icon: connectionIntent === "romantic" ? "heart" : "people",
      description: `Switch between dating and friendship connections anytime`
    },
    // Only show gender preferences for romantic connections
    ...(isRomantic ? [{
      label: "Interested In",
      value: userData?.matchPreferences?.connectionPreferences,
      isSubscriberField: false,
      fieldName: "connectionPreferences",
      icon: "heart-circle",
      description: "Who you're interested in connecting with"
    }] : []),
    {
      label: "Connection Style",
      value: userData?.matchPreferences?.connectionStyles,
      isSubscriberField: false,
      fieldName: "connectionStyles",
      icon: "sparkles-outline",
      description: isRomantic ? "Your romantic connection style" : "How you like to connect with friends"
    },
    {
      label: "Age Range",
      value: userData?.matchPreferences?.preferredAgeRange
        ? `${userData.matchPreferences.preferredAgeRange.min || 18} - ${
            userData.matchPreferences.preferredAgeRange.max || 70
          } years`
        : "18 - 70 years",
      isSubscriberField: false,
      fieldName: "preferredAgeRange",
      icon: "calendar",
      description: "Preferred age range for connections"
    },
    {
      label: "Height Range",
      value: userData?.matchPreferences?.preferredHeightRange
        ? `${userData.matchPreferences.preferredHeightRange.min || 3}' - ${
            userData.matchPreferences.preferredHeightRange.max || 8
          }' tall`
        : "3' - 8' tall",
      isSubscriberField: true,
      fieldName: "preferredHeightRange",
      icon: "resize",
      description: "Preferred height range"
    },
    {
      label: "Maximum Distance",
      value: `${userData?.matchPreferences?.preferredDistance || 100} miles`,
      isSubscriberField: false,
      fieldName: "preferredDistance",
      icon: "location",
      description: "How far you're willing to connect"
    },
  ];

  // Premium preferences for FullCircle subscribers
  const premiumPreferences = [
    {
      label: "Spiritual Practices",
      value: userData?.matchPreferences?.spiritualCompatibility?.practices || userData?.spiritualProfile?.practices || "Open to All",
      isSubscriberField: true,
      fieldName: "preferredSpiritualPractices",
      icon: "flower-outline",
      description: "Preferred spiritual practices for deeper compatibility"
    },
    {
      label: "Spiritual Draws",
      value: userData?.matchPreferences?.spiritualCompatibility?.spiritualDraws || userData?.spiritualProfile?.draws || "Open to All",
      isSubscriberField: true,
      fieldName: "preferredSpiritualDraws",
      icon: "leaf-outline",
      description: "Preferred spiritual interests and draws"
    },
    {
      label: "Healing Modalities",
      value: userData?.matchPreferences?.spiritualCompatibility?.healingModalities || userData?.spiritualProfile?.healingModalities || "Open to All",
      isSubscriberField: true,
      fieldName: "preferredHealingModalities",
      icon: "medical-outline",
      description: "Preferred healing and wellness practices"
    },
  ];

  const handleEditField = (fieldName: string, currentValue: any) => {
    // Special handling for connection intent - toggle right here
    if (fieldName === "connectionIntent") {
      handleConnectionIntentToggle();
      return;
    }

    if (fieldName === "preferredAgeRange" && typeof currentValue === "string") {
      currentValue = {
        min: parseInt(currentValue.split(" - ")[0], 10),
        max: parseInt(currentValue.split(" - ")[1], 10),
      };
    } else if (fieldName === "preferredDistance" && typeof currentValue === "string") {
      currentValue = parseInt(currentValue, 10);
    }
    
    router.navigate({
      pathname: "/user/edit/EditPreferenceField",
      params: { fieldName, currentValue: JSON.stringify(currentValue) },
    });
  };

  const handleConnectionIntentToggle = async () => {
    try {
      const newIntent = connectionIntent === "romantic" ? "friendship" : "romantic";
      
      // Subtle slide animation
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        // Content changes here, then fade back in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
      
      await updateUserData({
        matchPreferences: {
          ...userData.matchPreferences,
          connectionIntent: newIntent,
          // Reset connection preferences when switching
          connectionPreferences: newIntent === "romantic" ? [] : ["Everyone"],
          connectionStyles: [],
          // Ensure required fields are present
          preferredDistance: userData.matchPreferences?.preferredDistance || 100,
        },
      });
    } catch (error: any) {
      Alert.alert("Error", "Unable to update connection type: " + error.message);
    }
  };

  const getIntentColors = (intent: string) => {
    if (intent === "romantic") {
      return {
        primary: '#EC4899', // Vibrant pink
        secondary: '#FDF2F8', // Light pink background
        accent: '#BE185D', // Deep pink
        tertiary: '#F9A8D4', // Medium pink
      };
    } else {
      return {
        primary: '#10B981', // Vibrant emerald
        secondary: '#F0FDF4', // Light green background  
        accent: '#047857', // Deep emerald
        tertiary: '#6EE7B7', // Medium emerald
      };
    }
  };

  const intentColors = getIntentColors(connectionIntent);

  const renderPreferenceItem = (
    label: string,
    value: any,
    isSubscriberField: boolean,
    fieldName: string,
    icon: string,
    description: string
  ) => {
    const isConnectionType = fieldName === "connectionIntent";
    const itemColors = isConnectionType ? intentColors : { primary: colors.primary };
    
    return (
      <TouchableOpacity
        style={[
          styles.fieldContainer, 
          { 
            backgroundColor: colors.card,
            borderColor: isConnectionType ? intentColors.primary + '30' : colors.border,
            borderWidth: isConnectionType ? 2 : 1,
            opacity: isSubscriberField && !fullCircleSubscription ? 0.6 : 1
          }
        ]}
        onPress={() =>
          isSubscriberField && !fullCircleSubscription
            ? router.navigate("/user/FullCircleSubscription")
            : handleEditField(fieldName, value)
        }
        activeOpacity={0.7}
      >
        <View style={styles.fieldContent}>
          <View style={styles.fieldInfo}>
            <View style={styles.fieldHeader}>
              <View style={[
                styles.iconContainer, 
                { backgroundColor: itemColors.primary + '15' }
              ]}>
                <Ionicons 
                  name={icon as any} 
                  size={18} 
                  color={itemColors.primary} 
                />
              </View>
              <Text style={[styles.fieldLabel, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                {label}
              </Text>
              {isConnectionType && (
                <View style={[styles.switchBadge, { backgroundColor: intentColors.tertiary }]}>
                  <Ionicons name="swap-horizontal" size={12} color={intentColors.accent} />
                </View>
              )}
            </View>
            <Text style={[styles.fieldDescription, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
              {description}
            </Text>
            <Text style={[styles.fieldValue, fonts.spiritualBodyFont, { 
              color: isConnectionType ? intentColors.primary : colors.textLight,
              fontWeight: isConnectionType ? Typography.weights.semibold : Typography.weights.medium
            }]}>
              {formatValue(value)}
            </Text>
          </View>
          
          <View style={styles.fieldActions}>
            {isSubscriberField && !fullCircleSubscription && (
              <View style={[styles.lockContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="lock-closed" size={16} color={colors.primary} />
              </View>
            )}
            <Ionicons 
              name={isConnectionType ? "swap-horizontal" : "chevron-forward"} 
              size={18} 
              color={isConnectionType ? intentColors.primary : colors.textMuted}
              style={styles.chevronIcon}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleClose = () => {
    router.back();
  };

  const styles = createStyles(colors, fonts, intentColors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
      
      {/* Minimal Header with Close */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Single Header */}
        <View style={styles.headerSection}>
          <Text style={[styles.mainTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            Connection Preferences
          </Text>
          <Text style={[styles.mainSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            Customize how you connect with others in the circle
          </Text>
        </View>

        {/* Animated Container for Smooth Transitions */}
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }}>
          {/* Connection Preferences */}
          <View style={styles.section}>
            {preferences.map(({ label, value, isSubscriberField, fieldName, icon, description }) => (
              <React.Fragment key={fieldName}>
                {renderPreferenceItem(label, value, isSubscriberField, fieldName, icon, description)}
              </React.Fragment>
            ))}
          </View>

          {/* FullCircle Section */}
          <View style={[styles.premiumSection, { backgroundColor: colors.card }]}>
            <View style={styles.premiumHeader}>
              <Ionicons name="sparkles" size={24} color={colors.primary} />
              <Text style={[styles.premiumTitle, fonts.spiritualTitleFont, { color: colors.primary }]}>
                FullCircle
              </Text>
            </View>
            
            <Text style={[styles.premiumDescription, fonts.spiritualBodyFont, { color: colors.textLight }]}>
              {fullCircleSubscription 
                ? "Advanced spiritual compatibility preferences"
                : "Unlock deeper spiritual matching and advanced filters"
              }
            </Text>
            
            {!fullCircleSubscription && (
              <TouchableOpacity
                style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
                onPress={() => router.navigate("/user/FullCircleSubscription")}
                activeOpacity={0.8}
              >
                <Text style={[styles.upgradeText, fonts.spiritualBodyFont, { color: 'white' }]}>
                  Upgrade to FullCircle
                </Text>
                <Ionicons name="arrow-forward" size={16} color="white" style={styles.upgradeIcon} />
              </TouchableOpacity>
            )}

            {/* Premium Preferences */}
            <View style={styles.premiumPreferences}>
              {premiumPreferences.map(({ label, value, isSubscriberField, fieldName, icon, description }) => (
                <React.Fragment key={fieldName}>
                  {renderPreferenceItem(label, value, isSubscriberField, fieldName, icon, description)}
                </React.Fragment>
              ))}
            </View>
          </View>
        </Animated.View>
        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any, fonts: any, intentColors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.md,
  },
  
  closeButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  
  scrollView: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },

  headerSection: {
    marginBottom: Spacing.xl,
  },

  mainTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    textAlign: "left",
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },

  mainSubtitle: {
    fontSize: Typography.sizes.base,
    textAlign: "left",
    fontStyle: 'italic',
    lineHeight: Typography.sizes.base * 1.4,
  },
  
  section: {
    marginBottom: Spacing.lg,
  },

  premiumSection: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  premiumTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginLeft: Spacing.md,
  },

  premiumDescription: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
    lineHeight: Typography.sizes.sm * 1.4,
    marginBottom: Spacing.lg,
  },

  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  upgradeText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.5,
  },

  upgradeIcon: {
    marginLeft: Spacing.sm,
  },

  premiumPreferences: {
    // Container for premium preference items
  },
  
  fieldContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
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
  
  fieldContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  
  fieldInfo: {
    flex: 1,
  },
  
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    position: 'relative',
  },

  switchBadge: {
    position: 'absolute',
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  
  fieldLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.3,
  },
  
  fieldDescription: {
    fontSize: Typography.sizes.xs,
    marginBottom: Spacing.sm,
    fontStyle: 'italic',
    lineHeight: Typography.sizes.xs * 1.3,
  },
  
  fieldValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  
  fieldActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  
  lockContainer: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  
  chevronIcon: {
    opacity: 0.6,
  },

  affirmationContainer: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: intentColors.primary,
  },

  affirmation: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: Typography.sizes.base,
    lineHeight: Typography.sizes.base * 1.5,
    letterSpacing: 0.3,
  },

  highlightedWord: {
    color: colors.textDark,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.5,
  },
  
  bottomSpacing: {
    height: Spacing.xl,
  },
});