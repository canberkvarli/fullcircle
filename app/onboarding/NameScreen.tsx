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
  const [lastName, setLastName] = useState(userData.lastName || "");
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user?.displayName) {
        const [first, last] = user.displayName.split(" ");
        setFirstName(first);
        setLastName(last || "");
      }
    });
    return unsubscribe;
  }, []);

  const handleInputChange = (text: string, type: string) => {
    if (/^[a-zA-Z\s]*$/.test(text)) {
      type === "firstName" ? setFirstName(text) : setLastName(text);
    }
  };

  const handleNameSubmit = async () => {
    if (firstName.trim() === "") {
      Alert.alert("Sacred Energy", "Please share your first name so we can honor your essence");
      return;
    }

    if (!userData.userId || typeof userData.userId !== "string") {
      Alert.alert("Connection Error", "Something mystical went wrong. Please try again.");
      return;
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const fullName = trimmedLastName
      ? `${trimmedFirstName} ${trimmedLastName}`
      : trimmedFirstName;

    try {
      await updateUserData({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        fullName,
      });
      navigateToNextScreen();
    } catch (error) {
      console.error("Error submitting name:", error);
      Alert.alert("Sacred Journey", "The universe needs a moment. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button at top left */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          router.replace("onboarding/LoginSignupScreen" as any);
          signOut();
        }}
      >
        <Ionicons name="chevron-back" size={24} color={colors.textDark} />
      </TouchableOpacity>

      {/* Progress Bar below back button */}
      <OnboardingProgressBar currentScreen="NameScreen" />

      {/* Title */}
      <Text style={styles.title}>How shall we call you?</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Share the sounds that call to your soul
      </Text>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Your calling name"
          placeholderTextColor={colors.textMuted}
          value={firstName}
          onChangeText={(text) => handleInputChange(text, "firstName")}
          autoFocus
        />
        <TextInput
          style={styles.input}
          placeholder="Your family name (if you wish)"
          placeholderTextColor={colors.textMuted}
          value={lastName}
          onChangeText={(text) => handleInputChange(text, "lastName")}
        />
      </View>

      {/* Optional Text with Link */}
      <TouchableOpacity 
        style={styles.optionalTextContainer}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.optionalText}>
          Your family name remains private, and shared only with your destined connections.
          <Text style={styles.linkText}>Why this matters?</Text>
        </Text>
      </TouchableOpacity>

      {/* Affirmation */}
      <Text style={styles.affirmation}>
        Every name carries a unique vibration that calls to kindred spirits
      </Text>

      {/* Submit Button */}
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

      {/* Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Name Sharing</Text>
            <Text style={styles.modalText}>
              In our circle, your calling name creates the first vibration of connection. 
              Your family name remains protected in our cosmic vault, revealed only when hearts 
              align and souls recognize each other through meaningful matches.
            </Text>
            <Text style={styles.modalSubText}>
              This honors both authentic connection and your personal sovereignty.
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>I understand</Text>
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
      ...fonts.spiritualTitleFont, // Using spiritual font for mystical feel
      color: colors.textDark,
      textAlign: "left",
      marginTop: Spacing.sm,
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.lg,
    },
    subtitle: {
      ...fonts.spiritualSubtitleFont, // Using spiritual subtitle font
      color: colors.textLight,
      textAlign: "left",
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.lg,
      fontStyle: "italic",
    },
    inputContainer: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.md, // Reduced from Spacing.lg for tighter spacing
    },
    input: {
      ...fonts.inputFont,
      height: 56,
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.sm,
      color: colors.textDark,
      // Enhanced focus styling
      // borderColor: colors.primary + '20',
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    optionalTextContainer: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    optionalText: {
      ...fonts.spiritualBodyFont, // Using spiritual body font
      fontStyle: "italic",
      color: colors.textMuted,
      lineHeight: Typography.sizes.base * 1.5,
    },
    linkText: {
      ...fonts.buttonFont,
      fontStyle: "normal",
      textDecorationLine: "underline",
      color: colors.primary,
      fontWeight: Typography.weights.semibold,
    },
    affirmation: {
      ...fonts.affirmationFont,
      position: 'absolute',
      bottom: Platform.select({ ios: 130, android: 110 }),
      left: Spacing.lg,
      right: Spacing.lg,
      textAlign: "center",
      fontStyle: "italic",
      color: colors.textLight,
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3, // Slight letter spacing for elegance
    },
    submitButton: {
      position: "absolute",
      bottom: Platform.select({ ios: 50, android: 30 }),
      right: Spacing.xl,
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
      backgroundColor: "rgba(0, 0, 0, 0.6)", // Darker overlay for better focus
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
      ...fonts.spiritualTitleFont, // Using spiritual font for modal title
      fontSize: Typography.sizes.xl, // Slightly smaller than page title
      color: colors.textDark,
      marginBottom: Spacing.lg,
      textAlign: "center",
    },
    modalText: {
      ...fonts.spiritualBodyFont, // Using spiritual body font
      textAlign: "center",
      color: colors.textLight,
      lineHeight: Typography.sizes.base * 1.6,
      marginBottom: Spacing.md,
      fontStyle: "italic",
    },
    modalSubText: {
      ...fonts.captionFont,
      textAlign: "center",
      color: colors.primary,
      marginBottom: Spacing.xl,
      fontStyle: "italic",
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