import React, { useEffect, useState, useRef } from "react";
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
  Keyboard,
  Animated,
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
    handleAppleSignIn,
    signOut,
  } = useUserContext();
  const [email, setEmail] = useState(userData.email || "");
  const [marketingRequested, setMarketingRequested] = useState(
    userData?.marketingRequested ?? true
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [hasUserStartedTyping, setHasUserStartedTyping] = useState(false);
  const [showErrorFeedback, setShowErrorFeedback] = useState(false);
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);
  
  // Animation for keyboard adjustment
  const bottomElementsPosition = useRef(new Animated.Value(0)).current;

  const getWebClientId = () => {
    const env = process.env.EXPO_PUBLIC_ENV || 'development';

    switch (env) {
      case 'production':
        return process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      case 'staging':
        return process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      default:
        return process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    }
  };

  const webClientId = getWebClientId();
  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
  });

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user?.email) {
        setEmail(user.email);
        validateEmail(user.email);
      }
    });
    return unsubscribe;
  }, []);

  // Validate email on mount if it exists
  useEffect(() => {
    if (email && email.trim()) {
      validateEmail(email);
    }
  }, []);
  
  // Add keyboard listeners
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
        
        // Get keyboard height
        const keyboardHeight = event.endCoordinates.height;
        
        // Animate the bottom elements up by keyboard height plus some padding
        Animated.timing(bottomElementsPosition, {
          toValue: keyboardHeight + (Platform.OS === 'ios' ? 10 : 20),
          duration: Platform.OS === 'ios' ? 300 : 200,
          useNativeDriver: true,
        }).start();
      }
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        
        // Animate the bottom elements back to original position
        Animated.timing(bottomElementsPosition, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? 300 : 200,
          useNativeDriver: true,
        }).start();
      }
    );
    
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const validateEmail = (emailToValidate: string) => {
    setEmailError("");
    
    // If email is empty, it's valid (optional field)
    if (!emailToValidate.trim()) {
      setIsEmailValid(true);
      return;
    }
    
    // Check for basic email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(emailToValidate)) {
      setIsEmailValid(false);
      return;
    }
    
    // Check for common issues
    if (emailToValidate.includes('..')) {
      setIsEmailValid(false);
      return;
    }
    
    if (emailToValidate.startsWith('.') || emailToValidate.endsWith('.')) {
      setIsEmailValid(false);
      return;
    }
    
    if (emailToValidate.includes('@.') || emailToValidate.includes('.@')) {
      setIsEmailValid(false);
      return;
    }
    
    // Check domain length
    const domain = emailToValidate.split('@')[1];
    if (domain && domain.length > 253) {
      setIsEmailValid(false);
      return;
    }
    
    setIsEmailValid(true);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (!hasUserStartedTyping) {
      setHasUserStartedTyping(true);
    }
    validateEmail(text);
    
    // Delay showing error feedback to avoid immediate red border
    if (text.trim() && !isEmailValid) {
      setTimeout(() => {
        setShowErrorFeedback(true);
      }, 1000); // 1 second delay
    } else {
      setShowErrorFeedback(false);
    }
  };

  const isGoogleConnected = () => {
    return userData.GoogleSSOEnabled || googleCredential;
  };

  const isAppleConnected = () => {
    return userData.AppleSSOEnabled;
  };

  const handleEmailSubmit = async () => {
    // Email is optional, so only validate if user entered something
    if (email.trim() !== "" && !isEmailValid) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      await updateUserData({
        email: email.trim() || "", // Save empty string if no email provided
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
        familyName: googleUser?.user.familyName || userData.familyName,
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
        if (isAppleConnected()) {
          Alert.alert(
            "Apple Connected",
            "Your Apple account is already linked. Would you like to switch to a different Apple account?",
            [
              {
                text: "Keep Current",
                style: "cancel",
              },
              {
                text: "Switch Account",
                onPress: async () => {
                  try {
                      handleAppleSignIn();
                  } catch (error) {
                    console.error("Error signing out from Apple:", error);
                  }
                },
              },
            ]
          );
        } else {
          handleAppleSignIn();
        }
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
      <View style={styles.mainContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={navigateToPreviousScreen}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>

        <OnboardingProgressBar currentScreen="EmailScreen" />

        <Text style={styles.title}>stay in touch</Text>
        
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="your.email@example.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus={true}
          />
          <View style={[
            styles.inputUnderline,
            showErrorFeedback && styles.inputUnderlineError
          ]} />
        </View>
        

        
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={styles.toggle}
            onPress={() => setMarketingRequested((prev) => !prev)}
          >
            <View style={[
              styles.checkbox,
              marketingRequested && styles.checkboxChecked
            ]}>
              {marketingRequested && (
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={colors.background}
                />
              )}
            </View>
            <Text style={styles.toggleText}>
              I prefer to receive only essential updates about my Circle journey
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Bottom elements positioned under checkbox when keyboard is visible */}
        {keyboardVisible && (
          <View style={styles.keyboardBottomElements}>
            {/* <Text style={styles.affirmation}>
              The best{' '}
              <Text style={styles.highlightedWord}>conversations</Text>
              {' happen when people feel truly heard'}
            </Text> */}
            
            <View style={styles.keyboardButtonContainer}>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleEmailSubmit}
              >
                <Ionicons 
                  name="chevron-forward" 
                  size={24} 
                  color={colors.background} 
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      
      {/* Animated Bottom Elements Container - only visible when keyboard is hidden */}
      {!keyboardVisible && (
        <View 
          style={styles.bottomElementsContainer}
        >
          {/* <Text style={styles.affirmation}>
            The best{' '}
            <Text style={styles.highlightedWord}>conversations</Text>
            {' happen when people feel truly heard'}
          </Text> */}
          
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleEmailSubmit}
            >
                              <Ionicons 
                  name="chevron-forward" 
                  size={24} 
                  color={colors.background} 
                />
            </TouchableOpacity>
          </View>
        </View>
      )}

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
                  { 
                    option: 1, 
                    text: "Connect with Apple", 
                    icon: "logo-apple", 
                    connected: isAppleConnected() 
                  },
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
                      {item.connected && item.option === 1 ? "Apple account connected ✨" : 
                       item.connected && item.option === 2 ? "Google account connected ✨" : 
                       item.text}
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
    },
    mainContent: {
      flex: 1,
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
      marginTop: Spacing.lg,
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.lg,
    },
    inputWrapper: {
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
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
    inputUnderlineError: {
      backgroundColor: colors.error,
      opacity: 1,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.sm,
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
    },
    toggleContainer: {
      marginHorizontal: Spacing.lg,
      padding: Spacing.sm,
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
      alignItems: "center",
    },
    toggleText: {
      ...fonts.modalBodyFont,
      fontStyle: "normal",
      color: colors.textMuted,
      marginLeft: Spacing.sm,
      flex: 1,
      lineHeight: Typography.sizes.base * 1.5,
    },
    bottomElementsContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: Platform.select({ ios: 30, android: 20 }),
      paddingHorizontal: Spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 5,
    },
    keyboardBottomElements: {
      marginTop: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 5,
    },
    keyboardButtonContainer: {
      flex: 1,
      alignItems: 'flex-end',
    },
    bottomButtonContainer: {
      flex: 1,
      alignItems: 'flex-end',
    },
    affirmation: {
      ...fonts.elegantItalicFont,
      flex: 1,
      textAlign: "center",
      color: colors.textDark,
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3,
      opacity: 0.8,
      paddingRight: Spacing.md,
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
      padding: Spacing.lg,
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
      paddingHorizontal: Spacing.xl,
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
    errorText: {
      color: colors.error,
      fontSize: Typography.sizes.sm,
      marginTop: Spacing.xs,
      marginLeft: Spacing.sm,
    },
  });
};

export default EmailScreen;