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
  
  // 🔄 UPDATED: Use new consolidated state from UserContext
  const {
    // New consolidated functions
    likeMatch,
    dislikeMatch,
    orbLike,
    loadNextMatch,
    resetMatching,
    
    // New consolidated state
    currentPotentialMatch,
    matchingState,
    DAILY_LIKE_LIMIT,
    userData,
  } = useUserContext();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  // 🆕 NEW: Enhanced loading state management
  const [isLoading, setIsLoading] = useState(true);
  const [hasMinimumLoadingTime, setHasMinimumLoadingTime] = useState(false);
  const [showContent, setShowContent] = useState(false);
  
  // Local component state (unchanged)
  const [photosLoaded, setPhotosLoaded] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [lastAction, setLastAction] = useState<'like' | 'pass' | 'orb' | null>(null);
  const [showOrbModal, setShowOrbModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const [showDailyLimitModal, setShowDailyLimitModal] = useState(false);
  const dailyLimitModalOpacity = useRef(new Animated.Value(0)).current;
  const dailyLimitModalScale = useRef(new Animated.Value(0.8)).current;
  const dailyLimitGlow = useRef(new Animated.Value(0)).current
  
  // 🆕 NEW: Loading animation refs
  const loadingPulse = useRef(new Animated.Value(0)).current;
  const loadingRotation = useRef(new Animated.Value(0)).current;
  const loadingFadeIn = useRef(new Animated.Value(0)).current;
  const contentFadeIn = useRef(new Animated.Value(0)).current;
  
  // Animation refs (unchanged)
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const overlayScale = useRef(new Animated.Value(0.8)).current;
  
  const orbModalOpacity = useRef(new Animated.Value(0)).current;
  const orbModalScale = useRef(new Animated.Value(0.8)).current;
  const divineGlow = useRef(new Animated.Value(0)).current;
  
  const orbButtonGlow = useRef(new Animated.Value(0)).current;

  // Check if user has FullCircle subscription
  const hasFullCircleSubscription = userData?.fullCircleSubscription || false;

  const userDataRef = useRef(userData);
  const matchingStateRef = useRef(matchingState);
  const currentPotentialMatchRef = useRef(currentPotentialMatch);

  useEffect(() => {
  userDataRef.current = userData;
  }, [userData]);

  useEffect(() => {
    matchingStateRef.current = matchingState;
  }, [matchingState]);

  useEffect(() => {
    currentPotentialMatchRef.current = currentPotentialMatch;
  }, [currentPotentialMatch]);

  // 🆕 NEW: Enhanced loading state logic with minimum display time
  useEffect(() => {
    const actuallyLoading = matchingStateRef.current.loadingBatch || 
                          !currentPotentialMatchRef.current || 
                          !matchingStateRef.current.initialized;
    
    console.log('🔄 Loading state check:', {
      loadingBatch: matchingStateRef.current.loadingBatch,
      hasCurrentMatch: !!currentPotentialMatchRef.current,
      initialized: matchingStateRef.current.initialized,
      actuallyLoading,
      hasMinimumLoadingTime,
      isLoading,
      showContent
    });
    
    // Set minimum loading time (2 seconds)
    const timer = setTimeout(() => {
      setHasMinimumLoadingTime(true);
    }, 2000);

    if (actuallyLoading) {
      setIsLoading(true);
      setShowContent(false);
      
      // Start loading animations
      Animated.parallel([
        Animated.timing(loadingFadeIn, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(loadingPulse, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          { resetBeforeIteration: true }
        ),
        Animated.loop(
          Animated.timing(loadingRotation, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          })
        ),
      ]).start();
    } else if (hasMinimumLoadingTime) {
      // Only stop loading if minimum time has passed AND data is ready
      console.log('🎯 Transitioning to content...');
      
      // Smooth transition to content
      Animated.sequence([
        Animated.timing(loadingFadeIn, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(contentFadeIn, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsLoading(false);
        setShowContent(true);
        console.log('✅ Content transition complete');
      });
    }

    return () => clearTimeout(timer);
  }, [matchingState.loadingBatch, currentPotentialMatch, matchingState.initialized, hasMinimumLoadingTime]);

  // 🆕 NEW: Reset loading states when component mounts or remounts
  useEffect(() => {
    if (currentPotentialMatchRef.current && !actionInProgress && showContent) {
      console.log('🔄 Resetting animations for new match:', currentPotentialMatchRef.current.userId);
      contentOpacity.setValue(1);
      buttonsOpacity.setValue(0);
      overlayOpacity.setValue(0);
      overlayScale.setValue(0.8);
      orbButtonGlow.setValue(0);
      setPhotosLoaded(false);
    }
  }, [currentPotentialMatch?.userId, showContent, actionInProgress]);


  // 🔄 UPDATED: Monitor the new consolidated state
  useEffect(() => {
    console.log('🖥️ ConnectScreen: Detailed state debug', {
      // Basic state
      currentMatch: currentPotentialMatchRef.current?.userId,
      firstName: currentPotentialMatchRef.current?.firstName,
      
      // Loading states
      isLoading,
      hasMinimumLoadingTime,
      showContent,
      
      // Matching state details
      matchingStateExists: !!matchingStateRef.current,
      totalMatches: matchingStateRef.current?.potentialMatches?.length || 0,
      currentIndex: matchingStateRef.current?.currentIndex || 0,
      initialized: matchingStateRef.current?.initialized || false,
      loading: matchingStateRef.current?.loadingBatch || false,
      noMore: matchingStateRef.current?.noMoreMatches || false,
    });
  }, [currentPotentialMatch, matchingState, isLoading, hasMinimumLoadingTime, showContent]);

  // 🔄 UPDATED: Use new optimized action handlers with loading feedback
  const handleAction = async (action: 'like' | 'pass' | 'orb') => {
    if (actionInProgress || !currentPotentialMatchRef.current) {
      console.log('🚫 Action blocked: already in progress or no current match');
      return;
    }
    
    if (action === 'orb' && (!userDataRef.current?.numOfOrbs || userDataRef.current.numOfOrbs <= 0)) {
      showDivineOrbModal();
      return;
    }
    
    console.log(`🎯 Starting ${action} action for user: ${currentPotentialMatchRef.current.userId}`);
    
    setActionInProgress(true);
    setLastAction(action);
    
    // Start animation
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

    const userId = currentPotentialMatchRef.current.userId;
    
    try {
      switch (action) {
        case 'pass':
          await dislikeMatch(userId);
          break;
        case 'orb':
          await orbLike(userId);
          break;
        case 'like':
          await likeMatch(userId);
          break;
      }
      
      console.log(`✅ ${action} action completed successfully for user: ${userId}`);
      
    } catch (error: any) {
      console.error(`❌ ${action} action failed:`, error);
      
      // Handle daily limit error specifically
      if (error.message === "DAILY_LIMIT_REACHED") {
        console.log('📊 Daily limit reached, showing modal');
        setActionInProgress(false);
        setLastAction(null);
        contentOpacity.setValue(1);
        overlayOpacity.setValue(0);
        overlayScale.setValue(0.8);
        showDailyLimitModalFunc();
        return;
      }
      
      // Handle other errors - reset action state
      console.log('🔄 Resetting action state due to error');
      setActionInProgress(false);
      setLastAction(null);
      contentOpacity.setValue(1);
      overlayOpacity.setValue(0);
      overlayScale.setValue(0.8);
      return;
    }

    // Reset scroll position
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });

    // Complete animation
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
        console.log('🎬 Action animation completed');
      });
    }, 800);
  };

  // Divine orb modal functions (unchanged)
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

  // Photos loaded handler (unchanged)
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

  // Reset animations when match changes (unchanged)
  useEffect(() => {
    if (currentPotentialMatch && !actionInProgress && showContent) {
      contentOpacity.setValue(1);
      buttonsOpacity.setValue(0);
      overlayOpacity.setValue(0);
      overlayScale.setValue(0.8);
      orbButtonGlow.setValue(0);
      setPhotosLoaded(false);
    }
  }, [currentPotentialMatch?.userId, showContent]);

  // Helper functions for action feedback
  const getActionColor = (action: 'like' | 'pass' | 'orb') => {
    switch (action) {
      case 'like': return '#B8860B';
      case 'pass': return '#8B7355';
      case 'orb': return '#CD853F';
      default: return '#CD853F';
    }
  };

  const getActionIcon = (action: 'like' | 'pass' | 'orb') => {
    switch (action) {
      case 'like': return 'heart' as const;
      case 'pass': return 'close' as const;
      case 'orb': return 'sparkles' as const;
      default: return 'heart' as const;
    }
  };

  const showDailyLimitModalFunc = () => {
    setShowDailyLimitModal(true);
    
    Animated.parallel([
      Animated.timing(dailyLimitModalOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(dailyLimitModalScale, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(dailyLimitGlow, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(dailyLimitGlow, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ),
    ]).start();
  };

  const closeDailyLimitModal = () => {
    Animated.parallel([
      Animated.timing(dailyLimitModalOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(dailyLimitModalScale, {
        toValue: 0.8,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowDailyLimitModal(false);
      dailyLimitGlow.setValue(0);
    });
  };

  const navigateToFullCircle = () => {
    closeDailyLimitModal();
    setTimeout(() => {
      router.push('/user/FullCircleSubscription');
    }, 500);
  };

  // 🔄 UPDATED: Use new state for no more matches condition
  if (matchingState.noMoreMatches) {
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
          
          {/* 🔄 NEW: Add debug reset button in development */}
          {__DEV__ && (
            <TouchableOpacity onPress={resetMatching} style={styles.debugButton}>
              <Ionicons name="refresh" size={20} color="#B8860B" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.noLikesContainer}>
          {hasFullCircleSubscription ? (
            // FullCircle Subscriber Experience
            <>
              <View style={[styles.cosmicSymbol, { backgroundColor: '#B8860B' + '15' }]}>
                <Ionicons name="infinite" size={32} color="#B8860B" />
              </View>
              
              <Text style={[styles.noLikesTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                You've explored your current circle
              </Text>
              
              <Text style={[styles.noLikesSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                As a FullCircle member, you've seen all available connections in your area. New members join daily - check back soon or expand your search radius.
              </Text>
              
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: '#B8860B', shadowColor: '#B8860B' }]}
                  onPress={() => router.navigate('/user/EditUserProfile')}
                  activeOpacity={0.9}
                >
                  <Ionicons name="person" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={[styles.primaryButtonText, fonts.spiritualBodyFont]}>
                    Enhance Your Profile
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
            </>
          ) : (
            // Non-Subscriber Experience
            <>
              <View style={[styles.cosmicSymbol, { backgroundColor: '#B8860B' + '15' }]}>
                <Ionicons name="infinite" size={32} color="#B8860B" />
              </View>
              
              <Text style={[styles.noLikesTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                More connections coming soon
              </Text>
              
              <Text style={[styles.noLikesSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                We're preparing more meaningful matches for you. Expand your circle with FullCircle to discover more connections, or adjust your preferences.
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
            </>
          )}
        </View>
      </View>
    );
  }

  // 🆕 NEW: Enhanced loading screen with smooth animations
  if (isLoading || (!showContent && !matchingState.noMoreMatches)) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
        
        {/* Always show header to avoid white screen */}
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

        {/* Always show settings button */}
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

        <Animated.View 
          style={[
            styles.centeredContainer,
            { opacity: loadingFadeIn }
          ]}
        >
          <View style={styles.loadingContainer}>
            {/* 🆕 NEW: Enhanced loading mandala with multiple animation layers */}
            <Animated.View 
              style={[
                styles.loadingMandala,
                { 
                  backgroundColor: '#B8860B' + '10',
                  transform: [
                    {
                      rotate: loadingRotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                }
              ]}
            >
              <Animated.View
                style={[
                  styles.innerPulse,
                  {
                    opacity: loadingPulse.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.4, 1, 0.4],
                    }),
                    transform: [
                      {
                        scale: loadingPulse.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.8, 1.2, 0.8],
                        }),
                      },
                    ],
                  }
                ]}
              >
                <Ionicons name="heart" size={24} color="#B8860B" />
              </Animated.View>
              
              {/* 🆕 NEW: Secondary rotating elements */}
              <Animated.View
                style={[
                  styles.outerRing,
                  {
                    transform: [
                      {
                        rotate: loadingRotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['360deg', '0deg'], // Counter-rotation
                        }),
                      },
                    ],
                  }
                ]}
              >
                <View style={[styles.ringDot, { top: 0, left: '45%' }]} />
                <View style={[styles.ringDot, { bottom: 0, right: '45%' }]} />
                <View style={[styles.ringDot, { left: 0, top: '45%' }]} />
                <View style={[styles.ringDot, { right: 0, bottom: '45%' }]} />
              </Animated.View>
            </Animated.View>
          </View>
          
          <Animated.Text 
            style={[
              styles.loadingText, 
              fonts.spiritualTitleFont, 
              { 
                color: '#B8860B',
                opacity: loadingPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7, 1],
                }),
              }
            ]}
          >
            {matchingState.loadingBatch ? "Finding Your Matches" : "Preparing Your Journey"}
          </Animated.Text>
          
          <Text style={[styles.loadingSubtext, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            {matchingState.loadingBatch ? "We're preparing your next connection" : "Getting everything ready"}
          </Text>
          
          {/* 🆕 NEW: Loading progress dots */}
          <View style={styles.loadingDots}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.loadingDot,
                  {
                    opacity: loadingPulse.interpolate({
                      inputRange: [0, 0.3, 0.6, 1],
                      outputRange: index === 0 ? [0.3, 1, 0.3, 0.3] :
                                   index === 1 ? [0.3, 0.3, 1, 0.3] :
                                                 [0.3, 0.3, 0.3, 1],
                    }),
                  }
                ]}
              />
            ))}
          </View>
          
          {/* 🔄 NEW: Show additional debug info in development */}
          {__DEV__ && (
            <Text style={[styles.debugText, { color: colors.textLight, marginTop: 20 }]}>
              {`Debug: ${matchingState.potentialMatches.length} matches loaded, index: ${matchingState.currentIndex}, initialized: ${matchingState.initialized.toString()}, showContent: ${showContent.toString()}`}
            </Text>
          )}
        </Animated.View>
      </View>
    );
  }

  // 🆕 NEW: Content with fade-in animation - Always render the structure to avoid white screen
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />

      {/* Always show settings button */}
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
      
      <Animated.View 
        style={[
          styles.contentContainer,
          { 
            opacity: showContent ? contentFadeIn : 0.3 // Show dimmed content while transitioning
          }
        ]}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Only render PotentialMatch when we have content AND it's ready to show */}
          {showContent && currentPotentialMatch ? (
            <PotentialMatch
              currentPotentialMatch={currentPotentialMatch}
              isMatched={false}
              onPhotosLoaded={handlePhotosLoaded}
            />
          ) : (
            // Show placeholder to maintain layout during transitions
            <View style={styles.contentPlaceholder}>
              <Text style={[styles.placeholderText, { color: colors.textLight }]}>
                {!currentPotentialMatch ? "Loading matches..." : "Preparing profile..."}
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Only show buttons when content is ready */}
      {photosLoaded && !actionInProgress && showContent && currentPotentialMatch && (
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

      {/* Divine Orb Modal - unchanged */}
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

      {/* Clean Action Feedback Overlay - NO container box */}
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
          <Animated.View
            style={[
              styles.actionIconContainer,
              {
                backgroundColor: getActionColor(lastAction) || '#B8860B',
                shadowColor: getActionColor(lastAction) || '#B8860B',
              }
            ]}
          >
            <Ionicons 
              name={getActionIcon(lastAction) || 'heart'} 
              size={36} 
              color="#FFFFFF" 
            />
          </Animated.View>
        </Animated.View>
      )}

      {/* Daily Limit Modal */}
      {showDailyLimitModal && (
        <Animated.View 
          style={[
            styles.divineModalOverlay,
            { opacity: dailyLimitModalOpacity }
          ]}
        >
          <Animated.View 
            style={[
              styles.divineModal,
              {
                transform: [{ scale: dailyLimitModalScale }],
                backgroundColor: colors.card,
                borderColor: '#B8860B',
                shadowColor: '#B8860B',
              }
            ]}
          >
            <Animated.View 
              style={[
                styles.divineGlow,
                {
                  opacity: dailyLimitGlow.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.05, 0.15],
                  }),
                  backgroundColor: '#B8860B',
                }
              ]}
            />
            
            <View style={styles.divineContent}>
              <View style={[styles.divineIcon, { backgroundColor: '#B8860B' + '20' }]}>
                <Ionicons name="heart" size={36} color="#B8860B" />
              </View>
              
              <Text style={[
                styles.divineTitle, 
                fonts.spiritualTitleFont, 
                { color: colors.textDark }
              ]}>
                Daily Hearts Used
              </Text>
              
              <Text style={[
                styles.divineMessage, 
                fonts.spiritualBodyFont, 
                { color: colors.textLight }
              ]}>
                You've shared all {DAILY_LIKE_LIMIT} of your daily hearts. Your energy resets at midnight, or join FullCircle for unlimited connections.
              </Text>
              
              {/* Show remaining time until reset */}
              <Text style={[
                styles.resetTimeText,
                fonts.spiritualBodyFont,
                { color: '#B8860B', marginBottom: Spacing.lg }
              ]}>
                ✨ Hearts reset at midnight
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
                  onPress={navigateToFullCircle}
                  activeOpacity={0.9}
                >
                  <Ionicons name="infinite" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>
                    Get Unlimited Hearts
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.divineSecondaryButton,
                    { borderColor: colors.border }
                  ]}
                  onPress={closeDailyLimitModal}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.divineSecondaryText, 
                    fonts.spiritualBodyFont,
                    { color: colors.textLight }
                  ]}>
                    Continue Tomorrow
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
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
    zIndex: 1,
  },

  // Enhanced loading styles
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  
  loadingMandala: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#B8860B' + '20',
  },

  innerPulse: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B8860B' + '10',
  },

  outerRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    top: 10,
    left: 10,
  },

  ringDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#B8860B',
    opacity: 0.6,
  },

  loadingDots: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },

  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B8860B',
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
    marginBottom: Spacing.md,
  },
  
  // Divine orb modal styles
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
  
  // Clean Action feedback styles - NO container box
  actionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  
  actionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  
  // No more matches styles
  cosmicSymbol: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'transparent',
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
  },
  
  debugButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#B8860B' + '20',
  },
  
  debugText: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'monospace',
  },

  // Content placeholder styles to prevent white screen
  contentPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },

  placeholderText: {
    fontSize: Typography.sizes.base,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.6,
  },
  
  resetTimeText: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 0.3,
    fontWeight: Typography.weights.medium,
  },
});

export default ConnectScreen;