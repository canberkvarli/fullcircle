import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const { width, height } = Dimensions.get("window");

interface UserCardProps {
  user: any;
  isBlurred?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: "default" | "radiant";
  onPress?: () => void;
  showDetails?: boolean;
  onHeartPress?: () => void;
  getImageUrl?: (photoPath: string) => Promise<string>;
  isOrbLike?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  isBlurred = false,
  style,
  variant = "default",
  onPress,
  showDetails = false,
  onHeartPress,
  getImageUrl,
  isOrbLike = false,
}) => {
  const photos: string[] = user.photos || [];
  const [resolvedPhotos, setResolvedPhotos] = useState<string[]>(photos);

  // Resolve photos if getImageUrl is provided.
  useEffect(() => {
    if (getImageUrl) {
      const resolvePhotos = async () => {
        const updated = await Promise.all(
          photos.map(async (photo) =>
            photo.startsWith("http") ? photo : await getImageUrl(photo)
          )
        );
        setResolvedPhotos(updated);
      };
      resolvePhotos();
    } else {
      setResolvedPhotos(photos);
    }
  }, [photos, getImageUrl]);

  // For Radiant Souls we use photo index 2 (fallback to index 0),
  // whereas for Kindred Spirits (default), we use index 0.
  const mainPhoto =
    variant === "radiant"
      ? resolvedPhotos[2] || resolvedPhotos[0] || null
      : resolvedPhotos[0] || null;

  // For radiant variant, we display an avatar (from index 0).
  const avatarPhoto = resolvedPhotos[0] || null;

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <View
        style={[
          styles.card,
          variant === "radiant" && styles.radiantCard,
          style,
        ]}
      >
        {isOrbLike && (
          <View style={styles.orbIconContainer}>
            <Icon name="pagelines" size={20} color="#D8BFAA" />
          </View>
        )}
        {variant === "default" && (
          <View style={styles.headerDefault}>
            <Text style={styles.headerTextDefault}>
              {user.firstName || "Unknown"}
            </Text>
          </View>
        )}
        <View style={styles.mainPhotoContainer}>
          {mainPhoto ? (
            <Image
              source={{ uri: mainPhoto }}
              style={styles.mainPhoto}
              blurRadius={variant === "default" && isBlurred ? 20 : 0}
            />
          ) : (
            <View style={styles.photoFallback}>
              <Text>No Photo Available</Text>
            </View>
          )}
        </View>
        {variant === "radiant" && (
          <View style={styles.footer}>
            {avatarPhoto && (
              <View style={styles.avatarContainer}>
                <Image source={{ uri: avatarPhoto }} style={styles.avatar} />
              </View>
            )}
            <Text style={styles.userName}>{user.firstName || "Unknown"}</Text>
          </View>
        )}
        {onHeartPress && (
          <TouchableOpacity style={styles.heartIcon} onPress={onHeartPress}>
            <Icon name="heart" size={30} color="red" />
          </TouchableOpacity>
        )}
        {showDetails && (
          <View style={styles.detailsContainer}>
            {[
              { title: "Gender", content: user.gender?.join(", ") || "N/A" },
              { title: "Height", content: user.height || "N/A" },
              {
                title: "Ethnicities",
                content: user.ethnicities?.join(", ") || "N/A",
              },
              {
                title: "Date Preferences",
                content:
                  user.matchPreferences.ConnectionPreferences?.join(", ") || "N/A",
              },
              {
                title: "Children Preference",
                content: user.childrenPreference || "N/A",
              },
              {
                title: "Education Degree",
                content: user.educationDegree || "N/A",
              },
            ].map((detail, index) => (
              <View key={index} style={styles.detailRow}>
                <Text style={styles.detailTitle}>{detail.title}:</Text>
                <Text style={styles.detailContent}>{detail.content}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 3,
    width: width * 0.8,
    height: height * 0.66,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  radiantCard: {
    backgroundColor: "#EDE9E3",
    borderColor: "#D8BFAA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  mainPhotoContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  mainPhoto: {
    width: "100%",
    height: "100%",
  },
  photoFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  orbIconContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerDefault: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerTextDefault: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    backgroundColor: "#ccc",
    marginRight: 10,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  userName: {
    fontSize: 18,
    color: "#000",
  },
  detailsContainer: {
    marginTop: 10,
    width: "100%",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  detailContent: {
    fontSize: 14,
    color: "#777",
  },
  heartIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});

export default UserCard;
