import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import UserCard from "@/components/UserCard";
import { useUserContext } from "@/context/UserContext";
import potentialMatches from "@/data/potentialMatches";
import { Link } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

const KindredSpirits: React.FC = () => {
  const { userData } = useUserContext();
  const [likedByUsers, setLikedByUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLikedByUsers = async () => {
      if (userData.userId) {
        try {
          const likesReceived = Array.isArray(userData.likesReceived)
            ? userData.likesReceived
            : [];
          const likedUsers = potentialMatches.filter((user) =>
            likesReceived.includes(user.userId)
          );
          setLikedByUsers(likedUsers);
        } catch (error) {
          console.error("Failed to fetch likedBy users:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchLikedByUsers();
  }, [userData]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (likedByUsers.length === 0) {
    return (
      <View style={styles.noLikesContainer}>
        <Text style={styles.noLikesText}>No likes yet--we're here to help</Text>
        <Text style={styles.noLikesText}>
          We can get you seen by more daters, sooner.
        </Text>
        {/* Add buttons for boosting profile or upgrading */}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.likesText}>Likes you</Text>
      <View style={styles.gridContainer}>
        {likedByUsers.map((user, index) => (
          <View
            key={user.userId}
            style={[
              styles.userCardContainer,
              {
                width: likedByUsers.length === 1 ? screenWidth - 32 : undefined,
              },
            ]}
          >
            <Link
              href={{
                pathname: `/user/${user.userId}` as any,
                params: { userId: user.userId },
              }}
            >
              <UserCard
                user={user}
                isBlurred={index > 0 && !userData.fullCircleSubscription}
              />
            </Link>
          </View>
        ))}
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
  noLikesContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  likesText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "left",
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
  },
  userCardContainer: {
    flexBasis: "48%",
  },
});

export default KindredSpirits;
