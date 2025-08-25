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
  useColorScheme,
} from "react-native";
import { Colors, Typography, Spacing } from '@/constants/Colors';
import { useFont } from '@/hooks/useFont';
import { CustomIcon } from './CustomIcon';

const { width, height } = Dimensions.get("window");

interface UserCardProps {
  user: any;
  isBlurred?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  getImageUrl?: (photoPath: string) => Promise<string | null>;
  islotusLike?: boolean;
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
  getImageUrl,
  islotusLike = false,
  isRadianceLike = false,
  showConnectionBadges = true,
  isRecentlyActive = false,
  activityText = "",
  cardSize = "large",
}) => {
  const photos: string[] = user.photos || [];
  const [resolvedPhotos, setResolvedPhotos] = useState<string[]>(photos);
  const fonts = useFont();
  
  // Get current color scheme
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];


  // Smart font sizing based on name length, card size, and badge count
  const getNameFontSize = () => {
    const name = user.firstName || "Unknown Presence";
    const isSmallCard = cardSize === "small";
    
    // Count how many badges will be shown
    const badgeCount = (shouldShowTextActivity ? 1 : 0) + 
                      (shouldShowDotActivity ? 1 : 0) + 
                      (showConnectionBadges && islotusLike ? 1 : 0) + 
                      (showConnectionBadges && isRadianceLike ? 1 : 0);
    
    // Reduce font size if there are many badges to prevent overlap
    const badgeAdjustment = badgeCount >= 3 ? 2 : 0;
    
    if (isSmallCard) {
      if (name.length > 12) return Math.max(Typography.sizes.sm - badgeAdjustment, Typography.sizes.xs);
      if (name.length > 8) return Math.max(Typography.sizes.base - badgeAdjustment, Typography.sizes.sm);
      return Math.max(Typography.sizes.lg - badgeAdjustment, Typography.sizes.base);
    } else {
      // Large card sizing
      if (name.length > 15) return Math.max(Typography.sizes.base - badgeAdjustment, Typography.sizes.sm);
      if (name.length > 10) return Math.max(Typography.sizes.lg - badgeAdjustment, Typography.sizes.base);
      return Math.max(Typography.sizes.xl - badgeAdjustment, Typography.sizes.lg);
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
          isSmallCard && styles.smallCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
          style,
        ]}
      >
        {/* Only show ONE set of badges in top-right corner */}
        {(shouldShowTextActivity || shouldShowDotActivity || (showConnectionBadges && (islotusLike || isRadianceLike))) && (
          <View style={[
            styles.allBadgesContainer,
            isSmallCard && styles.smallCardBadgesContainer
          ]}>
            {/* Activity Badge - First (leftmost) */}
            {shouldShowTextActivity && (
              <View style={styles.activityBadge}>
                <View style={styles.activityIcon} />
                <Text style={styles.activityBadgeText}>
                  {activityText}
                </Text>
              </View>
            )}
            
            {shouldShowDotActivity && (
              <View style={styles.activityDot}>
                <View style={styles.activityIcon} />
              </View>
            )}
            
            {/* Connection Badges - After activity */}
            {showConnectionBadges && islotusLike && (
              <View style={[
                styles.connectionBadge, 
                isSmallCard && styles.smallConnectionBadge
              ]}>
                <CustomIcon 
                  name="lotus" 
                  size={isSmallCard ? 8 : 12} 
                />
              </View>
            )}
            {showConnectionBadges && isRadianceLike && (
              <View style={[
                styles.connectionBadge, 
                styles.radianceBadge,
                isSmallCard && styles.smallConnectionBadge
              ]}>
                <CustomIcon 
                  name="halo" 
                  size={isSmallCard ? 8 : 12} 
                  color="#FFFFFF" 
                />
              </View>
            )}
          </View>
        )}

        {/* Simple header with smart name sizing */}
        <View style={[
          styles.headerDefault,
          isSmallCard && styles.smallCardHeader
        ]}>
          <Text style={[
            fonts.spiritualBodyFont,
            {
              fontSize: getNameFontSize(),
              fontWeight: Typography.weights.bold,
              color: colors.textDark,
            }
          ]}>
            {user.firstName || "Unknown"}
          </Text>
        </View>

        <View style={[
          styles.mainPhotoContainer,
          isSmallCard && styles.smallCardPhotoContainer
        ]}>
          {mainPhoto ? (
            <Image
              source={{ uri: mainPhoto }}
              style={styles.mainPhoto}
              blurRadius={isBlurred ? 20 : 0}
            />
          ) : (
            <View style={[styles.photoFallback, { backgroundColor: colors.border }]}>
              <CustomIcon 
                name="person" 
                size={50} 
                color={colors.textMuted} 
              />
            </View>
          )}
        </View>


      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff", // Will be overridden by inline styles
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd", // Will be overridden by inline styles
    elevation: 3,
    width: width * 0.8,
    height: height * 0.55, // Reduced from 0.66
    flexDirection: "column",
    justifyContent: "space-between", // Use space-between to push photo to bottom
    overflow: 'hidden',
  },

  // Small card specific styling
  smallCard: {
    height: height * 0.22, // Much more reduced height for small cards
    padding: 8, // Slightly reduce padding for small cards
    justifyContent: "space-between", // Use space-between to push photo to bottom
  },
  radiantCard: {
    backgroundColor: "#EDE9E3", // Will be overridden by inline styles if needed
    borderColor: "#D8BFAA", // Will be overridden by inline styles if needed
    shadowColor: "#000", // Will be overridden by inline styles if needed
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

  // Small card photo container with tighter spacing
  smallCardPhotoContainer: {
    width: "100%",
    aspectRatio: 0.85, // Almost square but slightly longer than square for small cards
    borderRadius: 8, // Smaller border radius for small cards
    overflow: "hidden",
    position: 'relative',
    // Removed marginTop to eliminate invisible spacing
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
    backgroundColor: "#f0f0f0", // Will be overridden by inline styles
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

  // Activity icon (green circle)
  activityIcon: {
    backgroundColor: '#4CAF50',
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  headerDefault: {
    paddingHorizontal: Spacing.xs,
    zIndex: 5,
    marginBottom: 6, // Small space between name and photo
  },

  // Small card specific header styling
  smallCardHeader: {
    paddingHorizontal: Spacing.xs,
    zIndex: 5,
    marginBottom: 4, // Even smaller space for small cards
  },


});

export default UserCard;