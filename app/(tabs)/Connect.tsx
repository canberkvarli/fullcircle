import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  Platform,
  StatusBar,
  useColorScheme,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useUserContext } from "@/context/UserContext";
import { Link, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import PotentialMatch from "@/components/PotentialMatch";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const ConnectScreen: React.FC = () => {
  const router = useRouter();
  const {
    likeMatch,
    dislikeMatch,
    currentPotentialMatch,
    loadNextPotentialMatch,
    loadingNextBatch,
    userData,
    noMoreMatches,
    orbLike,
  } = useUserContext();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  const [showAnimation, setShowAnimation] = useState(false);
  const [animationType, setAnimationType] = useState<'like' | 'pass' | 'orb'>('like');
  const [photosLoaded, setPhotosLoaded] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Calculate age from birth data
  const calculateAge = (user: any) => {
    if (user.birthyear) {
      return new Date().getFullYear() - parseInt(user.birthyear);
    }
    return user.age || null;
  };

  // Get location string
  const getLocation = (user: any) => {
    if (user.location?.city && user.location?.region) {
      return `${user.location.city}, ${user.location.region}`;
    } else if (user.location?.city) {
      return user.location.city;
    } else if (user.regionName) {
      return user.regionName;
    }
    return null;
  };

  const handleAction = async (action: 'like' | 'pass' | 'orb') => {
    if (!currentPotentialMatch || actionInProgress) return;

    const userId = currentPotentialMatch.userId;
    
    setActionInProgress(true);
    setAnimationType(action);
    setShowAnimation(true);

    try {
      if (action === 'pass') {
        await dislikeMatch(userId);
      } else if (action === 'orb') {
        await orbLike(userId);
      } else {
        await likeMatch(userId);
      }
    } catch (error) {
      console.error('Action failed:', error);
    }

    // Small delay to show animation
    setTimeout(() => {
      loadNextPotentialMatch();
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      setShowAnimation(false);
      setActionInProgress(false);
      setPhotosLoaded(false);
    }, 1200);
  };

  const handlePhotosLoaded = () => {
    setPhotosLoaded(true);
  };

  // No more matches state
  if (noMoreMatches) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
        
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>Sacred Souls</Text>
            <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>Connect with purpose</Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => router.push('/user/FullCircleSubscription')}
            style={[styles.cosmicButton, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.cosmicButtonText, fonts.spiritualBodyFont, { color: colors.card }]}>
              Expand Your Circle
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.push('/user/DatingPreferences')}
            style={[styles.intentionsButton, { borderColor: colors.primary }]}
          >
            <Text style={[styles.intentionsButtonText, fonts.spiritualBodyFont, { color: colors.primary }]}>
              Adjust Intentions
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.centeredContainer}>
          <View style={[styles.cosmicSymbol, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="infinite" size={60} color={colors.primary} />
          </View>
          <Text style={[styles.noSoulsTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            The Universe is Aligning
          </Text>
          <Text style={[styles.noSoulsText, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            Your cosmic connections are being prepared. Expand your sacred circle or adjust your spiritual intentions.
          </Text>
          
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              onPress={() => router.push('/user/FullCircleSubscription')}
              style={[styles.cosmicButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.cosmicButtonText, fonts.spiritualBodyFont, { color: colors.card }]}>
                Expand Your Circle
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => router.push('/user/DatingPreferences')}
              style={[styles.intentionsButton, { borderColor: colors.primary }]}
            >
              <Text style={[styles.intentionsButtonText, fonts.spiritualBodyFont, { color: colors.primary }]}>
                Adjust Intentions
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Loading state
  if (loadingNextBatch || !currentPotentialMatch) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
        
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>Sacred Souls</Text>
            <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>Connect with purpose</Text>
          </View>
          
          <Link href="/user/FullCircleSubscription" style={[styles.cosmicButton, { backgroundColor: colors.primary }]}>
            <Text style={[styles.cosmicButtonText, fonts.spiritualBodyFont, { color: colors.card }]}>
              Expand Your Circle
            </Text>
          </Link>
          
          <Link href="/user/DatingPreferences" style={[styles.intentionsButton, { borderColor: colors.primary }]}>
            <Text style={[styles.intentionsButtonText, fonts.spiritualBodyFont, { color: colors.primary }]}>
              Adjust Intentions
            </Text>
          </Link>
        </View>

        <View style={styles.centeredContainer}>
          <LottieView
            source={require("../../assets/animations/loading_mandala.json")}
            autoPlay
            loop
            style={styles.loadingMandala}
          />
          <Text style={[styles.loadingText, fonts.spiritualTitleFont, { color: colors.primary }]}>
            Aligning Sacred Souls
          </Text>
          <Text style={[styles.loadingSubtext, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            The universe is preparing your next connection
          </Text>
        </View>
      </View>
    );
  }

  const age = calculateAge(currentPotentialMatch);
  const location = getLocation(currentPotentialMatch);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
      
      {/* Scrollable PotentialMatch Component */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <PotentialMatch
          currentPotentialMatch={currentPotentialMatch}
          isMatched={false}
          onPhotosLoaded={handlePhotosLoaded}
        />
      </ScrollView>

      {/* Floating Action Buttons */}
      {photosLoaded && (
        <>
          {/* Left Action - Pass */}
          <TouchableOpacity 
            style={[
              styles.floatingAction, 
              styles.leftAction,
              { backgroundColor: colors.card, borderColor: colors.border },
              actionInProgress && styles.disabledButton
            ]}
            onPress={() => handleAction('pass')}
            disabled={actionInProgress}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="#8B95A7" />
          </TouchableOpacity>

          {/* Right Action - Like */}
          <TouchableOpacity 
            style={[
              styles.floatingAction, 
              styles.rightAction,
              { backgroundColor: colors.card, borderColor: colors.border },
              actionInProgress && styles.disabledButton
            ]}
            onPress={() => handleAction('like')}
            disabled={actionInProgress}
            activeOpacity={0.7}
          >
            <Ionicons name="heart" size={20} color="#D49A8C" />
          </TouchableOpacity>

          {/* Center Action - Orb */}
          <TouchableOpacity 
            style={[
              styles.floatingAction, 
              styles.centerAction,
              { backgroundColor: colors.primary },
              actionInProgress && styles.disabledButton
            ]}
            onPress={() => handleAction('orb')}
            disabled={actionInProgress}
            activeOpacity={0.7}
          >
            <Ionicons name="sparkles" size={22} color="#FFFFFF" />
            <View style={[styles.orbRing, { borderColor: colors.primary + '40' }]} />
          </TouchableOpacity>

          {/* Floating Settings Button */}
          <TouchableOpacity 
            style={[
              styles.settingsFloating, 
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
            onPress={() => router.push('/user/DatingPreferences')}
            activeOpacity={0.7}
          >
            <Ionicons name="options" size={22} color={colors.primary} />
          </TouchableOpacity>
        </>
      )}

      {/* Enhanced Animation Overlay */}
      {showAnimation && (
        <View style={styles.animationOverlay}>
          <View style={[styles.animationContainer, { backgroundColor: colors.card + 'E6' }]}>
            <LottieView
              source={
                animationType === 'like' 
                  ? require("../../assets/animations/like.json")
                  : animationType === 'orb'
                  ? require("../../assets/animations/like.json")
                  : require("../../assets/animations/dislike.json")
              }
              autoPlay
              loop={false}
              style={styles.animation}
            />
            <Text style={[styles.animationText, fonts.spiritualTitleFont, { color: colors.primary }]}>
              {animationType === 'like' ? 'Heart Sent with Love' : 
               animationType === 'orb' ? 'Sacred Orb Delivered' : 
               'Energy Released with Gratitude'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
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
  
  profileName: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  profileLocation: {
    fontSize: Typography.sizes.sm,
  },
  
  settingsButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: 80, // Minimal space for floating buttons
    paddingTop: Platform.OS === 'ios' ? 60 : 40, // Top safe area
  },
  
  // Floating Action Buttons
  floatingAction: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
  },
  
  leftAction: {
    bottom: Platform.OS === 'ios' ? 140 : 120,
    left: Spacing.xl,
  },
  
  rightAction: {
    bottom: Platform.OS === 'ios' ? 140 : 120,
    right: Spacing.xl,
  },
  
  centerAction: {
    bottom: Platform.OS === 'ios' ? 125 : 105,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -28, // Half of width + 4px for larger size
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 0,
  },
  
  orbRing: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    top: -6,
    left: -6,
    opacity: 0.3,
  },
  
  settingsFloating: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 70 : 50,
    right: 32, // Explicit value instead of Spacing.xl
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
  },
  
  cosmicSymbol: {
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  noSoulsTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    letterSpacing: 0.5,
  },
  
  noSoulsText: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing['2xl'],
    paddingHorizontal: Spacing.md,
    letterSpacing: 0.3,
  },
  
  actionButtonsContainer: {
    width: '100%',
    gap: Spacing.lg,
  },
  
  cosmicButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    shadowColor: '#7B6B5C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  
  cosmicButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.5,
  },
  
  intentionsButton: {
    borderWidth: 2,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  
  intentionsButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.5,
  },
  
  loadingMandala: {
    width: 120,
    height: 120,
    marginBottom: Spacing.lg,
  },
  
  loadingText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  
  loadingSubtext: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  
  animationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  animationContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  
  animation: {
    width: 160,
    height: 160,
    marginBottom: Spacing.md,
  },
  
  animationText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.4,
    shadowOpacity: 0.05,
  },
});

export default ConnectScreen;