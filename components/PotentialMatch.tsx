import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  useColorScheme,
  Image,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { CustomIcon } from "@/components/CustomIcon"; // Import your CustomIcon component
import InfoCard from "@/components/InfoCard";
import { useUserContext, UserDataType } from "@/context/UserContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import { getSpiritualDrawLabels } from "@/constants/spiritualMappings"

const { width: screenWidth } = Dimensions.get("window");
const IMAGE_MARGIN = Spacing.xl;
const MAX_PHOTO_SIZE = screenWidth - IMAGE_MARGIN;

type Props = {
  currentPotentialMatch: UserDataType;
  currentUserData?: UserDataType; // Add current user data for comparison
  isMatched?: boolean;
  onPhotosLoaded?: () => void;
  getCachedPhotos?: (userId: string) => string[] | null; // 🆕 PHOTO CACHING: Optional prop for cached photos
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
  return 'Location not shared';
};

// Icon renderer function
const renderIcon = (iconName: string, iconType: string, size: number, color: string) => {
  if (iconType === "custom") {
    return <CustomIcon name={iconName} size={size} color={color} />;
  } else {
    return <Ionicons name={iconName as any} size={size} color={color} />;
  }
};

// Get connection intent colors and styling
const getConnectionIntentColors = (intent: string) => {
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

// Get connection intent icon with custom icons for spiritual concepts
const getConnectionIntentIcon = (intent: string) => {
  switch (intent) {
    case "romantic":
      return { name: "heart", iconType: "ionicon" };
    case "friendship":
      return { name: "friendship", iconType: "custom" }; // Custom friendship icon
    case "both":
      return { name: "infinity", iconType: "custom" }; // Custom infinite energy icon
    default:
      return { name: "sparkles", iconType: "ionicon" };
  }
};

// Get what they're looking for text
const getConnectionIntentText = (user: UserDataType) => {
  const intent = user.matchPreferences?.connectionIntent || "romantic";
  const preferences = user.matchPreferences?.connectionPreferences || user.matchPreferences?.datePreferences || [];
  
  let baseText = "";
  switch (intent) {
    case "romantic":
      baseText = "Looking for romance";
      break;
    case "friendship":
      baseText = "Looking for friendship";
      break;
    case "both":
      baseText = "Open to romance & friendship";
      break;
    default:
      baseText = "Open to connections";
  }
  
  if (preferences.length > 0) {
    baseText += ` with ${preferences.join(", ")}`;
  }
  
  return baseText;
};

// Helper function to find shared spiritual items
const findSharedSpiritualItems = (currentUser: UserDataType | undefined, potentialMatch: UserDataType) => {
  if (!currentUser?.spiritualProfile) return { practices: [], healingModalities: [], draws: [] };
  
  const shared = {
    practices: [] as string[],
    healingModalities: [] as string[],
    draws: [] as string[]
  };
  
  // Compare spiritual practices
  if (currentUser.spiritualProfile.practices && potentialMatch.spiritualProfile?.practices) {
    shared.practices = currentUser.spiritualProfile.practices.filter(practice => 
      potentialMatch.spiritualProfile?.practices?.includes(practice)
    );
  }
  
  // Compare healing modalities
  if (currentUser.spiritualProfile.healingModalities && potentialMatch.spiritualProfile?.healingModalities) {
    shared.healingModalities = currentUser.spiritualProfile.healingModalities.filter(modality => 
      potentialMatch.spiritualProfile?.healingModalities?.includes(modality)
    );
  }
  
  // Compare spiritual draws
  if (currentUser.spiritualProfile.draws && potentialMatch.spiritualProfile?.draws) {
    shared.draws = currentUser.spiritualProfile.draws.filter(draw => 
      potentialMatch.spiritualProfile?.draws?.includes(draw)
    );
  }
  
  return shared;
};

// Generate organized info cards for interleaving with photos
const generateInfoCards = (user: UserDataType, sharedItems: any) => {
  const cards = [];
  const connectionColors = getConnectionIntentColors(user.matchPreferences?.connectionIntent || "romantic");

  // 1. Basic Demographics with custom icons for spiritual elements
  const age = user.age;
  const location = getLocation(user);
  const warmNeutral = '#8B7355'; // Warm brown-gray color for all basic info
  
  const basicItems = [
    { icon: "cake", iconType: "custom", text: age ? `${age}` : "Age not shared", color: warmNeutral },
    { icon: "swap-vertical-outline", text: user.height ? `${user.height}` : "Height not shared", color: warmNeutral },
    { icon: "temple", iconType: "custom", text: location, color: warmNeutral } // Custom location icon
  ];
  
  // Add identity to basic info if available
  if (user.gender && user.gender.length > 0) {
    basicItems.push({ icon: "person-outline", iconType: "ionicon", text: user.gender.join(", "), color: warmNeutral });
  }
  
  cards.push({
    title: "", // No title for basic info
    items: basicItems,
    type: 'basic-info'
  });

  // 2. Connection Styles using InfoCard with custom heart icon
  // Removed as it's not essential UI/UX - connection intent is already shown in header

  // 3. Spiritual Practices using InfoCard with custom lotus icon
  if (user.spiritualProfile?.practices && user.spiritualProfile.practices.length > 0) {
    // Filter out meaningless placeholder values like "Open to All"
    const meaningfulPractices = user.spiritualProfile.practices.filter(practice => 
      practice !== "Open to All" && practice.trim() !== ""
    );
    
    if (meaningfulPractices.length > 0) {
      const hasShared = sharedItems.practices.length > 0;
      cards.push({
        title: "Spiritual Practices",
        content: meaningfulPractices.slice(0, 3).join(", "),
        icon: "meditation",
        iconType: "custom",
        pillsData: meaningfulPractices,
        color: '#059669',
        type: 'info-card',
        sharedItems: sharedItems.practices,
        hasShared
      });
    }
  }

  // 4. Healing Modalities using InfoCard with custom healing hands icon
  if (user.spiritualProfile?.healingModalities && user.spiritualProfile.healingModalities.length > 0) {
    // Filter out meaningless placeholder values like "Open to All"
    const meaningfulModalities = user.spiritualProfile.healingModalities.filter(modality => 
      modality !== "Open to All" && modality.trim() !== ""
    );
    
    if (meaningfulModalities.length > 0) {
      const hasShared = sharedItems.healingModalities.length > 0;
      cards.push({
        title: "Healing Path",
        content: meaningfulModalities.slice(0, 3).join(", "),
        icon: "yinyang", // Custom healing hands icon
        iconType: "custom",
        pillsData: meaningfulModalities,
        color: '#0891B2', // Cyan for healing
        type: 'info-card',
        sharedItems: sharedItems.healingModalities,
        hasShared
      });
    }
  }

  // 5. Spiritual Draws using InfoCard with custom spiritual energy icon
  if (user.spiritualProfile?.draws && user.spiritualProfile.draws.length > 0) {
    // Filter out meaningless placeholder values like "Open to All"
    const meaningfulDraws = user.spiritualProfile.draws.filter(draw => 
      draw !== "Open to All" && draw.trim() !== ""
    );
    
    if (meaningfulDraws.length > 0) {
      const spiritualDrawLabels = getSpiritualDrawLabels(meaningfulDraws);
      const hasShared = sharedItems.draws.length > 0;
      
      cards.push({
        title: "Spiritual Draws",
        content: spiritualDrawLabels.slice(0, 3).join(", "),
        icon: "ohm", // Custom spiritual energy icon
        iconType: "custom",
        pillsData: spiritualDrawLabels,
        color: '#DC2626', // Red for draws
        type: 'info-card',
        sharedItems: sharedItems.draws,
        hasShared
      });
    }
  }

  return cards;
};

const PotentialMatch: React.FC<Props> = ({
  currentPotentialMatch,
  currentUserData,
  isMatched = false,
  onPhotosLoaded,
  getCachedPhotos,
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
        // 🆕 PHOTO CACHING: Check if photos are already cached
        const cachedPhotos = getCachedPhotos?.(currentPotentialMatch.userId);
        
        if (cachedPhotos && cachedPhotos.length > 0) {
          // 🚀 INSTANT: Use cached photos for immediate display
          console.log('📸 Using cached photos for:', currentPotentialMatch.firstName);
          setPhotoUrls(cachedPhotos);
          setIsPhotoLoading(false);
          onPhotosLoaded?.();
          return;
        }
        
        // 📥 FALLBACK: Load photos normally if not cached
        console.log('📥 Loading photos for:', currentPotentialMatch.firstName);
        const urls = await Promise.all(
          currentPotentialMatch.photos.map((path: string) => getImageUrl(path))
        );
        setPhotoUrls(urls.filter((u): u is string => !!u));
      }
      setIsPhotoLoading(false);
      onPhotosLoaded?.();
    };
    fetchAll();
  }, [currentPotentialMatch, getImageUrl, onPhotosLoaded, getCachedPhotos]);

  if (isPhotoLoading) return null;

  // Find shared spiritual items
  const sharedItems = findSharedSpiritualItems(currentUserData, currentPotentialMatch);
  const infoCards = generateInfoCards(currentPotentialMatch, sharedItems);
  const connectionColors = getConnectionIntentColors(currentPotentialMatch.matchPreferences?.connectionIntent || "romantic");
  const connectionIcon = getConnectionIntentIcon(currentPotentialMatch.matchPreferences?.connectionIntent || "romantic");
  
  const styles = createStyles(colors, fonts, connectionColors);

  // Render pills with proper styling and highlighting for shared items
  const renderPills = (items: string[], color: string, sharedItems: string[] = []) => (
    <View style={styles.pillsContainer}>
      {/* Show shared items first */}
      {items
        .slice(0, 6)
        .filter(item => sharedItems.includes(item))
        .map((item, index) => (
          <View key={`shared-${index}`} style={[
            styles.pill, 
            { 
              backgroundColor: color + '40',
              borderColor: color,
              borderWidth: 2,
              shadowColor: color,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }
          ]}>
            <Text style={[
              styles.pillText, 
              { 
                color: color,
                fontWeight: Typography.weights.bold
              }
            ]}>
              {item}
            </Text>
          </View>
        ))}
      
      {/* Then show non-shared items */}
      {items
        .slice(0, 6)
        .filter(item => !sharedItems.includes(item))
        .map((item, index) => (
          <View key={`non-shared-${index}`} style={[
            styles.pill, 
            { 
              backgroundColor: color + '15',
              borderColor: color + '30',
              borderWidth: 1,
              shadowColor: 'transparent',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0,
              shadowRadius: 0,
              elevation: 0,
            }
          ]}>
            <Text style={[
              styles.pillText, 
              { 
                color: colors.textMuted,
                fontWeight: Typography.weights.medium
              }
            ]}>
              {item}
            </Text>
          </View>
        ))}
      {items.length > 6 && (
        <View style={[styles.pill, styles.morePill, { 
          backgroundColor: color + '10',
          borderColor: color + '20'
        }]}>
          <Text style={[styles.pillText, { color: color, opacity: 0.7 }]}>
            +{items.length - 6} more
          </Text>
        </View>
      )}
    </View>
  );

  // Render basic info items with custom icons
  const renderBasicInfo = (items: any[]) => (
    <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
      <View style={styles.basicInfoColumn}>
        {items.map((item, index) => (
          <View key={index} style={styles.basicInfoItem}>
            {renderIcon(item.icon, item.iconType, 18, item.color)}
            <Text style={[styles.basicInfoText, { color: colors.textLight }]}>
              {item.text}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  // Render info card based on type
  const renderInfoCard = (card: any) => {
    // For basic info, render without a container (no title)
    if (card.type === 'basic-info') {
      return renderBasicInfo(card.items);
    }
    
    // For InfoCard compatible items, use the InfoCard component with custom colors
    if (card.type === 'info-card') {
      return (
        <InfoCardWithColor
          title={card.title}
          content={card.content}
          icon={card.icon}
          iconType={card.iconType}
          pillsData={card.pillsData}
          customColor={card.color}
          sharedItems={card.sharedItems}
          hasShared={card.hasShared}
        />
      );
    }
    
    return null;
  };

  // Custom InfoCard component that accepts color override and icon type
  const InfoCardWithColor: React.FC<{
    title: string;
    content: string;
    icon: string;
    iconType?: string;
    pillsData: string[];
    customColor?: string;
    sharedItems?: string[];
    hasShared?: boolean;
  }> = ({ title, content, icon, iconType = "ionicon", pillsData, customColor, sharedItems = [], hasShared = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldTruncate = pillsData.length > 4 || content.length > 120;
    const canExpand = shouldTruncate;
    const cardColor = customColor || colors.primary;

    const renderContent = () => {
      if (pillsData.length > 0) {
        const displayItems = isExpanded ? pillsData : pillsData.slice(0, 4);
        const hasMore = pillsData.length > 4;
        
        return (
          <View>
            {/* Shared items indicator */}
            {hasShared && (
              <View style={styles.sharedIndicator}>
                <Text style={[styles.sharedText, { color: colors.textMuted }]}>
                  • {sharedItems.length} shared
                </Text>
              </View>
            )}
            
            <View style={styles.pillsContainer}>
              {/* Show shared items first */}
              {displayItems
                .filter(item => sharedItems.includes(item))
                .map((item, index) => (
                  <View key={`shared-${index}`} style={[
                    styles.pill, 
                    { 
                      backgroundColor: cardColor + '40',
                      borderColor: cardColor,
                      borderWidth: 2,
                      shadowColor: cardColor,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 4,
                    }
                  ]}>
                    <Text style={[
                      styles.pillText, 
                      { 
                        color: cardColor,
                        fontWeight: Typography.weights.bold
                      }
                    ]}>
                      {item}
                    </Text>
                  </View>
                ))}
              
              {/* Then show non-shared items */}
              {displayItems
                .filter(item => !sharedItems.includes(item))
                .map((item, index) => (
                  <View key={`non-shared-${index}`} style={[
                    styles.pill, 
                    { 
                      backgroundColor: cardColor + '20',
                      borderColor: cardColor + '30',
                      borderWidth: 1,
                      shadowColor: 'transparent',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0,
                      shadowRadius: 0,
                      elevation: 0,
                    }
                  ]}>
                    <Text style={[
                      styles.pillText, 
                      { 
                        color: colors.textMuted,
                        fontWeight: Typography.weights.medium
                      }
                    ]}>
                      {item}
                    </Text>
                  </View>
                ))}
              {hasMore && !isExpanded && (
                <TouchableOpacity 
                  style={[styles.pill, {
                    backgroundColor: cardColor + '15',
                    borderColor: cardColor + '30'
                  }]}
                  onPress={() => setIsExpanded(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, { color: cardColor, fontStyle: 'italic' }]}>
                    +{pillsData.length - 4} more
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      }

      return (
        <Text style={{ color: colors.textLight }}>
          {content}
        </Text>
      );
    };

    return (
      <TouchableOpacity 
        style={[styles.infoCard, { backgroundColor: colors.card }]}
        onPress={() => canExpand && setIsExpanded(!isExpanded)}
        activeOpacity={canExpand ? 0.95 : 1}
        disabled={!canExpand}
      >
        <View style={styles.infoHeader}>
          <View style={[styles.iconContainer, { backgroundColor: cardColor + '15' }]}>
            {renderIcon(icon, iconType, 28, cardColor)}
          </View>
          <Text style={[styles.infoTitle, { color: colors.textDark }]}>
            {title}
          </Text>
          {canExpand && (
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.textMuted}
            />
          )}
        </View>
        
        <View>
          {renderContent()}
        </View>

        {isExpanded && (
          <TouchableOpacity 
            onPress={() => setIsExpanded(false)}
            activeOpacity={0.7}
          >
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  // Create content array - FIXED: properly sprinkle InfoCards between photos
  const createContent = () => {
    const content = [];
    const totalPhotos = photoUrls.length;
    
    // Separate the basic info from InfoCard items
    const basicInfoCard = infoCards.find(card => card.type === 'basic-info');
    const infoCardItems = infoCards.filter(card => card.type === 'info-card');

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

    // Now properly distribute remaining photos and InfoCards
    // Rule: Always add a photo before each InfoCard (if photos available)
    for (let i = 0; i < infoCardItems.length; i++) {
      // Add photo before InfoCard if available
      if (photoIndex < totalPhotos) {
        content.push({
          type: 'photo',
          uri: photoUrls[photoIndex],
          index: photoIndex
        });
        photoIndex++;
      }

      // Then add the InfoCard
      content.push({
        type: 'info',
        card: infoCardItems[i],
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

  const content = createContent();

  return (
    <View style={styles.container}>
      {/* Header with name and verification */}
      {!isMatched && (
        <View style={styles.headerContainer}>
          {/* Name Row */}
          <View style={styles.nameRow}>
            <Text style={[styles.userName, { color: colors.textDark }]}>
              {currentPotentialMatch.firstName}
            </Text>
          </View>
          
          {/* Verification Status */}
          <View style={styles.verificationContainer}>
            <Ionicons 
              name={currentPotentialMatch.settings?.isSelfieVerified ? "checkmark-circle" : "checkmark-circle-outline"} 
              size={16} 
              color={currentPotentialMatch.settings?.isSelfieVerified ? '#8B4513' : colors.textMuted} 
            />
            <Text style={[styles.verificationText, { 
              color: currentPotentialMatch.settings?.isSelfieVerified ? '#8B4513' : colors.textMuted 
            }]}>
              {currentPotentialMatch.settings?.isSelfieVerified ? 'Verified' : 'Not verified'}
            </Text>
          </View>

          {/* Connection Intent Description with custom icons */}
          <View style={styles.connectionIntentRow}>
            {renderIcon(connectionIcon.name, connectionIcon.iconType, 26, connectionColors.primary)}
            <Text style={[styles.connectionIntentDescription, { color: connectionColors.primary }]}>
              {currentPotentialMatch.matchPreferences?.connectionIntent === "romantic" ? "Looking for romantic connections" 
               : currentPotentialMatch.matchPreferences?.connectionIntent === "friendship" ? "Looking for meaningful friendships"
               : currentPotentialMatch.matchPreferences?.connectionIntent === "both" ? "Open to romance and friendship"
               : "Open to meaningful connections"}
            </Text>
          </View>

          <View style={[styles.headerDivider, { backgroundColor: connectionColors.primary }]} />
        </View>
      )}

      {/* Interleaved Photos and Info Cards */}
      {content.map((item, index) => (
        <View key={index} style={styles.contentSection}>
          {item.type === 'photo' && (
            <View style={styles.photoContainer}>
              <Image
                source={{ uri: item.uri }}
                style={styles.photo}
              />
            </View>
          )}
          
          {item.type === 'info' && (
            <View style={styles.infoWrapper}>
              {renderInfoCard(item.card)}
            </View>
          )}
        </View>
      ))}

      {/* Handle case when no photos - with custom camera icon */}
      {photoUrls.length === 0 && (
        <View style={styles.noPhotosContainer}>
          <View style={[styles.noPhotosIcon, { backgroundColor: connectionColors.secondary }]}>
            {renderIcon("camera-spiritual", "custom", 40, connectionColors.primary)}
          </View>
          <Text style={[styles.noPhotosText, { color: colors.textMuted }]}>
            No photos to preview
          </Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: any, fonts: any, connectionColors: any) => StyleSheet.create({
  container: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
  
  headerContainer: {
    alignItems: "flex-start", // Left aligned as requested
    marginBottom: Spacing.xl,
    width: "100%",
  },
  
  nameRow: {
    width: '100%',
    marginBottom: Spacing.sm,
  },
  
  userName: {
    ...fonts.spiritualLargeTitleFont,
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    textAlign: "left",
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
  
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  
  verificationText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginLeft: Spacing.xs,
  },
  
  headerDivider: {
    width: 60,
    height: 2,
    borderRadius: BorderRadius.full,
  },
  
  contentSection: {
    marginBottom: Spacing.xl,
    width: "100%",
    alignItems: "center",
  },
  
  photoContainer: {
    alignItems: "center",
    width: MAX_PHOTO_SIZE,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  
  photo: {
    width: MAX_PHOTO_SIZE,
    height: MAX_PHOTO_SIZE * 1.2,
    borderRadius: BorderRadius.xl,
  },
  
  infoCard: {
    width: '100%',
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
  
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  
  infoTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
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
    justifyContent: 'flex-start',
  },
  
  basicInfoText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    textAlign: 'left',
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
  
  morePill: {
    opacity: 0.7,
  },
  
  pillText: {
    fontSize: Typography.sizes.sm,
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
  
  infoWrapper: {
    width: '100%',
  },

  sharedIndicator: {
    marginBottom: Spacing.sm,
    paddingHorizontal: 0,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignSelf: 'flex-start',
  },

  sharedText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.regular,
    textAlign: 'left',
    opacity: 0.6,
  },
});

export default PotentialMatch;