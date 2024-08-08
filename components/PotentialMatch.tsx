import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import InfoCard from "@/components/InfoCard";
import { useUserContext } from "@/context/UserContext";
import Icon from "react-native-vector-icons/FontAwesome";

const PotentialMatch = ({
  currentPotentialMatch,
}: {
  currentPotentialMatch: any;
}) => {
  const { likeMatch, loadNextPotentialMatch } = useUserContext();
  const infoSections = [
    {
      title: "Children Preference",
      content: currentPotentialMatch.childrenPreference,
    },
    {
      title: "Education Level",
      content: currentPotentialMatch.educationDegree,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.userName}>{currentPotentialMatch.firstName}</Text>
      {currentPotentialMatch.photos.map((photo: any, index: number) => (
        <View key={index} style={styles.photoContainer}>
          <Image source={{ uri: photo }} style={styles.photo} />
          <TouchableOpacity
            style={styles.heartIcon}
            onPress={() => {
              likeMatch(currentPotentialMatch.userId).then(() => {
                loadNextPotentialMatch();
              });
            }}
          >
            <Icon name="heart" size={40} color="red" />
          </TouchableOpacity>
          {index < infoSections.length && (
            <InfoCard
              title={infoSections[index].title}
              content={infoSections[index].content}
              currentPotentialMatch={currentPotentialMatch}
            />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    paddingLeft: 30,
    textAlign: "left",
    zIndex: 1,
  },
  photoContainer: {
    position: "relative",
  },
  photo: {
    width: 400,
    height: 400,
    borderRadius: 30,
    marginVertical: 10,
  },
  heartIcon: {
    alignItems: "flex-end",
    bottom: 70,
    right: 35,
  },
});

export default PotentialMatch;
