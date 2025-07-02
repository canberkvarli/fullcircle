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

  // Helper function to calculate age if not provided
  const calculateAge = (user: UserDataType) => {
    if (user.birthyear) {
      return new Date().getFullYear() - parseInt(user.birthyear);
    }
    if (user.age) return user.age;
    return 'Age unknown';
  };

  // Create meaningful details based on current user data
  const getDetailsForPhoto = (index: number) => {
    const detailOptions = [
      {
        title: "Basic Info",
        content: `${userData.age || calculateAge(userData)} • ${getLocation(userData)}`,
        icon: "person"
      },
      {
        title: "Spiritual Practices",
        content: userData?.spiritualProfile?.practices?.length 
          ? userData.spiritualProfile.practices.slice(0, 3).join(", ")
          : 'Sacred practices not shared',
        icon: "sparkles"
      },
      {
        title: "Healing Modalities",
        content: userData?.spiritualProfile?.healingModalities?.length
          ? userData.spiritualProfile.healingModalities.slice(0, 3).join(", ")
          : 'Healing path not shared',
        icon: "heart"
      },
      {
        title: "Physical Details",
        content: userData.height ? `${userData.height} ft` : 'Height not shared',
        icon: "resize"
      },
      {
        title: "Sacred Connections",
        content: userData.matchPreferences?.datePreferences?.length
          ? userData.matchPreferences.datePreferences.join(", ")
          : 'Open to divine connections',
        icon: "heart-circle"
      },
      {
        title: "Spiritual Draws",
        content: userData?.spiritualProfile?.draws?.length
          ? userData.spiritualProfile.draws.slice(0, 3).join(", ")
          : 'Spiritual draws not shared',
        icon: "leaf"
      }
    ];

    return detailOptions[index] || detailOptions[0];
  };

  // Helper function to get array for pills display
  const getPillsArray = (detail: any) => {
    if (detail.title === "Spiritual Practices") {
      return userData.spiritualProfile?.practices || [];
    } else if (detail.title === "Healing Modalities") {
      return userData.spiritualProfile?.healingModalities || [];
    } else if (detail.title === "Spiritual Draws") {
      return userData.spiritualProfile?.draws || [];
    }
    return [];
  };

  const styles = createStyles(colors, fonts);

  if (loadingPhotos) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.loadingMandala, { backgroundColor: '#8B4513' + '10' }]}>
          <Ionicons name="heart" size={40} color="#8B4513" />
        </View>
        <Text style={[styles.loadingText, fonts.spiritualBodyFont, { color: '#8B4513' }]}>
          Loading Sacred Soul...
        </Text>
      </View>
    );
  }

  // Create all available info sections
  const createInfoSections = () => {
    const sections = [];

    // Additional standalone info sections
    if (userData.gender && userData.gender.length > 0) {
      sections.push({
        type: 'info',
        title: "Gender Identity",
        icon: "person-outline",
        content: userData.gender.join(", "),
        isPill: false
      });
    }

    if (userData.matchPreferences?.datePreferences && userData.matchPreferences.datePreferences.length > 0) {
      sections.push({
        type: 'info',
        title: "Seeking Connections With",
        icon: "heart-outline",
        content: userData.matchPreferences.datePreferences.join(", "),
        isPill: false
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
        <Ionicons name={section.icon as any} size={20} color="#8B4513" />
        <Text style={[styles.detailTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
          {section.title}
        </Text>
      </View>
      <Text style={[styles.detailText, fonts.spiritualBodyFont, { color: colors.textLight }]}>
        {section.content}
      </Text>
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
            <Ionicons name={detail.icon as any} size={20} color="#8B4513" />
            <Text style={[styles.detailTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              {detail.title}
            </Text>
          </View>
          
          {/* Enhanced content display */}
          {(detail.title === "Spiritual Practices" || 
            detail.title === "Healing Modalities" || 
            detail.title === "Spiritual Draws") && pillsArray.length > 0 ? (
            <View style={styles.pillsContainer}>
              {pillsArray.slice(0, 4).map((item: string, pillIndex: number) => (
                <View key={pillIndex} style={[styles.pill, { 
                  backgroundColor: '#8B4513' + '20',
                  borderColor: '#8B4513' + '40'
                }]}>
                  <Text style={[styles.pillText, fonts.spiritualBodyFont, { color: '#8B4513' }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.detailText, fonts.spiritualBodyFont, { 
              color: pillsArray.length === 0 && (detail.title === "Spiritual Practices" || 
                                                detail.title === "Healing Modalities" || 
                                                detail.title === "Spiritual Draws") 
                ? colors.textLight 
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
      <Text
        style={[
          styles.topName, 
          fonts.spiritualTitleFont,
          { color: colors.textDark }
        ]}
      >
        {userData.firstName}, {calculateAge(userData)}
      </Text>

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

const createStyles = (colors: any, fonts: any) => StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  topName: {
    marginLeft: Spacing.sm,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
  },
  photoCard: {
    marginBottom: Spacing.lg,
  },
  photo: {
    width: Dimensions.get("window").width - (Spacing.lg * 2),
    height: 400,
    borderRadius: 16,
    marginBottom: Spacing.md,
  },
  detailCard: {
    borderRadius: 12,
    padding: Spacing.xl,
    borderWidth: 1,
    position: "relative",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  detailTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginLeft: Spacing.sm,
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
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  infoSection: {
    borderRadius: 12,
    padding: Spacing.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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