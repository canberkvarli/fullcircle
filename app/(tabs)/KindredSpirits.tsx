import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  useColorScheme,
  Alert,
  Animated,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { CustomIcon } from "@/components/CustomIcon";
import UserCard from "@/components/UserCard";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import RadianceScreen from "@/components/RadianceScreen";
import OuroborosLoader from "@/components/ouroboros/OuroborosLoader";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

type SortOption = 'recent' | 'lastActive' | 'newest' | 'viaLotus';

interface SortConfig {
  key: SortOption;
  label: string;
  description: string;
}

const SORT_OPTIONS: SortConfig[] = [
  {
    key: 'recent',
    label: 'Most Recent',
    description: 'Latest likes first'
  },
  {
    key: 'lastActive',
    label: 'Recently Active',
    description: 'Active users first'
  },
  {
    key: 'newest',
    label: 'New Souls',
    description: 'Newest members first'
  },
  {
    key: 'viaLotus',
    label: 'Lotus Connections',
    description: 'Sacred lotus likes first'
  }
];

const KindredSpirits: React.FC = () => {
  const { 
    userData, 
    subscribeToReceivedLikes, 
    getRadianceTimeRemaining, 
    activateRadiance,
    getImageUrl 
  } = useUserContext();
  
  const [likedByUsers, setLikedByUsers] = useState<any[]>([]);
  const [sortedUsers, setSortedUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSort, setSelectedSort] = useState<SortOption>('recent');
  const [showRadianceModal, setShowRadianceModal] = useState(false);
  const [radianceTimeRemaining, setRadianceTimeRemaining] = useState<number>(0);
  const [isActivatingBoost, setIsActivatingBoost] = useState(false);
  const [displayedUsers, setDisplayedUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const router = useRouter();
  
  // Track if we're already subscribed to prevent multiple subscriptions
  const isSubscribedRef = useRef(false);
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  // Check if user has Full Circle subscription
  const hasFullCircle = userData.subscription?.isActive;

  // Loading animation ref
  const loadingPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!userData.userId) {
      return;
    }
    
    // Prevent multiple subscriptions
    if (isSubscribedRef.current) {
      return;
    }
    
    setIsLoading(true);
    isSubscribedRef.current = true;
    
    // Start loading animation
    Animated.loop(
      Animated.timing(loadingPulse, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      { resetBeforeIteration: true }
    ).start();

    subscribeToReceivedLikes((users) => {
      try {
        // Only update if we actually received valid data
        if (users && Array.isArray(users)) {
          setLikedByUsers(users);
        } else {
          // Don't clear existing users if we get invalid data
          if (likedByUsers.length === 0) {
            setLikedByUsers([]);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error in subscribeToReceivedLikes callback:', error);
        // Don't clear existing users on error, just stop loading
        setIsLoading(false);
      }
    });

    return () => {
      isSubscribedRef.current = false;
    };
  }, [userData.userId]); // Remove subscribeToReceivedLikes from dependencies

  // Check radiance time remaining
  useEffect(() => {
    const checkRadianceTime = () => {
      if (userData.boostExpiresAt && getRadianceTimeRemaining) {
        const remaining = getRadianceTimeRemaining();
        setRadianceTimeRemaining(remaining);
      }
    };

    checkRadianceTime();
    const interval = setInterval(checkRadianceTime, 1000);
    return () => clearInterval(interval);
  }, [userData.boostExpiresAt, getRadianceTimeRemaining]);

  // Sort users whenever likedByUsers or selectedSort changes
  useEffect(() => {
    if (likedByUsers.length === 0) {
      setSortedUsers([]);
      setDisplayedUsers([]);
      setCurrentPage(1);
      setHasMoreUsers(false);
      return;
    }

    const sorted = [...likedByUsers].sort((a, b) => {
      switch (selectedSort) {
        case 'recent':
          const aTime = a.timestamp?.toDate?.() || a.timestamp || new Date(0);
          const bTime = b.timestamp?.toDate?.() || b.timestamp || new Date(0);
          return new Date(bTime).getTime() - new Date(aTime).getTime();
          
        case 'lastActive':
          const aActive = a.lastActive?.toDate?.() || a.lastActive || new Date(0);
          const bActive = b.lastActive?.toDate?.() || b.lastActive || new Date(0);
          return new Date(bActive).getTime() - new Date(bActive).getTime();
          
        case 'newest':
          const aCreated = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
          const bCreated = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
          return new Date(bCreated).getTime() - new Date(bCreated).getTime();
          
        case 'viaLotus':
          if (a.viaLotus && !b.viaLotus) return -1;
          if (!a.viaLotus && b.viaLotus) return 1;
          const aTimeLotus = a.timestamp?.toDate?.() || a.timestamp || new Date(0);
          const bTimeLotus = b.timestamp?.toDate?.() || b.timestamp || new Date(0);
          return new Date(bTimeLotus).getTime() - new Date(bTimeLotus).getTime();
          
        default:
          return 0;
      }
    });

    setSortedUsers(sorted);
    
    // Reset pagination when sort changes
    setCurrentPage(1);
    const initialBatch = sorted.slice(0, 15); // Show first 15 users
    setDisplayedUsers(initialBatch);
    setHasMoreUsers(sorted.length > 15);
  }, [likedByUsers, selectedSort]);

  const loadMoreUsers = () => {
    const nextPage = currentPage + 1;
    const endIndex = nextPage * 15;
    const newUsers = sortedUsers.slice(0, endIndex);
    
    setDisplayedUsers(newUsers);
    setCurrentPage(nextPage);
    setHasMoreUsers(endIndex < sortedUsers.length);
  };

  const handleCardPress = (user: any, isFirst: boolean) => {
    if (hasFullCircle || isFirst) {
      // 🆕 FIX: Pass the full list of users and current position for proper navigation
      const userIndex = displayedUsers.findIndex(u => u.userId === user.userId);
      const navigationData = {
        user: user,
        allUsers: displayedUsers,
        currentIndex: userIndex
      };
      router.navigate(`/user/${user.userId}?navigationData=${encodeURIComponent(JSON.stringify(navigationData))}`);
    } else {
      router.navigate({ pathname: "/user/FullCircleSubscription" });
    }
  };

  const handleSortPress = (sortKey: SortOption) => {
    if (!hasFullCircle && sortKey !== 'recent') {
      router.navigate({ pathname: "/user/FullCircleSubscription" });
      return;
    }
    setSelectedSort(sortKey);
  };

  const handleRadiancePress = async () => {
    // If boost is already active, just show the modal
    if (radianceTimeRemaining > 0) {
      setShowRadianceModal(true);
      return;
    }

    if ((userData.activeBoosts || 0) > 0) {
      Alert.alert(
        "Activate Radiance",
        `You have ${userData.activeBoosts} radiance${userData.activeBoosts !== 1 ? ' boosts' : ''} available. Activate Radiance to increase your visibility for 1 hour?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Radiate",
            onPress: handleActivateBoost
          }
        ]
      );
    } else {
      // No boosts available, show purchase modal
      setShowRadianceModal(true);
    }
  };

  const handleActivateBoost = async () => {
    setIsActivatingBoost(true);
    try {
      await activateRadiance();
      Alert.alert(
        "Radiance Activated! ✨",
        "Your profile is now boosted for the next hour. You'll appear higher in potential matches and your likes will have special radiance energy."
      );
    } catch (error: any) {
      Alert.alert(
        "Activation Failed",
        error.message || "Failed to activate Radiance. Please try again."
      );
    } finally {
      setIsActivatingBoost(false);
    }
  };

  const isRecentlyActive = (user: any): boolean => {
    const lastActive = user.lastActive?.toDate?.() || user.lastActive;
    if (!lastActive) return false;
    
    const now = new Date();
    const diffHours = (now.getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60);
    return diffHours <= 24;
  };

  const getTimeSinceActive = (user: any): string => {
    const lastActive = user.lastActive?.toDate?.() || user.lastActive;
    if (!lastActive) return '';
    
    const now = new Date();
    const diffMinutes = (now.getTime() - new Date(lastActive).getTime()) / (1000 * 60);
    
    if (diffMinutes < 60) {
      return 'Active now';
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `Active ${hours}h ago`;
    } else {
      const days = Math.floor(diffMinutes / 1440);
      return `Active ${days}d ago`;
    }
  };

  const formatRadianceTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getRadianceButtonConfig = () => {
    if (isActivatingBoost) {
      return {
        text: "Activating...",
        color: '#FFFFFF',
        backgroundColor: '#D4AF37',
        borderColor: '#D4AF37',
        disabled: true
      };
    }
    
    if (radianceTimeRemaining > 0) {
      return {
        text: formatRadianceTime(radianceTimeRemaining),
        color: '#FFFFFF',
        backgroundColor: '#D4AF37',
        borderColor: '#D4AF37',
        disabled: false
      };
    }
    
    if ((userData.activeBoosts || 0) > 0) {
      return {
        text: `Radiate (${userData.activeBoosts})`,
        color: '#8B4513', // Changed from #D4AF37 to brown for better visibility
        backgroundColor: colors.background,
        borderColor: '#D4AF37',
        disabled: false
      };
    }
    
    return {
      text: "Radiance",
      color: colorScheme === 'dark' ? '#D4AF37' : '#8B4513',
      backgroundColor: colors.background,
      borderColor: colors.border,
      disabled: false
    };
  };

  const radianceConfig = getRadianceButtonConfig();

  // Show loading animation while data is being fetched
  // Safety check: if we have users but still loading, something went wrong - stop loading
  if (isLoading && likedByUsers.length > 0) {
    setIsLoading(false);
  }
  
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
        
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <Text style={[fonts.spiritualLargeTitleFont, { color: colors.textDark }]}>
              Kindred Spirits
            </Text>
            <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
              People who{' '}
              <Text style={styles.highlightedWord}>appreciate</Text>
              {' you'}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.radianceButton,
              { 
                backgroundColor: radianceConfig.backgroundColor,
                borderColor: radianceConfig.borderColor,
                opacity: radianceConfig.disabled ? 0.7 : 1
              }
            ]}
            onPress={handleRadiancePress}
            activeOpacity={0.8}
            disabled={radianceConfig.disabled}
          >
            <CustomIcon 
              name="halo" 
              size={14} 
              color={radianceConfig.color} 
            />
            <Text style={[styles.radianceButtonText, fonts.spiritualBodyFont, { color: radianceConfig.color }]}>
              {radianceConfig.text}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.loadingContainer}>
          <OuroborosLoader 
              variant="pulse"              
              size={120}                   
              duration={800} 
              fillColor="#F5E6D3"
              strokeColor="#7B6B5C"
              strokeWidth={1}
              loop={true}
            />
        </View>

        <RadianceScreen
          visible={showRadianceModal}
          onClose={() => setShowRadianceModal(false)}
        />
      </View>
    );
  }

  // Show no likes content when no users have liked the current user
  if (sortedUsers.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
        
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <Text style={[fonts.spiritualLargeTitleFont, { color: colors.textDark }]}>
              Kindred Spirits
            </Text>
            <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
              People who{' '}
              <Text style={styles.highlightedWord}>appreciate</Text>
              {' you'}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.radianceButton,
              { 
                backgroundColor: radianceConfig.backgroundColor,
                borderColor: radianceConfig.borderColor,
                opacity: radianceConfig.disabled ? 0.7 : 1
              }
            ]}
            onPress={handleRadiancePress}
            activeOpacity={0.8}
            disabled={radianceConfig.disabled}
          >
            <CustomIcon 
              name="halo" 
              size={22} 
              color={radianceConfig.color} 
            />
            <Text style={[styles.radianceButtonText, fonts.spiritualBodyFont, { color: radianceConfig.color }]}>
              {radianceConfig.text}
            </Text>
          </TouchableOpacity>
        </View>

        {/* No likes content */}
        <View style={styles.noLikesContainer}>
          <View style={styles.cosmicSymbol}>
            <CustomIcon name="hand-heart" size={54} color="#8B4513" />
          </View>
          
          <Text style={[styles.noLikesTitle, fonts.spiritualLargeTitleFont, { color: colors.textDark }]}>
            Your connections are coming
          </Text>
          
          <Text style={[styles.noLikesSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            Connect with souls who appreciate your authentic self.
          </Text>
          
          <View style={styles.actionContainer}>
            {/* Only show Full Circle button if user doesn't have it */}
            {!hasFullCircle && (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: '#8B4513', shadowColor: '#8B4513' }]}
                onPress={() => router.navigate({ pathname: "/user/FullCircleSubscription" })}
                activeOpacity={0.9}
              >
                <Ionicons name="infinite" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={[styles.primaryButtonText, fonts.spiritualBodyFont]}>
                  Embrace Full Circle
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: '#D4AF37' }]}
              onPress={handleRadiancePress}
              activeOpacity={0.9}
            >
              <CustomIcon name="halo" size={18} color="#D4AF37" style={styles.buttonIcon} />
              <Text style={[styles.secondaryButtonText, fonts.spiritualBodyFont, { color: '#D4AF37' }]}>
                {(userData.activeBoosts || 0) > 0 ? 'Activate Radiance' : 'Radiance'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <RadianceScreen
          visible={showRadianceModal}
          onClose={() => setShowRadianceModal(false)}
        />
      </View>
    );
  }

  const [firstUser, ...rest] = displayedUsers;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
      
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[fonts.spiritualLargeTitleFont, { color: colors.textDark }]}>
            Kindred Spirits
          </Text>
          <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            {sortedUsers.length} soul{sortedUsers.length !== 1 ? 's' : ''} who{' '}
            <Text style={styles.highlightedWord}>appreciate</Text>
            {' you'}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.radianceButton,
            { 
              backgroundColor: radianceConfig.backgroundColor,
              borderColor: radianceConfig.borderColor,
              opacity: radianceConfig.disabled ? 0.7 : 1
            }
          ]}
          onPress={handleRadiancePress}
          activeOpacity={0.8}
          disabled={radianceConfig.disabled}
        >
          <CustomIcon 
            name="halo" 
            size={16} 
            color={radianceConfig.color} 
          />
          <Text style={[styles.radianceButtonText, fonts.spiritualBodyFont, { color: radianceConfig.color }]}>
            {radianceConfig.text}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Sort Row */}
      <View style={[styles.sortContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortScrollContainer}
        >
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortChip,
                { 
                  backgroundColor: selectedSort === option.key ? '#8B4513' : colors.background,
                  borderColor: selectedSort === option.key ? '#8B4513' : colors.border
                }
              ]}
              onPress={() => handleSortPress(option.key)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.sortChipText, 
                fonts.spiritualBodyFont, 
                { 
                  color: selectedSort === option.key ? '#FFFFFF' : colors.textDark,
                  marginLeft: Spacing.xs
                }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.featuredSection}>
          <TouchableOpacity 
            onPress={() => handleCardPress(firstUser, true)}
            activeOpacity={0.9}
          >
            <View style={styles.cardContainer}>
              <UserCard
                user={firstUser}
                isBlurred={false}
                style={styles.largeCard}
                islotusLike={firstUser.viaLotus}
                isRadianceLike={firstUser.viaRadiance}
                getImageUrl={getImageUrl}
                isRecentlyActive={isRecentlyActive(firstUser)}
                activityText={getTimeSinceActive(firstUser)}
                cardSize="large"
              />
            </View>
          </TouchableOpacity>
        </View>

        {rest.length > 0 && (
          <View style={styles.othersSection}>
            <View style={styles.sectionHeader}>
              <CustomIcon name="friendship" size={32} color="#8B4513" />
              <Text style={[styles.sectionTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                Other Connections ({rest.length})
              </Text>
            </View>
            
            {!hasFullCircle && (
              <TouchableOpacity 
              onPress={() => router.navigate({ pathname: "/user/FullCircleSubscription" })}
              style={[styles.unlockBanner, { backgroundColor: '#FFD700' + '15', borderColor: '#FFD700' + '40' }]}>
                <Ionicons name="lock-closed" size={16} color="#B8860B" />
                <Text style={[styles.unlockText, fonts.spiritualBodyFont, { color: '#B8860B' }]}>
                Become a FullCircle member to unlock all your Kindred Spirits!
                </Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.gridContainer}>
              {rest.map((user) => (
                <View key={user.userId} style={styles.userCardContainer}>
                  <TouchableOpacity 
                    onPress={() => handleCardPress(user, false)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.cardContainer}>
                      <UserCard
                        user={user}
                        isBlurred={!hasFullCircle}
                        style={styles.smallCard}
                        islotusLike={user.viaLotus}
                        isRadianceLike={user.viaRadiance}
                        getImageUrl={getImageUrl}
                        isRecentlyActive={isRecentlyActive(user)}
                        activityText={getTimeSinceActive(user)}
                        cardSize="small"
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            
            {/* Load More Button */}
            {hasMoreUsers && (
              <TouchableOpacity
                style={[styles.loadMoreButton, { borderColor: colors.border }]}
                onPress={loadMoreUsers}
                activeOpacity={0.8}
              >
                <Text style={[styles.loadMoreText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                  Load More ({sortedUsers.length - displayedUsers.length} remaining)
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.textDark} />
              </TouchableOpacity>
            )}
          </View>
        )}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <RadianceScreen
        visible={showRadianceModal}
        onClose={() => setShowRadianceModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
  },
  
  headerLeft: {
    flex: 1
  },

  radianceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 90,
  },

  radianceButtonText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    marginLeft: Spacing.xs,
  },
  
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  
  highlightedWord: {
    color: '#B8860B',
    textShadowColor: '#CD853F',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.5,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing["4xl"],
  },

  sortContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },

  sortScrollContainer: {
    paddingRight: Spacing.lg,
    gap: Spacing.sm,
  },

  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  sortChipText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  
  scrollContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  
  noLikesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing["2xl"]
  },
  
  cosmicSymbol: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderColor: 'transparent',
  },
  
  noLikesTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  
  noLikesSubtitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing['2xl'],
    letterSpacing: 0.3,
  },
  
  actionContainer: {
    width: '100%',
    gap: Spacing.lg,
  },
  
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  
  primaryButtonText: {
    fontSize: Typography.sizes.lg,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 16,
    borderWidth: 2,
  },
  
  secondaryButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.3,
  },
  
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  
  featuredSection: {
    marginBottom: Spacing['2xl'],
  },
  
  othersSection: {
    marginBottom: Spacing.xl,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  
  sectionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginLeft: Spacing.sm,
    letterSpacing: 0.3,
  },
  
  unlockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  
  unlockText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginLeft: Spacing.sm,
    flex: 1,
    letterSpacing: 0.3,
  },

  cardContainer: {
    position: 'relative',
  },
  
  largeCard: {
    width: screenWidth - (Spacing.xl * 2),
    height: screenHeight * 0.52,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  userCardContainer: {
    width: '48%',
    marginBottom: Spacing.lg,
  },
  
  smallCard: {
    width: '100%',
    height: 280, // Increased from 240
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  
  bottomSpacing: {
    height: Spacing['2xl'],
  },
  
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  
  loadMoreText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.3,
  },
});

export default KindredSpirits;