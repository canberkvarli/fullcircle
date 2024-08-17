import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const UserCard = ({ user, isBlurred }: { user: any; isBlurred: boolean }) => {
  return (
    <View style={[styles.card, isBlurred && styles.blurred]}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: user.photos[0] }} style={styles.photo} />
        {isBlurred && (
          <View style={styles.blurOverlay}>
            <Text style={styles.userName}>Name Hidden</Text>
          </View>
        )}
      </View>
      {!isBlurred && <Text style={styles.userName}>{user.firstName}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
    alignItems: "center",
    width: 150,
    height: 200,
  },
  imageContainer: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    overflow: "hidden",
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
    backgroundColor: "rgba(255, 255, 255, 0.7)", // White overlay with opacity
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  blurred: {
    overflow: "hidden",
  },
});

export default UserCard;
