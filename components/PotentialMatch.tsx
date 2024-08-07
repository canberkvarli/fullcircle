import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import InfoCard from "@/components/InfoCard";
import { useUserContext } from "@/context/UserContext";

// TODO: For now we are using faker to fill the data of a match.
// Later use the fetchUserData to populate with real data.
const PotentialMatch = ({
  currentMatch,
}: {
  currentMatch: {
    firstName: string;
    lastName: string;
    birthyear: string;
    photos: string[];
    childrenPreference: string;
    educationDegree: string;
  };
}) => {
  const infoSections = [
    { title: "Children Preference", content: currentMatch.childrenPreference },
    { title: "Education Level", content: currentMatch.educationDegree },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.userName}>{currentMatch.firstName}</Text>
      {currentMatch.photos.map((photo, index) => (
        <View key={index}>
          <Image source={{ uri: photo }} style={styles.photo} />
          {index < infoSections.length && (
            <InfoCard
              title={infoSections[index].title}
              content={infoSections[index].content}
              currentMatch={currentMatch}
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
  photo: {
    width: 400,
    height: 400,
    borderRadius: 30,
    marginVertical: 10,
  },
});

export default PotentialMatch;
