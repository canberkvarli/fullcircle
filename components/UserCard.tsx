import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { BlurView } from "expo-blur";
import Icon from "react-native-vector-icons/FontAwesome";

const { width, height } = Dimensions.get("window");

interface UserCardProps {
  user: any;
  isBlurred?: boolean;
  style?: object;
  variant?: "default" | "radiant";
  onPress?: () => void;
  showDetails?: boolean;
  onHeartPress?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  isBlurred = false,
  style,
  variant = "default",
  onPress,
  showDetails = false,
  onHeartPress,
}) => {
  const firstPhoto = user.photos?.[0];

  // Helper function to render user details
  const renderDetails = () => {
    const details = [
      { title: "Gender", content: user.gender || "N/A" },
      { title: "Height", content: user.height || "N/A" },
      {
        title: "Ethnicities",
        content: user.ethnicities?.join(", ") || "N/A",
      },
      {
        title: "Sexual Orientation",
        content: user.sexualOrientation?.join(", ") || "N/A",
      },
      {
        title: "Date Preferences",
        content: user.matchPreferences.datePreferences?.join(", ") || "N/A",
      },
      {
        title: "Children Preference",
        content: user.childrenPreference || "N/A",
      },
      { title: "Education Degree", content: user.educationDegree || "N/A" },
    ];

    return details.map((detail, index) => (
      <View key={index} style={styles.detailRow}>
        <Text style={styles.detailTitle}>{detail.title}:</Text>
        <Text style={styles.detailContent}>{detail.content}</Text>
      </View>
    ));
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <View
        style={[
          styles.card,
          variant === "radiant" && styles.radiantCard,
          style,
        ]}
      >
        <View style={styles.imageContainer}>
          {firstPhoto ? (
            <Image source={{ uri: firstPhoto }} style={styles.photo} />
          ) : (
            <View style={styles.photoFallback}>
              <Text>No Photo Available</Text>
            </View>
          )}
          {isBlurred ? (
            <BlurView intensity={150} tint="default" style={styles.blurOverlay}>
              <Text style={styles.userNameBlurred}>
                {user.firstName || "Unknown"}
              </Text>
            </BlurView>
          ) : (
            <Text style={styles.userName}>{user.firstName || "Unknown"}</Text>
          )}
          {onHeartPress && (
            <TouchableOpacity style={styles.heartIcon} onPress={onHeartPress}>
              <Icon name="heart" size={30} color="red" />
            </TouchableOpacity>
          )}
        </View>
        {showDetails && (
          <View style={styles.detailsContainer}>{renderDetails()}</View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 3,
    alignItems: "center",
    width: width * 0.8, // 80% of the screen width
    height: height * 0.66, // 66% of the screen height
  },
  radiantCard: {
    backgroundColor: "#EDE9E3",
    borderColor: "#D8BFAA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  photoFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  imageContainer: {
    width: "100%",
    height: "70%",
    borderRadius: 10,
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  blurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginTop: 10,
  },
  userNameBlurred: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    top: 112,
    left: 0,
    right: 0,
    textAlign: "center",
    opacity: 0.3,
  },
  detailsContainer: {
    marginTop: 10,
    width: "100%",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  detailContent: {
    fontSize: 14,
    color: "#777",
  },
  heartIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});

export default UserCard;
