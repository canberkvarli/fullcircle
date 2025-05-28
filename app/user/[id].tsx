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
} from "react-native";
import { useRouter, useLocalSearchParams, Link } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";
import LottieView from "lottie-react-native";
import { useUserContext, UserDataType } from "@/context/UserContext";
import leavesAnimation from "../../assets/animations/leaves.json";
import blackCircleAnimation from "../../assets/animations/black-circle.json";
import SlidingTabBar from "@/components/SlidingTabBar";

const HEADER_HEIGHT = 120;
const HEADER_FADE_START = 80;
const HEADER_FADE_END = 120;
const TAB_BAR_HEIGHT = 80;

const UserShow: React.FC = () => {
  const router = useRouter();
  const { user: userParam, source } = useLocalSearchParams();
  const isFromKindredSpirits = source === "KindredSpirits";
  const isFromRadiantSouls = source === "RadiantSouls";
  const initialUser: UserDataType = JSON.parse(userParam as string);
  const {
    getImageUrl,
    orbLike,
    fetchRadiantSouls,
    userData,
    likeMatch,
    subscribeToReceivedLikes,
  } = useUserContext();

  const [souls, setSouls] = useState<UserDataType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<UserDataType>(initialUser);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [showOrbAnim, setShowOrbAnim] = useState(false);
  const [orbAnimFinished, setOrbAnimFinished] = useState(false);
  const lastLoadedPhotosFor = useRef<string | null>(null);
  const didSubscribe = useRef(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const tabTranslateY = useRef(new Animated.Value(TAB_BAR_HEIGHT)).current;
  const lastY = useRef(0);

  useEffect(() => {
    if (!isFromKindredSpirits || !userData.userId) return;

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

    return () => unsub();
  }, [isFromKindredSpirits, userData.userId]);

  useEffect(() => {
    if (!isFromKindredSpirits || !userData.userId) return;

    // track the last snapshot payload so we don’t re-render
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
  }, [isFromKindredSpirits, userData.userId]);

  useEffect(() => {
    if (isFromRadiantSouls) {
      fetchRadiantSouls().then((list) => {
        setSouls(list);
        const idx = list.findIndex((u) => u.userId === initialUser.userId);
        setCurrentIndex(idx >= 0 ? idx : 0);
      });
    }
  }, []);

  useEffect(() => {
    const id = currentUser.userId;
    if (!id || id === lastLoadedPhotosFor.current) {
      // same user → don’t reload
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

  useEffect(() => {
    if (orbAnimFinished && !loadingPhotos) {
      setShowOrbAnim(false);
      setOrbAnimFinished(false);
      const next = currentIndex + 1;
      if (souls[next]) {
        setCurrentIndex(next);
        setCurrentUser(souls[next]);
      } else {
        router.back();
      }
    }
  }, [orbAnimFinished, loadingPhotos]);

  const handleOrbLike = async () => {
    if ((userData.numOfOrbs ?? 0) < 1) return;
    setShowOrbAnim(true);
    setOrbAnimFinished(false);
    try {
      await orbLike(currentUser.userId);
    } catch {
      setShowOrbAnim(false);
    }
  };

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

  const details = [
    { title: "Gender", content: userData?.gender?.join(", ") ?? "N/A" },
    { title: "Height", content: `${userData?.height ?? "N/A"}` },
    {
      title: "Ethnicities",
      content: userData?.ethnicities?.join(", ") ?? "N/A",
    },
    {
      title: "Sexual Orientation",
      content: userData?.sexualOrientation?.join(", ") ?? "N/A",
    },
    {
      title: "Date Preferences",
      content: userData?.matchPreferences?.datePreferences?.join(", ") ?? "N/A",
    },
    {
      title: "Children Preferences",
      content: userData?.matchPreferences?.childrenPreference ?? "N/A",
    },
    { title: "Education", content: userData?.educationDegree ?? "N/A" },
  ];

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
      useNativeDriver: false,
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

  return (
    <SafeAreaView style={styles.wrapper}>
      {showOrbAnim && (
        <View style={styles.animOverlay}>
          <LottieView
            source={leavesAnimation}
            autoPlay
            loop={false}
            onAnimationFinish={() => setOrbAnimFinished(true)}
            style={styles.animation}
          />
        </View>
      )}

      {loadingPhotos && !showOrbAnim && (
        <View style={styles.loaderOverlay}>
          <LottieView
            source={blackCircleAnimation}
            autoPlay
            loop
            style={styles.loaderAnimation}
          />
        </View>
      )}

      {!loadingPhotos && !showOrbAnim && (
        <>
          <View style={styles.headerOverlay}>
            <View style={styles.headerContainer}>
              <View style={styles.backSection}>
                <Link href=".." asChild>
                  <TouchableOpacity
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    style={styles.backInner}
                  >
                    <Icon name="chevron-left" size={20} color="#7E7972" />
                    <Text style={styles.backText}>Back</Text>
                  </TouchableOpacity>
                </Link>
              </View>

              <Animated.Text
                style={[
                  styles.nameCenter,
                  { opacity: headerOpacity },
                  !isFromRadiantSouls && {
                    position: "absolute",
                    left: 0,
                    right: 0,
                    textAlign: "center",
                  },
                ]}
              >
                {currentUser.firstName}
              </Animated.Text>

              {isFromRadiantSouls && (
                <TouchableOpacity style={styles.orbsButton}>
                  <Icon name="pagelines" size={22} color="#D8BFAA" />
                  <Text style={styles.orbsButtonText}>
                    Orbs ({userData.numOfOrbs ?? 0})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

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
              style={[styles.topName, { opacity: leftNameOpacity }]}
            >
              {currentUser.firstName}
            </Animated.Text>

            {photoUrls.map((uri, i) => (
              <View key={i} style={styles.photoCard}>
                <Image source={{ uri }} style={styles.photo} />

                {/* Radiant‐souls orb like */}
                {isFromRadiantSouls && (
                  <View style={styles.overlayIcons}>
                    <TouchableOpacity
                      disabled={(userData.numOfOrbs ?? 0) < 1}
                      onPress={handleOrbLike}
                      style={styles.orbActionBtn}
                    >
                      <Icon
                        name="pagelines"
                        size={28}
                        color={
                          (userData.numOfOrbs ?? 0) > 0 ? "#D8BFAA" : "#ccc"
                        }
                      />
                    </TouchableOpacity>
                  </View>
                )}

                {/* KindredSpirits heart like */}
                {isFromKindredSpirits && (
                  <View style={styles.overlayIcons}>
                    <TouchableOpacity
                      onPress={handleHeartPress}
                      style={styles.heartActionBtn}
                    >
                      <Icon name="heart" size={28} color="#E0245E" />
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.detailCard}>
                  {/* Radiant‐souls orb detail */}
                  {isFromRadiantSouls && (
                    <View style={styles.overlayIconsDetail}>
                      <TouchableOpacity
                        disabled={(userData.numOfOrbs ?? 0) < 1}
                        onPress={handleOrbLike}
                        style={styles.orbDetailBtn}
                      >
                        <Icon
                          name="pagelines"
                          size={28}
                          color={
                            (userData.numOfOrbs ?? 0) > 0 ? "#D8BFAA" : "#ccc"
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* KindredSpirits heart detail */}
                  {isFromKindredSpirits && (
                    <View style={styles.overlayIconsDetail}>
                      <TouchableOpacity
                        onPress={handleHeartPress}
                        style={styles.heartDetailBtn}
                      >
                        <Icon name="heart" size={28} color="#E0245E" />
                      </TouchableOpacity>
                    </View>
                  )}

                  <Text style={styles.detailTitle}>{details[i].title}:</Text>
                  <Text style={styles.detailText}>{details[i].content}</Text>
                </View>
              </View>
            ))}
          </Animated.ScrollView>
        </>
      )}

      <SlidingTabBar translateY={tabTranslateY} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#EDE9E3",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    backgroundColor: "#EDE9E3",
    paddingHorizontal: 16,
    paddingTop: 45,
    zIndex: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  backSection: {
    flexDirection: "column",
    alignItems: "flex-start",
  },

  backInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    marginLeft: 6,
    fontSize: 16,
    color: "#7E7972",
  },

  backNameText: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "bold",
    color: "#7E7972",
  },
  nameCenter: {
    position: "relative",
    left: 25,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#7E7972",
  },
  scrollView: {
    flex: 1,
    marginTop: HEADER_HEIGHT,
  },
  container: {
    paddingHorizontal: 16,
  },
  topName: {
    marginLeft: 16,
    marginBottom: 8,
    fontSize: 32,
    fontWeight: "bold",
    color: "#7E7972",
  },
  photoCard: {
    marginBottom: 14,
  },
  photo: {
    width: Dimensions.get("window").width - 32,
    height: 400,
    borderRadius: 20,
    marginBottom: 12,
  },
  overlayIcons: {
    width: "100%",
    alignItems: "flex-end",
    marginTop: -48,
    paddingRight: 16,
    zIndex: 10,
  },
  orbActionBtn: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 24,
    padding: 12,
    left: 8,
    bottom: 26,
  },
  heartActionBtn: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 24,
    padding: 12,
    left: 8,
    bottom: 26,
  },
  detailCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    position: "relative",
  },
  overlayIconsDetail: {
    position: "absolute",
    bottom: 16,
    right: 16,
    zIndex: 10,
  },
  orbDetailBtn: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 24,
    padding: 12,
  },
  heartDetailBtn: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 24,
    padding: 12,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  detailText: {
    fontSize: 16,
    color: "gray",
    marginTop: 8,
  },
  orbsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  orbsButtonText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "500",
    color: "#7E7972",
  },
  animOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: TAB_BAR_HEIGHT,
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 20,
    backgroundColor: "transparent",
    pointerEvents: "none",
    paddingBottom: 20,
  },
  animation: {
    width: Dimensions.get("window").width * 1.3,
    height: Dimensions.get("window").height * 0.6,
    transform: [{ scale: 1.2 }],
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#EDE9E3",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  loaderAnimation: {
    width: 120,
    height: 120,
  },
});

export default UserShow;
