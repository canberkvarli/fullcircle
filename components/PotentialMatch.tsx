import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  useColorScheme,
} from "react-native";
import InfoCard from "@/components/InfoCard";
import { useUserContext, UserDataType } from "@/context/UserContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

const { width: screenWidth } = Dimensions.get("window");
const IMAGE_MARGIN = Spacing.xl;
const MAX_PHOTO_SIZE = screenWidth - IMAGE_MARGIN;

type Props = {
  currentPotentialMatch: UserDataType;
  isMatched?: boolean;
  onPhotosLoaded?: () => void;
};

// Helper function to calculate age
const calculateAge = (user: UserDataType) => {
  if (user.birthyear) {
    return new Date().getFullYear() - parseInt(user.birthyear);
  }
  if (user.age) return user.age;
  return null;
};

// Helper function to get location string
const getLocation = (user: UserDataType) => {
  if (user.location?.city && user.location?.region) {
    return `${user.location.city}, ${user.location.region}`;
  } else if (user.location?.city) {
    return user.location.city;
  } else if (user.regionName) {
    return user.regionName;
  } else if (user.location?.region) {
    return user.location.region;
  }
  return null;
};

// Generate info cards data for a user
const generateInfoCards = (user: UserDataType) => {
  const cards = [];

  // Basic Info Card
  const age = calculateAge(user);
  const location = getLocation(user);
  const basicInfo = [age && `${age} years old`, location].filter(Boolean).join(" • ");
  
  if (basicInfo) {
    cards.push({
      title: "About",
      content: basicInfo,
      icon: "person-circle",
      pillsData: [],
    });
  }

  // Spiritual Practices
  if (user.spiritualProfile?.practices && user.spiritualProfile.practices.length > 0) {
    cards.push({
      title: "Spiritual Practices",
      content: user.spiritualProfile.practices.slice(0, 3).join(", "),
      icon: "sparkles",
      pillsData: user.spiritualProfile.practices,
    });
  }

  // Healing Modalities
  if (user.spiritualProfile?.healingModalities && user.spiritualProfile.healingModalities.length > 0) {
    cards.push({
      title: "Healing Modalities",
      content: user.spiritualProfile.healingModalities.slice(0, 3).join(", "),
      icon: "heart",
      pillsData: user.spiritualProfile.healingModalities,
    });
  }

  // Spiritual Draws
  if (user.spiritualProfile?.draws && user.spiritualProfile.draws.length > 0) {
    cards.push({
      title: "Spiritual Draws",
      content: user.spiritualProfile.draws.slice(0, 3).join(", "),
      icon: "leaf",
      pillsData: user.spiritualProfile.draws,
    });
  }

  // Physical Details
  if (user.height) {
    cards.push({
      title: "Physical",
      content: `${user.height} ft tall`,
      icon: "resize",
      pillsData: [],
    });
  }

  // Connection Preferences
  if (user.matchPreferences?.ConnectionPreferences && user.matchPreferences.ConnectionPreferences.length > 0) {
    cards.push({
      title: "Looking For",
      content: user.matchPreferences.ConnectionPreferences.join(", "),
      icon: "heart-circle",
      pillsData: user.matchPreferences.ConnectionPreferences,
    });
  }

  // Gender Identity
  if (user.gender && user.gender?.length > 0) {
    cards.push({
      title: "Identity",
      content: user.gender.join(", "),
      icon: "person",
      pillsData: user.gender,
    });
  }

  return cards;
};

const PotentialMatch: React.FC<Props> = ({
  currentPotentialMatch,
  isMatched = false,
  onPhotosLoaded,
}) => {
  const { getImageUrl } = useUserContext();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  
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

  const infoCards = generateInfoCards(currentPotentialMatch);
  const age = calculateAge(currentPotentialMatch);
  
  const styles = createStyles(colors, fonts);

  return (
    <View style={styles.container}>
      {/* User Name Header */}
      {!isMatched && (
        <View style={styles.headerContainer}>
          <Text style={styles.userName}>
            {currentPotentialMatch.firstName}
            {age && `, ${age}`}
          </Text>
          <View style={styles.headerDivider} />
        </View>
      )}

      {/* Photos and Info Cards */}
      {photoUrls.map((url, photoIndex) => {
        // Get the info card for this photo (cycling through available cards)
        const cardIndex = photoIndex % infoCards.length;
        const currentCard = infoCards[cardIndex];

        return (
          <View key={photoIndex} style={styles.photoSection}>
            {/* Clean Photo Display */}
            <View style={styles.photoContainer}>
              <ImageBackground
                source={{ uri: url }}
                style={styles.photoBackground}
                imageStyle={styles.photo}
              >
                {/* Subtle gradient overlay for depth */}
                <View style={styles.photoOverlay} />
              </ImageBackground>
            </View>

            {/* Info Card below photo */}
            {currentCard && (
              <InfoCard
                title={currentCard.title}
                content={currentCard.content}
                icon={currentCard.icon}
                pillsData={currentCard.pillsData}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const createStyles = (colors: any, fonts: any) => StyleSheet.create({
  container: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
  
  headerContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
    width: "100%",
  },
  
  userName: {
    ...fonts.spiritualTitleFont,
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: colors.textDark,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  
  headerDivider: {
    width: 60,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: BorderRadius.full,
  },
  
  photoSection: {
    marginBottom: Spacing.xl,
    alignItems: "center",
    width: "100%",
  },
  
  photoContainer: {
    position: "relative",
    marginBottom: Spacing.lg,
    alignItems: "center",
    width: MAX_PHOTO_SIZE,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  
  photoBackground: {
    width: MAX_PHOTO_SIZE,
    height: MAX_PHOTO_SIZE * 1.2, // Slightly taller for better proportions
    overflow: "hidden",
  },
  
  photo: {
    borderRadius: BorderRadius.xl,
  },
  
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)', // Very subtle overlay for depth
    borderRadius: BorderRadius.xl,
  },
});

export default PotentialMatch;