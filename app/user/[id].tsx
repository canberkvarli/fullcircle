import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  SafeAreaView,
  Animated,
} from "react-native";
import { useRouter, useLocalSearchParams, Link } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";
import LottieView from "lottie-react-native";
import { useUserContext, UserDataType } from "@/context/UserContext";
import leavesAnimation from "../../assets/animations/leaves.json";
import SlidingTabBar from "@/components/SlidingTabBar";

const HEADER_HEIGHT = 120;
const HEADER_FADE_START = 80;
const HEADER_FADE_END = 120;
const TAB_BAR_HEIGHT = 80;

const UserShow: React.FC = () => {
  const router = useRouter();
  const { user: userParam, isFromRadiantSouls } = useLocalSearchParams();
  const initialUser: UserDataType = JSON.parse(userParam as string);
  const { getImageUrl, orbLike, fetchRadiantSouls, userData } =
    useUserContext();

  const [souls, setSouls] = useState<UserDataType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<UserDataType>(initialUser);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [showOrbAnim, setShowOrbAnim] = useState(false);
  const [orbAnimFinished, setOrbAnimFinished] = useState(false);

  // raw scrollY
  const scrollY = useRef(new Animated.Value(0)).current;
  // tab bar translateY (0 = visible, TAB_BAR_HEIGHT = hidden)
  const tabTranslateY = useRef(new Animated.Value(TAB_BAR_HEIGHT)).current;
  // to detect scroll direction
  const lastY = useRef(0);

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
    let active = true;
    (async () => {
      setLoadingPhotos(true);
      if (currentUser.photos?.length) {
        const urls = await Promise.all(
          currentUser.photos.map((p) => getImageUrl(p))
        );
        if (active) setPhotoUrls(urls.filter((u): u is string => !!u));
      }
      setLoadingPhotos(false);
    })();
    return () => {
      active = false;
    };
  }, [currentUser]);

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

  // onScroll handler to track direction & animate tab bar
  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (e: any) => {
        const y = e.nativeEvent.contentOffset.y;
        const dy = y - lastY.current;

        if (dy > 5) {
          // user scrolling down → show bar
          Animated.timing(tabTranslateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else if (dy < -5) {
          // user scrolling up → hide bar
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

      {/* Fixed header */}
      <View style={styles.headerOverlay}>
        <View style={styles.headerContainer}>
          {/* TODO FIX THE BACK Button not working properly */}
          <Link href="/main/RadiantSouls" asChild>
            <TouchableOpacity
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <View style={styles.backInner}>
                <Icon name="chevron-left" size={20} color="#7E7972" />
                <Text style={styles.backText}>Back</Text>
              </View>
            </TouchableOpacity>
          </Link>
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

      {/* Scrollable content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.container,
          { paddingBottom: TAB_BAR_HEIGHT + 20 },
        ]}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <Animated.Text style={[styles.topName, { opacity: leftNameOpacity }]}>
          {currentUser.firstName}
        </Animated.Text>

        {loadingPhotos ? (
          <ActivityIndicator size="large" color="#D8BFAA" />
        ) : (
          photoUrls.map((uri, i) => (
            <View key={i} style={styles.photoCard}>
              <Image source={{ uri }} style={styles.photo} />

              <View style={styles.overlayIcons}>
                <TouchableOpacity
                  disabled={(userData.numOfOrbs ?? 0) < 1}
                  onPress={handleOrbLike}
                  style={styles.orbActionBtn}
                >
                  <Icon
                    name="pagelines"
                    size={28}
                    color={(userData.numOfOrbs ?? 0) > 0 ? "#D8BFAA" : "#ccc"}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.detailCard}>
                <View style={styles.overlayIconsDetail}>
                  <TouchableOpacity
                    disabled={(userData.numOfOrbs ?? 0) < 1}
                    onPress={handleOrbLike}
                    style={styles.orbDetailBtn}
                  >
                    <Icon
                      name="pagelines"
                      size={28}
                      color={(userData.numOfOrbs ?? 0) > 0 ? "#D8BFAA" : "#ccc"}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.detailTitle}>{details[i].title}:</Text>
                <Text style={styles.detailText}>{details[i].content}</Text>
              </View>
            </View>
          ))
        )}
      </Animated.ScrollView>

      {/* Sliding, hide/show tab bar */}
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
    paddingTop: 50,
    zIndex: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontSize: 22,
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
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "transparent",
    pointerEvents: "none",
    paddingBottom: 20,
  },
  animation: {
    width: Dimensions.get("window").width * 1.3,
    height: Dimensions.get("window").height * 0.6,
    transform: [{ scale: 1.2 }],
  },
});

export default UserShow;
