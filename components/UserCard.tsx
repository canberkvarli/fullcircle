import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window"); // Get screen dimensions

interface UserCardProps {
  user: any;
  isBlurred?: boolean;
  style?: object;
  variant?: "default" | "radiant";
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  isBlurred = false,
  style,
  variant = "default",
}) => {
  const firstPhoto = user.photos?.[0];

  return (
    <View
      style={[styles.card, variant === "radiant" && styles.radiantCard, style]}
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
      </View>
    </View>
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
});

export default UserCard;
