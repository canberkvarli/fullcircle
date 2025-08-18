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
  StatusBar,
  Dimensions,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import { Colors, Typography, Spacing } from "@/constants/Colors";
import { CustomIcon } from "@/components/CustomIcon";
import { useFont } from "@/hooks/useFont";
import RadianceScreen from "@/components/RadianceScreen";
import LotusScreen from "@/components/LotusScreen";
import OuroborosSVG from "@/components/ouroboros/OuroborosSVG";
import OuroborosInfoModal from "@/components/modals/OuroborosInfoModal";
import OuroborosLoader from "@/components/ouroboros/OuroborosLoader";
import AsyncStorage from '@react-native-async-storage/async-storage';


const { width: screenWidth } = Dimensions.get("window");

// Cache keys for profile photo
const PROFILE_PHOTO_CACHE_KEY = (userId: string) => `profile_photo_${userId}`;
const PROFILE_PHOTO_CACHE_TIMESTAMP_KEY = (userId: string) => `profile_photo_timestamp_${userId}`;
const PROFILE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export default function SacredSelf() {
  const { 
    userData, 
    activateRadiance, 
    getRadianceTimeRemaining,
    getRadianceStatus,
  } = useUserContext();
  
  const verified = userData?.settings?.isSelfieVerified || false;
  const [showRadianceModal, setShowRadianceModal] = useState(false);
  const [showLotusModal, setshowLotusModal] = useState(false);
  const [showOuroborosTooltip, setShowOuroborosTooltip] = useState(false);
  const [isProfileImageLoading, setIsProfileImageLoading] = useState(true);
  const [cachedProfilePhoto, setCachedProfilePhoto] = useState<string | null>(null);

  const [isActivatingBoost, setIsActivatingBoost] = useState(false);
  const router = useRouter();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const isFullCircle = userData.subscription?.isActive;

  // Load profile photo from cache
  React.useEffect(() => {
    const loadProfilePhoto = async () => {
      if (!userData?.userId) return;

      try {
        const cachedPhotoData = await AsyncStorage.getItem(PROFILE_PHOTO_CACHE_KEY(userData.userId));
        const cacheTimestamp = await AsyncStorage.getItem(PROFILE_PHOTO_CACHE_TIMESTAMP_KEY(userData.userId));
        
        const now = Date.now();
        const isCacheValid = cacheTimestamp && (now - parseInt(cacheTimestamp)) < PROFILE_CACHE_DURATION;
        
        if (cachedPhotoData && isCacheValid) {
          setCachedProfilePhoto(cachedPhotoData);
          console.log('Profile photo loaded from cache');
        } else if (userData.photos?.[0]) {
          // Cache the current photo
          await AsyncStorage.setItem(PROFILE_PHOTO_CACHE_KEY(userData.userId), userData.photos[0]);
          await AsyncStorage.setItem(PROFILE_PHOTO_CACHE_TIMESTAMP_KEY(userData.userId), now.toString());
          setCachedProfilePhoto(userData.photos[0]);
          console.log('Profile photo cached');
        }
      } catch (error) {
        console.error('Error loading profile photo cache:', error);
        setCachedProfilePhoto(userData.photos?.[0] || null);
      }
    };

    loadProfilePhoto();
  }, [userData?.userId, userData?.photos?.[0]]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

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
    if (isFullCircle) {
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
  }, [isFullCircle]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [100, 200],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const handleVerify = () => {
    router.navigate("/user/SelfieVerificationScreen");
  };

  const handleLotusPress = () => {
    setshowLotusModal(true);
  };

  const handleOuroborosInfo = () => {
    setShowOuroborosTooltip(true);
  };

  const handleRadiancePress = async () => {
    const radianceStatus = getRadianceStatus();
    const radianceTimeRemaining = getRadianceTimeRemaining();
    
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
        borderBottomWidth: 0
      }]}>
        <Animated.Text style={[
          styles.animatedHeaderTitle, 
          fonts.spiritualLargeTitleFont, 
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
              <Ionicons
                name="options"
                size={22}
                color={colorScheme === 'dark' ? '#F5E6D3' : '#8B4513'}
              />
            </TouchableOpacity>
          </Link>
          <Link href="/user/UserSettings" asChild>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="settings"
                size={22}
                color={colorScheme === 'dark' ? '#F5E6D3' : '#8B4513'}
              />
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
                {cachedProfilePhoto || userData.photos?.[0] ? (
                  <>
                    {isProfileImageLoading && (
                      <View style={[styles.profileImageLoadingOverlay, { backgroundColor: colors.background + 'F0' }]}>
                        <OuroborosLoader 
                          size={40} 
                          variant="spinner" 
                          loop={true}
                          duration={1500}
                          fillColor={colors.primary}
                          strokeColor={colors.primary}
                        />
                      </View>
                    )}
                    <Image
                      source={{ uri: cachedProfilePhoto || userData.photos?.[0] }}
                      style={styles.profileImage}
                      onLoadStart={() => setIsProfileImageLoading(true)}
                      onLoadEnd={() => setIsProfileImageLoading(false)}
                      onError={() => setIsProfileImageLoading(false)}
                    />
                  </>
                ) : (
                  <View style={[styles.placeholderImage, { backgroundColor: colors.border }]}>
                    <Ionicons name="person" size={40} color={colors.textMuted} />
                  </View>
                )}
                {!isProfileImageLoading && (
                  <View style={[styles.editIconContainer, { backgroundColor: '#8B4513' }]}>
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </Link>

          <View style={styles.userInfoContainer}>
            <View style={styles.nameVerificationRow}>
              <Text style={[styles.userName, fonts.spiritualLargeTitleFont, { color: colors.textDark }]}>
                {userData.firstName}
              </Text>
              {!verified ? (
                <TouchableOpacity 
                  style={[styles.verifyButton, { 
                    backgroundColor: colors.card,
                    borderColor: colors.border
                  }]} 
                  onPress={handleVerify}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="shield-checkmark-outline" 
                    size={16} 
                    color={colors.textDark} 
                  />
                  <Text style={[
                    styles.verifyText, 
                    fonts.spiritualBodyFont,
                    { color: colors.textDark }
                  ]}>
                    Verify
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.verifyButton, { 
                  backgroundColor: '#8B4513' + '20',
                  borderColor: '#8B4513'
                }]}>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={16} 
                    color="#8B4513" 
                  />
                  <Text style={[
                    styles.verifyText, 
                    fonts.spiritualBodyFont,
                    { color: '#8B4513' }
                  ]}>
                    Verified
                  </Text>
                </View>
              )}
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
              {/* Ouroboros Badge - Replaces Full Circle Active Text */}
              <TouchableOpacity 
                style={[styles.ouroborosBadge]}
                onPress={() => router.navigate("/user/FullCircleSubscription")}
                activeOpacity={0.7}
              >
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
                        size={80}
                        fillColor='#F5E6D3'
                        strokeColor='#B8860B'
                        strokeWidth={2}
                      />
                    </Animated.View>
                  </Animated.View>
                  
                  {/* Info Icon */}
                  <TouchableOpacity 
                    style={styles.infoIcon}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleOuroborosInfo();
                    }}
                  >
                    <Ionicons name="information-circle" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
                
                <Text style={[styles.ouroborosBadgeText, fonts.spiritualBodyFont, { color: '#8B4513' }]}>
                  Full Circle Active
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
              
              <View style={styles.featuresContainer}>
                <TouchableOpacity 
                  style={[styles.featureRow, { backgroundColor: colors.card }]}
                  onPress={() => router.navigate("/user/FullCircleSubscription")}
                  activeOpacity={0.7}
                >
                  <View style={styles.featureIconContainer}>
                    <View style={[styles.featureIcon, { backgroundColor: '#FF6B6B' + '20' }]}>
                      <Ionicons name="heart-circle" size={32} color="#FF6B6B" />
                    </View>
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                      Unlimited Hearts
                    </Text>
                    <Text style={[styles.featureSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                      Express your interest freely
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.featureRow, { backgroundColor: colors.card }]}
                onPress={handleRadiancePress}
                activeOpacity={0.7}
              >
                <View style={styles.featureIconContainer}>
                  <View style={[styles.featureIcon, { backgroundColor: '#F1C40F' + '20' }]}>
                    <CustomIcon name="halo" size={24} color="#F1C40F" />
                    <View style={[styles.countBadge, { backgroundColor: '#F1C40F' }]}>
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

                <TouchableOpacity 
                  style={[styles.featureRow, { backgroundColor: colors.card }]}
                  onPress={handleLotusPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.featureIconContainer}>
                    <View style={[styles.featureIcon, { backgroundColor: '#8E44AD' + '20' }]}>
                      <CustomIcon name="lotus" size={32} />
                      <View style={[styles.countBadge, { backgroundColor: '#8E44AD' }]}>
                        <Text style={styles.countText}>{userData.numOfLotus || 0}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                      Lotus Flowers
                    </Text>
                    <Text style={[styles.featureSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                      Super likes with cosmic energy
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.featureRow, { backgroundColor: colors.card }]}
                  onPress={() => router.navigate("/(tabs)/KindredSpirits")}
                  activeOpacity={0.7}
                >
                  <View style={styles.featureIconContainer}>
                    <View style={[styles.featureIcon, { backgroundColor: '#9D4EDD' + '20' }]}>
                      <Ionicons name="eye" size={32} color="#9D4EDD" />
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

                <TouchableOpacity 
                  style={[styles.featureRow, { backgroundColor: colors.card }]}
                  onPress={() => router.navigate("/user/ConnectingPreferences")}
                  activeOpacity={0.7}
                >
                  <View style={styles.featureIconContainer}>
                    <View style={[styles.featureIcon, { backgroundColor: '#00BCD4' + '20' }]}>
                      <Ionicons name="filter" size={32} color="#00BCD4" />
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
              {/* Ouroboros Badge for Non-Full Circle Users */}
              <TouchableOpacity 
                style={[styles.ouroborosBadge, { backgroundColor: colors.card }]}
                onPress={() => router.navigate("/user/FullCircleSubscription")}
                activeOpacity={0.7}
              >
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
                    <View style={styles.ouroborosBasic}>
                      <OuroborosSVG
                        size={60}
                        fillColor={colors.card}
                        strokeColor={colors.textMuted}
                        strokeWidth={2}
                      />
                    </View>
                  </Animated.View>
                  
                  {/* Info Icon */}
                  <TouchableOpacity 
                    style={styles.infoIcon}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleOuroborosInfo();
                    }}
                  >
                    <Ionicons name="information-circle" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
                
                <Text style={[styles.ouroborosBadgeText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                  Embrace Full Circle
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
              
              <Text style={[styles.upgradeSubtitle, fonts.spiritualBodyFont, { color: colors.textLight, textAlign: 'center' }]}>
                Unlock your full potential and connect with 3x more people
              </Text>

              <View style={styles.currentResourcesContainer}>
                <View style={styles.resourcesGrid}>
                  <TouchableOpacity 
                    style={[styles.resourceItem, { backgroundColor: colors.card }]}
                    onPress={handleRadiancePress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.resourceIconContainer}>
                      <View style={[styles.resourceIcon, { backgroundColor: '#F1C40F' + '20' }]}>
                        <CustomIcon name="halo" size={32} color="#F1C40F" />
                        <View style={[styles.countBadge, { backgroundColor: '#F1C40F' }]}>
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
                  <TouchableOpacity 
                    style={[styles.resourceItem, { backgroundColor: colors.card }]}
                    onPress={handleLotusPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.resourceIconContainer}>
                      <View style={[styles.resourceIcon, { backgroundColor: '#8E44AD' + '20' }]}>
                        <CustomIcon name="lotus" size={32} />
                        <View style={[styles.countBadge, { backgroundColor: '#8E44AD' }]}>
                          <Text style={styles.countText}>{userData.numOfLotus || 0}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.resourceContent}>
                      <Text style={[styles.resourceTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                        Lotus Flowers
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

      {/* Ouroboros Info Modal */}
      <OuroborosInfoModal
        visible={showOuroborosTooltip}
        onClose={() => setShowOuroborosTooltip(false)}
      />

      <RadianceScreen
        visible={showRadianceModal}
        onClose={() => setShowRadianceModal(false)}
      />

      <LotusScreen
        visible={showLotusModal}
        onClose={() => setshowLotusModal(false)}
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

  animatedHeaderTitle: {
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
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
  profileImageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderRadius: 57,
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
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  countBadge: {
    position: 'absolute',
    top: -6,
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
  upgradeContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  upgradeSubtitle: {
    fontSize: Typography.sizes.base,
    marginBottom: Spacing.xl,
    lineHeight: Typography.sizes.base * 1.4,
    letterSpacing: 0.2,
    fontStyle: 'italic',
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
    width: 48,
    height: 48,
    borderRadius: 25,
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
  
  // Ouroboros Badge Styles
  ouroborosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'center',
    maxWidth: '90%',
  },
  ouroborosContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  ouroborosWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ouroborosGlow: {
    shadowColor: '#B8860B',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 8,
  },
  ouroborosBasic: {
    // No special effects for non-Full Circle users
  },
  infoIcon: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ouroborosBadgeText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.2,
    flex: 1,
  },
  

});