import React, { useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  useColorScheme,
  Platform,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "@/context/UserContext";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import { STORAGE } from "@/services/FirebaseConfig";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

const { width: screenWidth } = Dimensions.get('window');

function PhotosScreen() {
  const {
    userData,
    updateUserData,
    navigateToPreviousScreen,
    completeOnboarding,
  } = useUserContext();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);

  const [selectedPhotos, setSelectedPhotos] = useState<string[]>(
    userData?.photos || Array(6).fill("")
  );
  const [loading, setLoading] = useState<boolean>(false);

  // Animations
  const fadeAnims = useRef(Array(6).fill(0).map(() => new Animated.Value(0))).current;
  const scaleAnims = useRef(Array(6).fill(0).map(() => new Animated.Value(0.8))).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Add pulsing glow animation for submit button
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulsing glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Sacred Permission",
          "To complete your spiritual profile, please allow access to your photo library."
        );
      }
    })();

    // Staggered entrance animation
    const animations = fadeAnims.map((fadeAnim, index) =>
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnims[index], {
          toValue: 1,
          duration: 600,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(80, animations).start();
  }, []);

  useEffect(() => {
    // Update progress animation based on photo count
    const photoCount = selectedPhotos.filter(photo => photo && photo !== "").length;
    const progress = Math.min(photoCount / 3, 1);
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [selectedPhotos]);

  const handleSelectPhoto = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.9,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];

      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const newPhotos = [...selectedPhotos];
      newPhotos[index] = manipResult.uri;
      setSelectedPhotos(newPhotos);

      // Photo added animation
      Animated.sequence([
        Animated.timing(scaleAnims[index], {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnims[index], {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePhotoUpload = async (photoUri: string) => {
    if (!photoUri) return null;

    const response = await fetch(photoUri);
    const blob = await response.blob();
    const storageRef = STORAGE.ref(`photos/${Date.now()}.jpg`);
    await storageRef.putFile(photoUri);
    const photoURL = await storageRef.getDownloadURL();
    return photoURL;
  };

  const handleSubmit = async () => {
    const filteredPhotos = selectedPhotos.filter(
      (photo) => photo !== undefined && photo !== null && photo !== ""
    );

    if (filteredPhotos.length < 3) {
      Alert.alert("Sacred Gallery", "Please share at least 3 photos to complete your spiritual profile.");
      return;
    }

    setLoading(true);
    try {
      const uploadedPhotos = await Promise.all(
        selectedPhotos.map((photoUri) =>
          photoUri && photoUri !== "" ? handlePhotoUpload(photoUri) : Promise.resolve(null)
        )
      );

      await updateUserData({
        photos: uploadedPhotos.filter(
          (photo) => photo !== null && photo !== undefined
        ),
      });

      console.log("Photos uploaded successfully!");
      completeOnboarding();
    } catch (error: any) {
      Alert.alert("Cosmic Interference", "The universe had trouble saving your photos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = (index: number) => {
    const newPhotos = [...selectedPhotos];
    newPhotos[index] = "";
    setSelectedPhotos(newPhotos);

    // Delete animation
    Animated.timing(scaleAnims[index], {
      toValue: 0.8,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const renderPhotoSlot = (index: number) => {
    const hasPhoto = selectedPhotos[index] && selectedPhotos[index] !== "";
    const isMainPhoto = index === 0;

    return (
      <Animated.View
        key={index}
        style={[
          isMainPhoto ? styles.mainPhotoContainer : styles.photoContainer,
          {
            opacity: fadeAnims[index],
            transform: [{ scale: scaleAnims[index] }],
          }
        ]}
      >
        <TouchableOpacity
          style={[
            isMainPhoto ? styles.mainPhoto : styles.photo,
            hasPhoto ? styles.photoWithImage : null
          ]}
          onPress={() => handleSelectPhoto(index)}
          activeOpacity={0.8}
        >
          {hasPhoto ? (
            <Image
              source={{ uri: selectedPhotos[index] }}
              style={isMainPhoto ? styles.mainPhotoImage : styles.photoImage}
            />
          ) : (
            <View style={styles.placeholderContent}>
              <View style={[styles.iconContainer, isMainPhoto && styles.mainIconContainer]}>
                <Ionicons 
                  name="camera" 
                  size={isMainPhoto ? 28 : 20} 
                  color={colors.primary} 
                />
              </View>
              <Text style={[
                styles.placeholderText,
                isMainPhoto && styles.mainPlaceholderText
              ]}>
                {isMainPhoto ? "Main Photo" : `Photo ${index + 1}`}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {hasPhoto && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeletePhoto(index)}
          >
            <Ionicons name="close" size={12} color={colors.background} />
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };
  const photoCount = selectedPhotos.filter(photo => photo && photo !== "").length;
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigateToPreviousScreen()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textDark} />
          </TouchableOpacity>

          {/* Progress Bar */}
          <OnboardingProgressBar currentScreen="PhotosScreen" />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Capture Your Essence</Text>
            <Text style={styles.subtitle}>
              Share your authentic self through photos that reflect your inner light
            </Text>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  { width: progressWidth }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {photoCount}/3 photos • {photoCount >= 3 ? "Complete!" : "At least 3 required"}
            </Text>
          </View>

          {/* Main Photo */}
          <View style={styles.mainPhotoSection}>
            <Text style={styles.sectionTitle}>Profile Photo</Text>
            {renderPhotoSlot(0)}
          </View>

          {/* Secondary Photos */}
          <View style={styles.secondarySection}>
            <Text style={styles.sectionTitle}>Additional Photos</Text>
            <View style={styles.secondaryGrid}>
              {Array.from({ length: 5 }).map((_, index) => renderPhotoSlot(index + 1))}
            </View>
          </View>

          {/* Instructions */}
          <Text style={styles.instructions}>
            Your first photo will be your main profile image. Choose photos that show your personality and energy.
          </Text>

          {/* Submit Button */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Uploading your sacred gallery...</Text>
            </View>
          ) : (
            <Animated.View style={[
              styles.submitButtonContainer,
              {
                shadowOpacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.8],
                }),
              }
            ]}>
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  photoCount < 3 && styles.submitButtonDisabled
                ]} 
                onPress={handleSubmit}
                disabled={photoCount < 3}
              >
                <Ionicons 
                  name="heart" 
                  size={20} 
                  color={photoCount >= 3 ? colors.background : colors.textMuted}
                  style={styles.buttonIcon}
                />
                <Text style={[
                  styles.buttonText,
                  photoCount < 3 && styles.buttonTextDisabled
                ]}>
                  Complete Sacred Profile
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Affirmation */}
          <Text style={styles.affirmation}>
            Your authentic beauty shines through every image you share
          </Text>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const createStyles = (colorScheme: 'light' | 'dark', fonts: Record<string, any>) => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: Spacing.xl,
      marginTop: Platform.select({ ios: 0, android: Spacing.lg }),
    },
    backButton: {
      backgroundColor: colors.card,
      padding: Spacing.xs,
      borderRadius: BorderRadius.full,
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginLeft: Spacing.xl,
      marginTop: Platform.select({ ios: Spacing.md, android: Spacing.lg }),
      marginBottom: 0,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    header: {
      marginTop: Spacing.lg,
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.xl,
    },
    title: {
      ...fonts.spiritualTitleFont,
      color: colors.textDark,
      textAlign: "left",
      marginBottom: Spacing.md,
    },
    subtitle: {
      ...fonts.spiritualSubtitleFont,
      color: colors.textLight,
      textAlign: "left",
      fontStyle: "italic",
      lineHeight: Typography.sizes.base * 1.4,
    },
    progressContainer: {
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.xl,
    },
    progressTrack: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      marginBottom: Spacing.sm,
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    progressText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.primary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    sectionTitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textDark,
      textAlign: 'center',
      marginBottom: Spacing.lg,
      fontStyle: 'italic',
      fontWeight: Typography.weights.medium,
    },
    mainPhotoSection: {
      alignItems: 'center',
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.xl,
    },
    mainPhotoContainer: {
      alignItems: 'center',
    },
    mainPhoto: {
      width: 180,
      height: 220,
      borderRadius: BorderRadius.xl,
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    mainPhotoImage: {
      width: '100%',
      height: '100%',
      borderRadius: BorderRadius.xl,
    },
    secondarySection: {
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.xl,
    },
    secondaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: Spacing.md,
    },
    photoContainer: {
      width: (screenWidth - (Spacing.xl * 2) - (Spacing.md * 4)) / 3,
      aspectRatio: 1,
    },
    photo: {
      width: '100%',
      height: '100%',
      borderRadius: BorderRadius.lg,
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    photoWithImage: {
      borderStyle: 'solid',
      borderColor: colors.primary,
    },
    photoImage: {
      width: '100%',
      height: '100%',
      borderRadius: BorderRadius.lg,
    },
    placeholderContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    mainIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginBottom: Spacing.sm,
    },
    placeholderText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.xs,
      color: colors.textMuted,
      textAlign: 'center',
    },
    mainPlaceholderText: {
      fontSize: Typography.sizes.sm,
      color: colors.primary,
    },
    deleteButton: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.error,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: colors.error,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    instructions: {
      ...fonts.spiritualBodyFont,
      color: colors.textLight,
      textAlign: 'center',
      fontStyle: 'italic',
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.xl,
      lineHeight: Typography.sizes.base * 1.4,
    },
    loadingContainer: {
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    loadingText: {
      ...fonts.spiritualBodyFont,
      color: colors.primary,
      marginTop: Spacing.md,
      fontStyle: 'italic',
    },
    submitButtonContainer: {
      alignSelf: 'center',
      marginBottom: Spacing.xl,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 20,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 200,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    submitButtonDisabled: {
      backgroundColor: colors.textMuted,
      opacity: 0.6,
      ...Platform.select({
        ios: {
          shadowColor: colors.textMuted,
          shadowOpacity: 0.15,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    buttonIcon: {
      marginRight: Spacing.sm,
    },
    buttonText: {
      ...fonts.spiritualBodyFont,
      color: colors.background,
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.medium,
      fontStyle: 'italic',
    },
    buttonTextDisabled: {
      color: colors.textMuted,
    },
    affirmation: {
      ...fonts.affirmationFont,
      textAlign: "center",
      fontStyle: "italic",
      color: colors.textLight,
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3,
      paddingHorizontal: Spacing.xl,
      marginBottom: Spacing.xl,
    },
  });
};

export default PhotosScreen;