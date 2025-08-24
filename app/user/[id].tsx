import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  Animated,
  unstable_batchedUpdates,
  useColorScheme,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useUserContext, UserDataType } from "@/context/UserContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import SlidingTabBar from "@/components/SlidingTabBar";
import { getSpiritualDrawLabels } from "@/constants/spiritualMappings";
import { CustomIcon } from "@/components/CustomIcon";

const HEADER_HEIGHT = 100;
const HEADER_FADE_START = 80;
const HEADER_FADE_END = 120;
const TAB_BAR_HEIGHT = 90;

const { width: screenWidth } = Dimensions.get("window");
const IMAGE_MARGIN = Spacing.xl;
const MAX_PHOTO_SIZE = screenWidth - IMAGE_MARGIN;

const UserShow: React.FC = () => {
  const router = useRouter();
  const { navigationData: navigationDataParam } = useLocalSearchParams();
  
  // Add proper error handling for JSON parsing
  let initialUser: UserDataType;
      let initialNavigationData: any = null;
    
    try {
      if (navigationDataParam && typeof navigationDataParam === 'string') {
        initialNavigationData = JSON.parse(navigationDataParam);
        initialUser = initialNavigationData.user;
      } else {
        // Fallback for direct navigation or other sources
        router.back();
        return null;
      }
    } catch (error) {
      console.error('❌ JSON parse error for navigation data:', error, 'navigationDataParam:', navigationDataParam);
      router.back();
      return null;
    }
  
  // Early return if initialUser is not valid
  if (!initialUser || !initialUser.userId) {
    console.error('❌ Invalid initial user data:', initialUser);
    router.back();
    return null;
  }
  
  const {
    getImageUrl,
    userData,
    likeMatch,
    dislikeMatch,
    subscribeToReceivedLikes,
  } = useUserContext();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  const [souls, setSouls] = useState<UserDataType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserDataType>(initialUser);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const lastLoadedPhotosFor = useRef<string | null>(null);
  const didSubscribe = useRef(false);
  
  // 🆕 FIX: Track the original order of users from Kindred Spirits
  const [originalOrder, setOriginalOrder] = useState<UserDataType[]>(initialNavigationData?.allUsers || []);
  const [currentPosition, setCurrentPosition] = useState(initialNavigationData?.currentIndex || 0);
  


  // Debug logging for originalOrder changes
  useEffect(() => {
    console.log('📋 Original order initialized with:', originalOrder.length, 'users');
    console.log('📍 Current position set to:', currentPosition);
    if (originalOrder.length > 0) {
      console.log('👤 First user in original order:', originalOrder[0]?.firstName);
      console.log('👤 Current user in original order:', originalOrder[currentPosition]?.firstName);
    }
  }, [originalOrder, currentPosition]);

  // Use consistent animation drivers - all useNativeDriver: true
  const scrollY = useRef(new Animated.Value(0)).current;
  const tabTranslateY = useRef(new Animated.Value(TAB_BAR_HEIGHT)).current;
  const lastY = useRef(0);

  useEffect(() => {
    if (!userData.userId) return;

    const unsub = subscribeToReceivedLikes((users) => {
      // swallow the first callback so we don't overwrite our nav param
      if (!didSubscribe.current) {
        didSubscribe.current = true;
        return;
      }

      // on real updates (someone new un‑likes or likes),
      // batch and update souls/currentUser/index:
      unstable_batchedUpdates(() => {
        setSouls(users);
        
        // 🆕 FIX: Initialize original order if this is the first time
        if (originalOrder.length === 0) {
          console.log('📋 Setting original order from subscription with', users.length, 'users');
          setOriginalOrder(users);
          // Find the current user's position in the new list
          const position = users.findIndex(u => u.userId === currentUser.userId);
          setCurrentPosition(position >= 0 ? position : 0);
          console.log('📍 Set current position to:', position >= 0 ? position : 0);
        } else {
          console.log('📋 Original order already set, not updating from subscription');
        }
        
        // Don't update currentUser here - let the navigation logic handle it
      });
    });

    return unsub;
  }, [userData.userId]);

  useEffect(() => {
    const id = currentUser.userId;
    if (!id || id === lastLoadedPhotosFor.current) {
      // same user → don't reload
      return;
    }
    lastLoadedPhotosFor.current = id;

    let active = true;
    setLoadingPhotos(true);

    (async () => {
      if (currentUser.photos?.length) {
        const urls = await Promise.all(
          currentUser.photos.map((p) => getImageUrl(p))
        );
        if (active) {
          setPhotoUrls(urls.filter((u): u is string => !!u));
        }
      } else {
        // Handle case where user has no photos
        setPhotoUrls([]);
      }
      if (active) setLoadingPhotos(false);
    })();

    return () => {
      active = false;
    };
  }, [currentUser.userId, getImageUrl]);

  const handleHeartPress = async () => {
    // Prevent rapid-fire interactions
    if (isProcessingAction) {
      console.log('⏳ Action already in progress, ignoring tap');
      return;
    }
    
    setIsProcessingAction(true);
    
    try {
      const likedId = currentUser.userId;
      
      console.log('❤️ Like pressed for:', currentUser.firstName);
      console.log('📍 Current position:', currentPosition);
      console.log('📋 Original order length:', originalOrder.length);
      
      // 🆕 SIMPLE FIX: Just use originalOrder directly
      let nextUser: UserDataType | null = null;
      
      if (originalOrder.length > 0) {
        const nextPosition = currentPosition + 1;
        if (nextPosition < originalOrder.length) {
          nextUser = originalOrder[nextPosition];
          setCurrentPosition(nextPosition);
          console.log('✅ Next user:', nextUser.firstName);
        }
      }

      // Always call likeMatch first
      await likeMatch(likedId);
      
      // Then show next user if available, otherwise go back
      if (nextUser) {
        setCurrentUser(nextUser);
      } else {
        console.log('🚪 No more users - going back');
        router.back();
      }
    } catch (error) {
      console.error('❌ Error in handleHeartPress:', error);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleDislikePress = async () => {
    // Prevent rapid-fire interactions
    if (isProcessingAction) {
      console.log('⏳ Action already in progress, ignoring tap');
      return;
    }
    
    setIsProcessingAction(true);
    
    try {
      const dislikedId = currentUser.userId;
      
      console.log('👎 Dislike pressed for:', currentUser.firstName);
      console.log('📍 Current position:', currentPosition);
      console.log('📋 Original order length:', originalOrder.length);
      
      // 🆕 SIMPLE FIX: Just use originalOrder directly
      let nextUser: UserDataType | null = null;
      
      if (originalOrder.length > 0) {
        const nextPosition = currentPosition + 1;
        if (nextPosition < originalOrder.length) {
          nextUser = originalOrder[nextPosition];
          setCurrentPosition(nextPosition);
          console.log('✅ Next user:', nextUser.firstName);
        }
      }

      // Always call dislikeMatch first
      await dislikeMatch(dislikedId);
      
      // Then show next user if available, otherwise go back
      if (nextUser) {
        setCurrentUser(nextUser);
      } else {
        console.log('🚪 No more users - going back');
        router.back();
      }
    } catch (error) {
      console.error('❌ Error in handleDislikePress:', error);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Helper functions (matching PotentialMatch)
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

  // Helper function to format height properly (feet and inches)
  const formatHeight = (height: number): string => {
    const feet = Math.floor(height);
    const inches = Math.round((height - feet) * 12);
    return `${feet}'${inches}"`;
  };

  // Helper function to find shared spiritual items (matching PotentialMatch)
  const findSharedSpiritualItems = (currentUser: UserDataType | undefined, potentialMatch: UserDataType) => {
    if (!currentUser?.spiritualProfile) return { practices: [], healingModalities: [], draws: [] };
    
    const shared = {
      practices: [] as string[],
      healingModalities: [] as string[],
      draws: [] as string[]
    };

    // Helper function to check if someone has "Open to All" selected
    const hasOpenToAll = (items: string[]) => items.includes("Open to All");
    
    // Compare spiritual practices
    if (currentUser.spiritualProfile.practices && potentialMatch.spiritualProfile?.practices) {
      const currentPractices = currentUser.spiritualProfile.practices;
      const matchPractices = potentialMatch.spiritualProfile.practices;
      
      // If either person has "Open to All", show the OTHER person's specific practices as shared
      if (hasOpenToAll(currentPractices)) {
        // You have "Open to All" - show their specific choices as shared
        shared.practices = matchPractices.filter(practice => practice !== "Open to All");
      } else if (hasOpenToAll(matchPractices)) {
        // They have "Open to All" - show their specific choices as shared (not all of yours!)
        shared.practices = matchPractices.filter(practice => practice !== "Open to All");
      } else {
        // Normal exact matching
        shared.practices = currentPractices.filter(practice => 
          matchPractices.includes(practice)
        );
      }
    }
    
    // Compare healing modalities
    if (currentUser.spiritualProfile.healingModalities && potentialMatch.spiritualProfile?.healingModalities) {
      const currentModalities = currentUser.spiritualProfile.healingModalities;
      const matchModalities = potentialMatch.spiritualProfile.healingModalities;
      
      // If either person has "Open to All", show the OTHER person's specific modalities as shared
      if (hasOpenToAll(currentModalities)) {
        // You have "Open to All" - show their specific choices as shared
        shared.healingModalities = matchModalities.filter(modality => modality !== "Open to All");
      } else if (hasOpenToAll(matchModalities)) {
        // They have "Open to All" - show their specific choices as shared (not all of yours!)
        shared.healingModalities = matchModalities.filter(modality => modality !== "Open to All");
      } else {
        // Normal exact matching
        shared.healingModalities = currentModalities.filter(modality => 
          matchModalities.includes(modality)
        );
      }
    }
    
    // Compare spiritual draws
    if (currentUser.spiritualProfile.draws && potentialMatch.spiritualProfile?.draws) {
      const currentDraws = currentUser.spiritualProfile.draws;
      const matchDraws = potentialMatch.spiritualProfile.draws;
      
      // If either person has "Open to All", show the OTHER person's specific choices as shared
      if (hasOpenToAll(currentDraws)) {
        // You have "Open to All" - show their specific choices as shared
        shared.draws = matchDraws.filter(draw => draw !== "Open to All");
      } else if (hasOpenToAll(matchDraws)) {
        // They have "Open to All" - show their specific choices as shared (not all of yours!)
        shared.draws = matchDraws.filter(draw => draw !== "Open to All");
      } else {
        // Normal exact matching
        shared.draws = currentDraws.filter(draw => 
          matchDraws.includes(draw)
        );
      }
    }
    
    return shared;
  };

  const connectionIntent = currentUser.matchPreferences?.connectionIntent || "romantic";
  const hasFullCircleSubscription = userData?.subscription?.isActive || false;

  // Get connection intent colors (restoring the dynamic colors based on intent)
  const getConnectionIntentColors = (intent: string) => {
    if (intent === "romantic") {
      return {
        primary: '#E11D48',
        secondary: '#FFF1F2',
        accent: '#BE123C',
        tertiary: '#FB7185',
      };
    } else if (intent === "friendship") {
      return {
        primary: '#059669',
        secondary: '#ECFDF5',
        accent: '#047857',
        tertiary: '#34D399',
      };
    } else if (intent === "both") {
      return {
        primary: '#7C3AED',
        secondary: '#F5F3FF',
        accent: '#6D28D9',
        tertiary: '#A78BFA',
      };
    } else {
      return {
        primary: '#0891B2',
        secondary: '#F0F9FF',
        accent: '#0E7490',
        tertiary: '#22D3EE',
      };
    }
  };

  const connectionColors = getConnectionIntentColors(connectionIntent);

  // Get connection intent icon with custom icons for spiritual concepts (matching PotentialMatch)
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

  // Icon renderer function (matching PotentialMatch)
  const renderIcon = (iconName: string, iconType: string, size: number, color: string) => {
    if (iconType === "custom") {
      return <CustomIcon name={iconName} size={size} color={color} />;
    } else {
      return <Ionicons name={iconName as any} size={size} color={color} />;
    }
  };

  // Generate organized info cards (matching PotentialMatch)
  const generateInfoCards = (user: UserDataType, sharedItems: any) => {
    const cards = [];
    const warmNeutral = '#8B7355';
    
    // Helper function to check if a field is hidden
    const isFieldHidden = (fieldName: string) => {
      return user.hiddenFields?.[fieldName] === true;
    };
    
    // 1. Basic Demographics
    const age = !isFieldHidden('age') && user.age;
    const location = !isFieldHidden('location') ? getLocation(user) : null;
    const height = !isFieldHidden('height') && user.height ? formatHeight(user.height) : null;
    
    const basicItems = [];
    
    // Only add items that aren't hidden and have valid data
    if (age) {
      basicItems.push({ icon: "calendar-outline", text: `${age}`, color: warmNeutral });
    }
    if (height) {
      basicItems.push({ icon: "swap-vertical-outline", text: height, color: warmNeutral });
    }
    if (location) {
      basicItems.push({ icon: "location-outline", text: location, color: warmNeutral });
    }
    
    // Add gender identity if available and not hidden
    if (!isFieldHidden('gender') && user.gender && user.gender.length > 0) {
      basicItems.push({ icon: "person-outline", text: user.gender.join(", "), color: warmNeutral });
    }
    
    // Only add basic info section if we have items to show
    if (basicItems.length > 0) {
      cards.push({
        title: "",
        items: basicItems,
        type: 'basic-info'
      });
    }

    // 2. Connection Styles
    if (!isFieldHidden('connectionStyles') && user.matchPreferences?.connectionStyles && user.matchPreferences.connectionStyles.length > 0) {
      cards.push({
        title: "Connection Style",
        content: "",
        icon: "heart-outline",
        pillsData: user.matchPreferences.connectionStyles,
        color: connectionColors.primary,
        type: 'info-card'
      });
    }

    // 3. Spiritual Practices
    if (!isFieldHidden('spiritualPractices') && user.spiritualProfile?.practices && user.spiritualProfile.practices.length > 0) {
      const hasShared = sharedItems.practices.length > 0;
      cards.push({
        title: "Spiritual Practices",
        content: user.spiritualProfile.practices.slice(0, 3).join(", "),
        icon: "meditation",
        iconType: "custom",
        pillsData: user.spiritualProfile.practices,
        color: '#059669',
        type: 'info-card',
        sharedItems: sharedItems.practices,
        hasShared
      });
    }

    // 4. Healing Modalities
    if (!isFieldHidden('healingModalities') && user.spiritualProfile?.healingModalities && user.spiritualProfile.healingModalities.length > 0) {
      const hasShared = sharedItems.healingModalities.length > 0;
      cards.push({
        title: "Healing Path",
        content: user.spiritualProfile.healingModalities.slice(0, 3).join(", "),
        icon: "yinyang",
        iconType: "custom",
        pillsData: user.spiritualProfile.healingModalities,
        color: '#0891B2',
        type: 'info-card',
        sharedItems: sharedItems.healingModalities,
        hasShared
      });
    }

    // 5. Spiritual Draws
    if (!isFieldHidden('spiritualDraws') && user.spiritualProfile?.draws && user.spiritualProfile.draws.length > 0) {
      const drawLabels = getSpiritualDrawLabels(user.spiritualProfile.draws);
      const hasShared = sharedItems.draws.length > 0;
      
      cards.push({
        title: "Spiritual Draws",
        content: drawLabels.slice(0, 3).join(", "), // UPDATED: Use labels instead of values
        icon: "ohm",
        iconType: "custom",
        pillsData: drawLabels, // UPDATED: Use labels instead of values
        pillsDataRaw: user.spiritualProfile.draws, // Raw values for shared item detection
        color: '#DC2626',
        type: 'info-card',
        sharedItems: sharedItems.draws,
        hasShared
      });
    }

    return cards;
  };

  // Create content array (matching PotentialMatch logic)
  const createContent = () => {
    const content = [];
    
    // Find shared spiritual items between current user and the profile being viewed
    const sharedItems = findSharedSpiritualItems(userData, currentUser);
    
    const infoCards = generateInfoCards(currentUser, sharedItems);
    const totalPhotos = photoUrls.length;
    
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

    // Distribute remaining photos and InfoCards
    for (let i = 0; i < infoCardItems.length; i++) {
      if (photoIndex < totalPhotos) {
        content.push({
          type: 'photo',
          uri: photoUrls[photoIndex],
          index: photoIndex
        });
        photoIndex++;
      }

      content.push({
        type: 'info',
        card: infoCardItems[i],
        index: `info-card-${i}`
      });
    }

    // Add any remaining photos
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

  // Render functions (matching PotentialMatch)
  const renderBasicInfo = (items: any[]) => (
    <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
      <View style={styles.basicInfoColumn}>
        {items.map((item, index) => (
          <View key={index} style={styles.basicInfoItem}>
            <Ionicons name={item.icon as any} size={18} color={item.color} />
            <Text style={[styles.basicInfoText, { color: colors.textLight }]}>
              {item.text}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const InfoCardWithColor: React.FC<{
    title: string;
    content: string;
    icon: string;
    iconType?: "ionicon" | "custom";
    pillsData: string[];
    pillsDataRaw?: string[]; // Raw values for shared item detection when pills show labels
    customColor?: string;
    sharedItems?: string[];
    hasShared?: boolean;
  }> = ({ title, content, icon, iconType = "ionicon", pillsData, pillsDataRaw, customColor, sharedItems = [], hasShared = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldTruncate = pillsData.length > 4 || content.length > 120;
    const canExpand = shouldTruncate;
    const cardColor = customColor || colors.primary;

    // Icon renderer function (matching PotentialMatch)
    const renderIcon = (iconName: string, iconType: string, size: number, color: string) => {
      if (iconType === "custom") {
        return <CustomIcon name={iconName} size={size} color={color} />;
      } else {
        return <Ionicons name={iconName as any} size={size} color={color} />;
      }
    };

    const renderContent = () => {
      if (pillsData.length > 0) {
        // If there are shared items, show ALL items (not just first 4)
        // This ensures users see the complete shared connection
        const shouldShowAll = hasShared && sharedItems.length > 0;
        const displayItems = isExpanded || shouldShowAll ? pillsData : pillsData.slice(0, 4);
        const hasMore = pillsData.length > 4 && !shouldShowAll;
        
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
              {/* Show shared items FIRST for prominence */}
              {displayItems
                .filter((item, index) => {
                  // Check if this item is shared using either pillsData or pillsDataRaw
                  const isShared = pillsDataRaw 
                    ? sharedItems.includes(pillsDataRaw[index]) // Use raw value for comparison
                    : sharedItems.includes(item); // Fallback to direct comparison
                  return isShared;
                })
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
                .filter((item, index) => {
                  // Check if this item is shared using either pillsData or pillsDataRaw
                  const isShared = pillsDataRaw 
                    ? sharedItems.includes(pillsDataRaw[index]) // Use raw value for comparison
                    : sharedItems.includes(item); // Fallback to direct comparison
                  return !isShared;
                })
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
                        fontWeight: Typography.weights.regular
                      }
                    ]}>
                      {item}
                    </Text>
                  </View>
                ))}
              
              {/* Show "more" button if needed */}
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

  const renderInfoCard = (card: any) => {
    if (card.type === 'basic-info') {
      return renderBasicInfo(card.items);
    }
    
    if (card.type === 'info-card') {
      return (
        <InfoCardWithColor
          title={card.title}
          content={card.content}
          icon={card.icon}
          iconType={card.iconType}
          pillsData={card.pillsData}
          pillsDataRaw={card.pillsDataRaw}
          customColor={card.color}
          sharedItems={card.sharedItems}
          hasShared={card.hasShared}
        />
      );
    }
    
    return null;
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [HEADER_FADE_START, HEADER_FADE_END],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  
  const leftNameOpacity = scrollY.interpolate({
    inputRange: [HEADER_FADE_START, HEADER_FADE_END],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (e: any) => {
        const y = e.nativeEvent.contentOffset.y;
        const dy = y - lastY.current;
        if (dy > 5) {
          Animated.timing(tabTranslateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else if (dy < -5) {
          Animated.timing(tabTranslateY, {
            toValue: TAB_BAR_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
        lastY.current = y;
      },
    }
  );

  const content = createContent();
  const styles = createStyles(colors, fonts, connectionColors);

  return (
    <SafeAreaView style={[styles.wrapper, { backgroundColor: colors.background }]}>
      {loadingPhotos && (
        <View style={[styles.loaderOverlay, { backgroundColor: colors.background }]}>
          <View style={[styles.loadingMandala, { backgroundColor: connectionColors.secondary }]}>
            {(() => {
              const iconInfo = getConnectionIntentIcon(connectionIntent);
              return renderIcon(iconInfo.name, iconInfo.iconType, 40, connectionColors.primary);
            })()}
          </View>
          <Text style={[styles.loadingText, fonts.spiritualBodyFont, { color: connectionColors.primary }]}>
            Loading Beautiful Soul...
          </Text>
        </View>
      )}

      {!loadingPhotos && (
        <>
          <Animated.View style={[
            styles.headerOverlay, 
            { backgroundColor: colors.background }
          ]}>
            <View style={styles.headerContent}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Ionicons name="chevron-back" size={24} color={colors.primary} />
                <Text style={[styles.backText, fonts.spiritualBodyFont, { color: colors.primary }]}>
                  Back
                </Text>
              </TouchableOpacity>

              <Animated.View 
                style={[
                  styles.centerNameContainer,
                  { opacity: headerOpacity }
                ]}
              >
                <Text
                  style={[
                    styles.centerName,
                    fonts.spiritualLargeTitleFont,
                    { color: colors.textDark }
                  ]}
                >
                  {currentUser.firstName}
                </Text>
              </Animated.View>
            </View>
          </Animated.View>

          <Animated.ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.container,
              { paddingBottom: TAB_BAR_HEIGHT + 20 },
            ]}
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            {/* Header section (matching PotentialMatch) */}
            <Animated.View style={{ opacity: leftNameOpacity }}>
              <View style={styles.headerContainer}>
                <View style={styles.nameRow}>
                  <Text style={[styles.userName, fonts.spiritualLargeTitleFont, { color: colors.textDark }]}>
                    {currentUser.firstName}
                  </Text>
                </View>
                
                <View style={styles.verificationContainer}>
                                      <Ionicons 
                      name={currentUser.settings?.selfieVerification?.isVerified ? "checkmark-circle" : "checkmark-circle-outline"} 
                      size={16} 
                      color={currentUser.settings?.selfieVerification?.isVerified ? '#8B4513' : colors.textMuted} 
                    />
                                         <Text style={[styles.verificationText, { 
                       color: currentUser.settings?.selfieVerification?.isVerified ? '#8B4513' : colors.textMuted 
                     }]}>
                      {currentUser.settings?.selfieVerification?.isVerified ? 'Verified' : 'Not verified'}
                    </Text>
                </View>

                <View style={[styles.connectionIntentRow, { 
                  backgroundColor: connectionColors.secondary,
                }]}>
                  {(() => {
                    const iconInfo = getConnectionIntentIcon(connectionIntent);
                    return renderIcon(iconInfo.name, iconInfo.iconType, 26, connectionColors.primary);
                  })()}
                  <Text style={[styles.connectionIntentDescription, { color: connectionColors.primary }]}>
                    {connectionIntent === "romantic" ? "Looking for romantic connections" 
                     : connectionIntent === "friendship" ? "Looking for meaningful friendships"
                     : connectionIntent === "both" ? "Open to romance and friendship"
                     : "Open to meaningful connections"}
                  </Text>
                </View>

                <View style={[styles.headerDivider, { backgroundColor: connectionColors.primary }]} />
              </View>
            </Animated.View>

            {/* Interleaved Photos and Info Cards (matching PotentialMatch) */}
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

            {photoUrls.length === 0 && (
              <View style={styles.noPhotosContainer}>
                <View style={[styles.noPhotosIcon, { backgroundColor: connectionColors.secondary }]}>
                  <Ionicons name="camera-outline" size={40} color={connectionColors.primary} />
                </View>
                <Text style={[styles.noPhotosText, { color: colors.textMuted }]}>
                  No photos to preview
                </Text>
              </View>
            )}
          </Animated.ScrollView>

          <View style={styles.floatingButtons}>
            <TouchableOpacity 
              style={[
                styles.floatingAction, 
                styles.leftAction,
                { backgroundColor: colors.card, borderColor: colors.border }
              ]}
              onPress={handleDislikePress}
              activeOpacity={0.8}
              disabled={isProcessingAction}
            >
              <Ionicons 
                name={isProcessingAction ? "hourglass-outline" : "close"} 
                size={20} 
                color={isProcessingAction ? colors.textMuted : "#8B7355"} 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.floatingAction, 
                styles.rightAction,
                { backgroundColor: colors.card, borderColor: colors.border }
              ]}
              onPress={handleHeartPress}
              activeOpacity={0.8}
              disabled={isProcessingAction}
            >
              <Ionicons 
                name={isProcessingAction ? "hourglass-outline" : "heart"} 
                size={20} 
                color={isProcessingAction ? colors.textMuted : (hasFullCircleSubscription ? '#FFD700' : '#E74C3C')} 
              />
            </TouchableOpacity>
          </View>
        </>
      )}

      <SlidingTabBar translateY={tabTranslateY} />
    </SafeAreaView>
  );
};

const createStyles = (colors: any, fonts: any, connectionColors: any) => StyleSheet.create({
  wrapper: {
    flex: 1,
  },
 headerOverlay: {
  position: "absolute" as const,
  left: 0,
  right: 0,
  height: HEADER_HEIGHT,
  zIndex: 1000,
  borderBottomWidth: 1,
  borderBottomColor: colors.border + '40',
},

// Updated header content styles
 headerContent: {
  marginTop: Spacing["3xl"],
  flex: 1,
  flexDirection: "row" ,
  alignItems: "center" ,
  paddingHorizontal: Spacing.lg,
  paddingTop: Platform.select({ 
    ios: 5, // Reduced from 10
    android: 3 // Reduced from 8
  }),
},
 backButton: {
  flexDirection: "row" ,
  alignItems: "center" ,
  paddingVertical: Spacing.xs, // Reduced from Spacing.sm
  paddingRight: Spacing.md,
  zIndex: 1001,
},

 backText: {
  marginLeft: 4,
  fontSize: Typography.sizes.base,
  fontWeight: Typography.weights.medium,
  color: colors.primary,
},
  centerNameContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  centerName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    marginTop: HEADER_HEIGHT,
  },
  container: {
    paddingHorizontal: Spacing.lg,
  },
  
  // Header section (matching PotentialMatch)
  headerContainer: {
    alignItems: "flex-start",
    marginBottom: Spacing.xl,
    width: "100%",
  },
  
  nameRow: {
    width: '100%',
    marginBottom: Spacing.sm,
  },
  
  userName: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    textAlign: "left",
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
  
  connectionIntentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
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
    marginTop: Spacing.lg,
  },
  
  // Content sections
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
  
  infoWrapper: {
    width: '100%',
  },
  
  // Info cards (matching PotentialMatch)
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
    width: 32,
    height: 32,
    borderRadius: 16,
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
  
  pillText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  
  // No photos state
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
  
  // Floating Action Buttons
  floatingButtons: {
    position: 'absolute',
    bottom: TAB_BAR_HEIGHT + 20,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 100,
  },
  
  floatingAction: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
  },
  
  leftAction: {
    bottom: 20,
    left: Spacing.xl,
  },
  
  rightAction: {
    bottom: 20,
    right: Spacing.xl,
  },
  
  // Loading state
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
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

export default UserShow;