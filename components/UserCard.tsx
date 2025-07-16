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
  getImageUrl?: (photoPath: string) => Promise<string | null>;
  isOrbLike?: boolean;
  isRadianceLike?: boolean;
  showConnectionBadges?: boolean;
  isRecentlyActive?: boolean;
  activityText?: string;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  isBlurred = false,
  style,
  variant = "default",
  onPress,
  showDetails = false,
  getImageUrl,
  isOrbLike = false,
  isRadianceLike = false,
  showConnectionBadges = true,
  isRecentlyActive = false,
  activityText = "",
}) => {
  const photos: string[] = user.photos || [];
  const [resolvedPhotos, setResolvedPhotos] = useState<string[]>(photos);

  // Resolve photos if getImageUrl is provided.
  useEffect(() => {
    if (getImageUrl) {
      const resolvePhotos = async () => {
        const updated = await Promise.all(
          photos.map(async (photo) => {
            if (photo.startsWith("http")) {
              return photo;
            }
            const resolvedUrl = await getImageUrl(photo);
            return resolvedUrl || photo; // Fallback to original if null
          })
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
        {(showConnectionBadges && (isOrbLike || isRadianceLike)) || (isRecentlyActive && activityText) ? (
          <View style={styles.allBadgesContainer}>
            {/* Activity Badge - First (leftmost when multiple badges) */}
            {isRecentlyActive && activityText && (
              <View style={styles.activityBadge}>
                <Ionicons name="radio" size={12} color="#FFFFFF" />
                {variant === "default" && (
                  <Text style={styles.activityBadgeText}>
                    {activityText}
                  </Text>
                )}
              </View>
            )}
            
            {/* Connection Badges - After activity */}
            {showConnectionBadges && isOrbLike && (
              <View style={[styles.connectionBadge, styles.orbBadge]}>
                <Ionicons name="star" size={12} color="#FFFFFF" />
              </View>
            )}
            {showConnectionBadges && isRadianceLike && (
              <View style={[styles.connectionBadge, styles.radianceBadge]}>
                <Ionicons name="radio" size={12} color="#FFFFFF" />
              </View>
            )}
          </View>
        ) : null}

        {/* Header for default variant */}
        {variant === "default" && (
          <View style={styles.headerDefault}>
            <View style={styles.nameRow}>
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
              <Ionicons 
                name="person" 
                size={50} 
                color="#ccc" 
              />
            </View>
          )}
        </View>

        {/* Footer for radiant variant */}
        {variant === "radiant" && (
          <View style={styles.footer}>
            <View style={styles.avatarContainer}>
              {avatarPhoto ? (
                <Image 
                  source={{ uri: avatarPhoto }} 
                  style={styles.avatar} 
                />
              ) : (
                <Ionicons 
                  name="person" 
                  size={30} 
                  color="#ccc" 
                />
              )}
            </View>
            <View style={styles.nameAndBadges}>
              <View style={styles.radiantNameRow}>
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
    overflow: 'hidden',
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
    position: 'relative',
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

  allBadgesContainer: {
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
    backgroundColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },

  radianceBadge: {
    backgroundColor: "#D4AF37",
  },

  activityBadge: {
    backgroundColor: '#348107ff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  activityBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },

  // Header for default variant
  headerDefault: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 5,
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

  // Footer for radiant variant
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 10,
    zIndex: 5,
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
    zIndex: 5,
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