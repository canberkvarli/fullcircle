import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

const UserCard = ({ user, isBlurred }: { user: any; isBlurred: boolean }) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: user.photos[0] }} style={styles.photo} />
        {isBlurred ? (
          <BlurView intensity={100} tint="dark" style={styles.blurOverlay}>
            <Text style={styles.userNameBlurred}>{user.firstName}</Text>
          </BlurView>
        ) : (
          <Text style={styles.userName}>{user.firstName}</Text>
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
    margin: 5,
    borderColor: "#ddd",
    elevation: 3,
    alignItems: "center",
    width: 170,
    height: 240,
  },
  imageContainer: {
    width: "100%",
    height: 180,
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
