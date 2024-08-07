import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import InfoCard from "@/components/InfoCard";

const PotentialMatch = ({
  match,
  onLike,
  onDislike,
}: {
  match: {
    firstName: string;
    lastName: string;
    birthyear: string;
    photos: string[];
    childrenPreference: string;
    educationDegree: string;
  };
  onLike: () => void;
  onDislike: () => void;
}) => {
  const infoSections = [
    { title: "Children Preference", content: match.childrenPreference },
    { title: "Education Level", content: match.educationDegree },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.userName}>{match.firstName}</Text>
      {match.photos.map((photo, index) => (
        <View key={index}>
          <Image source={{ uri: photo }} style={styles.photo} />
          {index < infoSections.length && (
            <InfoCard
              title={infoSections[index].title}
              content={infoSections[index].content}
              onLike={onLike}
              onDislike={onDislike}
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
