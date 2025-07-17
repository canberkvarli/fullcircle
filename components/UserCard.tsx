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
import { Colors, Typography, Spacing } from '@/constants/Colors';
import { useFont } from '@/hooks/useFont';

const { width, height } = Dimensions.get("window");

interface UserCardProps {
  user: any;
  isBlurred?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  showDetails?: boolean;
  getImageUrl?: (photoPath: string) => Promise<string | null>;
  isOrbLike?: boolean;
  isRadianceLike?: boolean;
  showConnectionBadges?: boolean;
  isRecentlyActive?: boolean;
  activityText?: string;
  cardSize?: "large" | "small";
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  isBlurred = false,
  style,
  onPress,
  showDetails = false,
  getImageUrl,
  isOrbLike = false,
  isRadianceLike = false,
  showConnectionBadges = true,
  isRecentlyActive = false,
  activityText = "",
  cardSize = "large",
}) => {
  const photos: string[] = user.photos || [];
  const [resolvedPhotos, setResolvedPhotos] = useState<string[]>(photos);
  const fonts = useFont();

  // Smart font sizing based on name length and card size
  const getNameFontSize = () => {
    const name = user.firstName || "Unknown Presence";
    const isSmallCard = cardSize === "small";
    
    if (isSmallCard) {
      if (name.length > 12) return Typography.sizes.sm; // 14px for very long names
      if (name.length > 8) return Typography.sizes.base; // 16px for long names
      return Typography.sizes.lg; // 18px for short names
    } else {
      // Large card sizing
      if (name.length > 15) return Typography.sizes.base; // 16px for very long names
      if (name.length > 10) return Typography.sizes.lg; // 18px for long names
      return Typography.sizes.xl; // 20px for short names
    }
  };

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

  // Use photo index 0 as the main photo
  const mainPhoto = resolvedPhotos[0] || null;

  // Determine badge styles based on card size
  const isSmallCard = cardSize === "small";
  const shouldShowTextActivity = isRecentlyActive && activityText && !isSmallCard;
  const shouldShowDotActivity = isRecentlyActive && isSmallCard;

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <View
        style={[
          styles.card,
          style,
        ]}
      >
        {/* Only show ONE set of badges in top-right corner */}
        {(shouldShowTextActivity || shouldShowDotActivity || (showConnectionBadges && (isOrbLike || isRadianceLike))) && (
          <View style={[
            styles.allBadgesContainer,
            isSmallCard && styles.smallCardBadgesContainer
          ]}>
            {/* Activity Badge - First (leftmost) */}
            {shouldShowTextActivity && (
              <View style={styles.activityBadge}>
                <Ionicons name="radio" size={12} color="#FFFFFF" />
                <Text style={styles.activityBadgeText}>
                  {activityText}
                </Text>
              </View>
            )}
            
            {shouldShowDotActivity && (
              <View style={styles.activityDot}>
                <Ionicons name="radio" size={8} color="#FFFFFF" />
              </View>
            )}
            
            {/* Connection Badges - After activity */}
            {showConnectionBadges && isOrbLike && (
              <View style={[
                styles.connectionBadge, 
                styles.orbBadge,
                isSmallCard && styles.smallConnectionBadge
              ]}>
                <Ionicons 
                  name="planet" 
                  size={isSmallCard ? 8 : 12} 
                  color="#FFFFFF" 
                />
              </View>
            )}
            {showConnectionBadges && isRadianceLike && (
              <View style={[
                styles.connectionBadge, 
                styles.radianceBadge,
                isSmallCard && styles.smallConnectionBadge
              ]}>
                <Ionicons 
                  name="radio" 
                  size={isSmallCard ? 8 : 12} 
                  color="#FFFFFF" 
                />
              </View>
            )}
          </View>
        )}

        {/* Simple header with smart name sizing */}
        <View style={styles.headerDefault}>
          <Text style={[
            fonts.spiritualBodyFont,
            {
              fontSize: getNameFontSize(),
              fontWeight: Typography.weights.bold,
              color: Colors.light.textDark,
            }
          ]}>
            {user.firstName || "Unknown"}
          </Text>
        </View>

        <View style={styles.mainPhotoContainer}>
          {mainPhoto ? (
            <Image
              source={{ uri: mainPhoto }}
              style={styles.mainPhoto}
              blurRadius={isBlurred ? 20 : 0}
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
    padding: 10,
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
    aspectRatio: 0.85,
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

  // Top-right badges container
  allBadgesContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 10,
  },

  smallCardBadgesContainer: {
    top: 8,
    right: 8,
    gap: 4,
  },

  // Connection Badges
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
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },

  smallConnectionBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  orbBadge: {
    backgroundColor: "#FFD700", // Gold background for star
  },

  radianceBadge: {
    backgroundColor: "#D4AF37", // Different gold for diamond
  },

  // Activity Badges
  activityBadge: {
    backgroundColor: '#4CAF50',
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
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },

  activityBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },

  // Small activity dot for small cards
  activityDot: {
    backgroundColor: '#4CAF50',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },

  headerDefault: {
    paddingHorizontal: Spacing.xs,
    zIndex: 5,
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