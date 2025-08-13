import React, { useState, useEffect, useRef } from "react";
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
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";
import PotentialMatch from "@/components/PotentialMatch";
import LotusScreen from "@/components/LotusScreen";
import { Colors, Typography, Spacing } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import OuroborosLoader from "@/components/ouroboros/OuroborosLoader";

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

  const scrollViewRef = useRef<ScrollView>(null);

  // 🆕 SIMPLIFIED: Only essential animations for smooth UX
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentScale = useRef(new Animated.Value(1)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(1)).current;
  const contentFadeIn = useRef(new Animated.Value(0)).current;
  
  // Modal animations
  const dailyLimitModalOpacity = useRef(new Animated.Value(0)).current;
  const dailyLimitModalScale = useRef(new Animated.Value(0.8)).current;
  const lotusModalOpacity = useRef(new Animated.Value(0)).current;
  const lotusModalScale = useRef(new Animated.Value(0.8)).current;

  const hasFullCircleSubscription = userData?.subscription?.isActive || false;
  const userDataRef = useRef(userData);
  const matchingStateRef = useRef(matchingState);

  // 🆕 NEW: Initialize content opacity to 1 to ensure content is visible
  useEffect(() => {
    contentOpacity.setValue(1);
    contentFadeIn.setValue(1);
  }, []);

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  useEffect(() => {
    matchingStateRef.current = matchingState;
  }, [matchingState]);



  // 🆕 ENHANCED: Improved loading state management with error handling
  useEffect(() => {
    // 🆕 FIXED: Proper loading state management
    const hasMatches = matchingStateRef.current.potentialMatches.length > 0;
    const isCurrentlyLoading = matchingStateRef.current.loadingBatch;
    const isInitialized = matchingStateRef.current.initialized;
    const noMoreAvailable = matchingStateRef.current.noMoreMatches;
    
    // Show loading when fetching or not initialized
    if (isCurrentlyLoading || !isInitialized) {
      setIsLoading(true);
      setShowContent(false);
      
      // Smooth loading entrance
      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Check if we have content to show
      if (hasMatches && !noMoreAvailable) {
        // Fade out loading and show content
        Animated.timing(loadingOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setIsLoading(false);
          setShowContent(true);
        });
      } else {
        // No matches available
        setIsLoading(false);
        setShowContent(false);
      }
    }
  }, [matchingState.loadingBatch, matchingState.initialized, matchingState.potentialMatches.length, matchingState.noMoreMatches]);

  // Reset animations when match changes
  useEffect(() => {
    if (currentPotentialMatch && !actionInProgress && showContent) {
      // 🆕 SIMPLIFIED: Only reset essential animation values
      contentOpacity.setValue(1);
      contentScale.setValue(1);
      buttonsOpacity.setValue(0);
      
      // Only reset if we actually have a new match (check by userId)
      const currentUserId = currentPotentialMatch.userId;
      if (currentUserId && currentUserId !== matchingState.currentIndex?.toString()) {
        setPhotosLoaded(false);
      }
    }
  }, [currentPotentialMatch?.userId, showContent, actionInProgress]);

  // 🆕 NEW: Ensure content is visible when showContent becomes true
  useEffect(() => {
    if (showContent) {
      contentOpacity.setValue(1);
      // Fade in content smoothly
      Animated.timing(contentFadeIn, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showContent]);

  // 🆕 ENHANCED: Action handler with better error handling and recovery
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
    
    // 🆕 SIMPLIFIED: Remove excessive transition animations
    // Just show a brief visual feedback, no complex transitions
    
    // 🆕 NEW: Simple visual feedback - subtle scale animation
    Animated.sequence([
      Animated.timing(contentScale, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(contentScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    const userId = currentPotentialMatch.userId;
    
    try {
      // Execute backend operation
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
      
      // Load next match
      await loadNextMatch();
      
    } catch (error: any) {
      console.error(`❌ ${action} action failed:`, error);
      
      if (error.message === "DAILY_LIMIT_REACHED") {
        resetActionState();
        showDailyLimitModalFunc();
        return;
      }
      
      // Even if the action fails, we should still advance to the next match
      // to prevent the user from getting stuck
      try {
        await loadNextMatch();
      } catch (loadError) {
        console.error('❌ Failed to load next match after action error:', loadError);
      }
      
      resetActionState();
      return;
    }

    // 🆕 SIMPLIFIED: Quick, smooth transition to next match
    // Reset scroll position
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    
    // Simple fade transition
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Brief pause
      setTimeout(() => {
        // Fade back in
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // Complete transition
          resetActionState();
          setPhotosLoaded(false);
        });
      }, 100);
    });
  };

  const resetActionState = () => {
    setActionInProgress(false);
    setLastAction(null);
    
    // 🆕 SIMPLIFIED: Only reset essential animation values
    contentOpacity.setValue(1);
    contentScale.setValue(1);
    buttonsOpacity.setValue(0);
    
    // 🆕 NEW: Reset photos loaded state to trigger button animation again
    setPhotosLoaded(false);
  };

  // Enhanced modal functions (keeping existing logic but with smoother animations)
  const showDivineLotusModal = () => {
    setShowLotusModal(true);
    
    Animated.parallel([
      Animated.timing(lotusModalOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(lotusModalScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDivineLotusModal = () => {
    Animated.parallel([
      Animated.timing(lotusModalOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(lotusModalScale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowLotusModal(false);
    });
  };

  const showDailyLimitModalFunc = () => {
    setShowDailyLimitModal(true);
    
    Animated.parallel([
      Animated.timing(dailyLimitModalOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(dailyLimitModalScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDailyLimitModal = () => {
    Animated.parallel([
      Animated.timing(dailyLimitModalOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(dailyLimitModalScale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowDailyLimitModal(false);
    });
  };

  const handlePhotosLoaded = () => {
    setPhotosLoaded(true);
    
    // 🆕 SIMPLIFIED: Smooth button entrance
    Animated.timing(buttonsOpacity, {
      toValue: 1,
      duration: 300,
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
  // 🆕 FIXED: Added fallback condition to prevent infinite loading
  if ((matchingState.noMoreMatches && matchingState.initialized && matchingState.potentialMatches.length === 0) ||
      (matchingState.initialized && matchingState.potentialMatches.length === 0 && !matchingState.loadingBatch)) {
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
            <OuroborosLoader
              variant="breathe"
              duration={7000}
              size={102}
              loop={true}
              fillColor="#F5E6D3"
              strokeColor="#B8860B"
            />
          
          <Text  style={[styles.noLikesTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
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

  // Enhanced loading screen
  if (isLoading || (!showContent && !matchingState.noMoreMatches)) {
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

        <Animated.View style={[styles.centeredLoadingContainer, { opacity: loadingOpacity }]}>
          <OuroborosLoader
            variant="pulse"              
            size={120}                   
            duration={1000}              
            loop={true}                  
            fillColor="#F5E6D3"          
            strokeColor="#7B6B5C"        
            strokeWidth={1}
          />
          

        </Animated.View>
        

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
            opacity: contentFadeIn,
            transform: [{ scale: contentScale }]
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
          
          {(() => {
            return showContent && currentPotentialMatch ? (
              <Animated.View style={{ opacity: contentOpacity }}>
                <PotentialMatch
                  currentPotentialMatch={currentPotentialMatch}
                  isMatched={false}
                  onPhotosLoaded={handlePhotosLoaded}
                />
              </Animated.View>
            ) : (
              <View style={styles.contentPlaceholder}>
                <Text style={{ color: colors.textLight, fontSize: 14, marginBottom: 20, textAlign: 'center' }}>
                  {!showContent ? 'Loading content...' : 'No current match'}
                </Text>
                <OuroborosLoader
                  variant="pulse"
                  size={60}
                  duration={800}
                  loop={true}
                  fillColor="#F5E6D3"
                  strokeColor="#7B6B5C"
                  strokeWidth={1}
                />
              </View>
            );
          })()}
        </ScrollView>
      </Animated.View>

      {/* Enhanced action buttons with smooth animations */}
      {(() => {
        return photosLoaded && !actionInProgress && showContent && currentPotentialMatch ? (
          <Animated.View style={[styles.buttonsContainer, { opacity: buttonsOpacity }]}>
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.leftAction,
                { backgroundColor: colors.card, borderColor: colors.border }
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
                { backgroundColor: colors.card, borderColor: colors.border }
              ]}
              onPress={() => handleAction('like')}
              activeOpacity={0.8}
              disabled={actionInProgress}
            >
              <CustomIcon name="heart" size={20} color="#B8860B" />
            </TouchableOpacity>

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
          </Animated.View>
        ) : null;
      })()}

      {/* 🆕 SIMPLIFIED: Removed complex overlay animations for smoother UX */}
      
      {/* Simple Transition Loading Overlay */}
      <Animated.View 
        style={[
          styles.transitionOverlay,
          { 
            opacity: actionInProgress ? contentOpacity.interpolate({
              inputRange: [0, 0.3],
              outputRange: [0, 1],
              extrapolate: 'clamp'
            }) : 0,
            backgroundColor: colors.background
          }
        ]}
        pointerEvents="none"
      >
        <Animated.View
          style={{
            transform: [{
              scale: actionInProgress ? contentScale.interpolate({
                inputRange: [0.8, 1],
                outputRange: [0.8, 1],
                extrapolate: 'clamp'
              }) : 1
            }]
          }}
        >
          <OuroborosLoader
            variant="pulse"
            size={60}
            duration={800}
            loop={true}
            fillColor="#F5E6D3"
            strokeColor="#B8860B"
            strokeWidth={2}
          />
        </Animated.View>
      </Animated.View>

      {/* Divine Lotus Modal */}
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
  
  // Transition Loading Overlay
  transitionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1500,
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
    fontWeight: Typography.weights.medium,
  },
});

export default ConnectScreen;