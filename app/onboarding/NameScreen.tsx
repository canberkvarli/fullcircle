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
  const styles = createStyles(colorScheme);

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
      Alert.alert("Error", "First name cannot be empty");
      return;
    }

    if (!userData.userId || typeof userData.userId !== "string") {
      Alert.alert("Error", "Invalid user ID");
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
      <Text style={styles.title}>What's your name?</Text>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="First name"
          placeholderTextColor={colors.textMuted}
          value={firstName}
          onChangeText={(text) => handleInputChange(text, "firstName")}
          autoFocus
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name (optional)"
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
          Last name is optional and only shared with matches.{" "}
          <Text style={styles.linkText}>Why?</Text>
        </Text>
      </TouchableOpacity>

      {/* Affirmation */}
      <Text style={styles.affirmation}>
        Every name carries a unique vibration
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
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Why We Ask for Your Name</Text>
            <Text style={styles.modalText}>
              Sharing your name creates a warm and authentic connection. Your
              last name is optional and will only be shared with people you
              match with, ensuring your privacy while allowing for a more
              personal connection.
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colorScheme: 'light' | 'dark') => {
  const colors = Colors[colorScheme];
  const { titleFont, inputFont, captionFont, affirmationFont, buttonFont, modalTitleFont, modalBodyFont } = useFont();
  
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
      ...titleFont,
      color: colors.textDark,
      textAlign: "left",
      marginTop: Spacing.sm,
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.lg,
    },
    inputContainer: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    input: {
      ...inputFont,
      height: 56,
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
      color: colors.textDark,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    optionalTextContainer: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    optionalText: {
      ...captionFont,
      fontStyle: "italic",
      color: colors.textLight === '#F5F5F5' ? '#8B8580' : colors.textMuted,
      lineHeight: Typography.sizes.sm * 1.4,
    },
    linkText: {
      ...buttonFont,
      fontStyle: "normal",
      textDecorationLine: "underline",
      color: colors.primary,
    },
    affirmation: {
      ...affirmationFont,
      position: 'absolute',
      bottom: Platform.select({ ios: 120, android: 100 }),
      left: Spacing.lg,
      right: Spacing.lg,
      textAlign: "center",
      fontStyle: "italic",
      color: colors.textLight === '#F5F5F5' ? '#6B6560' : colors.textLight,
      lineHeight: Typography.sizes.lg * 1.4,
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
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
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
          shadowRadius: 3,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      width: "85%",
      maxWidth: 400,
      padding: Spacing['2xl'],
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
        },
        android: {
          elevation: 10,
        },
      }),
    },
    modalTitle: {
      ...modalTitleFont,
      color: colors.textDark,
      marginBottom: Spacing.lg,
      textAlign: "center",
    },
    modalText: {
      ...modalBodyFont,
      textAlign: "center",
      color: colors.textLight === '#F5F5F5' ? '#6B6560' : colors.textLight,
      lineHeight: Typography.sizes.base * 1.5,
      marginBottom: Spacing.xl,
    },
    modalCloseButton: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.full,
      minWidth: 120,
    },
    modalCloseText: {
      ...buttonFont,
      color: colors.background,
      textAlign: 'center',
    },
  });
};

export default NameScreen;