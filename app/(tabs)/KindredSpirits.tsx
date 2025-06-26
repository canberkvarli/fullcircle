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

const KindredSpirits: React.FC = () => {
  const { userData, subscribeToReceivedLikes } = useUserContext();
  const [likedByUsers, setLikedByUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    return () => unsubscribe();
  }, [userData.userId, subscribeToReceivedLikes]);

  const handleCardPress = (user: any, isFirst: boolean) => {
    if (userData.fullCircleSubscription || isFirst) {
      router.navigate({
        pathname: "/user/UserShow" as any,
        params: { user: JSON.stringify(user), source: "KindredSpirits" },
      });
    } else {
      router.navigate({ pathname: "/user/FullCircleSubscription" });
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
        
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            Kindred Spirits
          </Text>
          <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            Souls who resonate with you
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <View style={[styles.loadingMandala, { backgroundColor: '#8B4513' + '10' }]}>
            <Ionicons name="heart" size={40} color="#8B4513" />
          </View>
          <Text style={[styles.loadingText, fonts.spiritualTitleFont, { color: '#8B4513' }]}>
            Gathering Sacred Connections
          </Text>
          <Text style={[styles.loadingSubtext, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            The universe is revealing who appreciates your energy
          </Text>
        </View>
      </View>
    );
  }

  if (likedByUsers.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
        
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            Kindred Spirits
          </Text>
          <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            Souls who resonate with you
          </Text>
        </View>

        <View style={styles.noLikesContainer}>
          <View style={[styles.cosmicSymbol, { backgroundColor: '#8B4513' + '15' }]}>
            <Ionicons name="heart-outline" size={60} color="#8B4513" />
          </View>
          
          <Text style={[styles.noLikesTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            Your Energy Awaits Discovery
          </Text>
          
          <Text style={[styles.noLikesSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            Sacred souls are still discovering your divine light. Amplify your spiritual presence and connect with kindred spirits seeking your energy.
          </Text>
          
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#8B4513', shadowColor: '#8B4513' }]}
              onPress={() => router.navigate({ pathname: "/user/FullCircleSubscription" })}
            >
              <Ionicons name="infinite" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={[styles.primaryButtonText, fonts.spiritualBodyFont]}>
                Embrace Full Circle ✨
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: '#8B4513' }]}
              onPress={() => router.navigate({ pathname: "/user/FullCircleSubscription" })}
            >
              <Ionicons name="flash" size={18} color="#8B4513" style={styles.buttonIcon} />
              <Text style={[styles.secondaryButtonText, fonts.spiritualBodyFont, { color: '#8B4513' }]}>
                Send Sacred Boost 🔥
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const [firstUser, ...rest] = likedByUsers;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
          Kindred Spirits
        </Text>
        <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
          {likedByUsers.length} soul{likedByUsers.length !== 1 ? 's' : ''} resonating with your energy
        </Text>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Connection */}
        <View style={styles.featuredSection}>
          <View style={styles.featuredHeader}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={[styles.featuredLabel, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              Latest Sacred Connection
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => handleCardPress(firstUser, true)}
            activeOpacity={0.9}
          >
            <UserCard
              user={firstUser}
              variant="default"
              isBlurred={false}
              style={styles.largeCard}
              isOrbLike={firstUser.viaOrb}
            />
          </TouchableOpacity>
        </View>

        {/* Other Connections */}
        {rest.length > 0 && (
          <View style={styles.othersSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people" size={20} color="#8B4513" />
              <Text style={[styles.sectionTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                Other Sacred Souls ({rest.length})
              </Text>
            </View>
            
            {!userData.fullCircleSubscription && (
              <View style={[styles.unlockBanner, { backgroundColor: '#FFD700' + '15', borderColor: '#FFD700' + '40' }]}>
                <Ionicons name="lock-closed" size={16} color="#B8860B" />
                <Text style={[styles.unlockText, fonts.spiritualBodyFont, { color: '#B8860B' }]}>
                  Unlock Full Circle to see all souls who appreciate your energy
                </Text>
              </View>
            )}
            
            <View style={styles.gridContainer}>
              {rest.map((user) => (
                <View key={user.userId} style={styles.userCardContainer}>
                  <TouchableOpacity 
                    onPress={() => handleCardPress(user, false)}
                    activeOpacity={0.9}
                  >
                    <UserCard
                      user={user}
                      variant="default"
                      isBlurred={!userData.fullCircleSubscription}
                      style={styles.smallCard}
                      isOrbLike={user.viaOrb}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Bottom Spacing */}
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
  },
  
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
    opacity: 0.8,
    letterSpacing: 0.3,
  },
  
  scrollContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  
  loadingMandala: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  
  loadingSubtext: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  
  noLikesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  
  cosmicSymbol: {
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: 60,
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
    height: 240,
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
});

export default KindredSpirits;