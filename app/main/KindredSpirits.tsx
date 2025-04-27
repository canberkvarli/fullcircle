import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import UserCard from "@/components/UserCard";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const KindredSpirits: React.FC = () => {
  const { userData, getImageUrl } = useUserContext();
  const [likedByUsers, setLikedByUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadLikedUsersWithPhotos = async () => {
      // If detailedLikesReceived is undefined or empty, show "no likes" immediately
      if (
        !userData?.detailedLikesReceived ||
        userData.detailedLikesReceived.length === 0
      ) {
        console.log("No likes received");
        setLikedByUsers([]);
        setIsLoading(false);
        return;
      }

      const processedLikes = await Promise.all(
        userData.detailedLikesReceived.map(async (user: any) => {
          if (user.photos && user.photos.length > 0) {
            const urls = await Promise.all(
              user.photos.map((photoPath: string) => getImageUrl(photoPath))
            );
            return { ...user, photos: urls.filter((url) => url !== null) };
          }
          return user;
        })
      );

      console.log("Processed Likes:", processedLikes);
      setLikedByUsers(processedLikes);
      setIsLoading(false);
    };

    loadLikedUsersWithPhotos();
  }, [userData?.detailedLikesReceived, getImageUrl]);

  const handleCardPress = (user: any, isFirstCard: boolean) => {
    if (userData?.fullCircleSubscription || isFirstCard) {
      router.navigate({
        pathname: "/user/UserShow" as any,
        params: { user: JSON.stringify(user), source: "isFromKindredSpirits" },
      });
    } else {
      router.navigate({
        pathname: "/user/FullCircleSubscription" as any,
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7E7972" />
      </View>
    );
  }

  if (likedByUsers.length === 0) {
    return (
      <View style={styles.noLikesContainer}>
        <Text style={styles.noLikesTitle}>No one’s vibing with you… yet.</Text>
        <Text style={styles.noLikesSubtitle}>
          Radiate more love by upgrading to FullCircle for unlimited visibility,
          or send a one-time Boost to soar to the top of the feed.
        </Text>

        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() =>
            router.navigate({ pathname: "/user/FullCircleSubscription" })
          }
        >
          <Text style={styles.upgradeButtonText}>Upgrade to FullCircle ✨</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boostButton}
          onPress={() =>
            router.navigate({ pathname: "/user/FullCircleSubscription" })
          }
        >
          <Text style={styles.boostButtonText}>Send a Boost ❤️‍🔥</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render grid of likes
  const firstUser = likedByUsers[0];

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.likesText}>Likes you</Text>

      <TouchableOpacity onPress={() => handleCardPress(firstUser, true)}>
        <UserCard
          user={firstUser}
          variant="default"
          isBlurred={false}
          style={styles.largeCard}
        />
      </TouchableOpacity>

      <View style={styles.gridContainer}>
        {likedByUsers.slice(1).map((user) => (
          <View key={user.userId} style={styles.userCardContainer}>
            <TouchableOpacity onPress={() => handleCardPress(user, false)}>
              <UserCard
                user={user}
                variant="default"
                isBlurred={!userData.fullCircleSubscription}
                style={styles.smallCard}
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#EDE9E3",
    padding: 16,
    paddingBottom: 20,
  },
  likesText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "left",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  noLikesContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDE9E3",
  },
  noLikesTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    color: "#3A3A3A",
  },
  noLikesSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    color: "#5C5C5C",
  },
  upgradeButton: {
    backgroundColor: "#7E7972",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginBottom: 12,
  },
  upgradeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  boostButton: {
    borderColor: "#7E7972",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
  },
  boostButtonText: {
    color: "#7E7972",
    fontSize: 16,
    fontWeight: "600",
  },
  largeCard: {
    width: screenWidth - 32,
    height: screenHeight * 0.52,
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  userCardContainer: {
    flexBasis: "48%",
    marginBottom: 16,
  },
  smallCard: {
    width: 180,
    height: 220,
  },
});

export default KindredSpirits;
