import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  View,
  useColorScheme,
  Platform,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import auth from "@react-native-firebase/auth";
import { useUserContext } from "@/context/UserContext";
import { Ionicons } from '@expo/vector-icons';
import OnboardingProgressBar from "../../components/OnboardingProgressBar";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

function FamilyNameScreen() {
  const { userData, navigateToNextScreen, navigateToPreviousScreen, updateUserData, signOut } =
    useUserContext();
  const router = useRouter();
  const [familyName, setFamilyName] = useState(userData.familyName || "");
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user?.displayName) {
        const nameParts = user.displayName.split(" ");
        if (nameParts.length > 1) {
          setFamilyName(nameParts.slice(1).join(" "));
        }
      }
    });
    return unsubscribe;
  }, []);

  // Updated input validation to prevent spaces and special characters
  const handleInputChange = (text: string) => {
    // Only allow letters (no spaces, numbers, or special characters)
    if (/^[a-zA-Z]*$/.test(text) && text.length <= 18) {
      setFamilyName(text);
    }
  };

  const handleFamilyNameSubmit = async () => {
    if (!userData.userId || typeof userData.userId !== "string") {
      Alert.alert("Connection Issue", "Something went wrong. Please try again.");
      return;
    }

    const trimmedFamilyName = familyName.trim();
    const fullName = trimmedFamilyName
      ? `${userData.firstName || ""} ${trimmedFamilyName}`
      : userData.firstName || "";

    try {
      await updateUserData({
        familyName: trimmedFamilyName,
        fullName,
      });
      navigateToNextScreen();
    } catch (error) {
      console.error("Error submitting last name:", error);
      Alert.alert("Oops!", "Something went wrong. Please try again.");
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button at top left */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={navigateToPreviousScreen}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textDark} />
          </TouchableOpacity>

          {/* Progress Bar below back button */}
          <OnboardingProgressBar currentScreen="FamilyNameScreen" />

          {/* Title */}
          <Text style={styles.title}>What's your family name</Text>

          {/* Input Fields - with underline style */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Your family name (optional)"
                placeholderTextColor={colors.textMuted}
                value={familyName}
                onChangeText={handleInputChange}
                autoFocus
              />
              <View style={styles.inputUnderline} />
            </View>
            
            {/* Compact privacy note */}
            <View style={styles.privacyNoteContainer}>
              <Text style={styles.privacyNote}>
                Private • <Text style={styles.linkText} onPress={() => setIsModalVisible(true)}>Learn more</Text>
              </Text>
            </View>
          </View>
          
          {/* Flexible spacer to push content to bottom */}
          <View style={{ flex: 1, minHeight: 20 }} />

          {/* Bottom elements with affirmation and continue button */}
          <View style={styles.bottomElementsContainer}>
            <Text style={styles.affirmation}>
              Every name carries its own{' '}
              <Text style={styles.highlightedWord}>story</Text>
              {', waiting to be shared'}
            </Text>
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleFamilyNameSubmit}
            >
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color={colors.background} 
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Privacy & Connection</Text>
            <Text style={styles.modalText}>
              Your first name creates that initial spark of recognition. 
              Your family name stays tucked away in your profile, only shared when you both 
              feel ready to let someone deeper into your world.
            </Text>
            <Text style={styles.modalSubText}>
              This gives you control over how much you share and when.
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colorScheme: 'light' | 'dark', fonts: ReturnType<typeof useFont>) => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: Spacing.lg,
      marginTop: Platform.select({ ios: 0, android: Spacing.lg }),
    },
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: Spacing.xl,
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
      marginLeft: Spacing.md,
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
    title: {
      ...fonts.spiritualityTitleFont,
      color: colors.textDark,
      textAlign: "left",
      marginTop: Spacing.sm,
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.lg,
    },
    subtitle: {
      ...fonts.spiritualSubtitleFont,
      color: colors.textLight,
      textAlign: "left",
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.lg,
      fontStyle: "normal",
    },
    inputContainer: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xs,
    },
    inputWrapper: {
      position: 'relative',
    },
    input: {
      ...fonts.inputFont,
      height: 48,
      paddingVertical: Spacing.xs,
      paddingHorizontal: 0,
      color: colors.textDark,
      backgroundColor: 'transparent',
      borderWidth: 0,
      marginBottom: 2,
    },
    inputUnderline: {
      height: 2,
      backgroundColor: colors.primary,
      width: '100%',
      borderRadius: 1,
      opacity: 0.8,
    },
    privacyNoteContainer: {
      marginTop: Spacing.xs,
      alignItems: 'flex-start',
    },
    privacyNote: {
      ...fonts.captionFont,
      color: colors.textMuted,
      fontSize: Typography.sizes.xs,
    },

    linkText: {
      ...fonts.captionFont,
      fontStyle: "normal",
      textDecorationLine: "underline",
      color: colors.primary,
      fontWeight: Typography.weights.medium,
      fontSize: Typography.sizes.xs,
    },

    affirmation: {
      ...fonts.elegantItalicFont,
      textAlign: "left",
      color: colors.textDark,
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3,
      opacity: 0.8,
      flex: 1,
      marginRight: Spacing.lg,
    },
    highlightedWord: {
      color: colors.textDark,
      textShadowColor: '#FFD700',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      fontWeight: Typography.weights.medium,
      letterSpacing: 0.5,
    },

    bottomElementsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      marginBottom: Platform.select({ ios: Spacing.lg, android: Spacing.md }),
      paddingBottom: Platform.select({ ios: 10, android: 0 }),
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.full,
      width: 56,
      height: 56,
      justifyContent: "center",
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
      }),
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      width: "88%",
      maxWidth: 420,
      padding: Spacing['2xl'],
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.primary + '20',
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.3,
          shadowRadius: 24,
        },
        android: {
          elevation: 12,
        },
      }),
    },
    modalTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.xl,
      color: colors.textDark,
      marginBottom: Spacing.lg,
      textAlign: "center",
    },
    modalText: {
      ...fonts.spiritualBodyFont,
      textAlign: "center",
      color: colors.textLight,
      lineHeight: Typography.sizes.base * 1.6,
      marginBottom: Spacing.md,
      fontStyle: "normal",
    },
    modalSubText: {
      ...fonts.captionFont,
      textAlign: "center",
      color: colors.primary,
      marginBottom: Spacing.xl,
      fontStyle: "normal",
      fontWeight: Typography.weights.medium,
    },
    modalCloseButton: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.full,
      minWidth: 140,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    modalCloseText: {
      ...fonts.buttonFont,
      color: colors.background,
      textAlign: 'center',
    },
  });
};

export default FamilyNameScreen; 