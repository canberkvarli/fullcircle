import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Animated,
  ScrollView,
  useColorScheme,
  Platform,
  StatusBar,
  Dimensions,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import { Colors, Typography, Spacing } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import RadianceScreen from "@/components/RadianceScreen";
import OrbsScreen from "@/components/OrbsScreen"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function SacredSelf() {
  const { 
    userData, 
    activateRadiance, 
    getRadianceTimeRemaining,
    getRadianceStatus,
    updateUserData
  } = useUserContext();
  
  const [verified, _] = useState(userData.settings?.isSelfieVerified || false);
  const [showRadianceModal, setShowRadianceModal] = useState(false);
  const [showOrbsModal, setShowOrbsModal] = useState(false);
  const [isActivatingBoost, setIsActivatingBoost] = useState(false);
  const router = useRouter();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const isFullCircle = userData.subscription?.isActive;

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [100, 200],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const handleVerify = () => {
    router.navigate("/user/SelfieVerificationScreen");
  };

  const handleOrbsPress = () => {
    setShowOrbsModal(true);
  };

  // New handler for radiance clicks
  const handleRadiancePress = async () => {
    const radianceStatus = getRadianceStatus();
    const radianceTimeRemaining = getRadianceTimeRemaining();
    
    // If radiance is already active, show info about current radiance
    if (radianceTimeRemaining > 0) {
      Alert.alert(
        "Sacred Radiance Active ✨",
        `Your Sacred Radiance is currently active with ${radianceStatus.formattedTime} remaining. You're getting 11x more visibility!`,
        [
          {
            text: "Get More Radiance",
            onPress: () => setShowRadianceModal(true)
          },
          {
            text: "OK",
            style: "cancel"
          }
        ]
      );
      return;
    }

    // If user has available radiances, ask if they want to activate
    if ((userData.activeBoosts || 0) > 0) {
      Alert.alert(
        "Activate Sacred Radiance",
        `You have ${userData.activeBoosts} radiance${userData.activeBoosts !== 1 ? 's' : ''} available. Activate Sacred Radiance to increase your visibility for 1 hour?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Activate",
            onPress: handleActivateRadiance
          },
          {
            text: "Buy More",
            onPress: () => setShowRadianceModal(true)
          }
        ]
      );
    } else {
      // No radiances available, redirect to purchase screen
      setShowRadianceModal(true);
    }
  };

  const handleActivateRadiance = async () => {
    setIsActivatingBoost(true);
    try {
      await activateRadiance();
      Alert.alert(
        "Sacred Radiance Activated! ✨",
        "Your profile is now boosted for the next hour. You'll appear higher in potential matches and your likes will have special radiance energy."
      );
    } catch (error: any) {
      Alert.alert(
        "Activation Failed",
        error.message || "Failed to activate Sacred Radiance. Please try again."
      );
    } finally {
      setIsActivatingBoost(false);
    }
  };

  const calculateAge = () => {
    if (userData.birthyear) {
      return new Date().getFullYear() - parseInt(userData.birthyear);
    }
    return userData.age || 'Unknown';
  };

  const getLocation = () => {
    if (userData.location?.city && userData.location?.region) {
      return `${userData.location.city}, ${userData.location.region}`;
    } else if (userData.location?.city) {
      return userData.location.city;
    } else if (userData.regionName) {
      return userData.regionName;
    }
    return 'Location not shared';
  };

  const getNameFontSize = () => {
    const nameLength = userData.firstName?.length || 0;
    if (nameLength <= 6) return Typography.sizes.lg; 
    if (nameLength <= 10) return Typography.sizes["2xl"];
    return Typography.sizes.sm;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
      
      <View style={[styles.header, { 
        backgroundColor: colors.background,
        borderBottomColor: colors.border 
      }]}>
        <View style={styles.headerLeft} />
        
        <Animated.Text style={[
          styles.animatedHeaderTitle, 
          fonts.spiritualTitleFont, 
          { 
            color: colors.textDark,
            opacity: headerOpacity,
            fontSize: getNameFontSize()
          }
        ]} 
        numberOfLines={1}
        >
          {userData.firstName}
        </Animated.Text>
        
        <View style={styles.headerIcons}>
          <Link href={{ pathname: "/user/ConnectingPreferences" as any }} asChild>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="options" size={22} color="#8B4513" />
            </TouchableOpacity>
          </Link>
          <Link href="/user/UserSettings" asChild>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="settings" size={22} color="#8B4513" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <Link href={"/user/EditUserProfile" as any} asChild>
            <TouchableOpacity style={styles.profileImageContainer} activeOpacity={0.8}>
              <View style={[styles.profileImageWrapper, { borderColor: verified ? '#FFD700' : colors.border }]}>
                {userData.photos?.[0] ? (
                  <Image
                    source={{ uri: userData.photos[0] }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={[styles.placeholderImage, { backgroundColor: colors.border }]}>
                    <Ionicons name="person" size={40} color={colors.textMuted} />
                  </View>
                )}
                <View style={[styles.editIconContainer, { backgroundColor: '#8B4513' }]}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>
          </Link>

          <View style={styles.userInfoContainer}>
            <View style={styles.nameVerificationRow}>
              <Text style={[styles.userName, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                {userData.firstName}
              </Text>
              <TouchableOpacity 
                style={[styles.verifyButton, { 
                  backgroundColor: verified ? '#FFD700' + '20' : colors.card,
                  borderColor: verified ? '#FFD700' : colors.border
                }]} 
                onPress={handleVerify}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={verified ? "checkmark-circle" : "shield-checkmark-outline"} 
                  size={16} 
                  color={verified ? '#FFD700' : '#8B4513'} 
                />
                <Text style={[
                  styles.verifyText, 
                  fonts.spiritualBodyFont,
                  { color: verified ? '#FFD700' : '#8B4513' }
                ]}>
                  {verified ? 'Verified' : 'Verify'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={colors.textMuted} />
              <Text style={[styles.locationText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                {getLocation()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tabContent}>
          {isFullCircle ? (
            <View style={styles.fullCircleActiveContainer}>
              {/* Clickable Full Circle Active Badge */}
              <TouchableOpacity 
                style={[styles.fullCircleBadge, { backgroundColor: colors.card }]}
                onPress={() => router.navigate("/user/FullCircleSubscription")}
                activeOpacity={0.7}
              >
                <View style={[styles.fullCircleIcon, { backgroundColor: '#8B4513' + '20' }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#8B4513" />
                </View>
                <Text style={[styles.fullCircleBadgeText, fonts.spiritualBodyFont, { color: '#8B4513' }]}>
                  Full Circle Active
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
              
              <View style={styles.featuresContainer}>
                {/* Unlimited Likes */}
                <TouchableOpacity 
                  style={[styles.featureRow, { backgroundColor: colors.card }]}
                  onPress={() => router.navigate("/user/FullCircleSubscription")}
                  activeOpacity={0.7}
                >
                  <View style={styles.featureIconContainer}>
                    <View style={[styles.featureIcon, { backgroundColor: '#FF6B6B' + '20' }]}>
                      <Ionicons name="heart-circle" size={24} color="#FF6B6B" />
                    </View>
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                      Unlimited Likes
                    </Text>
                    <Text style={[styles.featureSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                      Express your interest freely
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>

                {/* Radiances - Now clickable */}
                <TouchableOpacity 
                  style={[styles.featureRow, { backgroundColor: colors.card }]}
                  onPress={handleRadiancePress}
                  activeOpacity={0.7}
                >
                  <View style={styles.featureIconContainer}>
                    <View style={[styles.featureIcon, { backgroundColor: '#FFD700' + '20' }]}>
                      <Ionicons name="flash" size={24} color="#FFD700" />
                      <View style={[styles.countBadge, { backgroundColor: '#FFD700' }]}>
                        <Text style={styles.countText}>{userData.activeBoosts || 0}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                      Radiances
                    </Text>
                    <Text style={[styles.featureSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                      Get seen by 11x more people
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>

                {/* Orbs */}
                <TouchableOpacity 
                  style={[styles.featureRow, { backgroundColor: colors.card }]}
                  onPress={handleOrbsPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.featureIconContainer}>
                    <View style={[styles.featureIcon, { backgroundColor: '#8B4513' + '20' }]}>
                      <Ionicons name="sparkles" size={24} color="#8B4513" />
                      <View style={[styles.countBadge, { backgroundColor: '#8B4513' }]}>
                        <Text style={styles.countText}>{userData.numOfOrbs || 0}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                      Orbs
                    </Text>
                    <Text style={[styles.featureSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                      Super likes with cosmic energy
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>

                {/* See Who Likes You */}
                <TouchableOpacity 
                  style={[styles.featureRow, { backgroundColor: colors.card }]}
                  onPress={() => router.navigate("/(tabs)/KindredSpirits")}
                  activeOpacity={0.7}
                >
                  <View style={styles.featureIconContainer}>
                    <View style={[styles.featureIcon, { backgroundColor: '#9D4EDD' + '20' }]}>
                      <Ionicons name="eye" size={24} color="#9D4EDD" />
                    </View>
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                      See Who Likes You
                    </Text>
                    <Text style={[styles.featureSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                      Know who's interested in you
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>

                {/* Enhanced Filtering */}
                <TouchableOpacity 
                  style={[styles.featureRow, { backgroundColor: colors.card }]}
                  onPress={() => router.navigate("/user/ConnectingPreferences")}
                  activeOpacity={0.7}
                >
                  <View style={styles.featureIconContainer}>
                    <View style={[styles.featureIcon, { backgroundColor: '#00BCD4' + '20' }]}>
                      <Ionicons name="filter" size={24} color="#00BCD4" />
                    </View>
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                      Enhanced Filtering
                    </Text>
                    <Text style={[styles.featureSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                      Find your perfect spiritual match
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.upgradeContainer}>
              <Text style={[styles.upgradeSubtitle, fonts.spiritualBodyFont, { color: colors.textLight, textAlign: 'center' }]}>
                Unlock your full potential and connect with 3x more people
              </Text>
                <TouchableOpacity 
                  style={[styles.premiumUpgradeButton, { backgroundColor: '#8B4513' }]}
                  onPress={() => router.navigate("/user/FullCircleSubscription")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="arrow-up-circle" size={18} color="#FFFFFF" style={styles.upgradeIcon} />
                  <Text style={[styles.upgradeButtonText, fonts.spiritualBodyFont]}>
                    Embrace Full Circle
                  </Text>
                </TouchableOpacity>

              {/* Current user resources */}
              <View style={styles.currentResourcesContainer}>
                <View style={styles.resourcesGrid}>
                  {/* Radiances - Now clickable */}
                  <TouchableOpacity 
                    style={[styles.resourceItem, { backgroundColor: colors.card }]}
                    onPress={handleRadiancePress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.resourceIconContainer}>
                      <View style={[styles.resourceIcon, { backgroundColor: '#FFD700' + '20' }]}>
                        <Ionicons name="flash" size={20} color="#FFD700" />
                        <View style={[styles.countBadge, { backgroundColor: '#FFD700' }]}>
                          <Text style={styles.countText}>{userData.activeBoosts || 0}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.resourceContent}>
                      <Text style={[styles.resourceTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                        Radiances
                      </Text>
                      <Text style={[styles.resourceSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                        Get seen by 11x more people
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>

                  {/* Orbs */}
                  <TouchableOpacity 
                    style={[styles.resourceItem, { backgroundColor: colors.card }]}
                    onPress={handleOrbsPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.resourceIconContainer}>
                      <View style={[styles.resourceIcon, { backgroundColor: '#8B4513' + '20' }]}>
                        <Ionicons name="sparkles" size={20} color="#8B4513" />
                        <View style={[styles.countBadge, { backgroundColor: '#8B4513' }]}>
                          <Text style={styles.countText}>{userData.numOfOrbs || 0}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.resourceContent}>
                      <Text style={[styles.resourceTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                        Orbs
                      </Text>
                      <Text style={[styles.resourceSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                        Super likes with cosmic energy
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Add the RadianceScreen Modal */}
      <RadianceScreen
        visible={showRadianceModal}
        onClose={() => setShowRadianceModal(false)}
      />

      <OrbsScreen
        visible={showOrbsModal}
        onClose={() => setShowOrbsModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  animatedHeaderTitle: {
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
    position: 'absolute',
    left: 80,
    right: 80,
    textAlign: 'center',
    maxWidth: screenWidth - 160,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  iconButton: {
    padding: Spacing.sm,
    borderRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  profileImageContainer: {
    marginBottom: Spacing.md,
  },
  profileImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    padding: 3,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 57,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 57,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfoContainer: {
    alignItems: 'center',
    width: '100%',
  },
  nameVerificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  userName: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  verifyText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  locationText: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  tabContent: {
    flex: 1,
  },
  fullCircleActiveContainer: {
    marginBottom: Spacing.xl,
  },
  fullCircleActiveTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xl,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  featuresContainer: {
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIconContainer: {
    marginRight: Spacing.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.weights.bold,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
    letterSpacing: 0.2,
  },
  featureSubtitle: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.sizes.sm * 1.3,
    letterSpacing: 0.1,
  },
  upgradeSection: {
    marginBottom: Spacing.xl,
  },
  premiumUpgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  goldenGlow: {
    // Remove complex glow that might not be visible
  },
  premiumUpgradeText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
    color: 'white',
  },
  premiumUpgradeIcon: {
    marginLeft: Spacing.sm,
  },
  currentResourcesSection: {
    marginBottom: Spacing.xl,
  },
  upgradeContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  upgradeTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  upgradeSubtitle: {
    fontSize: Typography.sizes.base,
    marginBottom: Spacing.xl,
    lineHeight: Typography.sizes.base * 1.4,
    letterSpacing: 0.2,
    fontStyle: 'italic',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 16,
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeIcon: {
    marginRight: Spacing.sm,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.3,
  },
  currentResourcesContainer: {
    width: '100%',
    alignItems: 'center',
  },
  resourcesGrid: {
    width: '100%',
    gap: Spacing.md,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resourceIconContainer: {
    marginRight: Spacing.md,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
    letterSpacing: 0.2,
  },
  resourceSubtitle: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.sizes.sm * 1.3,
    letterSpacing: 0.1,
  },
  bottomSpacing: {
    height: Spacing['3xl'],
  },
  fullCircleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'center',
    maxWidth: '80%',
  },
  fullCircleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  fullCircleBadgeText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.2,
    flex: 1,
  },
});