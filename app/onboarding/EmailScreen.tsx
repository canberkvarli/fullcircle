import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  View,
  Modal,
  TouchableWithoutFeedback,
  useColorScheme,
  Platform,
  StyleSheet,
} from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import OnboardingProgressBar from "../../components/OnboardingProgressBar";
import { useUserContext } from "../../context/UserContext";
import { FIREBASE_AUTH } from "@/services/FirebaseConfig";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

function EmailScreen() {
  const {
    userData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
    googleCredential,
  } = useUserContext();
  const [email, setEmail] = useState("");
  const [marketingRequested, setMarketingRequested] = useState(
    userData?.marketingRequested ?? true
  );
  const [modalVisible, setModalVisible] = useState(false);
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);

  GoogleSignin.configure({
    webClientId:
      "856286042200-nv9vv4js8j3mqhu07acdbnf0hbp8feft.apps.googleusercontent.com",
  });

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user?.email) {
        setEmail(user.email);
      }
    });
    return unsubscribe;
  }, []);

  const handleEmailSubmit = async () => {
    if (email.trim() === "") {
      Alert.alert("Sacred Connection", "Please share your digital sanctuary address to stay connected");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Energy Alignment", "The cosmic address seems incomplete. Please check and try again");
      return;
    }

    try {
      await updateUserData({
        email,
        marketingRequested: marketingRequested ? false : true,
      });
      setModalVisible(true);
    } catch (error: any) {
      Alert.alert("Cosmic Interference", "The universe had trouble saving your information: " + error.message);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const { user } =
        await FIREBASE_AUTH.signInWithCredential(googleCredential);
      const userId = await user.getIdToken();
      console.log("userID from Google Sign-In:", userId);

      await updateUserData({
        userId,
        GoogleSSOEnabled: true,
      });

      if (!user.emailVerified) {
        await user.sendEmailVerification();
        navigateToNextScreen();
      }
    } catch (error) {
      console.error("Google sign-in error: ", error);
      Alert.alert("Divine Connection", "The cosmic bridge to Google couldn't be established: " + error);
    }
  };

  const handleModalOption = (option: number) => {
    switch (option) {
      case 1:
        Alert.alert("Sacred Apple Connection", "This divine pathway is being prepared for you!");
        break;
      case 2:
        if (googleCredential) {
          Alert.alert(
            "Switch Google Energy",
            "Would you like to align with a different Google essence?",
            [
              {
                text: "Keep Current",
                style: "cancel",
              },
              {
                text: "Switch Energy",
                onPress: () => {
                  GoogleSignin.signOut().then(() => handleGoogleSignIn());
                },
              },
            ]
          );
        } else {
          handleGoogleSignIn();
        }
        break;
      default:
        navigateToNextScreen();
        break;
    }
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button at top left */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={navigateToPreviousScreen}
      >
        <Ionicons name="chevron-back" size={24} color={colors.textDark} />
      </TouchableOpacity>

      {/* Progress Bar below back button */}
      <OnboardingProgressBar currentScreen="EmailScreen" />

      {/* Title */}
      <Text style={styles.title}>Open sacred channels</Text>
      
      {/* Subtitle */}
      <Text style={styles.subtitle}>Share your digital sanctuary address</Text>
      
      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="your.essence@cosmos.com"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoFocus={true}
      />
      
      {/* Marketing Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={styles.toggle}
          onPress={() => setMarketingRequested((prev) => !prev)}
        >
          <MaterialCommunityIcons
            name={marketingRequested ? "checkbox-blank-outline" : "checkbox-marked"}
            size={24}
            color={colors.primary}
          />
          <Text style={styles.toggleText}>
            I prefer to receive only essential cosmic communications about my Circle journey
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Affirmation */}
      <Text style={styles.affirmation}>
        Communication flows effortlessly when hearts are aligned
      </Text>
      
      {/* Submit Button */}
      <TouchableOpacity 
        style={[
          styles.submitButton,
          !email.trim() && styles.submitButtonDisabled
        ]} 
        onPress={handleEmailSubmit}
        disabled={!email.trim()}
      >
        <Ionicons 
          name="chevron-forward" 
          size={24} 
          color={email.trim() ? colors.background : colors.background} 
        />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Strengthen your cosmic connection</Text>
                <Text style={styles.modalSubtitle}>
                  Linking your spiritual account creates deeper resonance and easier access to your Circle.
                </Text>
                {[
                  { option: 1, text: "Connect your Apple essence", icon: "logo-apple" },
                  { option: 2, text: "Connect your Google energy", icon: "logo-google" },
                  { option: 3, text: "Continue with current flow", icon: "checkmark-circle" },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.option}
                    style={[
                      styles.modalOption,
                      item.option === 2 && googleCredential
                        ? styles.connectedOption
                        : null,
                    ]}
                    onPress={() => handleModalOption(item.option)}
                  >
                    <Ionicons 
                      name={item.icon as any} 
                      size={20} 
                      color={item.option === 2 && googleCredential ? colors.success : colors.textDark}
                      style={styles.modalOptionIcon}
                    />
                    <Text
                      style={[
                        styles.modalOptionText,
                        item.option === 2 && googleCredential
                          ? styles.connectedText
                          : null,
                      ]}
                    >
                      {item.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
      ...fonts.spiritualTitleFont, // Using spiritual fonts
      color: colors.textDark,
      textAlign: "left",
      marginTop: Spacing.sm,
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.lg,
    },
    subtitle: {
      ...fonts.spiritualSubtitleFont, // Using spiritual subtitle font
      color: colors.textLight === '#F5F5F5' ? '#6B6560' : colors.textLight,
      textAlign: "left",
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
      fontStyle: "italic",
    },
    input: {
      ...fonts.inputFont,
      height: 56,
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.primary + '20', // Subtle primary color border
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.lg,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
      color: colors.textDark,
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
    toggleContainer: {
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.md,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    toggle: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    toggleText: {
      ...fonts.spiritualBodyFont, // Using spiritual body font
      fontStyle: "italic",
      color: colors.textLight === '#F5F5F5' ? '#8B8580' : colors.textMuted,
      marginLeft: Spacing.sm,
      flex: 1,
      lineHeight: Typography.sizes.base * 1.5,
    },
    affirmation: {
      ...fonts.affirmationFont,
      position: 'absolute',
      bottom: Platform.select({ ios: 120, android: 100 }),
      left: Spacing.lg,
      right: Spacing.lg,
      textAlign: "center",
      fontStyle: "italic",
      color: colorScheme === 'light' ? '#8B7B6B' : '#C4A984', // Fixed color logic
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3,
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
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.6)", // Darker overlay
    },
    modalContent: {
      backgroundColor: colors.card,
      padding: Spacing['2xl'],
      borderRadius: BorderRadius.xl,
      width: "88%",
      maxWidth: 420,
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
      ...fonts.spiritualTitleFont, // Using spiritual font
      fontSize: Typography.sizes.xl,
      color: colors.textDark,
      marginBottom: Spacing.sm,
      textAlign: "center",
    },
    modalSubtitle: {
      ...fonts.spiritualBodyFont, // Using spiritual body font
      color: colors.textLight === '#F5F5F5' ? '#6B6560' : colors.textLight,
      marginBottom: Spacing.xl,
      textAlign: "center",
      lineHeight: Typography.sizes.base * 1.6,
      fontStyle: "italic",
    },
    modalOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.md,
      width: "100%",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      borderRadius: BorderRadius.sm,
      marginBottom: Spacing.xs,
    },
    modalOptionIcon: {
      marginRight: Spacing.md,
    },
    modalOptionText: {
      ...fonts.buttonFont,
      color: colors.textDark,
      flex: 1,
    },
    connectedOption: {
      backgroundColor: colors.success + '20', // 20% opacity
      borderColor: colors.success,
    },
    connectedText: {
      color: colors.success,
    },
  });
};

export default EmailScreen;