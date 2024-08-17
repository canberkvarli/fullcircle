import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useUserContext } from "@/context/UserContext";
import potentialMatches, { PotentialMatchType } from "@/data/potentialMatches"; // Adjust path as necessary
import { SafeAreaView } from "react-native-safe-area-context";

const KindredSpirits: React.FC = () => {
  const { userData } = useUserContext();
  const [likedByUsers, setLikedByUsers] = useState<PotentialMatchType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLikedByUsers = async () => {
      if (userData.userId) {
        try {
          // Simulate fetching the user data from Firestore
          const likesReceived = Array.isArray(userData.likesReceived)
            ? userData.likesReceived
            : [];
          console.log("Likes received:", likesReceived);
          // Find potential matches that match the likedByUsers
          const likedUsers = potentialMatches.filter((user) =>
            likesReceived.includes(user.userId)
          );
          setLikedByUsers(likedUsers);
          console.log("Liked by users:", likedUsers);
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
      <View>
        <Text>No likes yet--we're here to help</Text>
        <Text>We can get you seen by more daters, sooner.</Text>
        <Button
          title="Boost your profile"
          onPress={() => console.log("Boost clicked")}
        />
        <Button
          title="Upgrade to FullCircle"
          onPress={() => console.log("Upgrade clicked")}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text>Likes you</Text>
        {likedByUsers.map((user, index) => (
          <TouchableOpacity
            key={user.userId}
            onPress={() => console.log(`View ${user.userId}'s profile`)}
            style={{
              opacity: index === 0 || userData.fullCircleSubscription ? 1 : 0.5,
            }}
          >
            <View style={styles.profileContainer}>
              <Text style={styles.userName}>
                {user.firstName} {user.lastName}
              </Text>
              {user.photos.map((photo, i) => (
                <Image key={i} source={{ uri: photo }} style={styles.photo} />
              ))}
            </View>
          </TouchableOpacity>
        ))}
        {userData.fullCircleSubscription === false &&
          likedByUsers.length > 1 && (
            <View>
              <Text>More users liked you...</Text>
              {/* Display blurred out profiles here */}
            </View>
          )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 25,
  },
  profileContainer: {
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
});

export default KindredSpirits;
