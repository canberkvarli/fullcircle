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
  Animated,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";
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
    loadingNextBatch,
    userData,
    noMoreMatches,
    orbLike,
    exclusionsLoaded
  } = useUserContext();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  const [photosLoaded, setPhotosLoaded] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [lastAction, setLastAction] = useState<'like' | 'pass' | 'orb' | null>(null);
  const [showOrbModal, setShowOrbModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Simple, elegant animations
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const overlayScale = useRef(new Animated.Value(0.8)).current;
  
  // Divine orb modal animations
  const orbModalOpacity = useRef(new Animated.Value(0)).current;
  const orbModalScale = useRef(new Animated.Value(0.8)).current;
  const divineGlow = useRef(new Animated.Value(0)).current;
  
  // Orb button glow when available
  const orbButtonGlow = useRef(new Animated.Value(0)).current;

useEffect(() => {
  console.log('🖥️ ConnectScreen: Match state changed', {
    currentMatch: currentPotentialMatch?.userId,
    firstName: currentPotentialMatch?.firstName,
    loading: loadingNextBatch,
    noMore: noMoreMatches,
  });
}, [currentPotentialMatch, loadingNextBatch, noMoreMatches]);

const handleAction = async (action: 'like' | 'pass' | 'orb') => {
  if (actionInProgress || !currentPotentialMatch) return;
  
  if (action === 'orb' && (!userData?.numOfOrbs || userData.numOfOrbs <= 0)) {
    showDivineOrbModal();
    return;
  }
  
  setActionInProgress(true);
  setLastAction(action);
  
  Animated.parallel([
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }),
    Animated.spring(overlayScale, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }),
    Animated.timing(contentOpacity, {
      toValue: 0.3,
      duration: 300,
      useNativeDriver: true,
    }),
  ]).start();

  // Step 2: Process the action
  const userId = currentPotentialMatch.userId;
  try {
    if (action === 'pass') {
      await dislikeMatch(userId); // This now handles loadNextPotentialMatch internally
    } else if (action === 'orb') {
      await orbLike(userId); // This now handles loadNextPotentialMatch internally
    } else {
      await likeMatch(userId); // This now handles loadNextPotentialMatch internally
    }
  } catch (error) {
    console.error('Action failed:', error);
    // On error, reset the UI state
    setActionInProgress(false);
    setLastAction(null);
    contentOpacity.setValue(1);
    overlayOpacity.setValue(0);
    overlayScale.setValue(0.8);
    return;
  }

  scrollViewRef.current?.scrollTo({ y: 0, animated: false });

  setTimeout(() => {
    Animated.parallel([
      // Fade out overlay
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      // Fade in new content
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset state
      setActionInProgress(false);
      setLastAction(null);
      setPhotosLoaded(false);
      overlayScale.setValue(0.8);
      buttonsOpacity.setValue(0);
    });
  }, 800); // Reduced timing since we don't need to wait for manual loadNext
};

  const showDivineOrbModal = () => {
    setShowOrbModal(true);
    
    // Divine appearance with golden light
    Animated.parallel([
      Animated.timing(orbModalOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(orbModalScale, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      // Divine glow effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(divineGlow, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(divineGlow, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ),
    ]).start();
  };

  const closeDivineOrbModal = () => {
    Animated.parallel([
      Animated.timing(orbModalOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(orbModalScale, {
        toValue: 0.8,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowOrbModal(false);
      divineGlow.setValue(0);
    });
  };

  const navigateToSubscription = () => {
    closeDivineOrbModal();
    setTimeout(() => {
      router.push('/user/FullCircleSubscription');
    }, 500);
  };

  const handlePhotosLoaded = () => {
    setPhotosLoaded(true);
    // Simple button fade in
    Animated.timing(buttonsOpacity, {
      toValue: 1,
      duration: 400,
      delay: 300,
      useNativeDriver: true,
    }).start();
    
    // Start orb button glow if user has orbs
    if (userData?.numOfOrbs && userData.numOfOrbs > 0) {
      // Continuous smooth breathing effect - no pauses
      Animated.loop(
        Animated.timing(orbButtonGlow, {
          toValue: 1,
          duration: 2000, // Smooth 2-second cycle
          useNativeDriver: false,
        }),
        { iterations: -1, resetBeforeIteration: true }
      ).start();
    }
  };

  // Reset when new match loads
  useEffect(() => {
    if (currentPotentialMatch && !actionInProgress) {
      contentOpacity.setValue(1);
      buttonsOpacity.setValue(0);
      overlayOpacity.setValue(0);
      overlayScale.setValue(0.8);
      orbButtonGlow.setValue(0);
      setPhotosLoaded(false);
    }
  }, [currentPotentialMatch?.userId]);

  const getActionColor = (action: 'like' | 'pass' | 'orb') => {
    switch (action) {
      case 'like': return '#D49A8C';
      case 'pass': return '#8B95A7';
      case 'orb': return '#FFD700'; // Divine golden color for orb
      default: return '#FFD700'; // Divine golden fallback
    }
  };

  const getActionIcon = (action: 'like' | 'pass' | 'orb') => {
    switch (action) {
      case 'like': return 'heart';
      case 'pass': return 'close';
      case 'orb': return 'sparkles';
      default: return 'heart';
    }
  };

  const getActionText = (action: 'like' | 'pass' | 'orb') => {
    switch (action) {
      case 'like': return 'Heart Sent';
      case 'pass': return 'Released with Love';
      case 'orb': return 'Sacred Orb Sent';
      default: return 'Energy Shared';
    }
  };

  // No more matches state
if (noMoreMatches) {
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
      
      {/* Header - matches other screens exactly */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>Sacred Souls</Text>
          <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>Connect with purpose</Text>
        </View>
      </View>

      {/* Main content - follows KindredSpirits pattern */}
      <View style={styles.noLikesContainer}>
        {/* Cosmic symbol - matches KindredSpirits style */}
        <View style={[styles.cosmicSymbol, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="infinite" size={60} color={colors.primary} />
        </View>
        
        {/* Title and subtitle - matches KindredSpirits */}
        <Text style={[styles.noLikesTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
          The Universe is Aligning
        </Text>
        
        <Text style={[styles.noLikesSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
          Sacred souls are being prepared for your cosmic journey. Expand your divine circle or adjust your spiritual intentions to discover new connections.
        </Text>
        
        {/* Action buttons - matches KindredSpirits style */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={() => router.navigate('/user/FullCircleSubscription')}
            activeOpacity={0.9}
          >
            <Ionicons name="infinite" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={[styles.primaryButtonText, fonts.spiritualBodyFont]}>
              Expand Your Circle ✨
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.primary }]}
            onPress={() => router.navigate('/user/DatingPreferences')}
            activeOpacity={0.9}
          >
            <Ionicons name="options" size={18} color={colors.primary} style={styles.buttonIcon} />
            <Text style={[styles.secondaryButtonText, fonts.spiritualBodyFont, { color: colors.primary }]}>
              Adjust Preferences 🔮
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}


  // Loading state
  if (loadingNextBatch || !currentPotentialMatch || !exclusionsLoaded) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
        
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
              Sacred Souls
            </Text>
            <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
              Connect with purpose
            </Text>
          </View>
        </View>

        <View style={styles.centeredContainer}>
          <View style={[styles.loadingMandala, { backgroundColor: colors.primary + '10' }]}>
            <Ionicons name="heart" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.loadingText, fonts.spiritualTitleFont, { color: colors.primary }]}>
            {loadingNextBatch ? "Aligning Sacred Souls" : "Preparing Your Journey"}
          </Text>
          <Text style={[styles.loadingSubtext, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            {loadingNextBatch ? "The universe is preparing your next connection" : "Sacred energies are gathering"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
      
      {/* Main Content */}
      <Animated.View 
        style={[
          styles.contentContainer,
          { opacity: contentOpacity }
        ]}
      >
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
      </Animated.View>

      {/* Settings Button */}
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

      {/* Action Buttons */}
      {photosLoaded && !actionInProgress && (
        <Animated.View style={[styles.buttonsContainer, { opacity: buttonsOpacity }]}>
          {/* Pass Button */}
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.leftAction,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
            onPress={() => handleAction('pass')}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color="#8B95A7" />
          </TouchableOpacity>

          {/* Like Button */}
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.rightAction,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
            onPress={() => handleAction('like')}
            activeOpacity={0.8}
          >
            <Ionicons name="heart" size={20} color="#D49A8C" />
          </TouchableOpacity>

          {/* Orb Button with Divine Glow */}
          <View style={styles.orbButtonContainer}>
          {userData?.numOfOrbs && userData.numOfOrbs > 0 && (
            <Animated.View 
              style={[
                styles.orbGlow,
                {
                  shadowOpacity: orbButtonGlow.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 0.8, 0.3] // More prominent divine glow
                  }),
                }
              ]}
            />
          )}
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.centerAction,
              { 
                backgroundColor: '#8B4513', // Rich, sacred brown with warmth
                shadowColor: '#FFD700', // Divine golden shadow
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 8,
              }
            ]}
            onPress={() => handleAction('orb')}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={22} color="#FFD700" />
            <View style={[styles.orbRing, { borderColor: '#FFD700' + '60' }]} />
          </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Divine Orb Modal - Sacred Golden Light */}
      {showOrbModal && (
        <Animated.View 
          style={[
            styles.divineModalOverlay,
            { opacity: orbModalOpacity }
          ]}
        >
          <Animated.View 
            style={[
              styles.divineModal,
              {
                transform: [{ scale: orbModalScale }],
                backgroundColor: colors.card,
                borderColor: '#FFD700',
                shadowColor: '#FFD700',
              }
            ]}
          >
            {/* Divine Glow Background */}
            <Animated.View 
              style={[
                styles.divineGlow,
                {
                  opacity: divineGlow,
                  backgroundColor: '#B8860B',
                }
              ]}
            />
            
            {/* Sacred Content */}
            <View style={styles.divineContent}>
              <View style={[styles.divineIcon, { backgroundColor: '#B8860B' + '20' }]}>
                <Ionicons name="sparkles" size={48} color="#B8860B" />
              </View>
              
              <Text style={[
                styles.divineTitle, 
                fonts.spiritualTitleFont, 
                { color: colors.textDark }
              ]}>
                Sacred Orbs Needed
              </Text>
              
              <Text style={[
                styles.divineMessage, 
                fonts.spiritualBodyFont, 
                { color: colors.textLight }
              ]}>
                Your divine orbs have been lovingly shared with fellow souls. To continue spreading this sacred energy, embrace the Full Circle journey.
              </Text>
              
              <View style={styles.divineActions}>
                <TouchableOpacity 
                  style={[
                    styles.divineButton, 
                    { 
                      backgroundColor: '#B8860B', // Darker gold, less overwhelming
                      shadowColor: '#B8860B'
                    }
                  ]}
                  onPress={navigateToSubscription}
                  activeOpacity={0.9}
                >
                  <Ionicons name="infinite" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={[styles.primaryButton, { backgroundColor: '#8B4513', shadowColor: '#8B4513' }]}>
                    Embrace Full Circle
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.divineSecondaryButton,
                    { borderColor: colors.border }
                  ]}
                  onPress={closeDivineOrbModal}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.divineSecondaryText, 
                    fonts.spiritualBodyFont,
                    { color: colors.textLight }
                  ]}>
                    Continue with Hearts
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      )}

      {/* Simple Action Overlay */}
      {lastAction && (
        <Animated.View 
          style={[
            styles.actionOverlay,
            {
              opacity: overlayOpacity,
              transform: [{ scale: overlayScale }]
            }
          ]}
        >
          <View style={[
            styles.actionFeedback,
            { 
              backgroundColor: colors.card,
              borderColor: getActionColor(lastAction),
              shadowColor: getActionColor(lastAction),
            }
          ]}>
            <Ionicons 
              name={getActionIcon(lastAction)} 
              size={32} 
              color={getActionColor(lastAction)} 
            />
            <Text style={[
              styles.actionText, 
              fonts.spiritualBodyFont,
              { color: colors.textDark }
            ]}>
              {getActionText(lastAction)}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  contentContainer: {
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
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: 80,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  
  buttonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 200 : 180,
  },
  
  actionButton: {
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
    right: 32,
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
  
  divineModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  
  divineModal: {
    marginHorizontal: Spacing.xl,
    borderRadius: 24,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
    overflow: 'hidden',
  },
  
  divineGlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    borderRadius: 50,
    opacity: 0.3,
  },
  
  divineContent: {
    padding: Spacing['2xl'],
    alignItems: 'center',
    zIndex: 1,
  },
  
  orbButtonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 125 : 105,
    left: '50%',
    marginLeft: -28, // Center the 56px button properly
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  orbGlow: {
    position: 'absolute',
    width: 56, // Same size as button
    height: 56,
    borderRadius: 28,
    backgroundColor: 'transparent', // No background, just glow
    top: 0, // Perfectly aligned with button
    left: 0,
    shadowColor: '#FFD700', // Divine yellow glow
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12, // Slightly more prominent divine glow
    elevation: 0,
  },
  
  divineIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 2,
    borderColor: '#B8860B' + '40',
  },
  
  divineTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    letterSpacing: 0.5,
  },
  
  divineMessage: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing['2xl'],
    letterSpacing: 0.3,
    fontStyle: 'italic',
  },
  
  divineActions: {
    width: '100%',
    gap: Spacing.lg,
  },
  
  divineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  buttonIcon: {
    marginRight: Spacing.sm,
  },
  
  divineSecondaryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  
  divineSecondaryText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.3,
  },
  
  actionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  
  actionFeedback: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  
  actionText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    marginTop: Spacing.sm,
    letterSpacing: 0.5,
  },
  
  cosmicSymbol: {
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: 60,
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
    borderRadius: 60,
    marginBottom: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
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
  
  // Use existing noLikesContainer from KindredSpirits
  noLikesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  
  // Use existing noLikesTitle from KindredSpirits
  noLikesTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    letterSpacing: 0.5,
  },
  
  // Use existing noLikesSubtitle from KindredSpirits
  noLikesSubtitle: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing['2xl'],
    letterSpacing: 0.3,
    fontStyle: 'italic',
  },
  
  // Use existing actionContainer from KindredSpirits
  actionContainer: {
    width: '100%',
    gap: Spacing.lg,
  },
  
  // Use existing primaryButton from KindredSpirits
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
  
  // Use existing primaryButtonText from KindredSpirits
  primaryButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  
  // Use existing secondaryButton from KindredSpirits
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 16,
    borderWidth: 2,
  },
  
  // Use existing secondaryButtonText from KindredSpirits
  secondaryButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.3,
  },
  
});

export default ConnectScreen