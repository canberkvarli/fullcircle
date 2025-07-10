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
  
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const overlayScale = useRef(new Animated.Value(0.8)).current;
  
  const orbModalOpacity = useRef(new Animated.Value(0)).current;
  const orbModalScale = useRef(new Animated.Value(0.8)).current;
  const divineGlow = useRef(new Animated.Value(0)).current;
  
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

  const userId = currentPotentialMatch.userId;
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
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActionInProgress(false);
      setLastAction(null);
      setPhotosLoaded(false);
      overlayScale.setValue(0.8);
      buttonsOpacity.setValue(0);
    });
  }, 800);
};

  const showDivineOrbModal = () => {
    setShowOrbModal(true);
    
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
    Animated.timing(buttonsOpacity, {
      toValue: 1,
      duration: 400,
      delay: 300,
      useNativeDriver: true,
    }).start();
    
    if (userData?.numOfOrbs && userData.numOfOrbs > 0) {
      Animated.loop(
        Animated.timing(orbButtonGlow, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        { iterations: -1, resetBeforeIteration: true }
      ).start();
    }
  };

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
      case 'like': return '#B8860B'; // Rusty gold
      case 'pass': return '#8B7355'; // Rusty brown
      case 'orb': return '#CD853F'; // Peru/rusty gold
      default: return '#CD853F';
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
      
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>Circle</Text>
          <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            Meaningful{' '}
            <Text style={styles.highlightedWord}>connections</Text>
            {' await'}
          </Text>
        </View>
      </View>

      <View style={styles.noLikesContainer}>
        <View style={[styles.cosmicSymbol, { backgroundColor: '#B8860B' + '15' }]}>
          <Ionicons name="infinite" size={32} color="#B8860B" />
        </View>
        
        <Text style={[styles.noLikesTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
          More connections coming soon
        </Text>
        
        <Text style={[styles.noLikesSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
          We're preparing more meaningful matches for you. Expand your circle or adjust your preferences to discover new connections.
        </Text>
        
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: '#B8860B', shadowColor: '#B8860B' }]}
            onPress={() => router.navigate('/user/FullCircleSubscription')}
            activeOpacity={0.9}
          >
            <Ionicons name="infinite" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={[styles.primaryButtonText, fonts.spiritualBodyFont]}>
              Expand Your Circle
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: '#B8860B' }]}
            onPress={() => router.navigate('/user/ConnectingPreferences')}
            activeOpacity={0.9}
          >
            <Ionicons name="options" size={18} color="#B8860B" style={styles.buttonIcon} />
            <Text style={[styles.secondaryButtonText, fonts.spiritualBodyFont, { color: '#B8860B' }]}>
              Adjust Preferences
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
              Circle
            </Text>
            <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
              Meaningful{' '}
              <Text style={styles.highlightedWord}>connections</Text>
              {' await'}
            </Text>
          </View>
        </View>

        <View style={styles.centeredContainer}>
          <View style={[styles.loadingMandala, { backgroundColor: '#B8860B' + '10' }]}>
            <Ionicons name="heart" size={24} color="#B8860B" />
          </View>
          <Text style={[styles.loadingText, fonts.spiritualTitleFont, { color: '#B8860B' }]}>
            {loadingNextBatch ? "Finding Your Matches" : "Preparing Your Journey"}
          </Text>
          <Text style={[styles.loadingSubtext, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            {loadingNextBatch ? "We're preparing your next connection" : "Getting everything ready"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
      
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

      <TouchableOpacity 
        style={[
          styles.settingsFloating, 
          { backgroundColor: colors.card, borderColor: colors.border }
        ]}
        onPress={() => router.push('/user/ConnectingPreferences')}
        activeOpacity={0.7}
      >
        <Ionicons name="options" size={22} color="#B8860B" />
      </TouchableOpacity>

      {photosLoaded && !actionInProgress && (
        <Animated.View style={[styles.buttonsContainer, { opacity: buttonsOpacity }]}>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.leftAction,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
            onPress={() => handleAction('pass')}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color="#8B7355" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.rightAction,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
            onPress={() => handleAction('like')}
            activeOpacity={0.8}
          >
            <Ionicons name="heart" size={20} color="#B8860B" />
          </TouchableOpacity>

          <View style={styles.orbButtonContainer}>
          {userData?.numOfOrbs && userData.numOfOrbs > 0 && (
            <Animated.View 
              style={[
                styles.orbGlow,
                {
                  shadowOpacity: orbButtonGlow.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 0.8, 0.3]
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
                backgroundColor: '#8B4513',
                shadowColor: '#CD853F',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 8,
              }
            ]}
            onPress={() => handleAction('orb')}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={22} color="#CD853F" />
            <View style={[styles.orbRing, { borderColor: '#CD853F' + '60' }]} />
          </TouchableOpacity>
          </View>
        </Animated.View>
      )}

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
                borderColor: '#CD853F',
                shadowColor: '#CD853F',
              }
            ]}
          >
            <Animated.View 
              style={[
                styles.divineGlow,
                {
                  opacity: divineGlow,
                  backgroundColor: '#B8860B',
                }
              ]}
            />
            
            <View style={styles.divineContent}>
              <View style={[styles.divineIcon, { backgroundColor: '#B8860B' + '20' }]}>
                <Ionicons name="sparkles" size={36} color="#B8860B" />
              </View>
              
              <Text style={[
                styles.divineTitle, 
                fonts.spiritualTitleFont, 
                { color: colors.textDark }
              ]}>
                More Orbs Needed
              </Text>
              
              <Text style={[
                styles.divineMessage, 
                fonts.spiritualBodyFont, 
                { color: colors.textLight }
              ]}>
                You've shared all your orbs with fellow connections. To continue spreading this energy, join the Full Circle experience.
              </Text>
              
              <View style={styles.divineActions}>
                <TouchableOpacity 
                  style={[
                    styles.divineButton, 
                    { 
                      backgroundColor: '#B8860B',
                      shadowColor: '#B8860B'
                    }
                  ]}
                  onPress={navigateToSubscription}
                  activeOpacity={0.9}
                >
                  <Ionicons name="infinite" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>
                    Join Full Circle
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
  
  highlightedWord: {
    color: '#B8860B',
    textShadowColor: '#CD853F',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.5,
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
    marginLeft: -28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  orbGlow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'transparent',
    top: 0,
    left: 0,
    shadowColor: '#CD853F',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 0,
  },
  
  divineIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    padding: Spacing.lg,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  loadingMandala: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  
  noLikesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
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
  }}
)
export default ConnectScreen;