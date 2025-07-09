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

export default function DatingPreferences() {
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

  // Updated preferences based on current UserDataType
  const preferences = [
    {
      label: "Looking For",
      value: userData?.matchPreferences?.ConnectionPreferences,
      isSubscriberField: false,
      fieldName: "ConnectionPreferences",
      icon: "heart-circle",
      description: "Who you're interested in connecting with"
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
      value: userData?.matchPreferences?.spiritualCompatibility?.practices || "Open to All",
      isSubscriberField: true,
      fieldName: "preferredSpiritualPractices",
      icon: "sparkles",
      description: "Preferred spiritual practices"
    },
    {
      label: "Spiritual Draws",
      value: userData?.matchPreferences?.spiritualCompatibility?.spiritualDraws || "Open to All",
      isSubscriberField: true,
      fieldName: "preferredSpiritualDraws",
      icon: "leaf",
      description: "Preferred spiritual draws"
    },
    {
      label: "Healing Modalities",
      value: userData?.matchPreferences?.spiritualCompatibility?.healingModalities || "Open to All",
      isSubscriberField: true,
      fieldName: "preferredHealingModalities",
      icon: "heart",
      description: "Preferred healing modalities"
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
            <Ionicons 
              name={icon as any} 
              size={20} 
              color={colors.primary} 
              style={styles.fieldIcon}
            />
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

  const styles = createStyles(colors, fonts);

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
        {/* Basic Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            Connection Preferences
          </Text>
          <Text style={[styles.sectionSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            Set your basic preferences for sacred connections
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
              <Ionicons name="sparkles" size={24} color={colors.primary} />
              <Text style={[styles.sectionTitle, fonts.spiritualTitleFont, { color: colors.textDark, marginLeft: Spacing.sm }]}>
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

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any, fonts: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.md,
  },
  
  headerTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  upgradeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.5,
  },
  
  fieldContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    marginBottom: Spacing.xs,
  },
  
  fieldIcon: {
    marginRight: Spacing.sm,
  },
  
  fieldLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.3,
  },
  
  fieldDescription: {
    fontSize: Typography.sizes.xs,
    marginBottom: Spacing.xs,
    fontStyle: 'italic',
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
  
  bottomSpacing: {
    height: Spacing.xl,
  },
});