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
    setGoogleCredential,
  } = useUserContext();
  const [email, setEmail] = useState(userData.email || "");
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

  const isGoogleConnected = () => {
    return userData?.settings?.connectedAccounts?.google === true || 
           FIREBASE_AUTH.currentUser?.providerData?.some(provider => provider.providerId === 'google.com') ||
           googleCredential !== null;
  };

  const handleEmailSubmit = async () => {
    if (email.trim() === "") {
      Alert.alert("Almost there!", "Please share your email to stay connected");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Check your email", "That email address doesn't look quite right. Please check and try again");
      return;
    }

    try {
      await updateUserData({
        email,
        marketingRequested: marketingRequested ? false : true,
      });
      setModalVisible(true);
    } catch (error: any) {
      Alert.alert("Connection Issue", "We had trouble saving your information: " + error.message);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const newGoogleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      if (!FIREBASE_AUTH.currentUser) {
        Alert.alert("Error", "No user session found. Please sign in with phone first.");
        return;
      }

      await FIREBASE_AUTH.currentUser.linkWithCredential(newGoogleCredential);
      
      const googleUser = await GoogleSignin.getCurrentUser();
      
      await updateUserData({
        email: googleUser?.user.email || email,
        GoogleSSOEnabled: true,
        firstName: googleUser?.user.givenName || userData.firstName,
        lastName: googleUser?.user.familyName || userData.lastName,
        fullName: googleUser?.user.name || userData.fullName,
        settings: {
          ...userData.settings,
          connectedAccounts: {
            ...userData.settings?.connectedAccounts,
            google: true,
          },
        },
      });
      
      setGoogleCredential(newGoogleCredential);
      
      console.log("Successfully linked Google account to phone user");
      Alert.alert("Great!", "Your Google account has been successfully linked! ✨");
      
    } catch (error: any) {
      console.error("Google sign-in error: ", error);
      
      if (error.code === 'auth/credential-already-in-use') {
        Alert.alert(
          "Account Already Used",
          "This Google account is already linked to another account."
        );
      } else if (error.code === 'auth/provider-already-linked') {
        Alert.alert(
          "Already Linked",
          "Your account is already connected to Google."
        );
      } else {
        Alert.alert("Error", "Failed to link Google account: " + error.message);
      }
    }
  };

  const handleModalOption = (option: number) => {
    switch (option) {
      case 1:
        Alert.alert("Coming Soon", "Apple Sign-In is being prepared for you!");
        break;
      case 2:
        if (isGoogleConnected()) {
          Alert.alert(
            "Google Connected",
            "Your Google account is already linked. Would you like to switch to a different Google account?",
            [
              {
                text: "Keep Current",
                style: "cancel",
              },
              {
                text: "Switch Account",
                onPress: async () => {
                  try {
                    await GoogleSignin.signOut();
                    handleGoogleSignIn();
                  } catch (error) {
                    console.error("Error signing out from Google:", error);
                  }
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
      <TouchableOpacity
        style={styles.backButton}
        onPress={navigateToPreviousScreen}
      >
        <Ionicons name="chevron-back" size={24} color={colors.textDark} />
      </TouchableOpacity>

      <OnboardingProgressBar currentScreen="EmailScreen" />

      <Text style={styles.title}>Stay in touch</Text>
      
      <Text style={styles.subtitle}>Share your email address with us</Text>
      
      <TextInput
        style={styles.input}
        placeholder="your.email@example.com"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoFocus={true}
      />
      
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
            I prefer to receive only essential updates about my Circle journey
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.affirmation}>
        The best{' '}
        <Text style={styles.highlightedWord}>conversations</Text>
        {' happen when people feel truly heard'}
      </Text>
      
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
                <Text style={styles.modalTitle}>Make connecting even easier</Text>
                <Text style={styles.modalSubtitle}>
                  Linking your account creates a smoother experience and easier access to your Circle.
                </Text>
                {[
                  { option: 1, text: "Connect with Apple", icon: "logo-apple", connected: false },
                  { 
                    option: 2, 
                    text: "Connect with Google", 
                    icon: "logo-google", 
                    connected: isGoogleConnected() 
                  },
                  { option: 3, text: "Continue as is", icon: "checkmark-circle", connected: false },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.option}
                    style={[
                      styles.modalOption,
                      item.connected ? styles.connectedOption : null,
                    ]}
                    onPress={() => handleModalOption(item.option)}
                  >
                    <Ionicons 
                      name={item.icon as any} 
                      size={20} 
                      color={item.connected ? colors.success : colors.textDark}
                      style={styles.modalOptionIcon}
                    />
                    <Text
                      style={[
                        styles.modalOptionText,
                        item.connected ? styles.connectedText : null,
                      ]}
                    >
                      {item.connected && item.option === 2 ? "Google account connected ✨" : item.text}
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
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
      fontStyle: "normal",
    },
    input: {
      ...fonts.inputFont,
      height: 56,
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.primary + '20',
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
      ...fonts.spiritualBodyFont,
      fontStyle: "normal",
      color: colors.textMuted,
      marginLeft: Spacing.sm,
      flex: 1,
      lineHeight: Typography.sizes.base * 1.5,
    },
    affirmation: {
      ...fonts.elegantItalicFont,
      position: 'absolute',
      bottom: Platform.select({ ios: 120, android: 100 }),
      left: Spacing.lg,
      right: Spacing.lg,
      textAlign: "center",
      color: colors.textDark,
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3,
      opacity: 0.8,
    },
    highlightedWord: {
      color: colors.textDark,
      textShadowColor: '#FFD700',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      fontWeight: Typography.weights.medium,
      letterSpacing: 0.5,
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
      backgroundColor: "rgba(0, 0, 0, 0.6)",
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
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.xl,
      color: colors.textDark,
      marginBottom: Spacing.sm,
      textAlign: "center",
    },
    modalSubtitle: {
      ...fonts.spiritualBodyFont,
      color: colors.textLight,
      marginBottom: Spacing.xl,
      textAlign: "center",
      lineHeight: Typography.sizes.base * 1.6,
      fontStyle: "normal",
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
      backgroundColor: colors.success + '20',
      borderColor: colors.success,
    },
    connectedText: {
      color: colors.success,
    },
  });
};

export default EmailScreen;