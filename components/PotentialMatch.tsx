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

  // Consolidate info for spreading evenly across photos
  const infoSections = [
    {
      title: "Children Preference",
      content: currentPotentialMatch.childrenPreference,
    },
    {
      title: "Education Level",
      content: currentPotentialMatch.educationDegree,
    },
    {
      title: "Ethnicities",
      content: currentPotentialMatch.ethnicities.join(", "),
    },
    { title: "Height", content: currentPotentialMatch.height },
    {
      title: "Location",
      content: `${currentPotentialMatch.location.city}, ${currentPotentialMatch.location.country}`,
    },
    {
      title: "Sexual Orientation",
      content: currentPotentialMatch.sexualOrientation.join(", "),
    },
  ];

  // Calculate the step to evenly distribute info sections
  const infoStep = Math.ceil(
    infoSections.length / currentPotentialMatch.photos.length
  );

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
            <Icon name="heart" size={40} color="black" />
          </TouchableOpacity>
          {/* Spread info evenly across photos */}
          {infoSections
            .slice(index * infoStep, (index + 1) * infoStep)
            .map((info, i) => (
              <InfoCard
                key={i}
                title={info.title}
                content={info.content}
                currentPotentialMatch={currentPotentialMatch}
              />
            ))}
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
    marginBottom: 20,
  },
  photo: {
    width: 400,
    height: 400,
    borderRadius: 30,
    marginVertical: 10,
  },
  heartIcon: {
    position: "absolute",
    bottom: 180,
    right: 50,
    zIndex: 10,
  },
});

export default PotentialMatch;
