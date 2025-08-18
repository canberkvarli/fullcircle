import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ScrollView,
  StatusBar,
  useColorScheme,
  Platform,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { DraggableGrid } from "react-native-draggable-grid";
import * as ImagePicker from "expo-image-picker";

import { useUserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import ProfilePreview from "@/components/ProfilePreview";
import { STORAGE } from "@/services/FirebaseConfig";
import { getSpiritualDrawLabels } from "@/constants/spiritualMappings";
import OuroborosLoader from "@/components/ouroboros/OuroborosLoader";


export default function EditUserProfile() {
  const { userData, updateUserData } = useUserContext();
  const [photos, setPhotos] = useState<string[]>(userData.photos || []);
  const [tab, setTab] = useState("Edit");
  const router = useRouter();
  const [isModified, setIsModified] = useState(false);
  const [fieldVisibility, setFieldVisibility] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const [progressUpdate, setProgressUpdate] = useState(0);

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  // Get connection intent for appropriate labeling
  const connectionIntent = userData?.matchPreferences?.connectionIntent || "romantic";
  const isRomantic = connectionIntent === "romantic";

  useEffect(() => {
    const initialVisibility = {
      // Always visible fields (no toggle needed)
      fullName: true,
      firstName: true,
      familyName: true,
      
      // Basic info with visibility controls
      age: !userData.hiddenFields?.age,
      height: !userData.hiddenFields?.height,
      location: !userData.hiddenFields?.location,
      
      // Connection preferences with visibility controls
      gender: !userData.hiddenFields?.gender,
      connectionIntent: true, // Always visible
      connectionPreferences: !userData.hiddenFields?.connectionPreferences,
      connectionStyles: !userData.hiddenFields?.connectionStyles,
      
      // Spiritual fields with visibility controls
      spiritualDraws: !userData.hiddenFields?.spiritualDraws,
      spiritualPractices: !userData.hiddenFields?.spiritualPractices,
      healingModalities: !userData.hiddenFields?.healingModalities,
    };

    setFieldVisibility(initialVisibility);
  }, [userData]);



  const pickImage = async (index: number) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      // @ts-ignore - suppressing deprecation warning until library is updated
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const updatedPhotos = [...photos];
      updatedPhotos[index] = result.assets[0].uri;
      setPhotos(updatedPhotos);
      setIsModified(true);
      setProgressUpdate(prev => prev + 1); // Force progress update

      // Provide feedback that the photo will be uploaded when saved
      console.log(`Photo ${index} selected (will upload when saved):`, result.assets[0].uri);
    }
  };

  const handleFieldPress = (fieldName: string) => {
    router.push({
      pathname: "/user/EditFieldScreen",
      params: { fieldName },
    });
  };

  const uploadPhotoToStorage = async (photoUri: string, index: number): Promise<string | null> => {
  if (!photoUri || !userData.userId) return null;

  // Skip if it's already a Firebase Storage URL
  if (photoUri.includes('firebasestorage.googleapis.com')) {
    return photoUri;
  }

  try {
    const response = await fetch(photoUri);
    const blob = await response.blob();

    // Use user ID + unique identifier + index for proper organization
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const storageRef = STORAGE.ref(`users/${userData.userId}/photos/${index}_${uniqueId}.jpg`);

    await storageRef.putFile(photoUri);
    const photoURL = await storageRef.getDownloadURL();
    return photoURL;
  } catch (error) {
    console.error(`Error uploading photo ${index}:`, error);
    return null;
  }
};

  // Check if field should show visibility toggle
  const shouldShowVisibilityToggle = (fieldName: string) => {
    const fieldsWithVisibilityControl = [
      'age', 'height', 'location', 'gender', 'connectionPreferences', 'connectionStyles',
      'spiritualDraws', 'spiritualPractices', 'healingModalities'
    ];
    return fieldsWithVisibilityControl.includes(fieldName);
  };

  const renderField = (field: { fieldName: string; title: string; value: any }) => {
    const formatFieldValue = (value: any, fieldName: string) => {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return "Not set";
      }

      if (Array.isArray(value)) {
        // Filter out any non-string values and empty strings
        const validValues = value.filter(item =>
          typeof item === 'string' && item.trim().length > 0
        );

        if (validValues.length === 0) {
          return "Not set";
        }

        // Special handling for spiritual draws - convert values to labels
        if (fieldName === "spiritualDraws") {
          const labelValues = getSpiritualDrawLabels(validValues);
          if (labelValues.length > 3) {
            return `${labelValues.slice(0, 3).join(", ")} +${labelValues.length - 3} more`;
          }
          return labelValues.join(", ");
        }

        if (validValues.length > 3) {
          return `${validValues.slice(0, 3).join(", ")} +${validValues.length - 3} more`;
        }
        return validValues.join(", ");
      }

      // Special formatting for connection intent
      if (fieldName === "connectionIntent") {
        return value === "romantic" ? "Dating"
             : value === "friendship" ? "Friendship"
             : value === "both" ? "Both"
             : value.toString();
      }

      return value.toString();
    };

    const getFieldIcon = (fieldName: string): keyof typeof Ionicons.glyphMap => {
      const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
        spiritualDraws: "sparkles-outline",
        spiritualPractices: "leaf-outline",
        healingModalities: "medical-outline",
        gender: "person-outline",
        connectionIntent: isRomantic ? "heart-outline" : "people-outline",
        connectionPreferences: "heart-circle-outline",
        connectionStyles: "link-outline",
        fullName: "person-circle-outline",
        age: "calendar-outline",
        height: "resize-outline",
        location: "location-outline",
      };
      return iconMap[fieldName] || "information-circle-outline";
    };

    const getFieldGradient = (fieldName: string) => {
      const gradientMap: { [key: string]: string[] } = {
        spiritualDraws: [colors.primary, "#8A2BE2"],
        spiritualPractices: [colors.primary, "#20B2AA"],
        healingModalities: [colors.primary, "#FF6347"],
        gender: [colors.primary, "#4169E1"],
        connectionIntent: isRomantic ? ["#EC4899", "#F97316"] : ["#10B981", "#06B6D4"],
        connectionPreferences: isRomantic ? ["#EC4899", "#BE185D"] : ["#10B981", "#047857"],
        connectionStyles: isRomantic ? ["#F97316", "#EC4899"] : ["#06B6D4", "#10B981"],
      };
      return gradientMap[fieldName] || [colors.primary, colors.primary];
    };

    const isSpiritualField = ['spiritualDraws', 'spiritualPractices', 'healingModalities'].includes(field.fieldName);
    const isConnectionField = ['connectionIntent', 'connectionPreferences', 'connectionStyles'].includes(field.fieldName);
    const gradientColors = getFieldGradient(field.fieldName);
    const hasVisibilityControl = shouldShowVisibilityToggle(field.fieldName);
    const isFieldVisible = fieldVisibility[field.fieldName];

    // Get the actual field value with proper validation
    const fieldValue = field.value;
    const hasValidValue = fieldValue &&
      (Array.isArray(fieldValue) ? fieldValue.length > 0 && fieldValue.some(item =>
        typeof item === 'string' && item.trim().length > 0
      ) : true);

    return (
      <TouchableOpacity
        key={field.fieldName}
        onPress={() => handleFieldPress(field.fieldName)}
        style={[
          styles.fieldContainer,
          {
            backgroundColor: colors.card,
            borderColor: (isSpiritualField || isConnectionField) ? gradientColors[0] + '30' : colors.border,
          }
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.fieldContent}>
          <View style={styles.fieldHeader}>
            <View style={[
              styles.fieldIconContainer,
              {
                backgroundColor: (isSpiritualField || isConnectionField)
                  ? `${gradientColors[0]}15`
                  : `${colors.primary}15`
              }
            ]}>
              <Ionicons
                name={getFieldIcon(field.fieldName)}
                size={18}
                color={(isSpiritualField || isConnectionField) ? gradientColors[0] : colors.primary}
              />
            </View>

            <View style={styles.fieldTitleContainer}>
              <Text style={[styles.fieldTitle, fonts.buttonFont, { color: colors.textDark }]}>
                {field.title}
              </Text>
            </View>

            <View style={styles.fieldActions}>
              {/* Visibility indicator - only show for certain fields */}
              {hasVisibilityControl && (
                <View style={[
                  styles.visibilityIndicator,
                  {
                    backgroundColor: isFieldVisible
                      ? colors.primary + '15'
                      : colors.textMuted + '15'
                  }
                ]}>
                  <Ionicons
                    name={isFieldVisible ? "eye-outline" : "eye-off-outline"}
                    size={12}
                    color={isFieldVisible ? colors.primary : colors.textMuted}
                  />
                </View>
              )}
              <Ionicons
                name="chevron-forward-outline"
                size={16}
                color={colors.textMuted}
              />
            </View>
          </View>

          {/* Special handling for connection intent */}
          {field.fieldName === "connectionIntent" ? (
            <View style={styles.connectionIntentDisplay}>
              <View style={[
                styles.connectionIntentBadge,
                {
                  backgroundColor: gradientColors[1] + '20',
                  borderColor: gradientColors[1] + '40'
                }
              ]}>
                <Ionicons
                  name={isRomantic ? "heart" : connectionIntent === "both" ? "infinite" : "people"}
                  size={14}
                  color={gradientColors[1]}
                />
                <Text style={[styles.connectionIntentText, { color: gradientColors[1] }]}>
                  {formatFieldValue(field.value, field.fieldName)}
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* Colorful tags for spiritual and connection fields */}
              {(isSpiritualField || isConnectionField) && hasValidValue && Array.isArray(field.value) ? (
                <View style={styles.spiritualPreview}>
                  {(() => {
                    // For spiritual draws, convert values to labels for display
                    const displayValues = field.fieldName === "spiritualDraws"
                      ? getSpiritualDrawLabels(field.value.filter(item => typeof item === 'string' && item.trim().length > 0))
                      : field.value.filter(item => typeof item === 'string' && item.trim().length > 0);

                    return displayValues
                      .slice(0, 3)
                      .map((item: string, index: number) => (
                        <View
                          key={`${field.fieldName}-${index}`}
                          style={[
                            styles.spiritualTag,
                            {
                              backgroundColor: gradientColors[1] + '20',
                              borderColor: gradientColors[1] + '40'
                            }
                          ]}
                        >
                          <Text style={[styles.spiritualTagText, { color: gradientColors[1] }]}>
                            {item}
                          </Text>
                        </View>
                      ));
                  })()}
                  {(() => {
                    const originalValues = field.value.filter(item => typeof item === 'string' && item.trim().length > 0);
                    return originalValues.length > 3 && (
                      <View style={[styles.moreTag, { backgroundColor: colors.textMuted + '20' }]}>
                        <Text style={[styles.moreTagText, { color: colors.textMuted }]}>
                          +{originalValues.length - 3}
                        </Text>
                      </View>
                    );
                  })()}
                </View>
              ) : (
                <Text style={[styles.fieldValue, fonts.captionFont, { color: colors.textMuted }]}>
                  {formatFieldValue(field.value, field.fieldName)}
                </Text>
              )}
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = (item: { key: string; uri: string }, order: number) => {
    const hasPhoto = item.uri && item.uri !== '';
    const index = parseInt(item.key.split('-')[1]);

    if (hasPhoto) {
      // Render actual photo
      return (
        <View style={styles.photoContainer} key={item.key}>
          <View style={styles.photoWrapper}>
            <Image source={{ uri: item.uri }} style={styles.photo} />
            <TouchableOpacity
              style={styles.editPhotoIcon}
              onPress={() => pickImage(index)}
            >
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removePhotoIcon}
              onPress={() => {
                const newPhotos = photos.filter((_, i) => i !== index);
                setPhotos(newPhotos);
                setIsModified(true);
                setProgressUpdate(prev => prev + 1); // Force progress update
              }}
            >
              <Ionicons name="close" size={10} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      // Render placeholder
      return (
        <View style={styles.photoContainer} key={item.key}>
          <TouchableOpacity
            style={[styles.photoPlaceholder, { borderColor: colors.border, backgroundColor: colors.background }]}
            onPress={() => pickImage(index)}
            activeOpacity={0.7}
          >
            <View style={[styles.placeholderContent, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="camera-outline" size={24} color={colors.primary} />
              <Text style={[styles.placeholderText, fonts.captionFont, { color: colors.primary }]}>
                Add Photo
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const renderPhotoGrid = () => {
    const maxPhotos = 6;

    // Create photo data array - add existing photos first, then placeholders
    const photoData = [];

    // Add existing photos
    for (let i = 0; i < photos.length; i++) {
      photoData.push({
        key: `photo-${i}`,
        uri: photos[i],
      });
    }

    // Add placeholders for remaining slots
    for (let i = photos.length; i < maxPhotos; i++) {
      photoData.push({
        key: `placeholder-${i}`,
        uri: '', // Empty URI means placeholder
      });
    }

    return (
      <View style={styles.photoGridContainer}>
        <DraggableGrid
          numColumns={3}
          renderItem={renderItem}
          data={photoData}
          onDragRelease={(data) => {
            const updatedPhotos = data
              .filter(item => item.uri && item.uri !== '')
              .map((item) => item.uri);
            setPhotos(updatedPhotos);
            setIsModified(true);
            setProgressUpdate(prev => prev + 1); // Force progress update
          }}
          style={styles.photosGrid}
        />


      </View>
    );
  };

  const handleCancel = () => {
    if (isModified) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Do you want to discard them?",
        [
          {
            text: "Keep Editing",
            style: "cancel",
          },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleDone = async () => {
    // Check if user has at least 3 photos before saving
    if (photos.length < 3) {
      Alert.alert(
        "More Photos Needed",
        "You need at least 3 photos to complete your profile. Please add more photos before saving.",
        [{ text: "OK" }]
      );
      return;
    }

    if (isModified) {
      try {
        // Show saving state with ouroboros loader
        setIsSaving(true);
        
        // Animate loader entrance
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();

        // Upload new photos to Storage and get URLs
        const uploadedPhotos = await Promise.all(
          photos.map(async (photoUri, index) => {
            if (photoUri && photoUri !== "") {
              return await uploadPhotoToStorage(photoUri, index);
            }
            return null;
          })
        );

        // Filter out failed uploads
        const validPhotoUrls = uploadedPhotos.filter(url => url !== null) as string[];

        console.log("Original photos (may include local paths):", photos);
        console.log("Uploaded photos (Storage URLs):", validPhotoUrls);

        // Update user data with Storage URLs
        await updateUserData({ photos: validPhotoUrls });
        setIsModified(false);
      } catch (error) {
        console.error("Error saving photos:", error);
        Alert.alert("Error", "Failed to save changes. Please try again.");
        return;
      } finally {
        // Animate loader exit
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsSaving(false);
        });
      }
    }
    router.back();
  };


  // Helper function to check if spiritual field has valid data
  const hasValidSpiritualData = (fieldValue: any) => {
    if (!fieldValue) return false;
    if (Array.isArray(fieldValue)) {
      return fieldValue.some(item => typeof item === 'string' && item.trim().length > 0);
    }
    return typeof fieldValue === 'string' && fieldValue.trim().length > 0;
  };

  const calculateJourneyProgress = () => {
    // Photos: 6/6 = 100%, 3/6 = 50%, etc. (min 3 required)
    const photoProgress = Math.min((photos.length || 0) / 6, 1) * 100;

    // Only count spiritual fields for progress (optional fields)
    const drawsCompleted = hasValidSpiritualData(userData.spiritualProfile?.draws);
    const practicesCompleted = hasValidSpiritualData(userData.spiritualProfile?.practices);
    const healingCompleted = hasValidSpiritualData(userData.spiritualProfile?.healingModalities);

    const spiritualFields = [
      drawsCompleted, // Spiritual draws
      practicesCompleted, // Spiritual practices
      healingCompleted, // Healing modalities
    ];

    const completedSpiritualFields = spiritualFields.filter(Boolean).length;
    const spiritualProgress = (completedSpiritualFields / spiritualFields.length) * 100;

    // Overall progress: 50% photos + 50% spiritual fields
    const overallProgress = (photoProgress * 0.5) + (spiritualProgress * 0.5);

    console.log('EditUserProfile progress calculation:', {
      photosLength: photos.length,
      photoProgress: Math.round(photoProgress),
      spiritualFieldsCompleted: completedSpiritualFields,
      spiritualProgress: Math.round(spiritualProgress),
      overallProgress: Math.round(overallProgress)
    });

    return Math.min(overallProgress, 100);
  };



  // Field groups based on new UserDataType and connection preferences structure
  const BasicInfoFields = [
    {
      fieldName: "fullName",
      title: "Name",
      value: userData.fullName ? userData.fullName : userData.firstName,
    },
    {
      fieldName: "age",
      title: "Age",
      value: userData.age,
    },
    {
      fieldName: "height",
      title: "Height",
      value: userData.height,
    },
    {
      fieldName: "gender",
      title: "Gender",
      value: userData.gender,
    },
    {
      fieldName: "location",
      title: "Location",
      value: userData.location?.city,
    },
  ];

  // Always include all spiritual fields in edit mode (users need to be able to add them)
  const AllSpiritualFields = [
    {
      fieldName: "spiritualDraws",
      title: "Your Path",
      value: userData.spiritualProfile?.draws,
    },
    {
      fieldName: "spiritualPractices",
      title: "Your Practices",
      value: userData.spiritualProfile?.practices,
    },
    {
      fieldName: "healingModalities",
      title: "Healing Modalities",
      value: userData.spiritualProfile?.healingModalities,
    },
  ];

  // Only filter for fields that have data (for conditional preview rendering)
  const SpiritualFieldsWithData = AllSpiritualFields.filter(field => hasValidSpiritualData(field.value));

  // Check if we should show the spiritual section in PREVIEW mode
  const shouldShowSpiritualSectionInPreview = SpiritualFieldsWithData.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />

      {/* Ouroboros Loader Overlay */}
      {isSaving && (
        <Animated.View 
          style={[
            styles.loaderOverlay,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.loaderContainer, 
              { 
                backgroundColor: colors.background + 'F0',
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <OuroborosLoader 
              size={80} 
              variant="spinner" 
              loop={true}
              duration={2000}
              fillColor={colors.primary}
              strokeColor={colors.primary}
            />
            <Text style={[styles.loaderText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              Saving your journey...
            </Text>
          </Animated.View>
        </Animated.View>
      )}

      {/* Header - matches your app style */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: colors.primary }]}>
            Cancel
          </Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            {userData.firstName || 'Profile'}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={handleDone} 
          style={styles.headerButton}
          disabled={isSaving}
        >
          <Text style={[styles.headerButtonText, {
            color: photos.length < 3 ? colors.textMuted : colors.primary,
            fontWeight: isModified ? '600' : '400',
            opacity: isSaving ? 0.5 : 1
          }]}>
            {isSaving ? "Saving..." : (isModified ? "Save" : "Done")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            tab === "Edit" && styles.activeTabButton,
            { borderBottomColor: colors.primary }
          ]}
          onPress={() => setTab("Edit")}
        >
          <Ionicons
            name="create-outline"
            size={18}
            color={tab === "Edit" ? colors.primary : colors.textMuted}
            style={styles.tabIcon}
          />
          <Text style={[
            styles.tabText,
            fonts.buttonFont,
            { color: tab === "Edit" ? colors.primary : colors.textMuted }
          ]}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            tab === "View" && styles.activeTabButton,
            { borderBottomColor: colors.primary }
          ]}
          onPress={() => setTab("View")}
        >
          <Ionicons
            name="eye-outline"
            size={18}
            color={tab === "View" ? colors.primary : colors.textMuted}
            style={styles.tabIcon}
          />
          <Text style={[
            styles.tabText,
            fonts.buttonFont,
            { color: tab === "View" ? colors.primary : colors.textMuted }
          ]}>
            Preview
          </Text>
        </TouchableOpacity>
      </View>

      {/* Journey Progress Indicator */}
      {calculateJourneyProgress() >= 100 ? (
        <View style={[styles.journeyProgressContainer, { backgroundColor: colors.background }]}>
          <View style={styles.journeyProgressContent}>
            <View style={styles.journeyProgressLeft}>
              <Text style={[styles.completionMessage, fonts.spiritualBodyFont, { color: colors.primary }]}>
                Your Circle journey is complete ✨
              </Text>
            </View>
            <View style={styles.journeyProgressRight}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.journeyProgressContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={styles.journeyProgressButton}
            onPress={() => {
              console.log('Journey progress button pressed!');
              router.push({
                pathname: '/user/JourneyInfoScreen',
                params: { currentPhotos: JSON.stringify(photos) }
              });
            }}
            activeOpacity={0.7}
          >
            <View style={styles.journeyProgressContent}>
              <View style={styles.journeyProgressLeft}>
                <Text style={[styles.journeyProgressTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                  Your Journey
                </Text>
                <View style={[styles.journeyProgressBar, { backgroundColor: colors.border }]}>
                  <View 
                    style={[
                      styles.journeyProgressFill, 
                      { 
                        backgroundColor: colors.primary,
                        width: `${Math.min(calculateJourneyProgress(), 100)}%`
                      }
                    ]} 
                  />
                </View>
              </View>
              <View style={styles.journeyProgressRight}>
                <Text style={[styles.journeyProgressPercentage, fonts.spiritualBodyFont, { color: colors.primary }]}>
                  {Math.round(calculateJourneyProgress())}%
                </Text>
                <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {tab === "Edit" && (
          <View style={styles.editContainer}>
            {/* Photos Section */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                  Photos
                </Text>
              </View>

              <View style={styles.photosContainer}>
                {renderPhotoGrid()}
              </View>
            </View>

            {/* Basic Info Section */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                  Basic Info
                </Text>
              </View>
              {BasicInfoFields.map(renderField)}
            </View>

            {/* Spiritual Section - ALWAYS show in edit mode so users can add spiritual info */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                  Your Journey
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                  Share your spiritual journey and practices
                </Text>
              </View>
              {AllSpiritualFields.map(renderField)}
            </View>
          </View>
        )}

        {tab === "View" && (
          <ProfilePreview userData={userData} photos={photos} />
        )}
      </ScrollView>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 0 : Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },

  headerButton: {
    paddingVertical: Spacing.sm,
    minWidth: 60,
  },

  headerButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },

  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.lg,
  },

  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  activeTabButton: {
    borderBottomWidth: 2,
  },

  tabIcon: {
    marginRight: Spacing.xs,
  },

  tabText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: Spacing['2xl'],
  },

  editContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },

  section: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },

  sectionHeader: {
    marginBottom: Spacing.md,
  },

  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.3,
  },

  sectionSubtitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    letterSpacing: 0.2,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },

  emptyStateContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyStateText: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: Typography.sizes.sm * 1.4,
  },

  // Photo Grid Styles
  photosContainer: {
    minHeight: 150,
  },

  photoGridContainer: {
    gap: Spacing.sm,
  },

  photosGrid: {
    flex: 1,
  },

  photoContainer: {
    width: 100,
    height: 100,
    margin: 8,
  },

  photoWrapper: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },

  photo: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },

  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    width: '85%',
  },

  placeholderText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },

  editPhotoIcon: {
    position: 'absolute',
    bottom: Spacing.xs,
    right: Spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  removePhotoIcon: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  photoRequirements: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginVertical: Spacing.sm,
    gap: Spacing.sm,
  },

  photoProgressContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.sm,
  },

  progressBarContainer: {
    alignItems: 'center',
    gap: Spacing.sm,
  },

  progressBarTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
  },

  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  progressText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.2,
  },



  // Field Styles
  fieldContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  fieldContent: {
    gap: Spacing.sm,
  },

  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  fieldIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  fieldTitleContainer: {
    flex: 1,
  },

  fieldTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.3,
  },

  fieldActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  visibilityIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Connection Intent Special Styling
  connectionIntentDisplay: {
    marginTop: Spacing.sm,
  },

  connectionIntentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },

  connectionIntentText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.3,
  },

  // Spiritual/Connection Field Tags
  spiritualPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },

  spiritualTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },

  spiritualTagText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.2,
  },

  moreTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },

  moreTagText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },

  fieldValue: {
    fontSize: Typography.sizes.sm,
    marginTop: Spacing.xs,
    lineHeight: Typography.sizes.sm * 1.3,
  },

  // Journey Progress Styles
  journeyProgressContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },

  journeyProgressButton: {
    backgroundColor: 'transparent',
  },

  journeyProgressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  journeyProgressLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },

  journeyProgressTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.2,
    marginBottom: Spacing.sm,
  },

  journeyProgressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
  },

  journeyProgressFill: {
    height: '100%',
    borderRadius: 3,
  },

  journeyProgressRight: {
    alignItems: 'center',
    gap: Spacing.xs,
  },

  journeyProgressPercentage: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.2,
  },

  completionMessage: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.3,
    marginTop: Spacing.sm,
    lineHeight: Typography.sizes.base * 1.4,
    textAlign: 'center',
  },

  // Loader Overlay Styles
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', // Semi-transparent black overlay
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Ensure it's above other content
  },

  loaderContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)', // Semi-transparent white background
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  loaderText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.2,
  },
});