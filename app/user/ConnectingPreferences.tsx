import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

export default function ConnectingPreferences() {
  const router = useRouter();
  const { userData } = useUserContext();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  const fullCircleSubscription = userData?.fullCircleSubscription || false;

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
      description: `Looking for ${connectionIntent === "romantic" ? "romantic connections" : "meaningful friendships"}`
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

  const getIntentColors = (intent: string) => {
    if (intent === "romantic") {
      return {
        primary: '#EC4899',
        secondary: '#FDF2F8',
        accent: '#BE185D',
      };
    } else {
      return {
        primary: '#10B981',
        secondary: '#F0FDF4',
        accent: '#047857',
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
  ) => (
    <TouchableOpacity
      style={[styles.fieldContainer, { 
        backgroundColor: colors.card,
        borderColor: colors.border,
        opacity: isSubscriberField && !fullCircleSubscription ? 0.6 : 1
      }]}
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
            <View style={[styles.iconContainer, { backgroundColor: intentColors.primary + '15' }]}>
              <Ionicons 
                name={icon as any} 
                size={18} 
                color={intentColors.primary} 
              />
            </View>
            <Text style={[styles.fieldLabel, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              {label}
            </Text>
          </View>
          <Text style={[styles.fieldDescription, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
            {description}
          </Text>
          <Text style={[styles.fieldValue, fonts.spiritualBodyFont, { color: colors.textLight }]}>
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
            name="chevron-forward" 
            size={18} 
            color={colors.textMuted}
            style={styles.chevronIcon}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

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
        {/* Dynamic Header based on connection type */}
        <View style={styles.headerSection}>
          <View style={styles.headerIconContainer}>
            <View style={[styles.headerIcon, { backgroundColor: intentColors.secondary }]}>
              <Ionicons 
                name={isRomantic ? "heart" : "people"} 
                size={32} 
                color={intentColors.primary} 
              />
            </View>
          </View>
          <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            {isRomantic ? "Dating" : "Friendship"} Preferences
          </Text>
          <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            Customize your {isRomantic ? "romantic" : "friendship"} connection preferences
          </Text>
        </View>

        {/* Basic Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.spiritualTitleFont, { color: intentColors.primary }]}>
            Connection Preferences
          </Text>
          <Text style={[styles.sectionSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            Set your basic preferences for meaningful connections
          </Text>
          
          {preferences.map(({ label, value, isSubscriberField, fieldName, icon, description }) => (
            <React.Fragment key={fieldName}>
              {renderPreferenceItem(label, value, isSubscriberField, fieldName, icon, description)}
            </React.Fragment>
          ))}
        </View>

        {/* Premium Section */}
        <View style={styles.section}>
          <View style={styles.premiumHeader}>
            <View style={styles.premiumTitleContainer}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="sparkles" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.sectionTitle, fonts.spiritualTitleFont, { color: colors.primary, marginLeft: Spacing.sm }]}>
                FullCircle Preferences
              </Text>
            </View>
            
            {!fullCircleSubscription && (
              <TouchableOpacity
                style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
                onPress={() => router.navigate("/user/FullCircleSubscription")}
                activeOpacity={0.8}
              >
                <Text style={[styles.upgradeText, fonts.spiritualBodyFont, { color: colors.card }]}>
                  Upgrade
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={[styles.sectionSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            {fullCircleSubscription 
              ? "Fine-tune your spiritual compatibility preferences"
              : "Unlock deeper spiritual matching with FullCircle"
            }
          </Text>

          {premiumPreferences.map(({ label, value, isSubscriberField, fieldName, icon, description }) => (
            <React.Fragment key={fieldName}>
              {renderPreferenceItem(label, value, isSubscriberField, fieldName, icon, description)}
            </React.Fragment>
          ))}
        </View>

        {/* Affirmation */}
        <View style={styles.affirmationContainer}>
          <Text style={[styles.affirmation, fonts.affirmationFont, { color: colors.textLight }]}>
            Your{' '}
            <Text style={[styles.highlightedWord, { textShadowColor: intentColors.primary }]}>
              preferences
            </Text>
            {' guide the universe in bringing you the perfect connections'}
          </Text>
        </View>

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
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },

  headerIconContainer: {
    marginBottom: Spacing.md,
  },

  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: intentColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  headerTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },

  headerSubtitle: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: Typography.sizes.base * 1.4,
  },
  
  section: {
    marginBottom: Spacing['2xl'],
  },
  
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
    letterSpacing: 0.3,
  },
  
  sectionSubtitle: {
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.lg,
    lineHeight: Typography.sizes.sm * 1.4,
    fontStyle: 'italic',
  },
  
  premiumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  
  premiumTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  upgradeButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  
  upgradeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.5,
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
    backgroundColor: intentColors.secondary,
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