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
import { Ionicons } from '@expo/vector-icons';

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
  isRadianceLike?: boolean; // NEW: For boost/radiance likes
  showConnectionBadges?: boolean; // NEW: Show connection method badges
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
  isRadianceLike = false,
  showConnectionBadges = true,
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
        {/* Connection Method Badges */}
        {showConnectionBadges && (isOrbLike || isRadianceLike) && (
          <View style={styles.connectionBadgesContainer}>
            {isOrbLike && (
              <View style={[styles.connectionBadge, styles.orbBadge]}>
                <Ionicons name="planet" size={12} color="#FFFFFF" />
              </View>
            )}
            {isRadianceLike && (
              <View style={[styles.connectionBadge, styles.radianceBadge]}>
                <Ionicons name="radio" size={12} color="#FFFFFF" />
              </View>
            )}
          </View>
        )}

        {/* Header for default variant */}
        {variant === "default" && (
          <View style={styles.headerDefault}>
            <View style={styles.nameRow}>
              {/* Connection icons next to name */}
              {(isOrbLike || isRadianceLike) && (
                <View style={styles.nameIconsContainer}>
                  {isOrbLike && (
                    <View style={styles.nameIcon}>
                      <Ionicons name="planet" size={14} color="#8B4513" />
                    </View>
                  )}
                  {isRadianceLike && (
                    <View style={styles.nameIcon}>
                      <Ionicons name="radio" size={14} color="#D4AF37" />
                    </View>
                  )}
                </View>
              )}
              <Text style={styles.headerTextDefault}>
                {user.firstName || "Unknown"}
              </Text>
            </View>
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
              <Ionicons name="person" size={50} color="#ccc" />
            </View>
          )}
        </View>

        {/* Footer for radiant variant */}
        {variant === "radiant" && (
          <View style={styles.footer}>
            <View style={styles.avatarContainer}>
              {avatarPhoto ? (
                <Image source={{ uri: avatarPhoto }} style={styles.avatar} />
              ) : (
                <Ionicons name="person" size={30} color="#ccc" />
              )}
            </View>
            <View style={styles.nameAndBadges}>
              <View style={styles.radiantNameRow}>
                {/* Connection icons next to name for radiant variant */}
                {(isOrbLike || isRadianceLike) && (
                  <View style={styles.nameIconsContainer}>
                    {isOrbLike && (
                      <View style={styles.nameIcon}>
                        <Ionicons name="planet" size={12} color="#8B4513" />
                      </View>
                    )}
                    {isRadianceLike && (
                      <View style={styles.nameIcon}>
                        <Ionicons name="radio" size={12} color="#D4AF37" />
                      </View>
                    )}
                  </View>
                )}
                <Text style={styles.userName}>
                  {user.firstName || "Unknown"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Details section */}
        {showDetails && (
          <View style={styles.detailsContainer}>
            {[
              {
                title: "Age",
                content: user.age?.toString() || "N/A",
              },
              {
                title: "Location",
                content: user.location?.city || "N/A",
              },
              {
                title: "Spiritual Practices",
                content: user.spiritualPractices?.join(", ") || "N/A",
              },
              {
                title: "Job Title",
                content: user.jobTitle || "N/A",
              },
              {
                title: "Height",
                content: user.height ? `${user.height} ft` : "N/A",
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

  // Connection Badges (top-right corner)
  connectionBadgesContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    gap: 6,
    zIndex: 10,
  },
  connectionBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  orbBadge: {
    backgroundColor: "#8B4513",
  },
  radianceBadge: {
    backgroundColor: "#D4AF37",
  },

  // Header for default variant
  headerDefault: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTextDefault: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },

  // Name icons (next to name)
  nameIconsContainer: {
    flexDirection: "row",
    marginRight: 8,
    gap: 4,
  },
  nameIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  // Footer for radiant variant
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
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  nameAndBadges: {
    flex: 1,
  },
  radiantNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
  },

  // Details section
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
});

export default UserCard;