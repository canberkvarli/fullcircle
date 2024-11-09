import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
  TouchableOpacity,
} from "react-native";
import UserCard from "@/components/UserCard";
import { useUserContext } from "@/context/UserContext";
import potentialMatches from "@/data/potentialMatches";
import { useRouter } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

const KindredSpirits: React.FC = () => {
  const { userData } = useUserContext();
  const [likedByUsers, setLikedByUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false); // Track modal visibility
  const [selectedUser, setSelectedUser] = useState<any | null>(null); // Track selected user for modal
  const router = useRouter();

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

  const handleCardPress = (user: any, isFirstCard: boolean) => {
    if (!userData.fullCircleSubscription || isFirstCard) {
      router.push({
        pathname: `/user/${user.userId}` as any,
        params: { userId: user.userId },
      });
    } else {
      setSelectedUser(user);
      setIsModalVisible(true);
    }
  };

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
                  isBlurred={index > 0 && !!userData.fullCircleSubscription}
                />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Modal for users without fullCircleSubscription */}
      {isModalVisible && selectedUser && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)} // Close modal on background press
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Please upgrade to view {selectedUser.firstName}'s profile.
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={styles.modalButton}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: 300,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    fontSize: 16,
    color: "#007bff",
  },
});

export default KindredSpirits;
