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
import { CustomIcon } from "@/components/CustomIcon";
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
    // Filter out various forms of "unknown" values
    const isUnknown = (value: string) => {
      if (!value) return true;
      const lowerValue = value.toLowerCase();
      return lowerValue === 'unknown' || lowerValue === 'none' || lowerValue === 'n/a' || lowerValue === '';
    };
    
    const city = user.location?.city && !isUnknown(user.location.city) ? user.location.city : null;
    const region = user.location?.region && !isUnknown(user.location.region) ? user.location.region : null;
    const regionName = user.regionName && !isUnknown(user.regionName) ? user.regionName : null;
    
    // Debug logging
    console.log('Location debug:', {
      city: user.location?.city,
      region: user.location?.region,
      regionName: user.regionName,
      filteredCity: city,
      filteredRegion: region,
      filteredRegionName: regionName
    });
    
    if (city && region) {
      return `${city}, ${region}`;
    } else if (city) {
      return city;
    } else if (regionName) {
      return regionName;
    } else if (region) {
      return region;
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

  // Create organized info sections similar to PotentialMatch
  const createInfoSections = () => {
    const sections = [];
    const warmNeutral = '#8B7355'; // Warm brown-gray color for all basic info

    // Helper function to check if a field is hidden
    const isFieldHidden = (fieldName: string) => {
      return userData.hiddenFields?.[fieldName] === true;
    };

    // Helper function to format height properly (feet and inches)
    const formatHeight = (height: number): string => {
      const feet = Math.floor(height);
      const inches = Math.round((height - feet) * 12);
      return `${feet}'${inches}"`;
    };

    // 1. Basic Demographics (About Me) - similar to PotentialMatch
    const age = !isFieldHidden('age') && userData.age ? userData.age : null;
    const location = !isFieldHidden('location') ? getLocation(userData) : null;
    const height = !isFieldHidden('height') && userData.height ? formatHeight(userData.height) : null;
    
    const basicItems = [];
    
    // Only add items that aren't hidden and have valid data
    if (age) {
      basicItems.push({ icon: "cake", iconType: "custom", text: age, color: warmNeutral });
    }
    if (height) {
      basicItems.push({ icon: "swap-vertical-outline", iconType: "ionicon", text: height, color: warmNeutral });
    }
    if (location) {
      basicItems.push({ icon: "temple", iconType: "custom", text: location, color: warmNeutral });
    }
    
    // Add gender identity if available and not hidden
    if (!isFieldHidden('gender') && userData.gender && userData.gender.length > 0) {
      basicItems.push({ 
        icon: "person-outline", 
        iconType: "ionicon", 
        text: userData.gender.join(", "), 
        color: warmNeutral 
      });
    }
    
    // Only add basic info section if we have items to show
    if (basicItems.length > 0) {
      sections.push({
        type: 'basic-info',
        items: basicItems
      });
    }

    // 2. Spiritual Practices using custom meditation icon
    if (!isFieldHidden('spiritualPractices') && userData.spiritualProfile?.practices && userData.spiritualProfile.practices.length > 0) {
      const meaningfulPractices = userData.spiritualProfile.practices.filter(practice => 
        practice !== "Open to All" && practice.trim() !== ""
      );
      
      if (meaningfulPractices.length > 0) {
        sections.push({
          type: 'info-card',
          title: "Spiritual Practices",
          content: meaningfulPractices.slice(0, 3).join(", "),
          icon: "meditation",
          iconType: "custom",
          pillsData: meaningfulPractices,
          color: '#059669',
          key: 'practices'
        });
      }
    }

    // 3. Healing Modalities using custom yinyang icon
    if (!isFieldHidden('healingModalities') && userData.spiritualProfile?.healingModalities && userData.spiritualProfile.healingModalities.length > 0) {
      const meaningfulModalities = userData.spiritualProfile.healingModalities.filter(modality => 
        modality !== "Open to All" && modality.trim() !== ""
      );
      
      if (meaningfulModalities.length > 0) {
        sections.push({
          type: 'info-card',
          title: "Healing Path",
          content: meaningfulModalities.slice(0, 3).join(", "),
          icon: "yinyang",
          iconType: "custom",
          pillsData: meaningfulModalities,
          color: '#0891B2',
          key: 'healing'
        });
      }
    }

    // 4. Spiritual Draws using custom ohm icon
    if (!isFieldHidden('spiritualDraws') && userData.spiritualProfile?.draws && userData.spiritualProfile.draws.length > 0) {
      const meaningfulDraws = userData.spiritualProfile.draws.filter(draw => 
        draw !== "Open to All" && draw.trim() !== ""
      );
      
      if (meaningfulDraws.length > 0) {
        sections.push({
          type: 'info-card',
          title: "Spiritual Draws",
          content: meaningfulDraws.slice(0, 3).join(", "),
          icon: "ohm",
          iconType: "custom",
          pillsData: meaningfulDraws,
          color: '#DC2626',
          key: 'draws'
        });
      }
    }

    return sections;
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

  // Create organized content array - exactly like PotentialMatch
  const createOrganizedContent = () => {
    const content = [];
    const infoSections = createInfoSections();
    const totalPhotos = photoUrls.length;
    
    // Separate the basic info from other info items
    const basicInfoCard = infoSections.find(section => section.type === 'basic-info');
    const otherInfoItems = infoSections.filter(section => section.type === 'info-card');

    let photoIndex = 0;

    // Always start with first photo if available
    if (photoIndex < totalPhotos) {
      content.push({
        type: 'photo',
        uri: photoUrls[photoIndex],
        index: photoIndex
      });
      photoIndex++;
    }

    // Add basic info after first photo
    if (basicInfoCard) {
      content.push({
        type: 'info',
        card: basicInfoCard,
        index: 'basic-info'
      });
    }

    // Now properly distribute remaining photos and info cards
    // Rule: Always add a photo before each info card (if photos available)
    for (let i = 0; i < otherInfoItems.length; i++) {
      // Add photo before info card if available
      if (photoIndex < totalPhotos) {
        content.push({
          type: 'photo',
          uri: photoUrls[photoIndex],
          index: photoIndex
        });
        photoIndex++;
      }

      // Then add the info card
      content.push({
        type: 'info',
        card: otherInfoItems[i],
        index: `info-card-${i}`
      });
    }

    // Add any remaining photos at the end
    while (photoIndex < totalPhotos) {
      content.push({
        type: 'photo',
        uri: photoUrls[photoIndex],
        index: photoIndex
      });
      photoIndex++;
    }

    return content;
  };

  const renderInfoCard = (section: any) => {
    // For basic info, render without a container (no title) like PotentialMatch
    if (section.type === 'basic-info') {
      return (
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <View style={styles.basicInfoColumn}>
            {section.items.map((item: any, index: number) => (
              <View key={index} style={styles.basicInfoItem}>
                {item.iconType === "custom" ? (
                  <CustomIcon name={item.icon} size={18} color={item.color} />
                ) : (
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                )}
                <Text style={[styles.basicInfoText, { color: colors.textLight }]}>
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      );
    }
    
    // For info cards with titles
    return (
      <View style={[styles.infoSection, { backgroundColor: colors.card }]}>
        <View style={styles.detailHeader}>
          <View style={[styles.iconContainer, { backgroundColor: section.color + '15' }]}>
            {section.iconType === "custom" ? (
              <CustomIcon name={section.icon} size={18} color={section.color} />
            ) : (
              <Ionicons name={section.icon as any} size={18} color={section.color} />
            )}
          </View>
          <Text style={[styles.detailTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
            {section.title}
          </Text>
        </View>

        {section.pillsData && Array.isArray(section.pillsData) ? 
          renderPillsSection(section.pillsData, section.color, section.key) : (
          <Text style={[styles.detailText, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            {section.content}
          </Text>
        )}
      </View>
    );
  };

  const renderPhotoWithDetail = (uri: string, index: number) => {
    // For photos, we'll show them without additional details since info is in separate cards
    return (
      <View style={styles.photoCard}>
        <Image source={{ uri }} style={styles.photo} />
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
      {/* Header with name and connection intent - similar to PotentialMatch */}
      <View style={styles.headerContainer}>
        {/* Name Row */}
        <View style={styles.nameRow}>
          <Text
            style={[
              styles.topName, 
              fonts.spiritualLargeTitleFont,
              { color: colors.textDark }
            ]}
          >
            {userData.firstName}
          </Text>
        </View>
        
        {/* Connection Intent Description with icon */}
        <View style={styles.connectionIntentRow}>
          <Ionicons 
            name={connectionIntent === "romantic" ? "heart" 
                 : connectionIntent === "friendship" ? "people" 
                 : connectionIntent === "both" ? "infinite"
                 : "sparkles"} 
            size={26} 
            color={intentColors.primary} 
          />
          <Text style={[styles.connectionIntentDescription, { color: intentColors.primary }]}>
            {getConnectionTypeDisplay(connectionIntent)}
          </Text>
        </View>

        <View style={[styles.headerDivider, { backgroundColor: intentColors.primary }]} />
      </View>

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
          {item.type === 'info' && renderInfoCard(item.card)}
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
    alignItems: "flex-start", // Left aligned like PotentialMatch
    marginBottom: Spacing.xl,
    width: "100%",
  },
  
  nameRow: {
    width: '100%',
    marginBottom: Spacing.sm,
  },
  
  connectionIntentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: Spacing.xs,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  
  connectionIntentDescription: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    fontStyle: 'italic',
    flex: 1,
  },
  
  headerDivider: {
    width: 60,
    height: 2,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  
  topName: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    flex: 1,
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
  
  infoCard: {
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
  
  basicInfoColumn: {
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'flex-start',
    width: '100%',
  },
  
  basicInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    width: '100%',
  },
  
  basicInfoText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
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