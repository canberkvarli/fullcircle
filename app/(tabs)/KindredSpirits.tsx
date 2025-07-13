import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import UserCard from "@/components/UserCard";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

type SortOption = 'recent' | 'lastActive' | 'newest' | 'viaOrb';

interface SortConfig {
  key: SortOption;
  label: string;
  icon: string;
  description: string;
}

const SORT_OPTIONS: SortConfig[] = [
  {
    key: 'recent',
    label: 'Most Recent',
    icon: 'time-outline',
    description: 'Latest likes first'
  },
  {
    key: 'lastActive',
    label: 'Recently Active',
    icon: 'radio-outline',
    description: 'Active users first'
  },
  {
    key: 'newest',
    label: 'New Souls',
    icon: 'sparkles-outline',
    description: 'Newest members first'
  },
  {
    key: 'viaOrb',
    label: 'Orb Connections',
    icon: 'planet-outline',
    description: 'Sacred orb likes first'
  }
];

const KindredSpirits: React.FC = () => {
  const { userData, subscribeToReceivedLikes } = useUserContext();
  const [likedByUsers, setLikedByUsers] = useState<any[]>([]);
  const [sortedUsers, setSortedUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSort, setSelectedSort] = useState<SortOption>('recent');
  const router = useRouter();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  useEffect(() => {
    if (!userData.userId) return;
    setIsLoading(true);
    const unsubscribe = subscribeToReceivedLikes((users) => {
      setLikedByUsers(users);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [userData.userId, subscribeToReceivedLikes]);

  // Sort users whenever likedByUsers or selectedSort changes
  useEffect(() => {
    if (likedByUsers.length === 0) {
      setSortedUsers([]);
      return;
    }

    const sorted = [...likedByUsers].sort((a, b) => {
      switch (selectedSort) {
        case 'recent':
          // Sort by timestamp (most recent likes first)
          const aTime = a.timestamp?.toDate?.() || a.timestamp || new Date(0);
          const bTime = b.timestamp?.toDate?.() || b.timestamp || new Date(0);
          return new Date(bTime).getTime() - new Date(aTime).getTime();
          
        case 'lastActive':
          // Sort by lastActive (most recently active first)
          const aActive = a.lastActive?.toDate?.() || a.lastActive || new Date(0);
          const bActive = b.lastActive?.toDate?.() || b.lastActive || new Date(0);
          return new Date(bActive).getTime() - new Date(aActive).getTime();
          
        case 'newest':
          // Sort by createdAt (newest profiles first)
          const aCreated = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
          const bCreated = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
          return new Date(bCreated).getTime() - new Date(aCreated).getTime();
          
        case 'viaOrb':
          // Orb likes first, then by recent
          if (a.viaOrb && !b.viaOrb) return -1;
          if (!a.viaOrb && b.viaOrb) return 1;
          // If both same orb status, sort by recent
          const aTimeOrb = a.timestamp?.toDate?.() || a.timestamp || new Date(0);
          const bTimeOrb = b.timestamp?.toDate?.() || b.timestamp || new Date(0);
          return new Date(bTimeOrb).getTime() - new Date(aTimeOrb).getTime();
          
        default:
          return 0;
      }
    });

    setSortedUsers(sorted);
  }, [likedByUsers, selectedSort]);

  const handleCardPress = (user: any, isFirst: boolean) => {
    if (userData.fullCircleSubscription || isFirst) {
      router.navigate({
        pathname: "/user/UserShow" as any,
        params: { user: JSON.stringify(user) },
      });
    } else {
      router.navigate({ pathname: "/user/FullCircleSubscription" });
    }
  };

  const handleSortPress = (sortKey: SortOption) => {
    if (!userData.fullCircleSubscription && sortKey !== 'recent') {
      // If not subscribed, redirect to upgrade for advanced sorting
      router.navigate({ pathname: "/user/FullCircleSubscription" });
      return;
    }
    setSelectedSort(sortKey);
  };

  const isRecentlyActive = (user: any): boolean => {
    const lastActive = user.lastActive?.toDate?.() || user.lastActive;
    if (!lastActive) return false;
    
    const now = new Date();
    const diffHours = (now.getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60);
    return diffHours <= 24; // Active within last 24 hours
  };

  const getTimeSinceActive = (user: any): string => {
    const lastActive = user.lastActive?.toDate?.() || user.lastActive;
    if (!lastActive) return '';
    
    const now = new Date();
    const diffMinutes = (now.getTime() - new Date(lastActive).getTime()) / (1000 * 60);
    
    if (diffMinutes < 60) {
      return 'Active now';
    } else if (diffMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffMinutes / 60);
      return `Active ${hours}h ago`;
    } else {
      const days = Math.floor(diffMinutes / 1440);
      return `Active ${days}d ago`;
    }
  };

  if (sortedUsers.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
        
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
              Kindred Spirits
            </Text>
            <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
              People who{' '}
              <Text style={styles.highlightedWord}>appreciate</Text>
              {' you'}
            </Text>
          </View>
        </View>

        {/* Horizontal Sort Row - Only show if we have likes */}
        {likedByUsers.length > 0 && (
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
                  <Ionicons 
                    name={option.icon as any} 
                    size={16} 
                    color={selectedSort === option.key ? '#FFFFFF' : '#8B4513'} 
                  />
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
                  {!userData.fullCircleSubscription && option.key !== 'recent' && (
                    <Ionicons 
                      name="lock-closed" 
                      size={12} 
                      color={selectedSort === option.key ? '#FFFFFF' : '#B8860B'} 
                      style={{ marginLeft: Spacing.xs }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.noLikesContainer}>
          <View style={[styles.cosmicSymbol, { backgroundColor: '#8B4513' + '15' }]}>
            <Ionicons name="heart-outline" size={32} color="#8B4513" />
          </View>
          
          <Text style={[styles.noLikesTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            Your connections are coming
          </Text>
          
          <Text style={[styles.noLikesSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            Great people are still discovering you. Boost your visibility and connect with those who appreciate your authentic self.
          </Text>
          
          <View style={styles.actionContainer}>
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
            
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: '#8B4513' }]}
              onPress={() => router.navigate({ pathname: "/user/FullCircleSubscription" })}
              activeOpacity={0.9}
            >
              <Ionicons name="flash" size={18} color="#8B4513" style={styles.buttonIcon} />
              <Text style={[styles.secondaryButtonText, fonts.spiritualBodyFont, { color: '#8B4513' }]}>
                Send Sacred Boost
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const [firstUser, ...rest] = sortedUsers;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
      
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            Kindred Spirits
          </Text>
          <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            {sortedUsers.length} soul{sortedUsers.length !== 1 ? 's' : ''} who{' '}
            <Text style={styles.highlightedWord}>appreciate</Text>
            {' you'}
          </Text>
        </View>
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
              <Ionicons 
                name={option.icon as any} 
                size={16} 
                color={selectedSort === option.key ? '#FFFFFF' : '#8B4513'} 
              />
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
              {!userData.fullCircleSubscription && option.key !== 'recent' && (
                <Ionicons 
                  name="lock-closed" 
                  size={12} 
                  color={selectedSort === option.key ? '#FFFFFF' : '#B8860B'} 
                  style={{ marginLeft: Spacing.xs }}
                />
              )}
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
                isOrbLike={firstUser.viaOrb}
              />
              
              {/* Activity Badge */}
              {isRecentlyActive(firstUser) && (
                <View style={[styles.activityBadge, { backgroundColor: '#4CAF50' }]}>
                  <Ionicons name="radio" size={12} color="#FFFFFF" />
                  <Text style={[styles.activityBadgeText, fonts.spiritualBodyFont]}>
                    {getTimeSinceActive(firstUser)}
                  </Text>
                </View>
              )}
              
              {/* Orb Badge */}
              {firstUser.viaOrb && (
                <View style={[styles.orbBadge, { backgroundColor: '#8B4513' }]}>
                  <Ionicons name="planet" size={12} color="#FFFFFF" />
                  <Text style={[styles.orbBadgeText, fonts.spiritualBodyFont]}>
                    Sacred Orb
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {rest.length > 0 && (
          <View style={styles.othersSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people" size={20} color="#8B4513" />
              <Text style={[styles.sectionTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                Other Connections ({rest.length})
              </Text>
            </View>
            
            {!userData.fullCircleSubscription && (
              <TouchableOpacity 
              onPress={() => router.navigate({ pathname: "/user/FullCircleSubscription" })}
              style={[styles.unlockBanner, { backgroundColor: '#FFD700' + '15', borderColor: '#FFD700' + '40' }]}>
                <Ionicons name="lock-closed" size={16} color="#B8860B" />
                <Text style={[styles.unlockText, fonts.spiritualBodyFont, { color: '#B8860B' }]}>
                  Unlock Full Circle to see everyone who appreciates you
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
                        isBlurred={!userData.fullCircleSubscription}
                        style={styles.smallCard}
                        isOrbLike={user.viaOrb}
                      />
                      
                      {/* Activity Badge for small cards */}
                      {!user.isBlurred && isRecentlyActive(user) && (
                        <View style={[styles.activityBadgeSmall, { backgroundColor: '#4CAF50' }]}>
                          <Ionicons name="radio" size={8} color="#FFFFFF" />
                        </View>
                      )}
                      
                      {/* Orb Badge for small cards */}
                      {user.viaOrb && (
                        <View style={[styles.orbBadgeSmall, { backgroundColor: '#8B4513' }]}>
                          <Ionicons name="planet" size={8} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
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

  // Sort Container Styles
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
  },
  
  cosmicSymbol: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  noLikesTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    letterSpacing: 0.5,
  },
  
  noLikesSubtitle: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing['2xl'],
    letterSpacing: 0.3,
    fontStyle: 'italic',
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
    fontWeight: Typography.weights.semibold,
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
  
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  
  featuredLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginLeft: Spacing.sm,
    letterSpacing: 0.3,
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

  // Card Container and Badge Styles
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

  activityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  activityBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.weights.semibold,
    marginLeft: 4,
  },

  orbBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  orbBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.weights.semibold,
    marginLeft: 4,
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
    height: 240,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  activityBadgeSmall: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  orbBadgeSmall: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  bottomSpacing: {
    height: Spacing['2xl'],
  },
});

export default KindredSpirits;