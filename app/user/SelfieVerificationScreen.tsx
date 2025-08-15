import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  Platform,
  Alert,
  Animated,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useUserContext } from "@/context/UserContext";

import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";

import { useFont } from "@/hooks/useFont";
import OuroborosLoader from "@/components/ouroboros/OuroborosLoader";
import { SelfieVerificationService, VerificationResult } from "@/services/SelfieVerificationService";
import * as ImagePicker from 'expo-image-picker';

// Soft, spiritual cherry red color scheme
const CHERRY_RED = '#A67C8E';
const CHERRY_RED_LIGHT = '#C4A5A7';
const CHERRY_RED_DARK = '#8B6B7A';

export default function SelfieVerificationScreen() {
  const router = useRouter();
  const { userData, updateUserSettings, updateUserData } = useUserContext();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);
  
  const [verificationStep, setVerificationStep] = useState<'intro' | 'capture' | 'processing' | 'success' | 'failed'>('intro');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Get profile image URL on component mount
  useEffect(() => {
    if (userData) {
      const profileUrl = SelfieVerificationService.getProfileImageUrl(userData);
      setProfileImageUrl(profileUrl);
      
      if (!profileUrl) {
        Alert.alert(
          'Profile Photo Required',
          'Please add a profile photo before attempting verification. This helps us verify your identity.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    }
  }, [userData]);

  // Start pulsing animation for camera
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Progress animation
  const animateProgress = () => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();
  };

  const takeSelfie = async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take a selfie.');
        return;
      }

      // Launch camera with front camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        cameraType: ImagePicker.CameraType.front,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        setVerificationStep('capture');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const processVerification = async (imageAsset: any) => {
    if (!profileImageUrl) {
      Alert.alert('Error', 'No profile image found for comparison');
      setVerificationStep('intro');
      return;
    }

    setVerificationStep('processing');
    setIsProcessing(true);
    animateProgress();

    try {
      // Validate the captured image
      const validation = SelfieVerificationService.validateImage(imageAsset.uri);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid image');
      }

      // Get the base64 data for the selfie
      let imageBase64 = imageAsset.uri;
      if (imageAsset.base64) {
        imageBase64 = imageAsset.base64;
      }

      // Call the verification service
      const result = await SelfieVerificationService.verifySelfie(
        imageBase64,
        profileImageUrl
      );

      setVerificationResult(result);

      if (result.verified) {
        // Update user context with verification status in settings
        await updateUserData({
          settings: {
            ...(userData.settings || {}),
            isSelfieVerified: true,
            selfieVerificationDate: new Date(),
          }
        });
        // Update verification status in Firestore
        await SelfieVerificationService.updateUserVerificationStatus(true, result.score);
        
        setVerificationStep('success');
      } else {
        setVerificationStep('failed');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      Alert.alert(
        'Verification Failed',
        error.message || 'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
      setVerificationStep('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetVerification = () => {
    setVerificationStep('intro');
    setCapturedImage(null);
    pulseAnim.setValue(1);
    progressAnim.setValue(0);
  };

  const renderIntroStep = () => (
    <View style={styles.contentContainer}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconBackground, { backgroundColor: CHERRY_RED + '20' }]}>
          <Ionicons name="aperture" size={48} color={CHERRY_RED_LIGHT} />
        </View>
      </View>
      
      <Text style={[styles.title, fonts.spiritualLargeTitleFont]}>
        Verify Your Identity
      </Text>
      
      <Text style={[styles.description, fonts.spiritualBodyFont]}>
        Help us ensure you are the person behind this beautiful profile. This verification builds trust within our community.
      </Text>
      
      <View style={styles.instructionsContainer}>
        <Text style={[styles.instructionsTitle, fonts.spiritualBodyFont]}>
          Guidelines:
        </Text>
        
        {[
          'Look directly into the camera with your authentic self',
          'Ensure your full face is clearly visible and well-lit',
          'Remove any masks, sunglasses, or accessories',
          'Be in a quiet space where you can focus'
        ].map((instruction, index) => (
          <View key={index} style={styles.instructionRow}>
            <Ionicons name="checkmark-circle" size={16} color={CHERRY_RED_LIGHT} />
            <Text style={[styles.instructionText, fonts.captionFont]}>
              {instruction}
            </Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity style={styles.primaryButton} onPress={takeSelfie}>
        <Ionicons name="aperture" size={20} color="#FFFFFF" style={styles.buttonIcon} />
        <Text style={[styles.primaryButtonText, fonts.buttonFont]}>
          Take Selfie
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCaptureStep = () => (
    <View style={styles.contentContainer}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconBackground, { backgroundColor: '#FF9800' + '20' }]}>
          <Ionicons name="camera" size={48} color="#FF9800" />
        </View>
      </View>
      
      <Text style={[styles.title, fonts.spiritualLargeTitleFont]}>
        Review Your Selfie
      </Text>
      
      <Text style={[styles.description, fonts.spiritualBodyFont]}>
        Take a moment to review your photo. Make sure your face is clearly visible and well-lit before proceeding with verification.
      </Text>
      
      {capturedImage && (
        <View style={styles.imagePreviewContainer}>
          <Image 
            source={{ uri: capturedImage }} 
            style={styles.imagePreview}
            resizeMode="cover"
          />
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: '#4CAF50' }]} 
          onPress={() => processVerification({ uri: capturedImage, base64: null })}
        >
          <Ionicons name="checkmark" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={[styles.primaryButtonText, fonts.buttonFont]}>
            Verify This Photo
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={resetVerification}
        >
          <Ionicons name="camera" size={20} color={colors.textMuted} style={styles.buttonIcon} />
          <Text style={[styles.secondaryButtonText, fonts.buttonFont]}>
            Take Another Photo
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProcessingStep = () => (
    <View style={styles.contentContainer}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconBackground, { backgroundColor: '#00BCD4' + '20' }]}>
          <OuroborosLoader 
              size={50}
              duration={3000}
              fillColor="#E0F7FA"
              strokeColor="#00BCD4"
              strokeWidth={1.5}
              loop={true}
            />
        </View>
      </View>
      
      <Text style={[styles.title, fonts.spiritualLargeTitleFont]}>
        Analyzing Your Photo
      </Text>
      
      <Text style={[styles.description, fonts.spiritualBodyFont]}>
        We're verifying your photo against your profile. This process ensures the authenticity of your identity.
      </Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, fonts.captionFont]}>
          Processing your verification...
        </Text>
      </View>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.contentContainer}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconBackground, { backgroundColor: '#4CAF50' + '20' }]}>
          <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
        </View>
      </View>
      
      <Text style={[styles.title, fonts.spiritualLargeTitleFont]}>
        Verification Complete!
      </Text>
      
      <Text style={[styles.description, fonts.spiritualBodyFont]}>
        Your identity has been verified! You now carry a verification badge, building greater trust with others seeking genuine connections.
      </Text>
      
      {verificationResult && (
        <View style={[styles.verificationDetailsContainer, { backgroundColor: '#4CAF50' + '10' }]}>
          <Text style={[styles.verificationDetailsTitle, fonts.spiritualBodyFont]}>
            Verification Details:
          </Text>
          <View style={styles.verificationDetailRow}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={[styles.verificationDetailText, fonts.captionFont]}>
              Similarity Score: {Math.round(verificationResult.score * 100)}%
            </Text>
          </View>
          <View style={styles.verificationDetailRow}>
            <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
            <Text style={[styles.verificationDetailText, fonts.captionFont]}>
              Status: Verified
            </Text>
          </View>
        </View>
      )}
      
      <View style={styles.benefitsContainer}>
        <Text style={[styles.benefitsTitle, fonts.spiritualBodyFont]}>
          Benefits Unlocked:
        </Text>
        
        {[
          'Enhanced visibility to other users',
          'Verification badge on your profile',
          'Increased trust from potential connections',
          'Priority in our matching system'
        ].map((benefit, index) => (
          <View key={index} style={styles.benefitRow}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={[styles.benefitText, fonts.captionFont]}>
              {benefit}
            </Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
        <Ionicons name="heart" size={20} color="#FFFFFF" style={styles.buttonIcon} />
        <Text style={[styles.primaryButtonText, fonts.buttonFont]}>
          Continue Journey
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFailedStep = () => (
    <View style={styles.contentContainer}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconBackground, { backgroundColor: '#FF6B6B' + '20' }]}>
          <Ionicons name="close-circle" size={48} color="#FF6B6B" />
        </View>
      </View>
      
      <Text style={[styles.title, fonts.spiritualLargeTitleFont]}>
        Verification Failed
      </Text>
      
      <Text style={[styles.description, fonts.spiritualBodyFont]}>
        We couldn't verify your photo against your profile. This sometimes happens when lighting or angles make it difficult to match.
      </Text>
      
      {verificationResult && (
        <View style={[styles.verificationDetailsContainer, { backgroundColor: '#FF6B6B' + '10' }]}>
          <Text style={[styles.verificationDetailsTitle, fonts.spiritualBodyFont]}>
            Verification Details:
          </Text>
          <View style={styles.verificationDetailRow}>
            <Ionicons name="information-circle" size={16} color="#FF6B6B" />
            <Text style={[styles.verificationDetailText, fonts.captionFont]}>
              Reason: {verificationResult.reason}
            </Text>
          </View>
          {verificationResult.score > 0 && (
            <View style={styles.verificationDetailRow}>
              <Ionicons name="analytics" size={16} color="#FF6B6B" />
              <Text style={[styles.verificationDetailText, fonts.captionFont]}>
                Similarity Score: {Math.round(verificationResult.score * 100)}%
              </Text>
            </View>
          )}
        </View>
      )}
      
      <View style={styles.tipsContainer}>
        <Text style={[styles.tipsTitle, fonts.spiritualBodyFont]}>
          Try These Adjustments:
        </Text>
        
        {[
          'Find better natural lighting',
          'Ensure your face matches your profile photos',
          'Remove any accessories',
          'Take a clear photo and try again'
        ].map((tip, index) => (
          <View key={index} style={styles.tipRow}>
            <Ionicons name="bulb" size={16} color="#FFD700" />
            <Text style={[styles.tipText, fonts.captionFont]}>
              {tip}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={resetVerification}>
          <Ionicons name="camera" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={[styles.primaryButtonText, fonts.buttonFont]}>
            Try Verification Again
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={[styles.secondaryButtonText, fonts.buttonFont]}>
            Continue Without Verification
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (verificationStep) {
      case 'intro':
        return renderIntroStep();
      case 'capture':
        return renderCaptureStep();
      case 'processing':
        return renderProcessingStep();
      case 'success':
        return renderSuccessStep();
      case 'failed':
        return renderFailedStep();
      default:
        return renderIntroStep();
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      {/* Floating Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.floatingBackButton}>
        <Ionicons name="chevron-back" size={24} color={colors.textDark} />
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colorScheme: 'light' | 'dark', fonts: ReturnType<typeof useFont>) => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingTop: Platform.OS === 'ios' ? 20 : 10,
      paddingBottom: Spacing['3xl'],
    },
    floatingBackButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 60 : 40,
      left: Spacing.lg,
      zIndex: 1000,
      padding: Spacing.sm,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing.lg,
      paddingTop: Platform.OS === 'ios' ? 20 : 40,
      paddingBottom: Spacing.lg,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: Spacing.xs,
      marginRight: Spacing.sm,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerTitle: {
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      letterSpacing: 0.5,
    },
    headerRight: {
      width: 32,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.xl,
      alignItems: 'center',
    },
    iconContainer: {
      marginBottom: Spacing.xl,
    },
    iconBackground: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: CHERRY_RED_LIGHT + '30',
      backgroundColor: CHERRY_RED + '10',
    },
    title: {
      fontSize: Typography.sizes['2xl'],
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      textAlign: 'center',
      marginBottom: Spacing.lg,
      letterSpacing: 0.5,
    },
    description: {
      fontSize: Typography.sizes.base,
      color: colors.textLight,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.md,
      fontStyle: 'italic',
    },
    instructionsContainer: {
      width: '100%',
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    instructionsTitle: {
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.semibold,
      color: colors.textDark,
      marginBottom: Spacing.md,
      letterSpacing: 0.3,
    },
    instructionRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: Spacing.sm,
    },
    instructionText: {
      fontSize: Typography.sizes.sm,
      color: colors.textLight,
      marginLeft: Spacing.sm,
      flex: 1,
      lineHeight: 20,
    },
    benefitsContainer: {
      width: '100%',
      backgroundColor: '#4CAF50' + '10',
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.xl,
      borderWidth: 1,
      borderColor: '#4CAF50' + '20',
    },
    benefitsTitle: {
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.semibold,
      color: colors.textDark,
      marginBottom: Spacing.md,
      letterSpacing: 0.3,
    },
    benefitRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: Spacing.sm,
    },
    benefitText: {
      fontSize: Typography.sizes.sm,
      color: colors.textLight,
      marginLeft: Spacing.sm,
      flex: 1,
      lineHeight: 20,
    },
    tipsContainer: {
      width: '100%',
      backgroundColor: '#FFD700' + '10',
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.xl,
      borderWidth: 1,
      borderColor: '#FFD700' + '20',
    },
    tipsTitle: {
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.semibold,
      color: colors.textDark,
      marginBottom: Spacing.md,
      letterSpacing: 0.3,
    },
    tipRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: Spacing.sm,
    },
    tipText: {
      fontSize: Typography.sizes.sm,
      color: colors.textLight,
      marginLeft: Spacing.sm,
      flex: 1,
      lineHeight: 20,
    },
    progressContainer: {
      width: '100%',
      alignItems: 'center',
      marginTop: Spacing.xl,
    },
    progressBackground: {
      width: '100%',
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: Spacing.md,
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#00BCD4',
      borderRadius: 4,
    },
    progressText: {
      fontSize: Typography.sizes.sm,
      color: colors.textMuted,
      fontStyle: 'italic',
    },
    buttonContainer: {
      width: '100%',
      gap: Spacing.md,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: CHERRY_RED,
      borderRadius: BorderRadius.xl,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.xl,
      width: '100%',
      borderWidth: 1,
      borderColor: CHERRY_RED_LIGHT,
      ...Platform.select({
        ios: {
          shadowColor: CHERRY_RED,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.semibold,
      letterSpacing: 0.5,
    },
    secondaryButton: {
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.xl,
      width: '100%',
      alignItems: 'center',
    },
    secondaryButtonText: {
      color: colors.textMuted,
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.medium,
    },
    buttonIcon: {
      marginRight: Spacing.sm,
    },
    imagePreviewContainer: {
      width: '100%',
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    imagePreview: {
      width: 200,
      height: 200,
      borderRadius: BorderRadius.xl,
      borderWidth: 3,
      borderColor: colors.primary + '40',
    },
    verificationDetailsContainer: {
      width: '100%',
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.xl,
      borderWidth: 1,
      borderColor: '#4CAF50' + '20',
    },
    verificationDetailsTitle: {
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.semibold,
      color: colors.textDark,
      marginBottom: Spacing.md,
      letterSpacing: 0.3,
    },
    verificationDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    verificationDetailText: {
      fontSize: Typography.sizes.sm,
      color: colors.textLight,
      marginLeft: Spacing.sm,
      flex: 1,
      lineHeight: 20,
    },
  });
};