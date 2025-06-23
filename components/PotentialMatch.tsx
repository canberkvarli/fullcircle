import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from "react-native";
import InfoCard from "@/components/InfoCard";
import { useUserContext } from "@/context/UserContext";
import Icon from "react-native-vector-icons/FontAwesome";

const { width: screenWidth } = Dimensions.get("window");
const IMAGE_MARGIN = 32;
const MAX_PHOTO_SIZE = screenWidth - IMAGE_MARGIN;

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
      content: currentPotentialMatch.location?.city
        ? `${currentPotentialMatch.location.city}, ${currentPotentialMatch.location.country}`
        : "Location not provided",
    },
  ];

  const infoStep = Math.ceil(infoSections.length / photoUrls.length);

  return (
    <View style={styles.container}>
      {!isMatched && (
        <Text style={styles.userName}>
          {currentPotentialMatch.firstName}, {currentPotentialMatch.age}
        </Text>
      )}

      {photoUrls.map((url, i) => (
        <View key={i} style={styles.photoContainer}>
          <ImageBackground
            source={{ uri: url }}
            style={styles.photoBackground}
            imageStyle={styles.photo}
          >
            {!isMatched && (
              <TouchableOpacity
                onPress={() =>
                  !disableInteractions && onLike(currentPotentialMatch.userId)
                }
                disabled={disableInteractions}
                style={styles.heartWrapper}
              >
                <Icon
                  name="heart"
                  size={40}
                  color={disableInteractions ? "#ccc" : "red"}
                />
              </TouchableOpacity>
            )}
          </ImageBackground>

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
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  photoContainer: {
    position: "relative",
    marginBottom: 20,
    alignItems: "center",
    width: MAX_PHOTO_SIZE,
  },
  photoBackground: {
    width: MAX_PHOTO_SIZE,
    height: MAX_PHOTO_SIZE,
    overflow: "hidden",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginVertical: 10,
  },
  photo: {
    borderRadius: 30,
  },
  heartWrapper: {
    padding: 12,
  },
});

export default PotentialMatch;
