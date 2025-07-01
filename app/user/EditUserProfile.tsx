import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { DraggableGrid } from "react-native-draggable-grid";
import * as ImagePicker from "expo-image-picker";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import EditUserProfileField from "@/components/EditUserProfileField";

export default function EditUserProfile() {
  const { userData, updateUserData } = useUserContext();
  const [photos, setPhotos] = useState<string[]>(userData.photos || []);
  const [tab, setTab] = useState("Edit");
  const router = useRouter();
  const [isModified, setIsModified] = useState(false);
  const [fieldVisibility, setFieldVisibility] = useState({});

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  useEffect(() => {
    const initialVisibility = {
      // Basic fields that actually exist in UserDataType
      gender: !userData.hiddenFields?.gender,
      datePreferences: !userData.hiddenFields?.datePreferences,
      spiritualProfile: !userData.hiddenFields?.spiritualProfile,
      spiritualDraws: !userData.hiddenFields?.spiritualDraws,
      spiritualPractices: !userData.hiddenFields?.spiritualPractices,
      healingModalities: !userData.hiddenFields?.healingModalities,
      firstName: true,
      lastName: true,
      fullName: true,
      age: true,
      height: !userData.hiddenFields?.height,
      location: true,
    };

    setFieldVisibility(initialVisibility);
  }, [userData]);

  const pickImage = async (index: number) => {
    let result = await ImagePicker.launchImageLibraryAsync({
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
    }
  };

  const handleFieldPress = (fieldName: string) => {
    router.push({
      pathname: "/user/EditFieldScreen",
      params: { fieldName },
    });
  };

  const renderField = (field: any) => {
    const formatFieldValue = (value: any, fieldName: string) => {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return "Not set";
      }
      
      if (Array.isArray(value)) {
        if (value.length > 3) {
          return `${value.slice(0, 3).join(", ")} +${value.length - 3} more`;
        }
        return value.join(", ");
      }
      
      return value.toString();
    };

    const getFieldIcon = (fieldName: string) => {
      const iconMap: { [key: string]: string } = {
        spiritualDraws: "sparkles",
        spiritualPractices: "leaf",
        healingModalities: "medical",
        gender: "person",
        datePreferences: "heart",
        fullName: "person-circle",
        age: "calendar",
        height: "resize",
        location: "location",
      };
      return iconMap[fieldName] || "information-circle";
    };

    const getFieldGradient = (fieldName: string) => {
      const gradientMap: { [key: string]: string[] } = {
        spiritualDraws: [colors.primary, "#8A2BE2"],
        spiritualPractices: [colors.primary, "#20B2AA"], 
        healingModalities: [colors.primary, "#FF6347"],
        gender: [colors.primary, "#4169E1"],
        datePreferences: [colors.primary, "#E91E63"],
      };
      return gradientMap[fieldName] || [colors.primary, colors.primary];
    };

    const isSpiritualField = ['spiritualDraws', 'spiritualPractices', 'healingModalities'].includes(field.fieldName);
    const gradientColors = getFieldGradient(field.fieldName);

    return (
      <TouchableOpacity
        key={field.fieldName}
        onPress={() => handleFieldPress(field.fieldName)}
        style={[
          styles.enhancedFieldContainer,
          { 
            backgroundColor: colors.card, 
            borderColor: isSpiritualField ? gradientColors[0] + '40' : colors.border,
            shadowColor: isSpiritualField ? gradientColors[0] : '#000',
          }
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.fieldContent}>
          <View style={styles.fieldHeader}>
            <View style={[
              styles.fieldIconContainer,
              { 
                backgroundColor: isSpiritualField 
                  ? `${gradientColors[0]}20` 
                  : `${colors.primary}20`
              }
            ]}>
              <Ionicons 
                name={getFieldIcon(field.fieldName)} 
                size={20} 
                color={isSpiritualField ? gradientColors[0] : colors.primary} 
              />
            </View>
            
            <View style={styles.fieldTitleContainer}>
              <Text style={[styles.fieldTitle, fonts.buttonFont, { color: colors.textDark }]}>
                {field.title}
              </Text>
              {isSpiritualField && (
                <View style={[styles.spiritualBadge, { backgroundColor: gradientColors[0] + '15' }]}>
                  <Text style={[styles.spiritualBadgeText, { color: gradientColors[0] }]}>
                    ✨ Spiritual
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.fieldActions}>
              <View style={[
                styles.visibilityIndicator,
                { 
                  backgroundColor: fieldVisibility[field.fieldName] 
                    ? colors.primary + '15' 
                    : colors.textMuted + '15'
                }
              ]}>
                <Ionicons 
                  name={fieldVisibility[field.fieldName] ? "eye" : "eye-off"} 
                  size={12} 
                  color={fieldVisibility[field.fieldName] ? colors.primary : colors.textMuted}
                />
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={16} 
                color={colors.textMuted} 
              />
            </View>
          </View>

          {/* Only show colorful tags for spiritual fields, regular text for others */}
          {isSpiritualField && Array.isArray(field.value) && field.value.length > 0 ? (
            <View style={styles.spiritualPreview}>
              {field.value.slice(0, 3).map((item: string, index: number) => (
                <View 
                  key={index}
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
              ))}
              {field.value.length > 3 && (
                <View style={[styles.moreTag, { backgroundColor: colors.textMuted + '20' }]}>
                  <Text style={[styles.moreTagText, { color: colors.textMuted }]}>
                    +{field.value.length - 3}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={[styles.fieldValue, fonts.captionFont, { color: colors.textMuted }]}>
              {formatFieldValue(field.value, field.fieldName)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = (item: { key: string; uri: string }, order: number) => {
    const hasPhoto = item.uri && item.uri !== '';
    const index = parseInt(item.key.split('-')[1]);
    
    if (hasPhoto) {
      // Render actual photo (like your working version)
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
            <View style={[styles.placeholderContent, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="camera-outline" size={32} color={colors.primary} />
              <Text style={[styles.placeholderText, fonts.captionFont, { color: colors.primary }]}>
                Add Photo
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const renderPhotoPlaceholder = (index: number) => {
    return (
      <View style={styles.photoContainer} key={`placeholder-${index}`}>
        <TouchableOpacity 
          style={[styles.photoPlaceholder, { borderColor: colors.border, backgroundColor: colors.background }]}
          onPress={() => pickImage(index)}
          activeOpacity={0.7}
        >
          <View style={[styles.placeholderContent, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="camera-outline" size={32} color={colors.primary} />
            <Text style={[styles.placeholderText, fonts.captionFont, { color: colors.primary }]}>
              Add Photo
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
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
    
    console.log('photoData:', photoData); // Debug log
    
    return (
      <View style={styles.photoGridContainer}>
        <DraggableGrid
          numColumns={3}
          renderItem={renderItem}
          data={photoData}
          disabledReSorted={false}
          onDragRelease={(data) => {
            // Only keep actual photos (filter out placeholders)
            const updatedPhotos = data
              .filter(item => item.uri && item.uri !== '')
              .map((item) => item.uri);
            setPhotos(updatedPhotos);
            setIsModified(true);
          }}
          dragItemFlex={1}
          dragAreaFlex={1}
          hoverStyle={{ scale: 1.05 }}
          style={styles.photosGrid}
        />

        {/* Photo tips */}
        {/* <View style={[styles.photoTips, { backgroundColor: colors.primary + '10' }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          <Text style={[styles.photoTipsText, fonts.captionFont, { color: colors.primary }]}>
            Add 3-6 photos that show your personality. First photo will be your main profile picture. Long press to drag and reorder.
          </Text>
        </View> */}
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
    if (isModified) {
      try {
        await updateUserData({ photos });
        setIsModified(false);
      } catch (error) {
        Alert.alert("Error", "Failed to save changes. Please try again.");
        return;
      }
    }
    router.back();
  };

  // Field groups based on ACTUAL UserDataType and onboarding screens
  const BasicInfoFields = [
    {
      fieldName: "fullName",
      title: "Name",
      value: userData.fullName || userData.firstName,
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
      fieldName: "location",
      title: "Location",
      value: userData.location?.city,
    },
  ];

  const IdentityFields = [
    {
      fieldName: "gender",
      title: "Gender",
      value: userData.gender,
    },
    {
      fieldName: "datePreferences",
      title: "I'm Looking For",
      value: userData.matchPreferences?.datePreferences,
    },
  ];

  // Based on actual UserDataType with new spiritualProfile structure
  const SpiritualFields = [
    {
      fieldName: "spiritualDraws",
      title: "Spiritual Draws", 
      value: userData.spiritualProfile?.draws,
    },
    {
      fieldName: "spiritualPractices",
      title: "Spiritual Practices",
      value: userData.spiritualProfile?.practices,
    },
    {
      fieldName: "healingModalities", 
      title: "Healing Modalities",
      value: userData.spiritualProfile?.healingModalities,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
      
      {/* Header - matches your app style */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            {userData.firstName}
          </Text>
          <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            Edit your profile
          </Text>
        </View>
        
        <TouchableOpacity onPress={handleDone} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { 
            color: colors.primary, 
            fontWeight: isModified ? '600' : '400' 
          }]}>
            {isModified ? "Save" : "Done"}
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

            {/* Identity Section */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                  Dating Preferences
                </Text>
              </View>
              {IdentityFields.map(renderField)}
            </View>

            {/* Spiritual Section - only if user has any spiritual profile data */}
            {(userData.spiritualProfile?.draws?.length || 
              userData.spiritualProfile?.practices?.length || 
              userData.spiritualProfile?.healingModalities?.length) && (
              <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                    Spiritual Profile
                  </Text>
                </View>
                {SpiritualFields.map(renderField)}
              </View>
            )}
          </View>
        )}
        
        {tab === "View" && (
          <View style={styles.previewContainer}>
            <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="eye" size={32} color={colors.primary} style={styles.previewIcon} />
              <Text style={[styles.previewTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                Profile Preview
              </Text>
              <Text style={[styles.previewText, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                This is how your profile appears to other users. Make sure your photos and info represent the real you!
              </Text>
            </View>
          </View>
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
  
  headerSubtitle: {
    fontSize: Typography.sizes.xs,
    fontStyle: 'italic',
    marginTop: 2,
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
    gap: Spacing.lg,
  },
  
  section: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginLeft: Spacing.sm,
    letterSpacing: 0.3,
  },
  
  // Enhanced Photo Grid Styles
  photosContainer: {
    minHeight: 150,
    paddingVertical: Spacing.md,
  },
  
  photoGridContainer: {
    gap: Spacing.md,
  },
  
  // Photo grid styles
  photosGrid: {
    flex: 1,
  },
  
  photoContainer: {
    width: 110,
    height: 110,
    margin: 8,
  },
  
  photoWrapper: {
    flex: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  
  placeholderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    width: '100%',
  },
  
  placeholderText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  
  // Action icons
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  
  removePhotoIcon: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // firstPhotoBadge: {
  //   position: 'absolute',
  //   top: Spacing.xs,
  //   left: Spacing.xs,
  //   width: 20,
  //   height: 20,
  //   borderRadius: 10,
  //   backgroundColor: 'rgba(255, 255, 255, 0.9)',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 1 },
  //   shadowOpacity: 0.15,
  //   shadowRadius: 2,
  //   elevation: 2,
  // },
  
  // firstPhotoBadgeText: {
  //   fontSize: Typography.sizes.xs,
  //   fontWeight: Typography.weights.bold,
  //   color: '#333',
  // },
  
  // Photo tips section
  // photoTips: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   padding: Spacing.md,
  //   borderRadius: BorderRadius.md,
  //   marginTop: Spacing.sm,
  //   gap: Spacing.sm,
  // },
  
  // photoTipsText: {
  //   flex: 1,
  //   fontSize: Typography.sizes.xs,
  //   lineHeight: Typography.sizes.xs * 1.4,
  // },

  // Enhanced Field Styles for Basic Info
  enhancedFieldContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  
  fieldContent: {
    padding: Spacing.md,
  },
  
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  fieldIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  
  fieldTitleContainer: {
    flex: 1,
  },
  
  fieldTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  
  spiritualBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  
  spiritualBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  
  fieldActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  
  visibilityIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  fieldValue: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.sizes.sm * 1.3,
    marginBottom: Spacing.xs,
  },
  
  spiritualPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  
  spiritualTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  
  spiritualTagText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  
  moreTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  
  moreTagText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  
  previewCard: {
    width: '100%',
    padding: Spacing['2xl'],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  
  previewIcon: {
    marginBottom: Spacing.lg,
  },
  
  previewTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  
  previewText: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    lineHeight: Typography.sizes.base * 1.4,
  },
});