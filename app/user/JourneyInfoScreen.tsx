import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import { useUserContext } from "@/context/UserContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Stack } from "expo-router";

export default function JourneyInfoScreen() {
  const router = useRouter();
  const { userData } = useUserContext();
  const { currentPhotos } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  // Get photos from params (from EditUserProfile) or fallback to userData
  const photos = currentPhotos ? JSON.parse(currentPhotos as string) : (userData?.photos || []);

  console.log('JourneyInfoScreen - userData:', userData ? 'exists' : 'null');
  console.log('JourneyInfoScreen - photos:', photos);
  console.log('JourneyInfoScreen - photos length:', photos?.length);
  console.log('JourneyInfoScreen - photos >= 3:', (photos?.length || 0) >= 3);

  const hasValidSpiritualData = (fieldValue: any) => {
    if (!fieldValue) return false;
    if (Array.isArray(fieldValue)) {
      return fieldValue.some(item => typeof item === 'string' && item.trim().length > 0);
    }
    return typeof fieldValue === 'string' && fieldValue.trim().length > 0;
  };

  const calculateProfileCompletion = () => {
    // Photos: 6/6 = 100%, 3/6 = 50%, etc. (min 3 required)
    const photoProgress = Math.min((photos?.length || 0) / 6, 1) * 100;
    
    // Only count spiritual fields for progress (optional fields)
    const drawsCompleted = hasValidSpiritualData(userData?.spiritualProfile?.draws);
    const practicesCompleted = hasValidSpiritualData(userData?.spiritualProfile?.practices);
    const healingCompleted = hasValidSpiritualData(userData?.spiritualProfile?.healingModalities);

    const spiritualFields = [
      drawsCompleted, // Spiritual draws
      practicesCompleted, // Spiritual practices
      healingCompleted, // Healing modalities
    ];
    
    const completedSpiritualFields = spiritualFields.filter(Boolean).length;
    const spiritualProgress = (completedSpiritualFields / spiritualFields.length) * 100;
    
    // Overall progress: 50% photos + 50% spiritual fields
    const overallProgress = (photoProgress * 0.5) + (spiritualProgress * 0.5);
    
    console.log('Screen progress calculation:', {
      photosLength: photos?.length,
      photoProgress: Math.round(photoProgress),
      spiritualFieldsCompleted: completedSpiritualFields,
      spiritualProgress: Math.round(spiritualProgress),
      overallProgress: Math.round(overallProgress)
    });
    
    return Math.min(overallProgress, 100);
  };

  const renderCompletionFields = () => {
    const fieldStatus = [
      { 
        name: "Photos", 
        completed: (photos.length || 0) >= 3, 
        color: colors.primary,
        description: `Share ${photos.length}/6 photos that show your authentic self`,
        missing: `Add ${Math.max(3 - photos.length, 0)} more photo${Math.max(3 - photos.length, 0) !== 1 ? 's' : ''} to help others see your true essence. More photos = better matches!`,
        icon: "camera-outline"
      },
      { 
        name: "Your Path", 
        completed: hasValidSpiritualData(userData?.spiritualProfile?.draws), 
        color: "#8A2BE2",
        description: "Your spiritual draws and interests",
        missing: "Share your spiritual interests to find like-minded souls. Even if you're just curious about certain practices, being honest about your interests can lead to beautiful conversations!",
        icon: "sparkles-outline"
      },
      { 
        name: "Your Practices", 
        completed: hasValidSpiritualData(userData?.spiritualProfile?.practices), 
        color: "#20B2AA",
        description: "Your spiritual practices and rituals",
        missing: "Share your practices to connect with those on similar journeys. Don't worry if you're just starting out - everyone's journey is unique and valid!",
        icon: "leaf-outline"
      },
      { 
        name: "Healing Modalities", 
        completed: hasValidSpiritualData(userData?.spiritualProfile?.healingModalities), 
        color: "#FF6347",
        description: "Your preferred healing and wellness approaches",
        missing: "Share your healing interests to find wellness-oriented connections. Whether you're experienced or just exploring, your curiosity about healing modalities can spark meaningful conversations!",
        icon: "medical-outline"
      },
    ];

    return (
      <View style={styles.completionFieldsList}>
        {fieldStatus.map((field, index) => (
          <View key={index} style={styles.completionFieldItem}>
            <View style={[
              styles.completionFieldIcon,
              { backgroundColor: field.completed ? field.color + '20' : colors.border }
            ]}>
              <Ionicons 
                name={field.icon as any} 
                size={16} 
                color={field.completed ? field.color : colors.textMuted} 
              />
            </View>
            <View style={styles.completionFieldContent}>
              <Text style={[
                styles.completionFieldText, 
                fonts.spiritualBodyFont,
                { color: field.completed ? colors.textDark : colors.textMuted }
              ]}>
                {field.name}
              </Text>
              <Text style={[
                styles.completionFieldDescription,
                fonts.spiritualBodyFont,
                { color: field.completed ? colors.textLight : colors.textMuted }
              ]}>
                {field.completed ? field.description : field.missing}
              </Text>
            </View>
            <View style={[
              styles.completionStatusIcon,
              { backgroundColor: field.completed ? field.color + '20' : colors.border }
            ]}>
              <Ionicons 
                name={field.completed ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={field.completed ? field.color : colors.textMuted} 
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const progress = calculateProfileCompletion();
  
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
        
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, fonts.spiritualLargeTitleFont, { color: colors.textDark }]}>
              Your Journey
            </Text>
          </View>
          
          <View style={styles.headerButton} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: colors.primary,
                    width: `${progress}%`
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, fonts.spiritualBodyFont, { color: colors.primary }]}>
              {Math.round(progress)}% complete
            </Text>
          </View>

          {/* Field Status */}
          <View style={styles.fieldsSection}>
            <Text style={[styles.sectionTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              What you've shared
            </Text>
            
            {renderCompletionFields()}
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={[styles.sectionTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              Why complete your journey?
            </Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <View style={[styles.benefitIcon, { backgroundColor: '#8A2BE2' + '20' }]}>
                  <Ionicons name="heart" size={16} color="#8A2BE2" />
                </View>
                <Text style={[styles.benefitText, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                  Find deeper, more meaningful connections
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={[styles.benefitIcon, { backgroundColor: '#20B2AA' + '20' }]}>
                  <Ionicons name="sparkles" size={16} color="#20B2AA" />
                </View>
                <Text style={[styles.benefitText, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                  Attract those who resonate with your energy
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={[styles.benefitIcon, { backgroundColor: '#FF6347' + '20' }]}>
                  <Ionicons name="people" size={16} color="#FF6347" />
                </View>
                <Text style={[styles.benefitText, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                  Build authentic relationships that last
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={[styles.benefitIcon, { backgroundColor: '#9D4EDD' + '20' }]}>
                  <Ionicons name="chatbubble-ellipses" size={16} color="#9D4EDD" />
                </View>
                <Text style={[styles.benefitText, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                  Start meaningful conversations about shared interests
                </Text>
              </View>
            </View>
          </View>

          {/* Encouragement Section */}
          <View style={styles.encouragementSection}>
            <Text style={[styles.sectionTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              Remember
            </Text>
            <View style={[styles.encouragementCard, { backgroundColor: colors.primary + '10' }]}>
              <Ionicons name="bulb-outline" size={20} color={colors.primary} />
              <Text style={[styles.encouragementText, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                Even if you're curious about spiritual practices you haven't tried yet, sharing your interests can lead to beautiful conversations and learning opportunities with your connections. Authenticity attracts authenticity!
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
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
    marginTop: Spacing.sm,
  },
  
  headerButton: {
    paddingVertical: Spacing.sm,
    minWidth: 60,
  },
  
  headerCenter: {
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  
  progressSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: Spacing.sm,
  },
  
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  
  progressText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  
  fieldsSection: {
    marginBottom: Spacing.lg,
  },
  
  sectionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
    letterSpacing: 0.3,
  },
  
  completionFieldsList: {
    gap: Spacing.md,
  },
  
  completionFieldItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  
  completionFieldIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  
  completionFieldContent: {
    flex: 1,
  },
  
  completionFieldText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.2,
    marginBottom: Spacing.xs,
  },
  
  completionFieldDescription: {
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.sizes.xs * 1.4,
    letterSpacing: 0.1,
  },
  
  completionStatusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  
  benefitsSection: {
    marginBottom: Spacing.lg,
  },
  
  benefitsList: {
    gap: Spacing.md,
  },
  
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  
  benefitIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  
  benefitText: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.sizes.sm * 1.4,
    flex: 1,
    letterSpacing: 0.2,
  },
  
  encouragementSection: {
    marginBottom: Spacing.lg,
  },
  
  encouragementCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  
  encouragementText: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.sizes.sm * 1.4,
    flex: 1,
    letterSpacing: 0.2,
  },
}); 