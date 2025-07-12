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
  Platform,
  useColorScheme,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

const { width, height } = Dimensions.get("window");

interface UserCardProps {
  user: any;
  isBlurred?: boolean;
  style?: StyleProp<ViewStyle>;
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
  onPress,
  showDetails = false,
  onHeartPress,
  getImageUrl,
  isOrbLike = false,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  
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

  const mainPhoto = resolvedPhotos[0] || null;

  const dynamicStyles = createStyles(colors, fonts, isOrbLike);

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.9}>
      <View style={[dynamicStyles.card, style]}>
        {/* Special orb effect overlay */}
        {isOrbLike && (
          <>
            <View style={dynamicStyles.orbGlow} />
            <View style={dynamicStyles.orbRays} />
            <View style={dynamicStyles.orbIconContainer}>
              <Ionicons name="sparkles" size={18} color="#FFD700" />
            </View>
            <View style={dynamicStyles.orbBadge}>
              <Text style={dynamicStyles.orbBadgeText}>Sacred Energy</Text>
            </View>
          </>
        )}

        {/* User name header */}
        <View style={dynamicStyles.header}>
          <Text style={[dynamicStyles.userName, { color: colors.textDark }]}>
            {user.firstName || "Unknown"}, {user.age || "?"}
          </Text>
        </View>

        {/* Main photo */}
        <View style={dynamicStyles.photoContainer}>
          {mainPhoto ? (
            <Image
              source={{ uri: mainPhoto }}
              style={dynamicStyles.photo}
              blurRadius={isBlurred ? 20 : 0}
            />
          ) : (
            <View style={dynamicStyles.photoFallback}>
              <Ionicons name="person-outline" size={32} color="#CCCCCC" />
              <Text style={dynamicStyles.photoFallbackText}>No Photo</Text>
            </View>
          )}
        </View>

        {/* Heart press action (if provided) */}
        {onHeartPress && (
          <TouchableOpacity style={dynamicStyles.heartIcon} onPress={onHeartPress}>
            <Ionicons name="heart" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        )}

        {/* User details (if showDetails is true) */}
        {showDetails && (
          <View style={dynamicStyles.detailsContainer}>
            {[
              { title: "Gender", content: user.gender?.join(", ") || "N/A" },
              { title: "Height", content: user.height || "N/A" },
              {
                title: "Ethnicities",
                content: user.ethnicities?.join(", ") || "N/A",
              },
              {
                title: "Location",
                content: user.location?.city 
                  ? `${user.location.city}, ${user.location.country}`
                  : "Location not provided",
              },
              {
                title: "Children Preference",
                content: user.childrenPreference || "N/A",
              },
              {
                title: "Education",
                content: user.educationDegree || "N/A",
              },
            ].map((detail, index) => (
              <View key={index} style={dynamicStyles.detailRow}>
                <Text style={dynamicStyles.detailTitle}>{detail.title}:</Text>
                <Text style={dynamicStyles.detailContent}>{detail.content}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any, fonts: any, isOrbLike: boolean) => StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: isOrbLike ? 3 : 1,
    borderColor: isOrbLike ? "#FFD700" : "#E5E5E5",
    shadowColor: isOrbLike ? "#FFD700" : '#000',
    shadowOffset: { width: 0, height: isOrbLike ? 8 : 2 },
    shadowOpacity: isOrbLike ? 0.4 : 0.1,
    shadowRadius: isOrbLike ? 16 : 8,
    elevation: isOrbLike ? 12 : 3,
    overflow: 'hidden',
    position: 'relative',
    transform: isOrbLike ? [{ scale: 1.02 }] : [{ scale: 1 }],
  },

  orbGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderRadius: 36,
    zIndex: 0,
  },

  orbRays: {
    position: 'absolute',
    top: -30,
    left: -30,
    right: -30,
    bottom: -30,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 46,
    zIndex: 0,
  },

  orbIconContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(139, 69, 19, 0.95)",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 2,
    borderColor: "#FFD700",
  },

  orbBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#FFD700",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 10,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#FFF8DC",
  },

  orbBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#8B4513",
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  header: {
    marginLeft: 15,
    marginBottom: 12,
    zIndex: 1,
  },

  userName: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  photoContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    zIndex: 1,
  },

  photo: {
    width: "100%",
    height: "100%",
  },

  photoFallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderStyle: 'dashed',
  },

  photoFallbackText: {
    fontSize: 12,
    color: "#999999",
    marginTop: 4,
    fontStyle: 'italic',
  },

  heartIcon: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },

  detailsContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    zIndex: 1,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    flexWrap: 'wrap',
  },

  detailTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666666",
    flex: 1,
  },

  detailContent: {
    fontSize: 12,
    color: "#888888",
    flex: 2,
    textAlign: 'right',
  },
});

export default UserCard;