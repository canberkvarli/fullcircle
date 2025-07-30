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
  RefreshControl
} from "react-native";
import { CustomIcon } from "@/components/CustomIcon"; // Import CustomIcon
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";
import PotentialMatch from "@/components/PotentialMatch";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import OuroborosLoader from "@/components/ouroboros/OuroborosLoader";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const ConnectScreen: React.FC = () => {
  const router = useRouter();
  
  // 🔄 UPDATED: Use new consolidated state from UserContext
  const {
    // New consolidated functions
    likeMatch,
    dislikeMatch,
    lotusLike,
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
  const [lastAction, setLastAction] = useState<'like' | 'pass' | 'lotus' | null>(null);
  const [showLotusModal, setShowLotusModal] = useState(false);
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
  
  const lotusModalOpacity = useRef(new Animated.Value(0)).current;
  const lotusModalScale = useRef(new Animated.Value(0.8)).current;
  const divineGlow = useRef(new Animated.Value(0)).current;
  
  const lotusButtonGlow = useRef(new Animated.Value(0)).current;

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if user has FullCircle subscription
  const hasFullCircleSubscription = userData?.subscription?.isActive || false;

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
      lotusButtonGlow.setValue(0);
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

  const handleAction = async (action: 'like' | 'pass' | 'lotus') => {
    if (actionInProgress || !currentPotentialMatchRef.current) {
      console.log('🚫 Action blocked: already in progress or no current match');
      return;
    }
    
    if (action === 'lotus' && (!userDataRef.current?.numOfLotus || userDataRef.current.numOfLotus <= 0)) {
      showDivineLotusModal();
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
        case 'lotus':
          await lotusLike(userId); // Backend function name stays the same
          break;
        case 'like':
          await likeMatch(userId);
          break;
      }
      
      console.log(`✅ ${action} action completed successfully for user: ${userId}`);
      
      console.log('🔄 Checking if need to prefetch more matches...');
      await loadNextMatch();
      
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

  // Divine lotus modal functions
  const showDivineLotusModal = () => {
    setShowLotusModal(true);
    
    Animated.parallel([
      Animated.timing(lotusModalOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(lotusModalScale, {
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

  const closeDivineLotusModal = () => {
    Animated.parallel([
      Animated.timing(lotusModalOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(lotusModalScale, {
        toValue: 0.8,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowLotusModal(false);
      divineGlow.setValue(0);
    });
  };

  const navigateToLotusShop = () => {
    closeDivineLotusModal();
    setTimeout(() => {
      router.push('/user/LotusScreen'); // Component name stays same for now
    }, 500);
  };

  const navigateToSubscription = () => {
    closeDivineLotusModal();
    setTimeout(() => {
      router.push('/user/FullCircleSubscription');
    }, 500);
  };

  // Photos loaded handler
  const handlePhotosLoaded = () => {
    setPhotosLoaded(true);
    Animated.timing(buttonsOpacity, {
      toValue: 1,
      duration: 400,
      delay: 300,
      useNativeDriver: true,
    }).start();
    
    if (userData?.numOfLotus && userData.numOfLotus > 0) {
      Animated.loop(
        Animated.timing(lotusButtonGlow, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        { iterations: -1, resetBeforeIteration: true }
      ).start();
    }
  };

  // Reset animations when match changes
  useEffect(() => {
    if (currentPotentialMatch && !actionInProgress && showContent) {
      contentOpacity.setValue(1);
      buttonsOpacity.setValue(0);
      overlayOpacity.setValue(0);
      overlayScale.setValue(0.8);
      lotusButtonGlow.setValue(0);
      setPhotosLoaded(false);
    }
  }, [currentPotentialMatch?.userId, showContent]);

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

  // 🆕 Pull-to-refresh handler
    const onRefresh = async () => {
      if (isRefreshing) return;
      
      console.log('🔄 User pulled to refresh - resetting matches...');
      setIsRefreshing(true);
      
      try {
        // Reset the matching system to pick up new users
        await resetMatching();
        
        // Give it a moment to initialize with fresh data
        setTimeout(() => {
          setIsRefreshing(false);
          console.log('✅ Refresh complete');
        }, 2000);
      } catch (error) {
        console.error('❌ Error during refresh:', error);
        setIsRefreshing(false);
      }
    };

  // 🔄 UPDATED: Use new state for no more matches condition
  if (matchingState.noMoreMatches) {
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

        <View style={styles.noLikesContainer}>
          {hasFullCircleSubscription ? (
            // FullCircle Subscriber Experience
            <>
              <View style={[styles.cosmicSymbol, { backgroundColor: '#B8860B' + '15' }]}>
                <CustomIcon name="infinite" size={32} color="#B8860B" />
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
                  <CustomIcon name="person" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={[styles.primaryButtonText, fonts.spiritualBodyFont]}>
                    Enhance Your Profile
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
            </>
          ) : (
            // Non-Subscriber Experience
            <>
              <View style={[styles.cosmicSymbol, { backgroundColor: '#B8860B' + '15' }]}>
                <CustomIcon name="infinite" size={32} color="#B8860B" />
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
                  <CustomIcon name="infinite" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={[styles.primaryButtonText, fonts.spiritualBodyFont]}>
                    Expand Your Circle
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
          <CustomIcon name="options" size={22} color="#B8860B" />
        </TouchableOpacity>

        {/* Centered OuroborosLoader */}
        <View style={styles.centeredLoadingContainer}>
          <OuroborosLoader
            variant="pulse"              
            size={120}                   
            duration={800}              
            loop={true}                  
            fillColor="#F5E6D3"          
            strokeColor="#7B6B5C"        
            strokeWidth={1}
          />
        </View>
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
        <CustomIcon name="options" size={22} color="#B8860B" />
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
          // refreshControl={
          //   <RefreshControl
          //     refreshing={isRefreshing}
          //     onRefresh={onRefresh}
          //     tintColor="#B8860B"
          //     colors={["#B8860B"]}
          //     progressBackgroundColor={colors.card} 
          //     titleColor="#B8860B"
          //   />
          // }
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

      {/* Only show buttons when content is ready - Android safe version */}
      {photosLoaded && !actionInProgress && showContent && currentPotentialMatch ? (
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
            <CustomIcon name="close" size={20} color="#8B7355" />
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
            <CustomIcon name="heart" size={20} color="#B8860B" />
          </TouchableOpacity>

          <View style={styles.lotusButtonContainer}>
            {userData?.numOfLotus && userData.numOfLotus > 0 ? (
              <Animated.View 
                style={[
                  styles.lotusGlow,
                  {
                    shadowOpacity: lotusButtonGlow.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.3, 0.8, 0.3]
                    }),
                  }
                ]}
              />
            ) : null}
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
            >
              <CustomIcon name="lotus2" size={36}/>
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : null}

      {/* Divine Lotus Modal - updated with CustomIcon */}
      {showLotusModal && (
        <Animated.View 
          style={[
            styles.divineModalOverlay,
            { opacity: lotusModalOpacity }
          ]}
        >
          <Animated.View 
            style={[
              styles.divineModal,
              {
                transform: [{ scale: lotusModalScale }],
                backgroundColor: colors.card,
                borderColor: '#CD853F',
                shadowColor: '#CD853F',
              }
            ]}
          >
            {/* Close button in top left */}
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
                <CustomIcon name="lotus2" size={36}/>
              </View>
              
              <Text style={[
                styles.divineTitle, 
                fonts.spiritualTitleFont, 
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
                  <CustomIcon name="lotus2" size={20} style={styles.buttonIcon} />
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
          </Animated.View>
        </Animated.View>
      )}

      {/* Clean Action Feedback Overlay - Android safe */}
      {lastAction ? (
        <Animated.View 
          style={[
            styles.actionOverlay,
            {
              opacity: overlayOpacity,
              transform: [{ scale: overlayScale }]
            }
          ]}
        >
          <View
            style={[
              styles.actionIconContainer,
              {
                backgroundColor: lastAction === 'like' ? '#B8860B' : 
                                 lastAction === 'pass' ? '#8B7355' : '#FF1493', // Deep pink for lotus
                shadowColor: lastAction === 'like' ? '#B8860B' : 
                            lastAction === 'pass' ? '#8B7355' : '#FF1493', // Deep pink for lotus
              }
            ]}
          >
            <CustomIcon 
              name={lastAction === 'like' ? 'heart' : 
                   lastAction === 'pass' ? 'close' : 'lotus2'} 
              size={36} 
              color="#FFFFFF" 
            />
          </View>
        </Animated.View>
      ) : null}

      {/* Daily Limit Modal - updated with CustomIcon */}
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
                <CustomIcon name="heart" size={36} color="#B8860B" />
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
    minHeight: screenHeight * 0.8,
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
  
  lottieContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  lottieAnimation: {
    width: 100,
    height: 100,
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
  
  lotusButtonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 125 : 105,
    left: '50%',
    marginLeft: -28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  lotusGlow: {
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
    centeredLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing["4xl"],
  },
});

export default ConnectScreen;