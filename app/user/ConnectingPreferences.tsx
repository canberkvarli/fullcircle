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
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import OuroborosSVG from "@/components/ouroboros/OuroborosSVG";

export default function ConnectingPreferences() {
  const router = useRouter();
  const { userData, updateUserData } = useUserContext();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  const fullCircleSubscription = userData?.subscription?.isActive || false;

  const connectionIntent = userData?.matchPreferences?.connectionIntent || "romantic";
  const isRomantic = connectionIntent === "romantic";
  const isFriendship = connectionIntent === "friendship";

  // Modal state
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(connectionIntent);
  
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [modalAnimation] = useState(new Animated.Value(0));

  // Ouroboros rotation animation
  const [rotateAnim] = useState(new Animated.Value(0));
  const [glowAnim] = useState(new Animated.Value(0));

  // Initialize animations
  React.useEffect(() => {
    // Continuous rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    // Continuous glow animation for Full Circle users
    if (fullCircleSubscription) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [fullCircleSubscription]);

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

  // Connection intent options
  const connectionOptions = [
    {
      id: "romantic",
      title: "Dating",
      subtitle: "Looking for romantic connections",
      icon: "heart",
      color: '#EC4899',
      gradient: ['#EC4899', '#F97316'],
    },
    {
      id: "friendship", 
      title: "Friendship",
      subtitle: "Looking for platonic connections",
      icon: "people",
      color: '#10B981',
      gradient: ['#10B981', '#06B6D4'],
    },
    {
      id: "both",
      title: "Both",
      subtitle: "Open to all types of connections",
      icon: "infinite",
      color: '#8B5CF6',
      gradient: ['#8B5CF6', '#EC4899', '#F97316'],
    }
  ];

  const preferences = [
    {
      label: "Connection Type",
      value: connectionIntent === "romantic" ? "Dating" : connectionIntent === "friendship" ? "Friendship" : "Both",
      isSubscriberField: false,
      fieldName: "connectionIntent",
      icon: connectionIntent === "romantic" ? "heart" : connectionIntent === "friendship" ? "people" : "infinite",
      description: `Switch between dating, friendship, and both connections anytime`
    },
    ...(isRomantic ? [{
      label: "Interested In",
      value: userData?.matchPreferences?.connectionPreferences,
      isSubscriberField: false,
      fieldName: "connectionPreferences",
      icon: "heart-circle",
      description: "Who you're interested in connecting with romantically"
    }] : []),
    {
      label: "Connection Style",
      value: userData?.matchPreferences?.connectionStyles,
      isSubscriberField: false,
      fieldName: "connectionStyles",
      icon: "infinite",
      description: isRomantic ? "Your romantic connection style" : isFriendship ? "How you like to connect with friends" : "Your connection style preferences"
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
      isSubscriberField: false,
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

  // Premium preferences for FullCircle subscribers - FIXED to use matchPreferences.spiritualCompatibility
  const premiumPreferences = [
    {
      label: "Spiritual Practices",
      value: userData?.matchPreferences?.spiritualCompatibility?.practices || [],
      isSubscriberField: true,
      fieldName: "preferredSpiritualPractices",
      icon: "flower-outline",
      description: "Preferred spiritual practices for deeper compatibility"
    },
    {
      label: "Spiritual Draws",
      value: userData?.matchPreferences?.spiritualCompatibility?.spiritualDraws || [],
      isSubscriberField: true,
      fieldName: "preferredSpiritualDraws",
      icon: "leaf-outline",
      description: "Preferred spiritual interests and draws"
    },
    {
      label: "Healing Modalities",
      value: userData?.matchPreferences?.spiritualCompatibility?.healingModalities || [],
      isSubscriberField: true,
      fieldName: "preferredHealingModalities",
      icon: "medical-outline",
      description: "Preferred healing and wellness practices"
    },
  ];

  const handleEditField = (fieldName: string, currentValue: any) => {
    if (fieldName === "connectionIntent") {
      setSelectedOption(connectionIntent); // Reset to current value when opening
      setShowConnectionModal(true);
      Animated.spring(modalAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
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

  const handleConnectionIntentChange = async (newIntent: "romantic" | "friendship" | "both") => {
    setSelectedOption(newIntent);
  };

  const handleSaveSelection = async () => {
    try {
      Animated.timing(modalAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowConnectionModal(false);
      });

      if (selectedOption !== connectionIntent) {
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        });
        
        await updateUserData({
          matchPreferences: {
            ...userData.matchPreferences,
            connectionIntent: selectedOption,
            connectionPreferences: selectedOption === "friendship" ? ["Everyone"] : [],
            connectionStyles: [],
            preferredDistance: userData.matchPreferences?.preferredDistance || 100,
            datePreferences: [],
          },
        });
      }
    } catch (error: any) {
      Alert.alert("Error", "Unable to update connection type: " + error.message);
    }
  };

  const handleCancelSelection = () => {
    setSelectedOption(connectionIntent);
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowConnectionModal(false);
    });
  };

  const getIntentColors = (intent: string) => {
    if (intent === "romantic") {
      return {
        primary: '#EC4899', 
        secondary: '#FDF2F8', 
        accent: '#BE185D', 
        tertiary: '#F9A8D4', 
      };
    } else if (intent === "friendship") {
      return {
        primary: '#10B981', 
        secondary: '#F0FDF4', 
        accent: '#047857', 
        tertiary: '#6EE7B7', 
      };
    } else { 
      return {
        primary: '#8B5CF6', 
        secondary: '#FAF5FF', 
        accent: '#7C3AED', 
        tertiary: '#C4B5FD', 
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
    
    // FIXED: Check if value is empty array and handle FullCircle subscription requirement properly
    const isEmptyArray = Array.isArray(value) && value.length === 0;
    const shouldShowLocked = isSubscriberField && !fullCircleSubscription;
    const displayValue = isEmptyArray && isSubscriberField 
      ? "Open to All" 
      : formatValue(value);

    // Divine golden border for spiritual filters when Full Circle is active
    const isPremiumField = isSubscriberField;
    const shouldShowGoldenBorder = isPremiumField && fullCircleSubscription;
    
    return (
      <TouchableOpacity
        style={[
          styles.fieldContainer, 
          { 
            backgroundColor: colors.card,
            borderColor: shouldShowGoldenBorder 
              ? '#D4AF37' // Softer golden color for Full Circle spiritual filters
              : isConnectionType 
                ? intentColors.primary + '30' 
                : colors.border,
            borderWidth: shouldShowGoldenBorder ? 2 : isConnectionType ? 2 : 1,
            opacity: shouldShowLocked ? 0.6 : 1,
            shadowColor: shouldShowGoldenBorder ? '#D4AF37' : '#000',
            shadowOpacity: shouldShowGoldenBorder ? 0.2 : 0.05,
            shadowRadius: shouldShowGoldenBorder ? 8 : 4,
            elevation: shouldShowGoldenBorder ? 6 : 2,
          }
        ]}
        onPress={() =>
          shouldShowLocked
            ? router.navigate("/user/FullCircleSubscription")
            : handleEditField(fieldName, value)
        }
        activeOpacity={0.7}
      >
        <View style={styles.fieldContent}>
          <View style={styles.fieldInfo}>
            <View style={styles.fieldHeader}>
              <Text style={[styles.fieldLabel, fonts.modalBodyFont, { color: colors.textDark }]}>
                {label}
              </Text>
              {isConnectionType && (
                <View style={[styles.connectionBadge, { backgroundColor: intentColors.tertiary }]}>
                  <Ionicons 
                    name={connectionIntent === "romantic" ? "heart" : connectionIntent === "friendship" ? "people" : "infinite"} 
                    size={14} 
                    color={intentColors.accent} 
                  />
                </View>
              )}
            </View>
            <Text style={[styles.fieldDescription, fonts.modalBodyFont, { color: colors.textMuted }]}>
              {description}
            </Text>
            <Text style={[styles.fieldValue, fonts.modalBodyFont, { 
              color: isConnectionType ? intentColors.primary : shouldShowGoldenBorder ? '#B8860B' : colors.textLight,
              fontWeight: isConnectionType ? Typography.weights.semibold : Typography.weights.medium
            }]}>
              {displayValue}
            </Text>
          </View>
          
          <View style={styles.fieldActions}>
            {shouldShowLocked && (
              <View style={[styles.lockContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="lock-closed" size={16} color={colors.primary} />
              </View>
            )}
            <Ionicons 
              name={isConnectionType ? "options" : "chevron-forward"} 
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
          <Text style={[styles.mainTitle, fonts.modalTitleFont, { color: colors.textDark }]}>
            Connection Preferences
          </Text>
          <Text style={[styles.mainSubtitle, fonts.modalBodyFont, { color: colors.textLight }]}>
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

          {/* FullCircle Header Section */}
          <View style={styles.premiumHeaderSection}>
            <View style={styles.premiumHeader}>
              {/* Ouroboros Icon instead of sparkles */}
              <View style={styles.ouroborosContainer}>
                <Animated.View 
                  style={[
                    styles.ouroborosWrapper,
                    {
                      transform: [{
                        rotate: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      }],
                    }
                  ]}
                >
                  {fullCircleSubscription ? (
                    <Animated.View 
                      style={[
                        styles.ouroborosGlow,
                        {
                          shadowOpacity: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 0.8],
                          }),
                        }
                      ]}
                    >
                      <OuroborosSVG
                        size={64}
                        fillColor='#F5E6D3'
                        strokeColor='#B8860B'
                        strokeWidth={2}
                      />
                    </Animated.View>
                  ) : (
                    <View style={styles.ouroborosBasic}>
                      <OuroborosSVG
                        size={64}
                        fillColor={colors.card}
                        strokeColor={colors.textMuted}
                        strokeWidth={2}
                      />
                    </View>
                  )}
                </Animated.View>
              </View>
              
              <Text style={[styles.premiumTitle, fonts.modalTitleFont, { color: colors.primary }]}>
                FullCircle
              </Text>
            </View>
            
            <Text style={[styles.premiumDescription, fonts.modalBodyFont, { color: colors.textLight }]}>
              {fullCircleSubscription 
                ? "Advanced spiritual compatibility preferences"
                : "Unlock deeper spiritual matching and advanced filters"
              }
            </Text>
            
            {!fullCircleSubscription && (
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => router.navigate("/user/FullCircleSubscription")}
                activeOpacity={0.8}
              >
                <View style={styles.goldenGlow} />
                <Text style={[styles.upgradeText, fonts.modalBodyFont]}>
                  Upgrade to FullCircle
                </Text>
                <Ionicons name="arrow-forward" size={16} color="white" style={styles.upgradeIcon} />
              </TouchableOpacity>
            )}
          </View>

          {/* Premium Preferences */}
          <View style={styles.section}>
            {premiumPreferences.map(({ label, value, isSubscriberField, fieldName, icon, description }) => (
              <React.Fragment key={fieldName}>
                {renderPreferenceItem(label, value, isSubscriberField, fieldName, icon, description)}
              </React.Fragment>
            ))}
          </View>
        </Animated.View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Connection Type Modal */}
      <Modal
        visible={showConnectionModal}
        transparent={true}
        animationType="none"
        onRequestClose={handleCancelSelection}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCancelSelection}
        >
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [
                  {
                    scale: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
                opacity: modalAnimation,
              }
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                <Text style={[styles.modalTitle, fonts.modalTitleFont, { color: colors.textDark }]}>
                  Choose Connection Type
                </Text>
                <Text style={[styles.modalSubtitle, fonts.modalBodyFont, { color: colors.textMuted }]}>
                  Select how you'd like to connect with others
                </Text>

                <View style={styles.optionsContainer}>
                  {connectionOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: selectedOption === option.id 
                            ? option.color + '15' 
                            : colors.background,
                          borderColor: selectedOption === option.id 
                            ? option.color 
                            : colors.border,
                          borderWidth: selectedOption === option.id ? 2 : 1,
                        }
                      ]}
                      onPress={() => handleConnectionIntentChange(option.id as "romantic" | "friendship" | "both")}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionContent}>
                        <View style={styles.optionLeft}>
                          <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                            <Ionicons 
                              name={option.icon as any} 
                              size={24} 
                              color={option.color} 
                            />
                          </View>
                          <View style={styles.optionText}>
                            <Text style={[styles.optionTitle, fonts.modalBodyFont, { 
                              color: selectedOption === option.id ? option.color : colors.textDark,
                              fontWeight: selectedOption === option.id ? Typography.weights.bold : Typography.weights.semibold
                            }]}>
                              {option.title}
                            </Text>
                            <Text style={[styles.optionSubtitle, fonts.modalBodyFont, { color: colors.textMuted }]}>
                              {option.subtitle}
                            </Text>
                          </View>
                        </View>
                        
                        <View style={styles.checkmarkContainer}>
                          {selectedOption === option.id && (
                            <Ionicons name="checkmark-circle" size={24} color={option.color} />
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={handleCancelSelection}
                  >
                    <Text style={[styles.cancelButtonText, fonts.modalBodyFont, { color: colors.textMuted }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                    onPress={handleSaveSelection}
                  >
                    <Text style={[styles.saveButtonText, fonts.modalBodyFont]}>
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
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

  premiumHeaderSection: {
    marginBottom: Spacing.lg,
  },

  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  // New Ouroboros styles
  ouroborosContainer: {
    marginRight: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ouroborosWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  ouroborosGlow: {
    shadowColor: '#B8860B',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 4,
  },

  ouroborosBasic: {
    // No special effects for non-Full Circle users
  },

  premiumTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
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
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#FFD700',
    ...Platform.select({
      ios: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  goldenGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: BorderRadius.full,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 25,
      },
      android: {
        elevation: 12,
      },
    }),
  },

  upgradeText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
    color: 'white',
    zIndex: 1,
  },

  upgradeIcon: {
    marginLeft: Spacing.sm,
    zIndex: 1,
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

  connectionBadge: {
    position: 'absolute',
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  premiumBadge: {
    position: 'absolute',
    right: 0,
    top: -5,
  },

  premiumBadgeText: {
    fontSize: 16,
  },

  connectionEmoji: {
    fontSize: 16,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },

  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },

  modalContent: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },

  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  modalSubtitle: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    opacity: 0.8,
  },

  optionsContainer: {
    marginBottom: Spacing.xl,
  },

  optionButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    width: '100%',
    borderWidth: 1,
  },

  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },

  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    flexShrink: 0,
  },

  optionText: {
    flex: 1,
    minWidth: 0,
  },

  optionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },

  optionSubtitle: {
    fontSize: Typography.sizes.sm,
    opacity: 0.8,
  },

  checkmarkContainer: {
    width:40, 
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },

  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButton: {
    borderWidth: 1,
  },

  saveButton: {
    // No additional styles needed - background color set inline
  },

  cancelButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },

  saveButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: 'white',
  },
});