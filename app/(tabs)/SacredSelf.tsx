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
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import { Colors, Typography, Spacing } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function SacredSelf() {
  const { userData } = useUserContext();
  const [activeTab, setActiveTab] = useState("discover");
  const [verified, _] = useState(userData.settings?.isSelfieVerified || false);
  const router = useRouter();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const isFullCircle = userData.fullCircleSubscription;

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [160, 290],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
  };

  const handleVerify = () => {
    router.navigate("/user/SelfieVerificationScreen");
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
            fontSize: getNameFontSize() // Dynamic font size based on name length
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

        <View style={[styles.hingeTabsContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[
              styles.hingeTab, 
              { borderBottomColor: activeTab === "discover" ? "#8B4513" : 'transparent' }
            ]}
            onPress={() => handleTabSwitch("discover")}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.hingeTabText,
              fonts.spiritualBodyFont,
              { color: activeTab === "discover" ? "#8B4513" : colors.textMuted },
              activeTab === "discover" && styles.activeHingeTabText
            ]}>
              Discover
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.hingeTab,
              { borderBottomColor: activeTab === "circle" ? "#8B4513" : 'transparent' }
            ]}
            onPress={() => handleTabSwitch("circle")}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.hingeTabText,
              fonts.spiritualBodyFont,
              { color: activeTab === "circle" ? "#8B4513" : colors.textMuted },
              activeTab === "circle" && styles.activeHingeTabText
            ]}>
              My Circle
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {activeTab === "discover" ? (
            <>
              {isFullCircle ? (
                <View style={[styles.fullCircleActiveCard, { 
                  backgroundColor: '#8B4513' + '10',
                  borderColor: '#8B4513' + '30'
                }]}>
                  <View style={styles.fullCircleHeader}>
                    <View style={[styles.fullCircleIcon, { backgroundColor: '#8B4513' + '20' }]}>
                      <Ionicons name="infinite" size={24} color="#8B4513" />
                    </View>
                    <View style={styles.fullCircleInfo}>
                      <Text style={[styles.fullCircleActiveTitle, fonts.spiritualTitleFont, { color: '#8B4513' }]}>
                        Full Circle Active ∞
                      </Text>
                      <Text style={[styles.fullCircleActiveSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                        Your experience is enhanced
                      </Text>
                    </View>
                  </View>

                  <View style={styles.perksContainer}>
                    <View style={[styles.perkItem, { backgroundColor: colors.card }]}>
                      <Ionicons name="flash" size={18} color="#FFD700" />
                      <Text style={[styles.perkText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                        Unlimited Boosts
                      </Text>
                    </View>
                    <View style={[styles.perkItem, { backgroundColor: colors.card }]}>
                      <Ionicons name="sparkles" size={18} color="#8B4513" />
                      <Text style={[styles.perkText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                        {userData.numOfOrbs || 0} Orbs
                      </Text>
                    </View>
                    <View style={[styles.perkItem, { backgroundColor: colors.card }]}>
                      <Ionicons name="eye" size={18} color="#9D4EDD" />
                      <Text style={[styles.perkText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                        See Who Likes You
                      </Text>
                    </View>
                    <View style={[styles.perkItem, { backgroundColor: colors.card }]}>
                      <Ionicons name="heart-circle" size={18} color="#FF6B6B" />
                      <Text style={[styles.perkText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                        Unlimited Likes
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={[styles.fullCircleCard, { 
                  backgroundColor: colors.card,
                  borderColor: colors.border 
                }]}>
                  <View style={styles.fullCircleContent}>
                    <View style={[styles.fullCircleIcon, { backgroundColor: '#8B4513' + '15' }]}>
                      <Ionicons name="infinite" size={24} color="#8B4513" />
                    </View>
                    <View style={styles.fullCircleTextContent}>
                      <Text style={[styles.fullCircleTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                        Full Circle ∞
                      </Text>
                      <Text style={[styles.fullCircleSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                        Unlock your full potential and connect with 3x more people
                      </Text>
                      <Link href={{ pathname: "user/FullCircleSubscription" as any }} asChild>
                        <TouchableOpacity 
                          style={[styles.upgradeButton, { backgroundColor: '#8B4513' }]}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="arrow-up-circle" size={18} color="#FFFFFF" style={styles.upgradeIcon} />
                          <Text style={[styles.upgradeButtonText, fonts.spiritualBodyFont]}>
                            Embrace Full Circle
                          </Text>
                        </TouchableOpacity>
                      </Link>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.toolsContainer}>
                <Text style={[styles.sectionTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                  Boost Tools
                </Text>
                
                <TouchableOpacity
                  style={[styles.toolItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => console.log("Day Pass clicked")}
                  activeOpacity={0.7}
                >
                  <View style={[styles.toolIcon, { backgroundColor: '#FFD700' + '20' }]}>
                    <Ionicons name="sunny" size={20} color="#FFD700" />
                  </View>
                  <View style={styles.toolContent}>
                    <Text style={[styles.toolTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                      Day Pass
                    </Text>
                    <Text style={[styles.toolSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                      Unlock full potential for 24 hours
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>

                {!isFullCircle && (
                  <TouchableOpacity
                    style={[styles.toolItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => console.log("Boost clicked")}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.toolIcon, { backgroundColor: '#FF6B6B' + '20' }]}>
                      <Ionicons name="flash" size={20} color="#FF6B6B" />
                    </View>
                    <View style={styles.toolContent}>
                      <Text style={[styles.toolTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                        Boost
                      </Text>
                      <Text style={[styles.toolSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                        Get seen by 11x more people
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.toolItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => console.log("Super Like clicked")}
                  activeOpacity={0.7}
                >
                  <View style={[styles.toolIcon, { backgroundColor: '#9D4EDD' + '20' }]}>
                    <Ionicons name="flower" size={20} color="#9D4EDD" />
                  </View>
                  <View style={styles.toolContent}>
                    <Text style={[styles.toolTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                      Super Like
                    </Text>
                    <Text style={[styles.toolSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                      Double your chance of matching
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.circleContent}>
              <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.emptyIcon, { backgroundColor: '#8B4513' + '15' }]}>
                  <Ionicons name="people-circle-outline" size={32} color="#8B4513" />
                </View>
                <Text style={[styles.emptyTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                  Your Circle
                </Text>
                <Text style={[styles.emptySubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                  Here you'll see your closest connections, favorite people, and meaningful conversations.
                </Text>
                <TouchableOpacity 
                  style={[styles.connectButton, { backgroundColor: '#8B4513' }]}
                  onPress={() => router.push('/Connect')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="heart" size={18} color="#FFFFFF" style={styles.connectIcon} />
                  <Text style={[styles.connectButtonText, fonts.spiritualBodyFont]}>
                    Start Connecting
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  highlightedWord: {
    color: '#8B4513',
    textShadowColor: '#D2691E',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.5,
  },
  animatedHeaderTitle: {
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
    position: 'absolute',
    left: 80, // Start after the headerLeft space
    right: 80, // End before the headerIcons space
    textAlign: 'center',
    maxWidth: screenWidth - 160, // Ensure it doesn't exceed container width
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
    paddingVertical: Spacing.xl,
  },
  profileImageContainer: {
    marginBottom: Spacing.lg,
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
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  locationText: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  hingeTabsContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  hingeTab: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderBottomWidth: 3,
    alignItems: 'center',
  },
  hingeTabText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.2,
  },
  activeHingeTabText: {
    fontWeight: Typography.weights.bold,
  },
  tabContent: {
    flex: 1,
  },
  fullCircleActiveCard: {
    borderRadius: 20,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 2,
  },
  fullCircleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  fullCircleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  fullCircleInfo: {
    flex: 1,
  },
  fullCircleActiveTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  fullCircleActiveSubtitle: {
    fontSize: Typography.sizes.sm,
    letterSpacing: 0.2,
    fontStyle: 'italic',
  },
  perksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    gap: Spacing.xs,
    minWidth: '45%',
    justifyContent: 'center',
  },
  perkText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.2,
  },
  fullCircleCard: {
    borderRadius: 20,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  fullCircleContent: {
    alignItems: 'center',
  },
  fullCircleTextContent: {
    alignItems: 'center',
  },
  fullCircleTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  fullCircleSubtitle: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    marginBottom: Spacing.lg,
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
  toolsContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.lg,
    letterSpacing: 0.5,
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 16,
    marginBottom: Spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toolIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  toolContent: {
    flex: 1,
  },
  toolTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
    letterSpacing: 0.2,
  },
  toolSubtitle: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.sizes.sm * 1.3,
    letterSpacing: 0.1,
  },
  circleContent: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: 20,
    borderWidth: 1,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: Typography.sizes.base * 1.4,
    letterSpacing: 0.2,
    fontStyle: 'italic',
  },
  connectButton: {
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
  connectIcon: {
    marginRight: Spacing.sm,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.3,
  },
  bottomSpacing: {
    height: Spacing['3xl'],
  },
});