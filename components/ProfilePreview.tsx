import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  useColorScheme,
  Platform,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useUserContext, UserDataType } from "@/context/UserContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

interface ProfilePreviewProps {
  userData: UserDataType;
  photos?: string[];
}

const ProfilePreview: React.FC<ProfilePreviewProps> = ({ userData, photos: passedPhotos }) => {
  const { getImageUrl } = useUserContext();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const lastLoadedPhotosFor = useRef<string | null>(null);

  useEffect(() => {
    // If photos are passed from edit screen (local URIs), use them directly
    if (passedPhotos && passedPhotos.length > 0) {
      setPhotoUrls(passedPhotos);
      setLoadingPhotos(false);
      return;
    }

    // Otherwise, load from Firebase storage
    const id = userData.userId;
    if (!id || id === lastLoadedPhotosFor.current) {
      return;
    }
    lastLoadedPhotosFor.current = id;

    let active = true;
    setLoadingPhotos(true);

    (async () => {
      if (userData.photos?.length) {
        const urls = await Promise.all(
          userData.photos.map((p) => getImageUrl(p))
        );
        if (active) {
          setPhotoUrls(urls.filter((u): u is string => !!u));
        }
      }
      if (active) setLoadingPhotos(false);
    })();

    return () => {
      active = false;
    };
  }, [userData.userId, userData.photos, passedPhotos]);

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
    return 'Location not shared';
  };

  // Get connection intent for theming
  const connectionIntent = userData.matchPreferences?.connectionIntent || "romantic";
  const isRomantic = connectionIntent === "romantic";

  // Get intent colors for dynamic theming
  const getIntentColors = (intent: string) => {
    if (intent === "romantic") {
      return {
        primary: '#EC4899',
        secondary: '#FDF2F8',
        accent: '#BE185D',
        tertiary: '#F9A8D4',
      };
    } else {
      return {
        primary: '#10B981',
        secondary: '#F0FDF4',
        accent: '#047857',
        tertiary: '#6EE7B7',
      };
    }
  };

  const intentColors = getIntentColors(connectionIntent);

  // Create meaningful details based on current user data - UPDATED
  const getDetailsForPhoto = (index: number) => {
    const detailOptions = [
      {
        title: "About Me",
        content: `${userData.age} • ${getLocation(userData)}`,
        icon: "person-outline",
        color: intentColors.primary
      },
      {
        title: "Spiritual Practices",
        content: userData?.spiritualProfile?.practices?.length 
          ? userData.spiritualProfile.practices.slice(0, 3).join(", ")
          : 'Spiritual practices not shared',
        icon: "flower-outline",
        color: '#8B5CF6'
      },
      {
        title: "Connection Type",
        content: isRomantic ? "Looking for romantic connections" : "Looking for meaningful friendships",
        icon: isRomantic ? "heart-outline" : "people-outline",
        color: intentColors.primary
      },
      // Only show "Interested In" for romantic connections
      ...(isRomantic ? [{
        title: "Interested In",
        content: userData.matchPreferences?.connectionPreferences?.length
          ? userData.matchPreferences.connectionPreferences.join(", ")
          : 'Open to connections',
        icon: "heart-circle-outline",
        color: intentColors.accent
      }] : []),
      {
        title: "Connection Style",
        content: userData.matchPreferences?.connectionStyles?.length
          ? userData.matchPreferences.connectionStyles.slice(0, 2).join(", ")
          : isRomantic ? 'Romantic style not set' : 'Friendship style not set',
        icon: "sparkles-outline",
        color: intentColors.tertiary
      },
      {
        title: "Healing Modalities",
        content: userData?.spiritualProfile?.healingModalities?.length
          ? userData.spiritualProfile.healingModalities.slice(0, 3).join(", ")
          : 'Healing path not shared',
        icon: "medical-outline",
        color: '#10B981'
      },
      {
        title: "Physical Details",
        content: userData.height ? `${userData.height} ft tall` : 'Height not shared',
        icon: "resize-outline",
        color: '#6B7280'
      },
      {
        title: "Spiritual Draws",
        content: userData?.spiritualProfile?.draws?.length
          ? userData.spiritualProfile.draws.slice(0, 3).join(", ")
          : 'Spiritual draws not shared',
        icon: "leaf-outline",
        color: '#059669'
      }
    ];

    return detailOptions[index % detailOptions.length] || detailOptions[0];
  };

  // Helper function to get array for pills display
  const getPillsArray = (detail: any) => {
    if (detail.title === "Spiritual Practices") {
      return userData.spiritualProfile?.practices || [];
    } else if (detail.title === "Healing Modalities") {
      return userData.spiritualProfile?.healingModalities || [];
    } else if (detail.title === "Spiritual Draws") {
      return userData.spiritualProfile?.draws || [];
    } else if (detail.title === "Connection Style") {
      return userData.matchPreferences?.connectionStyles || [];
    } else if (detail.title === "Interested In" && isRomantic) {
      return userData.matchPreferences?.connectionPreferences || [];
    }
    return [];
  };

  const styles = createStyles(colors, fonts, intentColors);

  if (loadingPhotos) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.loadingMandala, { backgroundColor: intentColors.secondary }]}>
          <Ionicons 
            name={isRomantic ? "heart" : "people"} 
            size={40} 
            color={intentColors.primary} 
          />
        </View>
        <Text style={[styles.loadingText, fonts.spiritualBodyFont, { color: intentColors.primary }]}>
          Loading {isRomantic ? "Sacred Soul" : "Beautiful Spirit"}...
        </Text>
      </View>
    );
  }

  // Create all available info sections - UPDATED
  const createInfoSections = () => {
    const sections = [];

    // Gender Identity
    if (userData.gender && userData.gender.length > 0) {
      sections.push({
        type: 'info',
        title: "Gender Identity",
        icon: "person-outline",
        content: userData.gender.join(", "),
        isPill: true,
        color: '#6366F1'
      });
    }

    // Connection Intent (Dating vs Friendship)
    // sections.push({
    //   type: 'info',
    //   title: "Connection Intent",
    //   icon: isRomantic ? "heart" : "people",
    //   content: isRomantic ? "Dating" : "Friendship",
    //   description: isRomantic ? "Seeking romantic connections" : "Building meaningful friendships",
    //   isPill: false,
    //   color: intentColors.primary
    // });

    // Only show connection preferences for romantic connections
    // if (isRomantic && userData.matchPreferences?.connectionPreferences && userData.matchPreferences.connectionPreferences.length > 0) {
    //   sections.push({
    //     type: 'info',
    //     title: "Interested In",
    //     icon: "heart-circle-outline",
    //     content: userData.matchPreferences.connectionPreferences.join(", "),
    //     isPill: true,
    //     color: intentColors.accent
    //   });
    // }

    // Connection Styles
    if (userData.matchPreferences?.connectionStyles && userData.matchPreferences.connectionStyles.length > 0) {
      sections.push({
        type: 'info',
        title: isRomantic ? "Romantic Style" : "Connection Style",
        icon: "sparkles-outline",
        content: userData.matchPreferences.connectionStyles.join(", "),
        isPill: true,
        color: intentColors.tertiary
      });
    }

    return sections;
  };

  // Create organized content array - interleave photos and info cards
  const createOrganizedContent = () => {
    const content = [];
    const infoSections = createInfoSections();
    const totalPhotos = photoUrls.length;
    const totalInfoSections = infoSections.length;
    
    // Calculate how to distribute content evenly
    const totalItems = totalPhotos + totalInfoSections;
    let photoIndex = 0;
    let infoIndex = 0;

    // Strategy: Start with photo, then alternate strategically
    for (let i = 0; i < totalItems; i++) {
      const shouldAddPhoto = photoIndex < totalPhotos && (
        infoIndex >= totalInfoSections || // No more info sections
        i === 0 || // Always start with photo
        (i % 3 === 0 && photoIndex < totalPhotos) // Every 3rd item should be a photo if available
      );

      if (shouldAddPhoto) {
        content.push({
          type: 'photo',
          index: photoIndex,
          uri: photoUrls[photoIndex]
        });
        photoIndex++;
      } else if (infoIndex < totalInfoSections) {
        content.push({
          ...infoSections[infoIndex],
          type: 'standalone-info'
        });
        infoIndex++;
      }
    }

    return content;
  };

  const renderInfoCard = (section: any) => (
    <View style={[styles.infoSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.detailHeader}>
        <View style={[styles.iconContainer, { backgroundColor: section.color + '15' }]}>
          <Ionicons name={section.icon as any} size={20} color={section.color} />
        </View>
        <Text style={[styles.detailTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
          {section.title}
        </Text>
      </View>
      
      {section.description && (
        <Text style={[styles.detailDescription, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
          {section.description}
        </Text>
      )}

      {section.isPill && Array.isArray(section.content.split(", ")) ? (
        <View style={styles.pillsContainer}>
          {section.content.split(", ").map((item: string, pillIndex: number) => (
            <View key={pillIndex} style={[styles.pill, { 
              backgroundColor: section.color + '20',
              borderColor: section.color + '40'
            }]}>
              <Text style={[styles.pillText, fonts.spiritualBodyFont, { color: section.color }]}>
                {item.trim()}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.detailText, fonts.spiritualBodyFont, { color: colors.textLight }]}>
          {section.content}
        </Text>
      )}
    </View>
  );

  const renderPhotoWithDetail = (uri: string, index: number) => {
    const detail = getDetailsForPhoto(index);
    const pillsArray = getPillsArray(detail);
    
    return (
      <View style={styles.photoCard}>
        <Image source={{ uri }} style={styles.photo} />

        <View style={[styles.detailCard, { 
          backgroundColor: colors.card, 
          borderColor: colors.border 
        }]}>
          <View style={styles.detailHeader}>
            <View style={[styles.iconContainer, { backgroundColor: detail.color + '15' }]}>
              <Ionicons name={detail.icon as any} size={20} color={detail.color} />
            </View>
            <Text style={[styles.detailTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              {detail.title}
            </Text>
          </View>
          
          {/* Enhanced content display */}
          {(detail.title === "Spiritual Practices" || 
            detail.title === "Healing Modalities" || 
            detail.title === "Spiritual Draws" ||
            detail.title === "Connection Style" ||
            detail.title === "Interested In") && pillsArray.length > 0 ? (
            <View style={styles.pillsContainer}>
              {pillsArray.slice(0, 4).map((item: string, pillIndex: number) => (
                <View key={pillIndex} style={[styles.pill, { 
                  backgroundColor: detail.color + '20',
                  borderColor: detail.color + '40'
                }]}>
                  <Text style={[styles.pillText, fonts.spiritualBodyFont, { color: detail.color }]}>
                    {item}
                  </Text>
                </View>
              ))}
              {pillsArray.length > 4 && (
                <View style={[styles.pill, { 
                  backgroundColor: detail.color + '10',
                  borderColor: detail.color + '30'
                }]}>
                  <Text style={[styles.pillText, fonts.spiritualBodyFont, { color: detail.color }]}>
                    +{pillsArray.length - 4} more
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={[styles.detailText, fonts.spiritualBodyFont, { 
              color: pillsArray.length === 0 && (detail.title === "Spiritual Practices" || 
                                                detail.title === "Healing Modalities" || 
                                                detail.title === "Spiritual Draws") 
                ? colors.textMuted 
                : colors.textLight,
              fontStyle: pillsArray.length === 0 && (detail.title === "Spiritual Practices" || 
                                                     detail.title === "Healing Modalities" || 
                                                     detail.title === "Spiritual Draws") 
                ? 'italic' 
                : 'normal'
            }]}>
              {detail.content}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const organizedContent = createOrganizedContent();

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Connection Type Badge */}
      <View style={styles.headerContainer}>
        <Text
          style={[
            styles.topName, 
            fonts.spiritualTitleFont,
            { color: colors.textDark }
          ]}
        >
          {userData.firstName}
        </Text>
      </View>

      {/* Handle case when no photos */}
      {photoUrls.length === 0 && (
        <View style={styles.noPhotosContainer}>
          <Ionicons name="camera-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.noPhotosText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
            No photos to preview
          </Text>
        </View>
      )}

      {/* Render organized content - interleaved photos and info cards */}
      {organizedContent.map((item, index) => (
        <View key={`content-${index}`}>
          {item.type === 'photo' && item.uri && renderPhotoWithDetail(item.uri, item.index)}
          {item.type === 'standalone-info' && renderInfoCard(item)}
        </View>
      ))}
    </ScrollView>
  );
};

const createStyles = (colors: any, fonts: any, intentColors: any) => StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  topName: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    flex: 1,
  },
  photoCard: {
    marginBottom: Spacing.lg,
  },
  photo: {
    width: Dimensions.get("window").width - (Spacing.lg * 2),
    height: 400,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
  },
  detailCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  detailTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  detailDescription: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  detailText: {
    fontSize: Typography.sizes.base,
    lineHeight: Typography.sizes.base * 1.4,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  pillText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  infoSection: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  loadingMandala: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.sizes.lg,
    fontStyle: 'italic',
  },
  noPhotosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  noPhotosText: {
    fontSize: Typography.sizes.lg,
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },
});

export default ProfilePreview;