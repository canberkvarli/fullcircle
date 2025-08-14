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

function NameScreen() {
  const { userData, navigateToNextScreen, updateUserData, signOut } =
    useUserContext();
  const router = useRouter();
  const [firstName, setFirstName] = useState(userData.firstName || "");
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user?.displayName) {
        const [first] = user.displayName.split(" ");
        setFirstName(first);
      }
    });
    return unsubscribe;
  }, []);

  // Updated input validation to prevent spaces and special characters
  const handleInputChange = (text: string) => {
    // Only allow letters (no spaces, numbers, or special characters)
    if (/^[a-zA-Z]*$/.test(text) && text.length <= 18) {
      setFirstName(text);
    }
  };

  const handleNameSubmit = async () => {
    if (firstName.trim() === "") {
      Alert.alert("Almost there!", "We'd love to know what to call you");
      return;
    }

    if (!userData.userId || typeof userData.userId !== "string") {
      Alert.alert("Connection Issue", "Something went wrong. Please try again.");
      return;
    }

    const trimmedFirstName = firstName.trim();
    const fullName = trimmedFirstName;

    try {
      await updateUserData({
        firstName: trimmedFirstName,
        fullName,
      });
      navigateToNextScreen();
    } catch (error) {
      console.error("Error submitting name:", error);
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
            onPress={() => {
              signOut();
            }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textDark} />
          </TouchableOpacity>

          {/* Progress Bar below back button */}
          <OnboardingProgressBar currentScreen="NameScreen" />

          {/* Title */}
          <Text style={styles.title}>What should we call you?</Text>

          {/* Input Fields - with underline style */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Share the sound that call to your soul"
                placeholderTextColor={colors.textMuted}
                value={firstName}
                onChangeText={handleInputChange}
                autoFocus
              />
              <View style={styles.inputUnderline} />
            </View>
          </View>
          
          {/* Flexible spacer to push content to bottom */}
          <View style={{ flex: 1, minHeight: 20 }} />

          {/* Bottom elements with affirmation and continue button */}
          <View style={styles.bottomElementsContainer}>
            <Text style={styles.affirmation}>
              Every name carries its own{' '}
              <Text style={styles.highlightedWord}>music</Text>
              {', drawing the right people closer'}
            </Text>
            
            <TouchableOpacity 
              style={[
                styles.submitButton,
                !firstName.trim() && styles.submitButtonDisabled
              ]} 
              onPress={handleNameSubmit}
              disabled={!firstName.trim()}
            >
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color={firstName.trim() ? colors.background : colors.background} 
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
      ...fonts.spiritualTitleFont,
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
      marginBottom: Spacing.md, // Reduced from xl to md
      paddingHorizontal: Spacing.lg,
      fontStyle: "normal", // Changed from italic
    },
    inputContainer: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
    },
    inputWrapper: {
      marginBottom: Spacing.md, // Space between inputs
      position: 'relative', // For positioning the underline
    },
    input: {
      ...fonts.inputFont,
      height: 48, // Slightly shorter than before
      paddingVertical: Spacing.xs,
      paddingHorizontal: 0, // No horizontal padding for underline style
      color: colors.textDark,
      backgroundColor: 'transparent', // No background
      borderWidth: 0, // No border
      marginBottom: 2, // Small gap before underline
    },
    inputUnderline: {
      height: 2, // Thickness of underline
      backgroundColor: colors.primary, // Primary color for underline
      width: '100%',
      borderRadius: 1, // Slightly rounded underline
      opacity: 0.8, // Slightly transparent
    },
    optionalTextContainer: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.md, // Reduced from xl to md
    },
    optionalText: {
      ...fonts.spiritualBodyFont,
      fontStyle: "normal", // Changed from italic
      color: colors.textMuted,
      lineHeight: Typography.sizes.base * 1.3, // Reduced line height slightly
      fontSize: Typography.sizes.sm, // Made text slightly smaller
    },
    linkText: {
      ...fonts.buttonFont,
      fontStyle: "normal",
      textDecorationLine: "underline",
      color: colors.primary,
      fontWeight: Typography.weights.semibold,
    },
    affirmationContainer: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    affirmation: {
      ...fonts.elegantItalicFont,
      textAlign: "left",
      color: colors.textDark, // Darker color for better visibility
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3,
      opacity: 0.8, // Slightly transparent for elegance
      flex: 1, // Take available space but not push button off screen
      marginRight: Spacing.lg, // Add space between text and button
    },
    highlightedWord: {
      color: colors.textDark, // Keep text dark
      textShadowColor: '#FFD700', // Divine yellow glow
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      fontWeight: Typography.weights.medium, // Slightly bolder
      letterSpacing: 0.5, // More letter spacing for emphasis
    },
    buttonContainer: {
      alignItems: 'flex-end',
      marginRight: Spacing.lg,
      marginBottom: Platform.select({ ios: Spacing.lg, android: Spacing.md }),
      paddingBottom: Platform.select({ ios: 10, android: 0 }),
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
    submitButtonDisabled: {
      backgroundColor: colors.textMuted,
      opacity: 0.6,
      ...Platform.select({
        ios: {
          shadowColor: colors.textMuted,
          shadowOpacity: 0.15,
          shadowRadius: 3,
        },
        android: {
          elevation: 3,
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
      fontStyle: "normal", // Changed from italic
    },
    modalSubText: {
      ...fonts.captionFont,
      textAlign: "center",
      color: colors.primary,
      marginBottom: Spacing.xl,
      fontStyle: "normal", // Changed from italic
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

export default NameScreen;