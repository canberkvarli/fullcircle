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
  TouchableOpacity,
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
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
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

  // Refined color palette - more subtle and elegant
  const getIntentColors = (intent: string) => {
    if (intent === "romantic") {
      return {
        primary: '#E11D48', // Rose-600
        secondary: '#FFF1F2', // Rose-50
        accent: '#BE123C', // Rose-700
        tertiary: '#FB7185', // Rose-400
      };
    } else if (intent === "friendship") {
      return {
        primary: '#059669', // Emerald-600
        secondary: '#ECFDF5', // Emerald-50
        accent: '#047857', // Emerald-700
        tertiary: '#34D399', // Emerald-400
      };
    } else if (intent === "both") {
      return {
        primary: '#7C3AED', // Violet-600
        secondary: '#F5F3FF', // Violet-50
        accent: '#6D28D9', // Violet-700
        tertiary: '#A78BFA', // Violet-400
      };
    } else {
      return {
        primary: '#0891B2', // Cyan-600
        secondary: '#F0F9FF', // Cyan-50
        accent: '#0E7490', // Cyan-700
        tertiary: '#22D3EE', // Cyan-400
      };
    }
  };

  const intentColors = getIntentColors(connectionIntent);

  // Toggle expanded state for sections
  const toggleExpanded = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Get connection type display text
  const getConnectionTypeDisplay = (intent: string) => {
    switch (intent) {
      case "romantic":
        return "Looking for romantic connections";
      case "friendship":
        return "Looking for meaningful friendships";
      case "both":
        return "Open to all types of connections";
      default:
        return "Open to connections";
    }
  };

  // Create meaningful details based on current user data
  const getDetailsForPhoto = (index: number) => {
    const detailOptions = [
      {
        title: "About Me",
        content: `${userData.age} • ${getLocation(userData)}`,
        icon: "person-outline",
        color: intentColors.primary,
        type: 'text'
      },
      {
        title: "Spiritual Practices",
        content: userData?.spiritualProfile?.practices || [],
        icon: "leaf-outline",
        color: '#059669',
        type: 'pills',
        emptyText: 'Spiritual practices not shared'
      },
      {
        title: "Connection Style",
        content: userData.matchPreferences?.connectionStyles || [],
        icon: "sparkles-outline",
        color: intentColors.tertiary,
        type: 'pills',
        emptyText: 'Connection style not set'
      },
      {
        title: "Healing Modalities",
        content: userData?.spiritualProfile?.healingModalities || [],
        icon: "medical-outline",
        color: '#0891B2',
        type: 'pills',
        emptyText: 'Healing path not shared'
      },
      {
        title: "Physical Details",
        content: userData.height ? `${userData.height} ft tall` : 'Height not shared',
        icon: "resize-outline",
        color: '#6B7280',
        type: 'text'
      },
      {
        title: "Spiritual Draws",
        content: userData?.spiritualProfile?.draws || [],
        icon: "heart-outline",
        color: '#DC2626',
        type: 'pills',
        emptyText: 'Spiritual draws not shared'
      }
    ];

    return detailOptions[index % detailOptions.length] || detailOptions[0];
  };

  const styles = createStyles(colors, fonts, intentColors);

  if (loadingPhotos) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.loadingMandala, { backgroundColor: intentColors.secondary }]}>
          <Ionicons 
            name={connectionIntent === "romantic" ? "heart" 
                 : connectionIntent === "friendship" ? "people" 
                 : connectionIntent === "both" ? "infinite"
                 : "sparkles"} 
            size={32} 
            color={intentColors.primary} 
          />
        </View>
        <Text style={[styles.loadingText, fonts.spiritualBodyFont, { color: intentColors.primary }]}>
          Loading Beautiful Spirit...
        </Text>
      </View>
    );
  }

  // Create organized info sections
  const createInfoSections = () => {
    const sections = [];

    // Gender Identity
    if (userData.gender && userData.gender.length > 0) {
      sections.push({
        type: 'info',
        title: "Gender Identity",
        icon: "person-outline",
        content: userData.gender,
        displayType: 'pills',
        color: '#6366F1',
        key: 'gender'
      });
    }

    // Connection Styles - always show if available
    if (userData.matchPreferences?.connectionStyles && userData.matchPreferences.connectionStyles.length > 0) {
      const styleTitle = connectionIntent === "romantic" ? "Romantic Style" 
                       : connectionIntent === "friendship" ? "Connection Style"
                       : "Connection Styles";
      
      sections.push({
        type: 'info',
        title: styleTitle,
        icon: "sparkles-outline",
        content: userData.matchPreferences.connectionStyles,
        displayType: 'pills',
        color: intentColors.tertiary,
        key: 'connectionStyles'
      });
    }

    // Spiritual practices
    if (userData.spiritualProfile?.practices && userData.spiritualProfile.practices.length > 0) {
      sections.push({
        type: 'info',
        title: "Spiritual Practices",
        icon: "leaf-outline",
        content: userData.spiritualProfile.practices,
        displayType: 'pills',
        color: '#059669',
        key: 'practices'
      });
    }

    // Healing modalities
    if (userData.spiritualProfile?.healingModalities && userData.spiritualProfile.healingModalities.length > 0) {
      sections.push({
        type: 'info',
        title: "Healing Modalities",
        icon: "medical-outline",
        content: userData.spiritualProfile.healingModalities,
        displayType: 'pills',
        color: '#0891B2',
        key: 'healing'
      });
    }

    return sections;
  };

  // Render pills with truncation and expand option
  const renderPillsSection = (items: string[], color: string, sectionKey: string, maxInitial: number = 3) => {
    const isExpanded = expandedSections[sectionKey];
    const displayItems = isExpanded ? items : items.slice(0, maxInitial);
    const hasMore = items.length > maxInitial;

    return (
      <View>
        <View style={styles.pillsContainer}>
          {displayItems.map((item: string, pillIndex: number) => (
            <View key={pillIndex} style={[styles.pill, { 
              backgroundColor: color + '15',
              borderColor: color + '30'
            }]}>
              <Text style={[styles.pillText, fonts.spiritualBodyFont, { color: color }]}>
                {item}
              </Text>
            </View>
          ))}
        </View>
        
        {hasMore && (
          <TouchableOpacity 
            style={[styles.seeMoreButton, { borderColor: color + '30' }]}
            onPress={() => toggleExpanded(sectionKey)}
          >
            <Text style={[styles.seeMoreText, { color: color }]}>
              {isExpanded ? 'See Less' : `+${items.length - maxInitial} More`}
            </Text>
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={color} 
            />
          </TouchableOpacity>
        )}
      </View>
    );
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
    <View style={[styles.infoSection, { backgroundColor: colors.card }]}>
      <View style={styles.detailHeader}>
        <View style={[styles.iconContainer, { backgroundColor: section.color + '15' }]}>
          <Ionicons name={section.icon as any} size={18} color={section.color} />
        </View>
        <Text style={[styles.detailTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
          {section.title}
        </Text>
      </View>

      {section.displayType === 'pills' && Array.isArray(section.content) ? 
        renderPillsSection(section.content, section.color, section.key) : (
        <Text style={[styles.detailText, fonts.spiritualBodyFont, { color: colors.textLight }]}>
          {Array.isArray(section.content) ? section.content.join(", ") : section.content}
        </Text>
      )}
    </View>
  );

  const renderPhotoWithDetail = (uri: string, index: number) => {
    const detail = getDetailsForPhoto(index);
    
    return (
      <View style={styles.photoCard}>
        <Image source={{ uri }} style={styles.photo} />

        <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
          <View style={styles.detailHeader}>
            <View style={[styles.iconContainer, { backgroundColor: detail.color + '15' }]}>
              <Ionicons name={detail.icon as any} size={18} color={detail.color} />
            </View>
            <Text style={[styles.detailTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              {detail.title}
            </Text>
          </View>
          
          {detail.type === 'pills' && Array.isArray(detail.content) && detail.content.length > 0 ? 
            renderPillsSection(detail.content, detail.color, `photo-${index}-${detail.title}`) : (
            <Text style={[styles.detailText, fonts.spiritualBodyFont, { 
              color: Array.isArray(detail.content) && detail.content.length === 0 
                ? colors.textMuted 
                : colors.textLight,
              fontStyle: Array.isArray(detail.content) && detail.content.length === 0 
                ? 'italic' 
                : 'normal'
            }]}>
              {Array.isArray(detail.content) 
                ? (detail.content.length > 0 ? detail.content.join(", ") : detail.emptyText)
                : detail.content}
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
      {/* Header with improved styling */}
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
        
        {/* Connection Intent Badge - Clean floating badge */}
        <View style={[styles.connectionBadge, { 
          backgroundColor: intentColors.secondary,
          borderColor: intentColors.primary + '40'
        }]}>
          <Ionicons 
            name={connectionIntent === "romantic" ? "heart" 
                 : connectionIntent === "friendship" ? "people" 
                 : connectionIntent === "both" ? "infinite"
                 : "sparkles"} 
            size={14} 
            color={intentColors.primary} 
          />
          <Text style={[styles.connectionBadgeText, { color: intentColors.primary }]}>
            {connectionIntent === "romantic" ? "Dating" 
             : connectionIntent === "friendship" ? "Friendship"
             : connectionIntent === "both" ? "Both"
             : "Open"}
          </Text>
        </View>
      </View>

      {/* Connection type description */}
      <Text style={[styles.connectionDescription, fonts.spiritualBodyFont, { color: intentColors.accent }]}>
        {getConnectionTypeDisplay(connectionIntent)}
      </Text>

      {/* Handle case when no photos */}
      {photoUrls.length === 0 && (
        <View style={styles.noPhotosContainer}>
          <View style={[styles.noPhotosIcon, { backgroundColor: intentColors.secondary }]}>
            <Ionicons name="camera-outline" size={40} color={intentColors.primary} />
          </View>
          <Text style={[styles.noPhotosText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
            No photos to preview
          </Text>
        </View>
      )}

      {/* Render organized content - interleaved photos and info cards */}
      {organizedContent.map((item, index) => (
        <View key={`content-${index}`}>
          {item.type === 'photo' && item.uri && renderPhotoWithDetail(item.uri, item.index)}
        </View>
      ))}

      {/* Footer spacing */}
      <View style={styles.footerSpacing} />
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
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  topName: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    flex: 1,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  connectionBadgeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginLeft: Spacing.xs,
  },
  connectionDescription: {
    fontSize: Typography.sizes.base,
    fontStyle: 'italic',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  photoCard: {
    marginBottom: Spacing.xl,
  },
  photo: {
    width: Dimensions.get("window").width - (Spacing.lg * 2),
    height: 400,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  detailCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  detailTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  detailText: {
    fontSize: Typography.sizes.base,
    lineHeight: Typography.sizes.base * 1.4,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  pillText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    // borderRadius: BorderRadius.md,
    // borderWidth: 1,
    backgroundColor: 'transparent',
  },
  seeMoreText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginRight: Spacing.xs,
  },
  infoSection: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.sizes.lg,
    fontStyle: 'italic',
    fontWeight: Typography.weights.medium,
  },
  noPhotosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  noPhotosIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  noPhotosText: {
    fontSize: Typography.sizes.lg,
    fontStyle: 'italic',
  },
  footerSpacing: {
    height: Spacing.xl,
  },
});

export default ProfilePreview;