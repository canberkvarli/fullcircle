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
} from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import OnboardingProgressBar from "../../components/OnboardingProgressBar";
import { useUserContext } from "../../context/UserContext";
import { FIREBASE_AUTH } from "@/services/FirebaseConfig";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";

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
  const styles = createStyles(colorScheme);

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
      Alert.alert("Error", "Email cannot be empty");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      await updateUserData({
        email,
        marketingRequested: marketingRequested ? false : true,
      });
      setModalVisible(true);
    } catch (error: any) {
      Alert.alert("Error", "Failed to save email: " + error.message);
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
      Alert.alert("Error", "Failed to link Google account: " + error);
    }
  };

  const handleModalOption = (option: number) => {
    switch (option) {
      case 1:
        Alert.alert("Connect Apple Account", "Feature coming soon!");
        break;
      case 2:
        if (googleCredential) {
          Alert.alert(
            "Switch Google Account",
            "Would you like to switch your Google account?",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Switch",
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
      <Text style={styles.title}>Stay Connected</Text>
      
      {/* Subtitle */}
      <Text style={styles.subtitle}>Enter your email address</Text>
      
      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="email@example.com"
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
            I do not wish to receive marketing communications about Circle
            products and services.
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Affirmation */}
      <Text style={styles.affirmation}>
        Open the channels of communication and connection
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
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Connect your account?</Text>
                <Text style={styles.modalSubtitle}>
                  Linking your account makes it easier to connect.
                </Text>
                {[
                  { option: 1, text: "Connect your Apple account", icon: "logo-apple" },
                  { option: 2, text: "Connect your Google account", icon: "logo-google" },
                  { option: 3, text: "No thanks", icon: "close" },
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

const createStyles = (colorScheme: 'light' | 'dark') => {
  const colors = Colors[colorScheme];
  
  return {
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
      fontSize: Typography.sizes['5xl'],
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      textAlign: "left",
      marginTop: Spacing.sm,
      marginBottom: Spacing.lg,
      paddingHorizontal: Spacing.lg,
    },
    subtitle: {
      fontSize: Typography.sizes.lg,
      color: colors.textLight === '#F5F5F5' ? '#6B6560' : colors.textLight,
      textAlign: "left",
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
      fontWeight: Typography.weights.light,
    },
    input: {
      height: 56,
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.lg,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
      fontSize: Typography.sizes.base,
      color: colors.textDark,
      fontWeight: Typography.weights.medium,
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
    toggleContainer: {
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.md,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggle: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    toggleText: {
      fontSize: Typography.sizes.sm,
      fontStyle: "italic",
      color: colors.textLight === '#F5F5F5' ? '#8B8580' : colors.textMuted,
      marginLeft: Spacing.sm,
      flex: 1,
      lineHeight: Typography.sizes.sm * 1.4,
    },
    affirmation: {
      position: 'absolute',
      bottom: Platform.select({ ios: 120, android: 100 }),
      left: Spacing.lg,
      right: Spacing.lg,
      textAlign: "center",
      fontSize: Typography.sizes.lg,
      fontStyle: "italic",
      fontWeight: Typography.weights.light,
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
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: colors.card,
      padding: Spacing['2xl'],
      borderRadius: BorderRadius.xl,
      width: "85%",
      maxWidth: 400,
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
      fontSize: Typography.sizes['2xl'],
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      marginBottom: Spacing.sm,
      textAlign: "center",
    },
    modalSubtitle: {
      fontSize: Typography.sizes.base,
      color: colors.textLight === '#F5F5F5' ? '#6B6560' : colors.textLight,
      marginBottom: Spacing.xl,
      textAlign: "center",
      lineHeight: Typography.sizes.base * 1.4,
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
      fontSize: Typography.sizes.base,
      color: colors.textDark,
      fontWeight: Typography.weights.medium,
      flex: 1,
    },
    connectedOption: {
      backgroundColor: colors.success + '20', // 20% opacity
      borderColor: colors.success,
    },
    connectedText: {
      color: colors.success,
    },
  };
};

export default EmailScreen;