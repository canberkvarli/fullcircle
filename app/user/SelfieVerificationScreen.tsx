import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import * as ImagePicker from 'expo-image-picker';

export default function SelfieVerification() {
  const router = useRouter();
  const { userData, updateUserSettings } = useUserContext();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);
  
  const [verificationStep, setVerificationStep] = useState<'intro' | 'capture' | 'processing' | 'success' | 'failed'>('intro');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

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

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Sacred Camera Access',
        'We need camera permission to verify your divine essence. Please enable camera access in your device settings.'
      );
      return false;
    }
    return true;
  };

  const takeSelfie = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    setVerificationStep('capture');
    startPulseAnimation();

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        processVerification(result.assets[0]);
      } else {
        setVerificationStep('intro');
      }
    } catch (error) {
      Alert.alert('Cosmic Interference', 'Unable to access your camera. Please try again.');
      setVerificationStep('intro');
    }
  };

  const processVerification = async (imageAsset: any) => {
    setVerificationStep('processing');
    setIsProcessing(true);
    animateProgress();

    try {
      // TODO: Implement actual verification logic
      // This is where you'd call your backend API for verification
      // Example: await verifyUserSelfie(imageAsset.base64, userData.userId);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // For demo purposes, randomly succeed or fail
      const success = Math.random() > 0.2; // 80% success rate for demo
      
      if (success) {
        await updateUserSettings({
          isSelfieVerified: true,
          selfieVerificationDate: new Date(),
        });
        setVerificationStep('success');
      } else {
        setVerificationStep('failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
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
        <View style={[styles.iconBackground, { backgroundColor: '#8B4513' + '20' }]}>
          <Ionicons name="camera" size={48} color="#8B4513" />
        </View>
      </View>
      
      <Text style={[styles.title, fonts.spiritualTitleFont]}>
        Verify Your Sacred Essence
      </Text>
      
      <Text style={[styles.description, fonts.spiritualBodyFont]}>
        Help us ensure you are the divine soul behind this beautiful profile. This sacred verification builds trust within our cosmic community.
      </Text>
      
      <View style={styles.instructionsContainer}>
        <Text style={[styles.instructionsTitle, fonts.spiritualBodyFont]}>
          Sacred Guidelines:
        </Text>
        
        {[
          'Look directly into the camera with your authentic self',
          'Ensure your full face is clearly visible and well-lit',
          'Remove any masks, sunglasses, or spiritual veils',
          'Be in a quiet space where your energy can shine through'
        ].map((instruction, index) => (
          <View key={index} style={styles.instructionRow}>
            <Ionicons name="checkmark-circle" size={16} color="#8B4513" />
            <Text style={[styles.instructionText, fonts.captionFont]}>
              {instruction}
            </Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity style={styles.primaryButton} onPress={takeSelfie}>
        <Ionicons name="camera" size={20} color="#FFFFFF" style={styles.buttonIcon} />
        <Text style={[styles.primaryButtonText, fonts.buttonFont]}>
          Capture Sacred Selfie
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderProcessingStep = () => (
    <View style={styles.contentContainer}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconBackground, { backgroundColor: '#8B4513' + '20' }]}>
          <ActivityIndicator size="large" color="#8B4513" />
        </View>
      </View>
      
      <Text style={[styles.title, fonts.spiritualTitleFont]}>
        Analyzing Your Divine Energy
      </Text>
      
      <Text style={[styles.description, fonts.spiritualBodyFont]}>
        The universe is verifying your sacred essence against your profile. This cosmic process ensures the authenticity of your spiritual presence.
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
          Connecting with cosmic verification spirits...
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
      
      <Text style={[styles.title, fonts.spiritualTitleFont]}>
        Divine Verification Complete! ✨
      </Text>
      
      <Text style={[styles.description, fonts.spiritualBodyFont]}>
        Your sacred essence has been verified! You now carry the cosmic seal of authenticity, building greater trust with kindred spirits seeking genuine connections.
      </Text>
      
      <View style={styles.benefitsContainer}>
        <Text style={[styles.benefitsTitle, fonts.spiritualBodyFont]}>
          Sacred Benefits Unlocked:
        </Text>
        
        {[
          'Enhanced visibility to seeking souls',
          'Sacred verification badge on your profile',
          'Increased trust from potential connections',
          'Priority in cosmic matching algorithms'
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
          Continue Sacred Journey
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
      
      <Text style={[styles.title, fonts.spiritualTitleFont]}>
        Cosmic Alignment Needed
      </Text>
      
      <Text style={[styles.description, fonts.spiritualBodyFont]}>
        The verification spirits couldn't align your sacred selfie with your profile energy. This sometimes happens when lighting or angles disrupt the cosmic flow.
      </Text>
      
      <View style={styles.tipsContainer}>
        <Text style={[styles.tipsTitle, fonts.spiritualBodyFont]}>
          Try These Sacred Adjustments:
        </Text>
        
        {[
          'Find better natural or spiritual lighting',
          'Ensure your face matches your profile photos',
          'Remove any energetic blockages (accessories)',
          'Center yourself and try again with pure intention'
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
            Try Sacred Verification Again
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, fonts.spiritualTitleFont]}>
          Sacred Verification
        </Text>
        <View style={styles.headerRight} />
      </View>

      {renderContent()}
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
      borderWidth: 2,
      borderColor: '#8B4513' + '40',
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
      backgroundColor: '#8B4513',
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
      backgroundColor: '#8B4513',
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.xl,
      width: '100%',
      ...Platform.select({
        ios: {
          shadowColor: '#8B4513',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: {
          elevation: 6,
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
  });
};