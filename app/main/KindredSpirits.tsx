import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import UserCard from "@/components/UserCard";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";
import { Link } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

const KindredSpirits: React.FC = () => {
  const { userData, fetchDetailedLikes } = useUserContext();
  const [likedByUsers, setLikedByUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!userData?.detailedLikesReceived) {
      setIsLoading(true);
    } else {
      setLikedByUsers(userData.detailedLikesReceived);
      setIsLoading(false);
    }
  }, [userData.detailedLikesReceived]);

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

  const handleCardPress = (user: any, isFirstCard: boolean) => {
    if (!userData.fullCircleSubscription || !isFirstCard) {
      console.log("Full Circle Subscription not purchased or first card.");
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
              <Link
                href={{
                  pathname: "/user/UserShow" as any,
                  params: {
                    user: JSON.stringify(user),
                    source: "KindredSpirits",
                  },
                }}
                style={{ width: "100%", height: "100%" }}
                onPress={() => handleCardPress(user, isFirstCard)}
              >
                <UserCard
                  user={user}
                  isBlurred={index > 0 && !userData.fullCircleSubscription}
                  style={styles.smallCard}
                />
              </Link>
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
  },
  userCardContainer: {
    flexBasis: "48%",
  },
  smallCard: {
    width: 150,
    height: 220,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
});

export default KindredSpirits;
