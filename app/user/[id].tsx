import React, { useEffect, useState, useRef } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  Animated,
  unstable_batchedUpdates,
  useColorScheme,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams, Link } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useUserContext, UserDataType } from "@/context/UserContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import SlidingTabBar from "@/components/SlidingTabBar";

const HEADER_HEIGHT = 100; // Reduced from 120
const HEADER_FADE_START = 80;
const HEADER_FADE_END = 120;
const TAB_BAR_HEIGHT = 90;

const UserShow: React.FC = () => {
  const router = useRouter();
  const { user: userParam } = useLocalSearchParams();
  const initialUser: UserDataType = JSON.parse(userParam as string);
  
  const {
    getImageUrl,
    userData,
    likeMatch,
    dislikeMatch,
    subscribeToReceivedLikes,
  } = useUserContext();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  const [souls, setSouls] = useState<UserDataType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<UserDataType>(initialUser);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const lastLoadedPhotosFor = useRef<string | null>(null);
  const didSubscribe = useRef(false);

  // Use consistent animation drivers - all useNativeDriver: true
  const scrollY = useRef(new Animated.Value(0)).current;
  const tabTranslateY = useRef(new Animated.Value(TAB_BAR_HEIGHT)).current;
  const lastY = useRef(0);

  useEffect(() => {
    if (!userData.userId) return;

    const unsub = subscribeToReceivedLikes((users) => {
      // swallow the first callback so we don't overwrite our nav param
      if (!didSubscribe.current) {
        didSubscribe.current = true;
        return;
      }

      // on real updates (someone new un‑likes or likes),
      // batch and update souls/currentUser/index:
      unstable_batchedUpdates(() => {
        setSouls(users);
        if (users.length === 0) {
          router.back();
        } else {
          setCurrentIndex(0);
          setCurrentUser(users[0]);
        }
      });
    });

    return unsub;
  }, [userData.userId]);

  useEffect(() => {
    if (!userData.userId) return;

    // track the last snapshot payload so we don't re-render
    let lastSnapshot: string | null = null;

    const unsub = subscribeToReceivedLikes((users) => {
      // serialize the list of IDs so we can do a deep compare
      const key = users.map((u) => u.userId).join("|");
      if (key === lastSnapshot) {
        // identical payload → skip
        return;
      }
      lastSnapshot = key;

      // batch all three updates into one render
      unstable_batchedUpdates(() => {
        setSouls(users);

        if (users.length === 0) {
          // if nobody left, go back
          router.back();
        } else {
          // if this is the very first snapshot, position on initialUser
          const idx = users.findIndex((u) => u.userId === initialUser.userId);
          const nextIndex = idx >= 0 ? idx : 0;
          setCurrentIndex(nextIndex);
          setCurrentUser(users[nextIndex]);
        }
      });
    });

    return () => unsub();
  }, [userData.userId]);

  useEffect(() => {
    const id = currentUser.userId;
    if (!id || id === lastLoadedPhotosFor.current) {
      // same user → don't reload
      return;
    }
    lastLoadedPhotosFor.current = id;

    let active = true;
    setLoadingPhotos(true);

    (async () => {
      if (currentUser.photos?.length) {
        const urls = await Promise.all(
          currentUser.photos.map((p) => getImageUrl(p))
        );
        if (active) {
          setPhotoUrls(urls.filter((u): u is string => !!u));
        }
      }
      if (active) setLoadingPhotos(false);
    })();

    return () => {
      active = false;
    };
  }, [currentUser.userId]);

  const handleHeartPress = async () => {
    const likedId = currentUser.userId;
    const nextSouls = souls.filter((u) => u.userId !== likedId);

    if (nextSouls.length) {
      // show the next one right away
      setSouls(nextSouls);
      setCurrentIndex(0);
      setCurrentUser(nextSouls[0]);
    } else {
      router.back();
    }

    await likeMatch(likedId);
  };

  const handleDislikePress = async () => {
    const dislikedId = currentUser.userId;
    const nextSouls = souls.filter((u) => u.userId !== dislikedId);

    if (nextSouls.length) {
      // show the next one right away
      setSouls(nextSouls);
      setCurrentIndex(0);
      setCurrentUser(nextSouls[0]);
    } else {
      router.back();
    }
    
    // Call dislikeMatch to remove from backend
    await dislikeMatch(dislikedId);
  };

  // Helper function to get location string
  const getLocation = (user: UserDataType) => {
    if (user.location?.city && user.location?.region) {
      return `${user.location.city}, ${user.location.region}`;
    } else if (user.location?.city) {
      return user.location.city;
    } else if (user.regionName) {
      return user.regionName;
    } else if (user.location?.region) {
      return user.location.region;
    }
    return 'Location not shared';
  };

  // Create meaningful details based on current user data
  const getDetailsForPhoto = (index: number) => {
    const detailOptions = [
      {
        title: "Basic Info",
        content: `${currentUser.age || calculateAge(currentUser)} • ${getLocation(currentUser)}`,
        icon: "person"
      },
      {
        title: "Spiritual Practices",
        content: currentUser?.spiritualProfile?.practices?.length 
          ? currentUser.spiritualProfile.practices.slice(0, 3).join(", ")
          : 'Sacred practices not shared',
        icon: "sparkles"
      },
      {
        title: "Healing Modalities",
        content: currentUser?.spiritualProfile?.healingModalities?.length
          ? currentUser.spiritualProfile.healingModalities.slice(0, 3).join(", ")
          : 'Healing path not shared',
        icon: "heart"
      },
      {
        title: "Physical Details",
        content: currentUser.height ? `${currentUser.height} ft` : 'Height not shared',
        icon: "resize"
      },
      {
        title: "Sacred Connections",
        content: currentUser.matchPreferences?.ConnectionPreferences?.length
          ? currentUser.matchPreferences.ConnectionPreferences.join(", ")
          : 'Open to divine connections',
        icon: "heart-circle"
      },
      {
        title: "Spiritual Draws",
        content: currentUser?.spiritualProfile?.draws?.length
          ? currentUser.spiritualProfile.draws.slice(0, 3).join(", ")
          : 'Spiritual draws not shared',
        icon: "leaf"
      }
    ];

    return detailOptions[index] || detailOptions[0];
  };

  // Helper function to calculate age if not provided
  const calculateAge = (user: UserDataType) => {
    if (user.birthyear) {
      return new Date().getFullYear() - parseInt(user.birthyear);
    }
    if (user.age) return user.age;
    return 'Age unknown';
  };

  // Helper function to get array for pills display
  const getPillsArray = (detail: any) => {
    if (detail.title === "Spiritual Practices") {
      return currentUser.spiritualProfile?.practices || [];
    } else if (detail.title === "Healing Modalities") {
      return currentUser.spiritualProfile?.healingModalities || [];
    } else if (detail.title === "Spiritual Draws") {
      return currentUser.spiritualProfile?.draws || [];
    }
    return [];
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [HEADER_FADE_START, HEADER_FADE_END],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  
  const leftNameOpacity = scrollY.interpolate({
    inputRange: [HEADER_FADE_START, HEADER_FADE_END],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true, // Use native driver consistently
      listener: (e: any) => {
        const y = e.nativeEvent.contentOffset.y;
        const dy = y - lastY.current;
        if (dy > 5) {
          Animated.timing(tabTranslateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else if (dy < -5) {
          Animated.timing(tabTranslateY, {
            toValue: TAB_BAR_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
        lastY.current = y;
      },
    }
  );

  const styles = createStyles(colors, fonts);

  return (
    <SafeAreaView style={[styles.wrapper, { backgroundColor: colors.background }]}>
      {loadingPhotos && (
        <View style={[styles.loaderOverlay, { backgroundColor: colors.background }]}>
          <View style={[styles.loadingMandala, { backgroundColor: '#8B4513' + '10' }]}>
            <Ionicons name="heart" size={40} color="#8B4513" />
          </View>
          <Text style={[styles.loadingText, fonts.spiritualBodyFont, { color: '#8B4513' }]}>
            Loading Sacred Soul...
          </Text>
        </View>
      )}

      {!loadingPhotos && (
        <>
          <Animated.View style={[
            styles.headerOverlay, 
            { backgroundColor: colors.background }
          ]}>
            <View style={styles.headerContent}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Ionicons name="chevron-back" size={24} color="#8B4513" />
                <Text style={[styles.backText, fonts.spiritualBodyFont, { color: "#8B4513" }]}>
                  Back
                </Text>
              </TouchableOpacity>

              {/* Centered name that appears on scroll */}
              <Animated.View 
                style={[
                  styles.centerNameContainer,
                  { opacity: headerOpacity }
                ]}
              >
                <Text
                  style={[
                    styles.centerName,
                    fonts.spiritualTitleFont,
                    { color: colors.textDark }
                  ]}
                >
                  {currentUser.firstName}
                </Text>
              </Animated.View>
            </View>
          </Animated.View>

          <Animated.ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.container,
              { paddingBottom: TAB_BAR_HEIGHT + 20 },
            ]}
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            <Animated.Text
              style={[
                styles.topName, 
                fonts.spiritualTitleFont,
                { opacity: leftNameOpacity, color: colors.textDark }
              ]}
            >
              {currentUser.firstName}, {calculateAge(currentUser)}
            </Animated.Text>

            {photoUrls.map((uri, i) => {
              const detail = getDetailsForPhoto(i);
              const pillsArray = getPillsArray(detail);
              
              return (
                <View key={i} style={styles.photoCard}>
                  <Image source={{ uri }} style={styles.photo} />

                  <View style={[styles.detailCard, { 
                    backgroundColor: colors.card, 
                    borderColor: colors.border 
                  }]}>
                    <View style={styles.detailHeader}>
                      <Ionicons name={detail.icon as any} size={20} color="#8B4513" />
                      <Text style={[styles.detailTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                        {detail.title}
                      </Text>
                    </View>
                    
                    {/* Enhanced content display */}
                    {(detail.title === "Spiritual Practices" || 
                      detail.title === "Healing Modalities" || 
                      detail.title === "Spiritual Draws") && pillsArray.length > 0 ? (
                      <View style={styles.pillsContainer}>
                        {pillsArray.slice(0, 4).map((item: string, pillIndex: number) => (
                          <View key={pillIndex} style={[styles.pill, { 
                            backgroundColor: '#8B4513' + '20',
                            borderColor: '#8B4513' + '40'
                          }]}>
                            <Text style={[styles.pillText, fonts.spiritualBodyFont, { color: '#8B4513' }]}>
                              {item}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={[styles.detailText, fonts.spiritualBodyFont, { 
                        color: pillsArray.length === 0 && (detail.title === "Spiritual Practices" || 
                                                          detail.title === "Healing Modalities" || 
                                                          detail.title === "Spiritual Draws") 
                          ? colors.textLight 
                          : colors.textLight,
                        fontStyle: pillsArray.length === 0 && (detail.title === "Spiritual Practices" || 
                                                               detail.title === "Healing Modalities" || 
                                                               detail.title === "Spiritual Draws") 
                          ? 'italic' 
                          : 'normal'
                      }]}>
                        {detail.content}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </Animated.ScrollView>

          <View style={styles.floatingButtons}>
            {/* Dislike Button - Left */}
            <TouchableOpacity 
              style={[
                styles.floatingAction, 
                styles.leftAction,
                { backgroundColor: colors.card, borderColor: colors.border }
              ]}
              onPress={handleDislikePress}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color="#8B95A7" />
            </TouchableOpacity>

            {/* Like Button - Right */}
            <TouchableOpacity 
              style={[
                styles.floatingAction, 
                styles.rightAction,
                { backgroundColor: colors.card, borderColor: colors.border }
              ]}
              onPress={handleHeartPress}
              activeOpacity={0.8}
            >
              <Ionicons name="heart" size={20} color="#8B4513" />
            </TouchableOpacity>
          </View>
        </>
      )}

      <SlidingTabBar translateY={tabTranslateY} />
    </SafeAreaView>
  );
};

const createStyles = (colors: any, fonts: any) => StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  headerOverlay: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 1000, // Higher z-index to ensure it's on top
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '40',
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.select({ 
      ios: 10, // Reduced from 45
      android: 8 // Reduced from 35
    }),
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingRight: Spacing.md,
    zIndex: 1001, // Even higher z-index for the back button
  },
  backText: {
    marginLeft: 4,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },
  centerNameContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999, // Lower than back button
  },
  centerName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    marginTop: HEADER_HEIGHT,
  },
  container: {
    paddingHorizontal: Spacing.lg,
  },
  topName: {
    marginLeft: Spacing.sm, // Reduced margin
    marginBottom: Spacing.md,
    marginTop: Spacing.sm, // Added top margin
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
  },
  photoCard: {
    marginBottom: Spacing.lg,
  },
  photo: {
    width: Dimensions.get("window").width - (Spacing.lg * 2),
    height: 400,
    borderRadius: 16,
    marginBottom: Spacing.md,
  },
  
  // Floating Action Buttons (like Connect screen)
  floatingButtons: {
    position: 'absolute',
    bottom: TAB_BAR_HEIGHT + 20, // Above the sliding tab bar
    left: 0,
    right: 0,
    height: 80,
    zIndex: 100, // Lower than header
  },
  
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
    bottom: 20,
    left: Spacing.xl,
  },
  
  rightAction: {
    bottom: 20,
    right: Spacing.xl,
  },
  detailCard: {
    borderRadius: 12,
    padding: Spacing.xl,
    borderWidth: 1,
    position: "relative",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  detailTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginLeft: Spacing.sm,
  },
  detailText: {
    fontSize: Typography.sizes.base,
    lineHeight: Typography.sizes.base * 1.4,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000, // Highest z-index for loading overlay
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
    fontSize: Typography.sizes.lg,
    fontStyle: 'italic',
  },
});

export default UserShow;