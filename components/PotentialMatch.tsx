import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import InfoCard from "@/components/InfoCard";
import { useUserContext } from "@/context/UserContext";
import Icon from "react-native-vector-icons/FontAwesome";

type Props = {
  currentPotentialMatch: any;
  isMatched?: boolean;
  onLike: (userId: string) => void;
  disableInteractions: boolean;
  onPhotosLoaded?: () => void;
};

const PotentialMatch: React.FC<Props> = ({
  currentPotentialMatch,
  isMatched = false,
  onLike,
  disableInteractions,
  onPhotosLoaded,
}) => {
  const { getImageUrl } = useUserContext();
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isPhotoLoading, setIsPhotoLoading] = useState(true);

  // once photos load, notify parent and render UI
  useEffect(() => {
    const fetchAll = async () => {
      if (currentPotentialMatch.photos) {
        const urls = await Promise.all(
          currentPotentialMatch.photos.map((path: string) => getImageUrl(path))
        );
        setPhotoUrls(urls.filter((u): u is string => !!u));
      }
      setIsPhotoLoading(false);
      onPhotosLoaded?.();
    };
    fetchAll();
  }, [currentPotentialMatch, getImageUrl, onPhotosLoaded]);

  // hide until photos done
  if (isPhotoLoading) return null;

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
      content: currentPotentialMatch.ethnicities?.join(", "),
    },
    { title: "Height", content: currentPotentialMatch.height },
    {
      title: "Location",
      content: `${currentPotentialMatch.location.city}, ${currentPotentialMatch.location.country}`,
    },
    {
      title: "Sexual Orientation",
      content: currentPotentialMatch.sexualOrientation?.join(", "),
    },
  ];

  const infoStep = Math.ceil(infoSections.length / photoUrls.length);

  return (
    <View style={styles.container}>
      <Text style={styles.userName}>
        {currentPotentialMatch.firstName}, {currentPotentialMatch.age}
      </Text>

      {photoUrls.map((url, i) => (
        <View key={i} style={styles.photoContainer}>
          <Image source={{ uri: url }} style={styles.photo} />

          {!isMatched && (
            <TouchableOpacity
              style={styles.heartIcon}
              onPress={() =>
                !disableInteractions && onLike(currentPotentialMatch.userId)
              }
              disabled={disableInteractions}
            >
              <Icon
                name="heart"
                size={40}
                color={disableInteractions ? "#ccc" : "red"}
              />
            </TouchableOpacity>
          )}

          {infoSections
            .slice(i * infoStep, (i + 1) * infoStep)
            .map((info, idx) => (
              <InfoCard
                key={idx}
                title={info.title}
                content={info.content}
                currentPotentialMatch={currentPotentialMatch}
                isMatched={isMatched}
                onLike={onLike}
                disableInteractions={disableInteractions}
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
    marginBottom: 10,
    paddingLeft: 30,
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
