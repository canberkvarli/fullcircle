import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const PotentialMatch = ({
  match,
}: {
  match: {
    firstName: string;
    lastName: string;
    birthyear: string;
    photos: string[];
    childrenPreference: string;
    educationDegree: string;
  };
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.userName}>{match.firstName}</Text>
      {match.photos.map((photo, index) => (
        <View key={index} style={styles.photoContainer}>
          <Image source={{ uri: photo }} style={styles.photo} />
          {index > 0 && (
            <View style={styles.heartIconContainer}>
              <Icon
                name="heart"
                size={30}
                color="black"
                style={styles.heartIcon}
              />
            </View>
          )}
        </View>
      ))}
      {/* Additional user info sprinkled in between photos */}
      <Text
        style={styles.infoText}
      >{`Children Preference: ${match.childrenPreference}`}</Text>
      <Text
        style={styles.infoText}
      >{`Education Level: ${match.educationDegree}`}</Text>
      {/* Add more user info as needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
  },
  photoContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  photo: {
    width: "100%",
    height: 400,
    borderRadius: 5,
  },
  photoText: {
    position: "absolute",
  },
  heartIconContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  heartIcon: {
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 15,
    padding: 5,
  },
  infoText: {
    fontSize: 18,
    marginVertical: 5,
    textAlign: "center",
  },
});

export default PotentialMatch;
