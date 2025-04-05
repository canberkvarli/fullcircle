import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import InfoCard from "@/components/InfoCard";
import { useUserContext } from "@/context/UserContext";
import Icon from "react-native-vector-icons/FontAwesome";

const PotentialMatch = ({
  currentPotentialMatch,
  isMatched = false,
}: {
  currentPotentialMatch: any;
  isMatched?: boolean;
}) => {
  const { likeMatch, loadNextPotentialMatch } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);

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
      content: currentPotentialMatch?.ethnicities?.join(", "),
    },
    { title: "Height", content: currentPotentialMatch.height },
    {
      title: "Location",
      content: `${currentPotentialMatch?.location?.city}, ${currentPotentialMatch?.location?.country}`,
    },
    {
      title: "Sexual Orientation",
      content: currentPotentialMatch?.sexualOrientation?.join(", "),
    },
  ];

  // Calculate the step to evenly distribute info sections
  const infoStep = Math.ceil(
    infoSections?.length / currentPotentialMatch?.photos?.length
  );

  const handleLike = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await likeMatch(currentPotentialMatch.userId);
      loadNextPotentialMatch();
    } catch (error) {
      console.error("Error liking match: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.userName}>{currentPotentialMatch.firstName}</Text>
      <Text style={styles.age}> {currentPotentialMatch.age} </Text>
      {currentPotentialMatch?.photos?.map((photo: any, index: number) => (
        <View key={index} style={styles.photoContainer}>
          <Image source={{ uri: photo }} style={styles.photo} />
          {!isMatched && (
            <TouchableOpacity
              style={styles.heartIcon}
              onPress={handleLike}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color="black" />
              ) : (
                <Icon name="heart" size={40} color="black" />
              )}
            </TouchableOpacity>
          )}
          {/* Spread info evenly across photos */}
          {infoSections
            .slice(index * infoStep, (index + 1) * infoStep)
            .map((info, i) => (
              <InfoCard
                key={i}
                title={info.title}
                content={info.content}
                currentPotentialMatch={currentPotentialMatch}
                isMatched={isMatched}
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
  age: {
    fontSize: 24,
    color: "#888",
    paddingLeft: 30,
    bottom: 15,
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
