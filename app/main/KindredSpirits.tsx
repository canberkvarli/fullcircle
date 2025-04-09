import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import UserCard from "@/components/UserCard";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

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

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.likesText}>Likes you</Text>
      <View style={styles.gridContainer}>
        {likedByUsers.map((user, index) => {
          const isFirstCard = index === 0;
          return (
            <View
              key={user.userId}
              style={[
                styles.userCardContainer,
                {
                  width:
                    likedByUsers.length === 1 ? screenWidth - 32 : undefined,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => handleCardPress(user, isFirstCard)}
              >
                <UserCard
                  user={user}
                  isBlurred={!userData?.fullCircleSubscription && index > 0}
                  style={styles.smallCard}
                />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    marginTop: 25,
    backgroundColor: "#f9f9f9",
  },
  likesText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "left",
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
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  userCardContainer: {
    flexBasis: "50%",
  },
  smallCard: {
    width: 180,
    height: 220,
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
});

export default KindredSpirits;
