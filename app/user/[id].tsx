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

    return () => unsub;
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

  // Get connection intent for theming
  const connectionIntent = currentUser.matchPreferences?.connectionIntent || "romantic";

  // Get intent colors for dynamic theming
  const getIntentColors = (intent: string) => {
    if (intent === "romantic") {
      return {
        primary: '#E11D48',
        secondary: '#FFF1F2',
        accent: '#BE123C',
        tertiary: '#FB7185',
      };
    } else if (intent === "friendship") {
      return {
        primary: '#059669',
        secondary: '#ECFDF5',
        accent: '#047857',
        tertiary: '#34D399',
      };
    } else if (intent === "both") {
      return {
        primary: '#7C3AED',
        secondary: '#F5F3FF',
        accent: '#6D28D9',
        tertiary: '#A78BFA',
      };
    } else {
      return {
        primary: '#8B4513',
        secondary: '#FDF6E3',
        accent: '#D2691E',
        tertiary: '#CD853F',
      };
    }
  };

  const intentColors = getIntentColors(connectionIntent);

  // Create meaningful details based on current user data - UPDATED
  const getDetailsForPhoto = (index: number) => {
    const detailOptions = [
      {
        title: "About Me",
        content: `${currentUser.age || calculateAge(currentUser)} • ${getLocation(currentUser)}`,
        icon: "person-outline",
        color: intentColors.primary,
        type: 'text'
      },
      {
        title: "Spiritual Practices",
        content: currentUser?.spiritualProfile?.practices || [],
        icon: "leaf-outline",
        color: '#059669',
        type: 'pills',
        emptyText: 'Spiritual practices not shared'
      },
      {
        title: "Connection Style",
        content: currentUser.matchPreferences?.connectionStyles || [],
        icon: "sparkles-outline",
        color: intentColors.tertiary,
        type: 'pills',
        emptyText: 'Connection style not set'
      },
      {
        title: "Healing Modalities",
        content: currentUser?.spiritualProfile?.healingModalities || [],
        icon: "medical-outline",
        color: '#0891B2',
        type: 'pills',
        emptyText: 'Healing path not shared'
      },
      {
        title: "Physical Details",
        content: currentUser.height ? `${currentUser.height} ft tall` : 'Height not shared',
        icon: "resize-outline",
        color: '#6B7280',
        type: 'text'
      },
      {
        title: "Spiritual Draws",
        content: currentUser?.spiritualProfile?.draws || [],
        icon: "heart-outline",
        color: '#DC2626',
        type: 'pills',
        emptyText: 'Spiritual draws not shared'
      },
      {
        title: "Gender Identity",
        content: currentUser.gender || [],
        icon: "person-outline",
        color: '#6366F1',
        type: 'pills',
        emptyText: 'Gender not shared'
      }
    ];

    return detailOptions[index % detailOptions.length] || detailOptions[0];
  };

  // Helper function to calculate age if not provided
  const calculateAge = (user: UserDataType) => {
    if (user.birthyear) {
      return new Date().getFullYear() - parseInt(user.birthyear);
    }
    if (user.age) return user.age;
    return 'Age unknown';
  };

  // Helper function to get array for pills display - UPDATED
  const getPillsArray = (detail: any) => {
    if (detail.type === 'pills' && Array.isArray(detail.content)) {
      // Filter out any non-string values and empty strings
      return detail.content.filter((item: unknown) => 
        typeof item === 'string' && item.trim().length > 0
      );
    }
    return [];
  };

  // Get connection type display for the user
  const getConnectionTypeDisplay = (intent: string) => {
    switch (intent) {
      case "romantic":
        return "Looking for romantic connections";
      case "friendship":
        return "Looking for meaningful friendships";
      case "both":
        return "Open to all types of connections";
      default:
        return "Open to connections";
    }
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
      useNativeDriver: true,
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

  const styles = createStyles(colors, fonts, intentColors);

  return (
    <SafeAreaView style={[styles.wrapper, { backgroundColor: colors.background }]}>
      {loadingPhotos && (
        <View style={[styles.loaderOverlay, { backgroundColor: colors.background }]}>
          <View style={[styles.loadingMandala, { backgroundColor: intentColors.secondary }]}>
            <Ionicons 
              name={connectionIntent === "romantic" ? "heart" 
                   : connectionIntent === "friendship" ? "people" 
                   : connectionIntent === "both" ? "infinite"
                   : "sparkles"} 
              size={40} 
              color={intentColors.primary} 
            />
          </View>
          <Text style={[styles.loadingText, fonts.spiritualBodyFont, { color: intentColors.primary }]}>
            Loading Beautiful Soul...
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
                <Ionicons name="chevron-back" size={24} color={intentColors.primary} />
                <Text style={[styles.backText, fonts.spiritualBodyFont, { color: intentColors.primary }]}>
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
            <Animated.View style={{ opacity: leftNameOpacity }}>
              <Text
                style={[
                  styles.topName, 
                  fonts.spiritualTitleFont,
                  { color: colors.textDark }
                ]}
              >
                {currentUser.firstName}, {calculateAge(currentUser)}
              </Text>
              
              {/* Connection Intent Badge */}
              <View style={[styles.connectionBadge, { 
                backgroundColor: intentColors.secondary,
                borderColor: intentColors.primary + '40'
              }]}>
                <Ionicons 
                  name={connectionIntent === "romantic" ? "heart" 
                       : connectionIntent === "friendship" ? "people" 
                       : connectionIntent === "both" ? "infinite"
                       : "sparkles"} 
                  size={14} 
                  color={intentColors.primary} 
                />
                <Text style={[styles.connectionBadgeText, { color: intentColors.primary }]}>
                  {connectionIntent === "romantic" ? "Dating" 
                   : connectionIntent === "friendship" ? "Friendship"
                   : connectionIntent === "both" ? "Both"
                   : "Open"}
                </Text>
              </View>
            </Animated.View>

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
                      <View style={[styles.iconContainer, { backgroundColor: detail.color + '15' }]}>
                        <Ionicons name={detail.icon as any} size={18} color={detail.color} />
                      </View>
                      <Text style={[styles.detailTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                        {detail.title}
                      </Text>
                    </View>
                    
                    {/* Enhanced content display */}
                    {detail.type === 'pills' && pillsArray.length > 0 ? (
                      <View style={styles.pillsContainer}>
                        {pillsArray.slice(0, 4).map((item: string, pillIndex: number) => (
                          <View key={pillIndex} style={[styles.pill, { 
                            backgroundColor: detail.color + '15',
                            borderColor: detail.color + '30'
                          }]}>
                            <Text style={[styles.pillText, fonts.spiritualBodyFont, { color: detail.color }]}>
                              {item}
                            </Text>
                          </View>
                        ))}
                        {pillsArray.length > 4 && (
                          <View style={[styles.pill, { 
                            backgroundColor: detail.color + '10',
                            borderColor: detail.color + '20'
                          }]}>
                            <Text style={[styles.pillText, fonts.spiritualBodyFont, { color: detail.color }]}>
                              +{pillsArray.length - 4} more
                            </Text>
                          </View>
                        )}
                      </View>
                    ) : (
                      <Text style={[styles.detailText, fonts.spiritualBodyFont, { 
                        color: (detail.type === 'pills' && pillsArray.length === 0) 
                          ? colors.textMuted 
                          : colors.textLight,
                        fontStyle: (detail.type === 'pills' && pillsArray.length === 0) 
                          ? 'italic' 
                          : 'normal'
                      }]}>
                        {detail.type === 'pills' && pillsArray.length === 0 
                          ? detail.emptyText 
                          : detail.content}
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
              <Ionicons name="heart" size={20} color={intentColors.primary} />
            </TouchableOpacity>
          </View>
        </>
      )}

      <SlidingTabBar translateY={tabTranslateY} />
    </SafeAreaView>
  );
};

const createStyles = (colors: any, fonts: any, intentColors: any) => StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  headerOverlay: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '40',
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.select({ 
      ios: 10,
      android: 8
    }),
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingRight: Spacing.md,
    zIndex: 1001,
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
    zIndex: 999,
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
    marginLeft: Spacing.sm,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginLeft: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  connectionBadgeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginLeft: Spacing.xs,
  },
  photoCard: {
    marginBottom: Spacing.lg,
  },
  photo: {
    width: Dimensions.get("window").width - (Spacing.lg * 2),
    height: 400,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
  },
  
  // Floating Action Buttons (like Connect screen)
  floatingButtons: {
    position: 'absolute',
    bottom: TAB_BAR_HEIGHT + 20,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 100,
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
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  detailTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  detailText: {
    fontSize: Typography.sizes.base,
    lineHeight: Typography.sizes.base * 1.4,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  pillText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
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