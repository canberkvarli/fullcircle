import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  useColorScheme,
  Animated,
} from "react-native";
import { CustomIcon } from "@/components/CustomIcon";
import { useUserContext, UserDataType } from "@/context/UserContext";
import { useRouter } from "expo-router";
import PotentialMatch from "@/components/PotentialMatch";
import LotusScreen from "@/components/LotusScreen";
import { Colors, Typography, Spacing } from "@/constants/Colors";

import { useFont } from "@/hooks/useFont";
import OuroborosLoader from "@/components/ouroboros/OuroborosLoader";

/**
 * 🚀 PERFORMANCE OPTIMIZED CONNECT SCREEN WITH PHOTO CACHING & GENTLE ANIMATIONS
 * 
 * KEY PERFORMANCE FEATURES:
 * 1. PHOTO CACHING: Preloads next user's photos for instant display
 * 2. SMART PRELOADING: Automatically fetches next batch when 3 users remain
 * 3. INSTANT TRANSITIONS: Next user is always ready when you swipe
 * 4. BACKGROUND LOADING: No UI blocking during data fetching
 * 5. 🎭 GENTLE ANIMATIONS: Subtle fade-in effects for seamless transitions
 * 
 * PHOTO CACHING STRATEGY:
 * - When viewing a user, automatically start loading next user's photos
 * - Photos are cached in memory and displayed instantly on swipe
 * - Fallback to normal loading if cache miss (never breaks existing functionality)
 * 
 * 🎭 GENTLE EFFECTS:
 * - Animation starts FIRST (fade out current user)
 * - THEN new user data loads (while invisible)
 * - Finally new user fades in smoothly (200ms)
 * - Buttons gently appear with subtle opacity transition
 * - Perfect sequence: Animate → Load → Display
 * 
 * This creates a polished, premium experience with instant performance!
 */
const ConnectScreen: React.FC = () => {
  const router = useRouter();
  
  const {
    likeMatch,
    dislikeMatch,
    lotusLike,
    loadNextMatch,
    currentPotentialMatch,
    matchingState,
    DAILY_LIKE_LIMIT,
    userData,
    checkAndRefetchIfNeeded,
    forceRefetchOnReturn,
    resetMatching,
  } = useUserContext();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  // Enhanced loading and transition states
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [photosLoaded, setPhotosLoaded] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [lastAction, setLastAction] = useState<'like' | 'pass' | 'lotus' | null>(null);
  const [showLotusModal, setShowLotusModal] = useState(false);
  const [showLotusScreen, setShowLotusScreen] = useState(false);
  const [showDailyLimitModal, setShowDailyLimitModal] = useState(false);
  
  // 🎭 TRANSITION: Control when user data changes
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<any>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  // 🎭 MORPHING ANIMATIONS: Beautiful scale-in effects for instant transitions
  const cardScale = useRef(new Animated.Value(0.8)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const contentFadeIn = useRef(new Animated.Value(0)).current;
  
  // Button entrance animations
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsScale = useRef(new Animated.Value(0.8)).current;
  const buttonsTranslateY = useRef(new Animated.Value(20)).current;

  const hasFullCircleSubscription = userData?.subscription?.isActive || false;
  const userDataRef = useRef(userData);
  const matchingStateRef = useRef(matchingState);

  // 🆕 PHOTO CACHING: Simple cache for next user's photos
  // This stores the next user's photos so they display instantly when you swipe
  // instead of showing a loading state while photos download
  const [photoCache, setPhotoCache] = useState<Map<string, string[]>>(new Map());

  // 🆕 PHOTO PRELOADING: Cache next user's photos for instant display
  // When you're viewing a user, we automatically start loading the next user's photos
  // so when you swipe, their photos are already cached and display instantly
  const preloadNextUserPhotos = useCallback(async () => {
    if (!matchingState.potentialMatches.length || !currentPotentialMatch) return;
    
    const currentIndex = matchingState.currentIndex || 0;
    const nextUser = matchingState.potentialMatches[currentIndex + 1];
    
    if (!nextUser || photoCache.has(nextUser.userId)) return;
    
    try {
      const { getImageUrl } = useUserContext();
      if (nextUser.photos && nextUser.photos.length > 0) {
        const photoUrls = await Promise.all(
          nextUser.photos.map((path: string) => getImageUrl(path))
        );
        
        const validUrls = photoUrls.filter((url): url is string => !!url);
        if (validUrls.length > 0) {
          setPhotoCache(prev => new Map(prev).set(nextUser.userId, validUrls));
          console.log('📸 Cached photos for next user:', nextUser.firstName);
        }
      }
    } catch (error) {
      console.log('⚠️ Photo preloading failed:', error);
    }
  }, [matchingState.potentialMatches, matchingState.currentIndex, currentPotentialMatch, photoCache]);

  // 🆕 PHOTO CACHE UTILITY: Get cached photos for a user
  const getCachedPhotos = useCallback((userId: string): string[] | null => {
    return photoCache.get(userId) || null;
  }, [photoCache]);

  // 🎭 GENTLE: Initialize subtle entrance animations
  useEffect(() => {
    // Start with content invisible for smooth entrance
    cardOpacity.setValue(0);
    contentFadeIn.setValue(0);
    
    // Gentle fade in content
    Animated.timing(contentFadeIn, {
      toValue: 1,
      duration: 300, // Faster and gentler
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  useEffect(() => {
    matchingStateRef.current = matchingState;
  }, [matchingState]);

  // 🆕 NEW: Check if preferences changed while user was away
  useEffect(() => {
    // 🔒 AUTH GUARD: Only proceed if user is authenticated and matching is initialized
    if (matchingState.initialized && userData.userId) {
      checkAndRefetchIfNeeded();
    }
  }, [matchingState.initialized, userData.userId, checkAndRefetchIfNeeded]);

  // 🆕 PATIENT: Refetch when returning to Connect screen to catch preference changes
  useEffect(() => {
    // 🔒 AUTH GUARD: Only proceed if user is authenticated and matching is initialized
    if (matchingState.initialized && userData.userId) {
      // Small delay to ensure state has propagated from preference changes
      setTimeout(() => {
        // Let the main loading state logic handle the loading states
        // Just trigger the refetch
        forceRefetchOnReturn();
      }, 100); // Small delay to let state settle
    }
  }, [matchingState.initialized, userData.userId, forceRefetchOnReturn]);

  // 🆕 PHOTO PRELOADING: Cache next user's photos when current user changes
  // This effect runs whenever the current user changes, automatically preloading
  // the next user's photos in the background for instant display
  useEffect(() => {
    if (currentPotentialMatch && matchingState.potentialMatches.length > 0) {
      // Preload photos for the next user in the queue
      preloadNextUserPhotos();
    }
  }, [currentPotentialMatch?.userId, matchingState.currentIndex, preloadNextUserPhotos]);



  // 🆕 BULLETPROOF: Improved loading state management with better logic
  useEffect(() => {
    // 🆕 FIXED: Use actual state values instead of refs to avoid timing issues
    const hasMatches = matchingState.potentialMatches.length > 0;
    const isCurrentlyLoading = matchingState.loadingBatch;
    const isInitialized = matchingState.initialized;
    const noMoreAvailable = matchingState.noMoreMatches;
    const hasTriedFetching = matchingState.lastFetchedDoc !== undefined;
    
    console.log('🔍 Connect screen loading state:', {
      hasMatches,
      isCurrentlyLoading,
      isInitialized,
      noMoreAvailable,
      hasTriedFetching,
      potentialMatchesLength: matchingState.potentialMatches.length,
      currentPotentialMatch: currentPotentialMatch ? `${currentPotentialMatch.firstName} (${currentPotentialMatch.userId})` : 'none',
      exclusionSetSize: matchingState.exclusionSet?.size || 0,
      lastFetchedDoc: matchingState.lastFetchedDoc ? 'exists' : 'null'
    });
    
    // Show loading when:
    // 1. Currently fetching a batch, OR
    // 2. Not initialized yet, OR  
    // 3. Initialized but haven't tried fetching yet (first time)
    if (isCurrentlyLoading || !isInitialized || (isInitialized && !hasTriedFetching)) {
      setIsLoading(true);
      setShowContent(false);
    } else {
      // 🚀 TESTING: Simplified logic - if no more matches available, we're done
      if (noMoreAvailable) {
        // We know there are no more matches, so we're done loading
        setIsLoading(false);
        setShowContent(false); // This will trigger the "no more matches" screen
      } else if (hasMatches) {
        // We have matches and more might be available
        setIsLoading(false);
        setShowContent(true);
      } else {
        // No matches and we don't know if there are more - still loading
        setIsLoading(false);
        setShowContent(false);
      }
    }
  }, [matchingState.loadingBatch, matchingState.initialized, matchingState.potentialMatches.length, matchingState.noMoreMatches, matchingState.lastFetchedDoc, currentPotentialMatch]);

  // 🔧 REMOVED: Auto-fetch logic that was causing infinite loops
  // The system will now rely on manual refresh or natural progression

  // 🎭 TRANSITION: Handle user changes during transitions
  useEffect(() => {
    // CRITICAL: Don't run this effect during transitions
    if (isTransitioning) {
      console.log('🎭 TRANSITION: Skipping useEffect during transition');
      return;
    }
    
    if (currentPotentialMatch && !actionInProgress && showContent) {
      // Only reset if we actually have a new match (check by userId)
      const currentUserId = currentPotentialMatch.userId;
      if (currentUserId && currentUserId !== matchingState.currentIndex?.toString()) {
        console.log('🎭 TRANSITION: ⚠️ USER DATA CHANGED - This should happen AFTER animation!');
        console.log('🎭 TRANSITION: Current user:', currentPotentialMatch.firstName);
        // Reset photo loading state for new user
        setPhotosLoaded(false);
      }
    }
  }, [currentPotentialMatch?.userId, showContent, actionInProgress, isTransitioning]);

  // 🎭 GENTLE: Ensure content fades in smoothly when visible
  useEffect(() => {
    if (showContent) {
      // 🎭 GENTLE EFFECT: Just fade in content smoothly
      // No scale - just gentle opacity transition
      cardOpacity.setValue(0);
      
      // Small delay to ensure smooth transition
      setTimeout(() => {
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 250, // Fast and gentle
          useNativeDriver: true,
        }).start();
      }, 100);
    }
  }, [showContent]);

  // 🆕 ENHANCED: Action handler with buttery-smooth animations
  const handleAction = async (action: 'like' | 'pass' | 'lotus') => {
    if (actionInProgress || !currentPotentialMatch) {
      return;
    }
    
    if (action === 'lotus' && (!userDataRef.current?.numOfLotus || userDataRef.current.numOfLotus <= 0)) {
      showDivineLotusModal();
      return;
    }
    
    setActionInProgress(true);
    setLastAction(action);
    
    // 🆕 SMOOTH: Beautiful card animation based on action
    const direction = action === 'like' ? 1 : -1;
    const targetX = direction * 400; // Swipe distance
    const targetY = direction * -50; // Slight upward movement
    const targetRotate = direction * 15; // Rotation for natural feel
    
    // 🚀 TESTING: No button animations for clean performance testing
    console.log('🚀 BUTTON PRESSED:', action, '- Testing instant transitions');
    
    // 🚀 TESTING: No card animation - instant transition for testing
    console.log('🚀 INSTANT TRANSITION: No animations, showing next user immediately');
    
    const userId = currentPotentialMatch.userId;
    
    // 🎭 FAST: Quick animation, then load next user
    console.log('🎭 FAST: Starting quick fade out animation');
    
    // 🚫 CRITICAL: Block user data changes during animation
    setIsTransitioning(true);
    
    // Start fade out immediately - FAST
    Animated.timing(cardOpacity, {
      toValue: 0,
      duration: 200, // Quick 200ms fade out
      useNativeDriver: true,
    }).start();
    
    // SHORT DELAY: Wait 300ms before loading next user
    // This gives the animation time to complete
    setTimeout(async () => {
      console.log('🎭 FAST: Animation complete, now loading next user');
      
      try {
        // 🚫 CRITICAL: Call the action function AFTER animation completes
        // This prevents the state from changing before animation
        switch (action) {
          case 'pass':
            await dislikeMatch(userId);
            break;
          case 'lotus':
            await lotusLike(userId);
            break;
          case 'like':
            await likeMatch(userId);
            break;
        }
        
        // Wait for data to load, then fade in
        setTimeout(() => {
          console.log('🎭 FAST: Loading complete, fading in new user');
          
          // Fade in new user - FAST
          Animated.timing(cardOpacity, {
            toValue: 1,
            duration: 200, // Quick fade in
            useNativeDriver: true,
          }).start(() => {
            console.log('🎭 FAST: Complete!');
            setIsTransitioning(false);
            resetActionState();
            setPhotosLoaded(false);
          });
        }, 100); // Short delay for data to settle
        
      } catch (error) {
        console.error('❌ Failed to execute action:', error);
        // Fade back in on error
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setIsTransitioning(false);
          resetActionState();
        });
      }
    }, 300); // Wait 300ms before loading next user
    
    // Reset scroll position
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  };

  const resetActionState = () => {
    setActionInProgress(false);
    setLastAction(null);
    
    // 🚀 TESTING: No animations - just reset state
    setPhotosLoaded(false);
  };

  // 🚀 TESTING: No modal animations for clean performance testing
  const showDivineLotusModal = () => {
    setShowLotusModal(true);
  };

  const closeDivineLotusModal = () => {
    setShowLotusModal(false);
  };

  const showDailyLimitModalFunc = () => {
    setShowDailyLimitModal(true);
  };

  const closeDailyLimitModal = () => {
    setShowDailyLimitModal(false);
  };

  const handlePhotosLoaded = () => {
    setPhotosLoaded(true);
    
    // 🎭 GENTLE: Subtle button entrance animation
    console.log('📸 Photos loaded - gently fading buttons into view');
    
    // Just fade in buttons smoothly - no scale or movement
    Animated.timing(buttonsOpacity, {
      toValue: 1,
      duration: 200, // Fast and gentle
      useNativeDriver: true,
    }).start();
  };



  // Navigate functions - FIXED TO USE MODAL INSTEAD OF NAVIGATION
  const navigateToLotusShop = () => {
    closeDivineLotusModal();
    setTimeout(() => {
      setShowLotusScreen(true); // Show modal instead of navigating
    }, 400);
  };

  const closeLotusScreen = () => {
    setShowLotusScreen(false);
  };

  const navigateToSubscription = () => {
    closeDivineLotusModal();
    setTimeout(() => {
      router.push('/user/FullCircleSubscription');
    }, 400);
  };

  const navigateToFullCircle = () => {
    closeDailyLimitModal();
    setTimeout(() => {
      router.push('/user/FullCircleSubscription');
    }, 400);
  };

  // No more matches screen - only show after we've actually tried to find matches
  // 🆕 BULLETPROOF: Only show no matches when we're absolutely sure there are none
  // Don't show if we're still loading, fetching, or if this is the first time
  

  
  if (matchingState.initialized && 
      !matchingState.loadingBatch && 
      !isLoading && 
      (matchingState.potentialMatches.length === 0 || matchingState.noMoreMatches) &&
      matchingState.lastFetchedDoc !== undefined && 
      !actionInProgress) { // Also don't show during actions to prevent flash
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
        


        <View style={styles.noLikesContainer}>
            <OuroborosLoader
              variant="breathe"
              duration={7000}
              size={102}
              loop={true}
              fillColor="#F5E6D3"
              strokeColor="#B8860B"
            />
          
          <Text  style={[styles.noLikesTitle, fonts.spiritualityVibrantTitleFont, { color: colors.textDark }]}>
            {hasFullCircleSubscription 
              ? "You've explored your current circle"
              : "More connections coming soon"
            }
          </Text>
          
          <Text style={[styles.noLikesSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            {hasFullCircleSubscription
              ? "As a FullCircle member, you've seen all available connections in your area. New members join daily - check back soon or expand your search radius."
              : "We're preparing more meaningful matches for you. Expand your circle with FullCircle to discover more connections, or adjust your preferences."
            }
          </Text>
          
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#B8860B', shadowColor: '#B8860B' }]}
              onPress={() => router.navigate(hasFullCircleSubscription ? '/user/EditUserProfile' : '/user/FullCircleSubscription')}
              activeOpacity={0.9}
            >
              <CustomIcon 
                name={hasFullCircleSubscription ? "person" : "infinite"} 
                size={20} 
                color="#FFFFFF" 
                style={styles.buttonIcon} 
              />
              <Text style={[styles.primaryButtonText, fonts.spiritualBodyFont]}>
                {hasFullCircleSubscription ? "Enhance Your Profile" : "Expand Your Circle"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: '#B8860B' }]}
              onPress={() => router.navigate('/user/ConnectingPreferences')}
              activeOpacity={0.9}
            >
              <CustomIcon name="options" size={18} color="#B8860B" style={styles.buttonIcon} />
              <Text style={[styles.secondaryButtonText, fonts.spiritualBodyFont, { color: '#B8860B' }]}>
                Adjust Preferences
              </Text>
            </TouchableOpacity>
            

            


          </View>
        </View>
      </View>
    );
  }

  // Enhanced loading screen - prevent flash of no matches container
  

  
  if (isLoading || 
      !showContent || 
      matchingState.loadingBatch || 
      (matchingState.potentialMatches.length === 0 && !matchingState.noMoreMatches)) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />

        <View style={styles.centeredLoadingContainer}>
          <OuroborosLoader
            variant="pulse"              
            size={120}                   
            duration={1000}              
            loop={true}                  
            fillColor="#F5E6D3"          
            strokeColor="#7B6B5C"        
            strokeWidth={1}
          />
        </View>
      </View>
    );
  }

  // Main content with enhanced animations
  

  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />

      <TouchableOpacity 
        style={[
          styles.settingsFloating, 
          { backgroundColor: colors.card, borderColor: colors.border }
        ]}
        onPress={() => router.push('/user/ConnectingPreferences')}
        activeOpacity={0.7}
      >
        <CustomIcon name="options" size={22} color="#B8860B" />
      </TouchableOpacity>
      
      <Animated.View 
        style={[
          styles.contentContainer,
          { 
            opacity: contentFadeIn
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
          
                     {showContent && currentPotentialMatch ? (
            <Animated.View style={{ 
              opacity: cardOpacity
            }}>
              <PotentialMatch
                currentPotentialMatch={currentPotentialMatch}
                currentUserData={userData}
                isMatched={false}
                onPhotosLoaded={handlePhotosLoaded}
                getCachedPhotos={getCachedPhotos}
              />
            </Animated.View>
          ) : (
            <View style={styles.contentPlaceholder}>
              {/* Removed small OuroborosLoader to prevent duplicate spinners */}
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Enhanced action buttons with smooth animations */}
      {(() => {
        return photosLoaded && !actionInProgress && showContent && currentPotentialMatch ? (
          <>
            {/* X and Heart buttons in their own container */}
            <Animated.View style={[
              styles.buttonsContainer, 
              { 
                opacity: buttonsOpacity
              }
            ]}>
              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  styles.leftAction,
                  { 
                    backgroundColor: colors.card, 
                    borderColor: colors.border,
                    shadowColor: '#8B7355',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 4,
                  }
                ]}
                onPress={() => handleAction('pass')}
                activeOpacity={0.8}
                disabled={actionInProgress}
              >
                <CustomIcon name="close" size={20} color="#8B7355" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  styles.rightAction,
                  { 
                    backgroundColor: colors.card, 
                    borderColor: colors.border,
                    shadowColor: hasFullCircleSubscription ? '#FFD700' : '#E74C3C',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 4,
                  }
                ]}
                onPress={() => handleAction('like')}
                activeOpacity={0.8}
                disabled={actionInProgress}
              >
                <CustomIcon 
                  name="heart" 
                  size={20} 
                  color={hasFullCircleSubscription ? '#FFD700' : '#E74C3C'} 
                />
              </TouchableOpacity>
            </Animated.View>

            {/* Lotus button positioned independently */}
            <View style={styles.lotusButtonContainer}>
              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  styles.centerAction,
                  { 
                    backgroundColor: '#680439ff',
                    shadowColor: '#CD853F',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 8,
                  }
                ]}
                onPress={() => handleAction('lotus')}
                activeOpacity={0.8}
                disabled={actionInProgress}
              >
                <CustomIcon name="lotus" size={36}/>
              </TouchableOpacity>
            </View>
          </>
        ) : null;
      })()}

      {/* 🆕 REMOVED: Transition overlay that was showing yellow ouroboros */}
      
      {/* Divine Lotus Modal */}
      {showLotusModal && (
        <View style={styles.divineModalOverlay}>
          <View 
            style={[
              styles.divineModal,
              {
                backgroundColor: colors.card,
                borderColor: '#CD853F',
                shadowColor: '#CD853F',
              }
            ]}
          >
            <TouchableOpacity 
              style={[
                styles.modalCloseButton,
                { backgroundColor: colors.background, borderColor: colors.border }
              ]}
              onPress={closeDivineLotusModal}
              activeOpacity={0.7}
            >
              <CustomIcon name="close" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <View style={styles.divineContent}>
              <View style={styles.divineIcon}>
                <CustomIcon name="lotus" size={36}/>
              </View>
              
              <Text style={[
                styles.divineTitle, 
                fonts.spiritualityVibrantTitleFont, 
                { color: colors.textDark }
              ]}>
                Lotus Needed
              </Text>
              
              <Text style={[
                styles.divineMessage, 
                fonts.spiritualBodyFont, 
                { color: colors.textLight }
              ]}>
                You've shared all your lotus flowers with fellow connections. Purchase more or join FullCircle for unlimited connections.
              </Text>
              
              <View style={styles.divineActions}>
                <TouchableOpacity 
                  style={[
                    styles.divineButton, 
                    { 
                      backgroundColor: '#680439ff',
                      shadowColor: '#680439ff'
                    }
                  ]}
                  onPress={navigateToLotusShop}
                  activeOpacity={0.9}
                >
                  <CustomIcon name="lotus" size={20} style={styles.buttonIcon} />
                  <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>
                    Get More Lotus
                  </Text>
                </TouchableOpacity>
                
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
                  <CustomIcon name="infinite" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>
                    Join Full Circle
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Daily Limit Modal */}
      {showDailyLimitModal && (
        <View style={styles.divineModalOverlay}>
          <View 
            style={[
              styles.divineModal,
              {
                backgroundColor: colors.card,
                borderColor: '#B8860B',
                shadowColor: '#B8860B',
              }
            ]}
          >
            <View style={styles.divineContent}>
              <View style={[styles.divineIcon, { backgroundColor: '#B8860B' + '20' }]}>
                <CustomIcon name="heart" size={36} color="#B8860B" />
              </View>
              
              <Text style={[
                styles.divineTitle, 
                fonts.spiritualityVibrantTitleFont, 
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
                  <CustomIcon name="infinite" size={20} color="#FFFFFF" style={styles.buttonIcon} />
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
          </View>
        </View>
      )}

      {/* Lotus Screen Modal - Uses same pattern as SacredSelf */}
      <LotusScreen
        visible={showLotusScreen}
        onClose={closeLotusScreen}
      />
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
            minHeight: 600,
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
    left: Spacing.lg,
  },
  
  rightAction: {
    right: Spacing.lg,
  },
  
  centerAction: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 0,
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



  centeredLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing["4xl"],
  },
  
  // 🆕 SIMPLIFIED: Only essential styles for smooth UX
  actionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  
  lotusButtonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100, // Higher position to stay centered
    left: '50%',
    marginLeft: -28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Modal styles
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
  
  divineContent: {
    padding: Spacing['2xl'],
    alignItems: 'center',
    zIndex: 1,
  },
  
  divineIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  
  divineTitle: {
    fontSize: Typography.sizes['2xl'],
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
  
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  noLikesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  
  noLikesTitle: {
    fontSize: Typography.sizes['2xl'],
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
    letterSpacing: 0.3,
  },
  

  
  contentPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
            minHeight: 500,
  },
  
  resetTimeText: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  
  transitionText: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    marginTop: Spacing.md,
    letterSpacing: 0.3,
    fontStyle: 'italic',
  },
});

export default ConnectScreen;