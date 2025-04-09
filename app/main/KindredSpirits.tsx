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
      if (!userData?.detailedLikesReceived) {
        setIsLoading(true);
      } else {
        // Process each user: Convert each photo storage path into a download URL.
        const processedLikes = await Promise.all(
          userData.detailedLikesReceived.map(async (user: any) => {
            if (user.photos && user.photos.length > 0) {
              const urls = await Promise.all(
                user.photos.map(async (photoPath: string) => {
                  const url = await getImageUrl(photoPath);
                  return url;
                })
              );
              return { ...user, photos: urls.filter((url) => url !== null) };
            }
            return user;
          })
        );
        setLikedByUsers(processedLikes);
        setIsLoading(false);
      }
    };

    loadLikedUsersWithPhotos();
  }, [userData.detailedLikesReceived, getImageUrl]);

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
        <Text style={styles.noLikesText}>No likes yet--we're here to help</Text>
        <Text style={styles.noLikesText}>
          We can get you seen by more daters, sooner.
        </Text>
      </View>
    );
  }

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
        {likedByUsers.slice(1).map((user, index) => (
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
    marginTop: 25,
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
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  noLikesText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
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
