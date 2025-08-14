import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  StyleSheet,
  TextInput,
  Animated,
  Dimensions,
  ScrollView,
  Modal,
  FlatList,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import auth from "@react-native-firebase/auth";
import { FIREBASE_AUTH } from "@/services/FirebaseConfig";
import { useUserContext } from "@/context/UserContext";
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { 
  getActiveCountries, 
  DEFAULT_COUNTRY, 
  formatPhoneNumberForCountry,
  validatePhoneNumberForCountry,
  CountryCode 
} from "@/constants/CountryCodes";
import { useFont } from "@/hooks/useFont";
import OuroborosLoader from "@/components/ouroboros/OuroborosLoader";

const { width: screenWidth } = Dimensions.get('window');

function PhoneNumberScreen(): JSX.Element {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { signOut } = useUserContext();
  const router = useRouter();
  const phoneInputRef = useRef<TextInput>(null);
  
  // Get active countries from constants
  const countryCodes = getActiveCountries();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const borderOpacity = useRef(new Animated.Value(0.3)).current;
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = createStyles(colorScheme, isFocused);

  // Handle back button press
  const handleBackPress = () => {
    console.log("🔙 Back button pressed in PhoneNumberScreen");
    console.log("🧭 User wants to go back, signing out to reset authentication state");
    
    // Sign out the user to reset the authentication state
    // This is necessary because the user is still authenticated with Apple
    // and needs to start fresh from the LoginSignupScreen
    signOut();
  };

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for the continue button when enabled
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    // Firebase Auth configuration
    if (__DEV__) {
      auth().settings.appVerificationDisabledForTesting = true;
    }
    auth().settings.forceRecaptchaFlowForTesting = true;
  }, []);

  useEffect(() => {
    // Animate border opacity when focused
    Animated.timing(borderOpacity, {
      toValue: isFocused ? 1 : 0.3,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumberForCountry(text, selectedCountry);
    const maxLength = selectedCountry.maxLength || 10;
    const cleaned = text.replace(/\D/g, '');
    
    if (cleaned.length <= maxLength) {
      setPhoneNumber(formatted);
    }
  };

  const handleSubmit = async () => {
    const isValid = validatePhoneNumberForCountry(phoneNumber, selectedCountry);
    const cleaned = phoneNumber.replace(/\D/g, '');
    const fullNumber = selectedCountry.code + cleaned;
    
    if (!isValid) {
      const maxLength = selectedCountry.maxLength || 10;
      Alert.alert("Almost there!", `Please enter a complete ${maxLength}-digit phone number.`);
      return;
    }

    // Don't dismiss keyboard here - keep it open
    setLoading(true);

    try {
      console.log("Sending verification to:", fullNumber);
      
      const confirmation = await FIREBASE_AUTH.signInWithPhoneNumber(
        fullNumber,
        true
      );
      
      console.log("Phone verification initiated successfully");
      
      router.replace({
        pathname: "onboarding/PhoneVerificationScreen" as any,
        params: {
          verificationId: confirmation.verificationId,
          phoneNumber: fullNumber,
        },
      });
    } catch (error: any) {
      console.error("Failed to sign in with phone number: ", error);
      
      // Handle specific error codes
      if (error.code === 'auth/invalid-phone-number') {
        Alert.alert(
          "Invalid Phone Number", 
          "Please check the phone number format and try again.",
          [{ text: "OK", onPress: () => setPhoneNumber("") }]
        );
      } else if (error.code === 'auth/missing-client-identifier' || error.code === 'auth/unknown') {
        // This typically happens in development with non-test numbers
        Alert.alert(
          "Verification Unavailable", 
          __DEV__ 
            ? "This number is not configured for testing. Please use a test number or try in production."
            : "We couldn't verify this number. Please ensure it's a valid mobile number.",
          [{ text: "OK", onPress: () => setPhoneNumber("") }]
        );
      } else if (error.code === 'auth/quota-exceeded') {
        Alert.alert(
          "Too Many Attempts", 
          "We've detected too many verification attempts. Please try again later.",
          [{ text: "OK" }]
        );
      } else if (error.code === 'auth/captcha-check-failed') {
        Alert.alert(
          "Verification Failed", 
          "CAPTCHA verification failed. Please try again.",
          [{ text: "OK", onPress: () => setPhoneNumber("") }]
        );
      } else if (error.code === 'auth/network-request-failed') {
        Alert.alert(
          "Network Error", 
          "Please check your internet connection and try again.",
          [{ text: "OK" }]
        );
      } else if (error.code === 'auth/too-many-requests') {
        Alert.alert(
          "Too Many Requests", 
          "You've made too many attempts. Please wait a few minutes and try again.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Connection Issue", 
          "We're having trouble connecting right now. Please try again.",
          [{ text: "OK", onPress: () => setPhoneNumber("") }]
        );
      }
      setLoading(false);
    }
  };

  const isPhoneValid = validatePhoneNumberForCountry(phoneNumber, selectedCountry);

  const CountryPickerModal = () => (
    <Modal
      visible={showCountryPicker}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCountryPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
              <Ionicons name="close" size={24} color={colors.textDark} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={countryCodes}
            keyExtractor={(item, index) => `${item.code}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.countryItem}
                onPress={() => {
                  setSelectedCountry(item);
                  setShowCountryPicker(false);
                }}
              >
                <Text style={styles.countryItemFlag}>{item.flag}</Text>
                <Text style={styles.countryItemName}>{item.name}</Text>
                <Text style={styles.countryItemCode}>{item.code}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        
        <Animated.View 
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.title}>Let's connect you</Text>
          <Text style={styles.subtitle}>Enter your phone number to get started</Text>
        </Animated.View>
        
        <View style={styles.mainContent}>
          <Animated.View 
            style={[
              styles.inputWrapper,
              {
                opacity: fadeAnim,
              }
            ]}
          >
            {/* Border overlay for animation */}
            <Animated.View 
              style={[
                styles.inputBorder,
                {
                  opacity: borderOpacity,
                  borderColor: isFocused ? colors.primary : colors.border,
                }
              ]} 
            />
            
            {/* Country Code Selector */}
            <TouchableOpacity 
              style={styles.countrySelector}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
              <Text style={styles.countryCode}>{selectedCountry.code}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
            </TouchableOpacity>
            
            {/* Divider */}
            <View style={styles.divider} />
            
            {/* Phone Input */}
            <TextInput
              ref={phoneInputRef}
              style={styles.phoneInput}
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              placeholder={selectedCountry.format?.replace(/X/g, '5') || "(555) 123-4567"}
              placeholderTextColor={colors.textMuted + '80'}
              keyboardType="number-pad"
              maxLength={selectedCountry.format?.length || 14} // Dynamic based on country
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoFocus={true}
              editable={!loading}
            />
          </Animated.View>


        </View>
        
        <View style={{ flex: 1, minHeight: 10 }} />
        
        {/* Affirmation */}
        <Animated.View 
          style={[
            styles.affirmationContainer,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.affirmation}>
            Every meaningful{' '}
            <Text style={styles.highlightedWord}>connection</Text>
            {' '}starts with a single step
          </Text>
        </Animated.View>
        
        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          {loading ? (
            <OuroborosLoader 
              size={80}
              duration={3000}
              fillColor="#F5E6D3"
              strokeColor="#7B6B5C"
              strokeWidth={1.5}
              loop={true}
            />
          ) : (
            <Animated.View
              style={[
                { transform: [{ scale: isPhoneValid ? pulseAnim : 1 }] }
              ]}
            >
              <TouchableOpacity 
                style={[
                  styles.continueButton,
                  !isPhoneValid && styles.continueButtonDisabled
                ]} 
                onPress={handleSubmit}
                disabled={!isPhoneValid}
              >
                <Text style={[
                  styles.continueButtonText,
                  !isPhoneValid && styles.continueButtonTextDisabled
                ]}>
                  Continue
                </Text>
                <Ionicons 
                  name="arrow-forward" 
                  size={20} 
                  color={isPhoneValid ? colors.background : colors.textMuted} 
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
      
      <CountryPickerModal />
    </SafeAreaView>
  );
}

const createStyles = (colorScheme: 'light' | 'dark', isFocused: boolean) => {
  const colors = Colors[colorScheme];
  const fonts = useFont();
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: Platform.select({ ios: 0, android: Spacing.lg }),
    },
    headerContainer: {
      paddingHorizontal: Spacing.xl,
      marginTop: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    mainContent: {
      paddingHorizontal: Spacing.xl,
      alignItems: 'center',
      marginBottom: Spacing.sm
    },
    bottomBar: {
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.xl,
      alignItems: 'center',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      paddingVertical: Platform.OS === 'ios' ? 18 : 16,
      paddingHorizontal: Spacing.lg,
      width: '100%',
      position: 'relative',
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isFocused ? 0.15 : 0.08,
          shadowRadius: 12,
        },
        android: {
          elevation: isFocused ? 8 : 4,
        },
      }),
    },
    inputBorder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: BorderRadius.xl,
      borderWidth: 2,
      pointerEvents: 'none',
    },
    countrySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: Spacing.sm,
    },
    countryFlag: {
      fontSize: 24,
      marginRight: Spacing.xs,
    },
    countryCode: {
      ...fonts.bodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textDark,
      marginRight: Spacing.xs,
    },
    divider: {
      width: 1,
      height: 24,
      backgroundColor: colors.border,
      marginHorizontal: Spacing.md,
      opacity: 0.3,
    },
    phoneInput: {
      flex: 1,
      ...fonts.inputFont,
      fontSize: Typography.sizes.lg,
      color: colors.textDark,
      letterSpacing: 0.5,
    },
    title: {
      ...fonts.spiritualTitleFont,
      color: colors.textDark,
      marginBottom: Spacing.xs,
    },
    subtitle: {
      ...fonts.bodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textMuted,
      lineHeight: Typography.sizes.base * 1.5,
   backgroundColor: colors.primary + '10',
      borderRadius: BorderRadius.md,
      alignItems: 'center',
    },
    previewLabel: {
      ...fonts.bodyFont,
      fontSize: Typography.sizes.xs,
      color: colors.textMuted,
      marginBottom: Spacing.xs,
    },
    previewNumber: {
      ...fonts.bodyFont,
      fontSize: Typography.sizes.base,
      color: colors.primary,
      fontWeight: Typography.weights.medium,
      letterSpacing: 1,
    },
    affirmationContainer: {
      paddingHorizontal: Spacing.xl,
      marginBottom: Spacing.lg,
    },
    affirmation: {
      ...fonts.spiritualSubtitleFont,
      color: colors.textDark,
      textAlign: 'center',
      lineHeight: Typography.sizes.lg * 1.6,
      letterSpacing: 0.3,
      opacity: 0.85,
    },
    highlightedWord: {
      color: colors.textDark,
      textShadowColor: '#FFD700',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      fontWeight: Typography.weights.medium,
      letterSpacing: 0.5,
    },
    continueButton: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: BorderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: screenWidth * 0.5,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    continueButtonDisabled: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    continueButtonText: {
      ...fonts.bodyFont,
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.semibold,
      color: colors.background,
      letterSpacing: 0.5,
    },
    continueButtonTextDisabled: {
      color: colors.textMuted,
    },
    backButton: {
      backgroundColor: colors.card,
      padding: Spacing.sm,
      marginLeft: Spacing.lg,
      marginTop: Spacing.md,
      borderRadius: BorderRadius.full,
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: colors.border,
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
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      maxHeight: '70%',
      paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      ...fonts.bodyFont,
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.semibold,
      color: colors.textDark,
    },
    countryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border + '30',
    },
    countryItemFlag: {
      fontSize: 28,
      marginRight: Spacing.md,
    },
    countryItemName: {
      ...fonts.bodyFont,
      flex: 1,
      fontSize: Typography.sizes.base,
      color: colors.textDark,
    },
    countryItemCode: {
      ...fonts.bodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textMuted,
      marginLeft: Spacing.sm,
    },
  });
};

export default PhoneNumberScreen;