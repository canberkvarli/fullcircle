import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  Modal,
  TextInput,
  Animated,
  StyleSheet,
  useColorScheme,
  Platform,
  Share,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import { useFont } from "@/hooks/useFont";
import { FIREBASE_AUTH, FUNCTIONS } from "@/services/FirebaseConfig";  
import OuroborosLoader from "@/components/ouroboros/OuroborosLoader";

export default function UserSettings() {
  const router = useRouter();
  const { userData, updateUserSettings, signOut, updateUserData, deleteAccount, handleAppleSignIn, fetchUserData } = useUserContext();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);
  
  // State management
  const [isPaused, setIsPaused] = useState(userData.settings?.isPaused || false);
  const [showLastActive, setShowLastActive] = useState(userData.settings?.showLastActiveStatus ?? true);
  const [phoneExpanded, setPhoneExpanded] = useState(false);
  const [emailExpanded, setEmailExpanded] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailVerificationPending, setEmailVerificationPending] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  
  // Notification states
  const [notifications, setNotifications] = useState({
    enableAll: userData.settings?.pushNotifications?.enableAll ?? true,
    muteAll: userData.settings?.pushNotifications?.muteAll ?? false,
    newLikes: userData.settings?.pushNotifications?.newLikes ?? true,
    newMatches: userData.settings?.pushNotifications?.newMatches ?? true,
    newMessages: userData.settings?.pushNotifications?.newMessages ?? true,
    promotions: userData.settings?.pushNotifications?.promotions ?? true,
    announcements: userData.settings?.pushNotifications?.announcements ?? true,
  });
  
  // Animated values for smooth expand/collapse
  const phoneAnimation = useRef(new Animated.Value(0)).current;
  const emailAnimation = useRef(new Animated.Value(0)).current;

  // Toggle animations
  const togglePhoneExpand = () => {
    const toValue = phoneExpanded ? 0 : 1;
    Animated.timing(phoneAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setPhoneExpanded(!phoneExpanded);
  };

  const toggleEmailExpand = () => {
    const toValue = emailExpanded ? 0 : 1;
    Animated.timing(emailAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setEmailExpanded(!emailExpanded);
  };

  // Handle profile pause toggle
  const handlePauseToggle = async (value: boolean) => {
    if (value && !isPaused) {
      // Show confirmation modal when trying to pause
      setShowPauseModal(true);
    } else {
      // Direct toggle when unpausing
      setIsPaused(value);
      await updateUserSettings({ isPaused: value });
    }
  };

  const handleGoogleToggle = async (value: boolean) => {
  if (value) {
    // Connect Google account
    await handleConnectGoogle();
  } else {
    // Disconnect Google account
    await handleDisconnectGoogle();
  }
};

  const handleConnectGoogle = async () => {
    if (!userData.userId || !FIREBASE_AUTH.currentUser) {
      Alert.alert("Error", "No user session found. Please restart the app.");
      return;
    }

    setIsConnectingGoogle(true);
    
    try {
      // Configure Google Sign In
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
      GoogleSignin.configure({// GoogleSignin.configure({
        webClientId,
        offlineAccess: false,
      });

      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Sign in with Google
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      // Link the Google credential to the current Firebase user
      await FIREBASE_AUTH.currentUser.linkWithCredential(googleCredential);
      
      // Get Google user info
      const googleUser = await GoogleSignin.getCurrentUser();
      
      // Update user data to reflect Google connection
      await updateUserData({
        GoogleSSOEnabled: true,
        email: googleUser?.user.email || userData.email, // Update email if available
        settings: {
          ...userData.settings,
          connectedAccounts: {
            ...userData.settings?.connectedAccounts,
            google: true,
          },
        },
      });
      
      console.log("Successfully linked Google account");
      Alert.alert("Success!", "Your Google account has been successfully connected! ✨");
      
    } catch (error: any) {
      console.error("Google connect error: ", error);
      
      let errorMessage = "Failed to connect Google account.";
      
      if (error.code === 'auth/credential-already-in-use') {
        errorMessage = "This Google account is already linked to another account.";
      } else if (error.code === 'auth/provider-already-linked') {
        errorMessage = "Your account is already connected to Google.";
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid Google credentials. Please try again.";
      } else if (error.code === 12501) {
        // User cancelled Google sign-in
        console.log("Google sign-in cancelled by user");
        return; // Don't show error for user cancellation
      }
      
      Alert.alert("Connection Failed", errorMessage);
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!userData.userId || !FIREBASE_AUTH.currentUser) {
      Alert.alert("Error", "No user session found.");
      return;
    }

    Alert.alert(
      "Disconnect Google Account",
      "Are you sure you want to disconnect your Google account? You'll still be able to sign in with your phone number.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            setIsConnectingGoogle(true);
            
            try {
              // Get the current user's providers
              const user = FIREBASE_AUTH.currentUser;
              if (!user) throw new Error("No current user");

              // Check if user has phone authentication as backup
              const hasPhoneAuth = user.providerData.some(
                provider => provider.providerId === 'phone'
              );
              
              if (!hasPhoneAuth) {
                Alert.alert(
                  "Cannot Disconnect", 
                  "You need to have a phone number linked to your account before disconnecting Google."
                );
                setIsConnectingGoogle(false);
                return;
              }

              // Unlink Google provider from Firebase
              await user.unlink('google.com');
              
              // Sign out from Google (optional - keeps it clean)
              try {
                const currentGoogleUser = await GoogleSignin.getCurrentUser();
                if (currentGoogleUser) {
                  await GoogleSignin.signOut();
                }
              } catch (googleError) {
                console.log("Google sign out error (non-critical):", googleError);
              }
              
              // Update user data to reflect Google disconnection
              await updateUserData({
                GoogleSSOEnabled: false,
                settings: {
                  ...userData.settings,
                  connectedAccounts: {
                    ...userData.settings?.connectedAccounts,
                    google: false,
                  },
                },
              });
              
              console.log("Successfully disconnected Google account");
              Alert.alert("Disconnected", "Your Google account has been disconnected.");
              
            } catch (error: any) {
              console.error("Google disconnect error: ", error);
              
              let errorMessage = "Failed to disconnect Google account.";
              
              if (error.code === 'auth/no-such-provider') {
                errorMessage = "Google account is not connected to this account.";
              }
              
              Alert.alert("Disconnection Failed", errorMessage);
            } finally {
              setIsConnectingGoogle(false);
            }
          },
        },
      ]
    );
  };

  const handleDisconnectApple = async () => {
    if (!userData.userId || !FIREBASE_AUTH.currentUser) {
      Alert.alert("Error", "No user session found.");
      return;
    }

    Alert.alert(
      "Disconnect Apple Account",
      "Are you sure you want to disconnect your Apple account? You'll still be able to sign in with your phone number.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            try {
              // Get the current user's providers
              const user = FIREBASE_AUTH.currentUser;
              if (!user) throw new Error("No current user");

              // Check if user has phone authentication as backup
              const hasPhoneAuth = user.providerData.some(
                provider => provider.providerId === 'phone'
              );
              
              if (!hasPhoneAuth) {
                Alert.alert(
                  "Cannot Disconnect", 
                  "You need to have a phone number linked to your account before disconnecting Apple."
                );
                return;
              }

              // Unlink Apple provider from Firebase
              await user.unlink('apple.com');
              
              // Update user data to reflect Apple disconnection
              await updateUserData({
                AppleSSOEnabled: false,
                settings: {
                  ...userData.settings,
                  connectedAccounts: {
                    ...userData.settings?.connectedAccounts,
                    apple: false,
                  },
                },
              });
              
              console.log("Successfully disconnected Apple account");
              Alert.alert("Disconnected", "Your Apple account has been disconnected.");
              
            } catch (error: any) {
              console.error("Apple disconnect error: ", error);
              
              let errorMessage = "Failed to disconnect Apple account.";
              
              if (error.code === 'auth/no-such-provider') {
                errorMessage = "Apple account is not connected to this account.";
              }
              
              Alert.alert("Disconnection Failed", errorMessage);
            }
          },
        },
      ]
    );
  };

  // Confirm pause action
  const confirmPause = async () => {
    setIsPaused(true);
    setShowPauseModal(false);
    await updateUserSettings({ isPaused: true });
  };

  // Handle last active toggle
  const handleLastActiveToggle = async (value: boolean) => {
    setShowLastActive(value);
    await updateUserSettings({ showLastActiveStatus: value });
  };

  // Handle notification toggles
  const handleNotificationToggle = async (key: string, value: boolean) => {
    const newNotifications = { ...notifications, [key]: value };
    
    // If enabling/disabling all, update all other settings
    if (key === 'enableAll') {
      Object.keys(newNotifications).forEach((k) => {
        if (k !== 'enableAll' && k !== 'muteAll') {
          newNotifications[k as keyof typeof newNotifications] = value;
        }
      });
      if (value) newNotifications.muteAll = false;
    } else if (key === 'muteAll') {
      if (value) newNotifications.enableAll = false;
    }
    
    setNotifications(newNotifications);
    await updateUserSettings({
      pushNotifications: newNotifications,
    });
  };

  // Handle email change
  const handleEmailChange = async () => {
    if (!newEmail || newEmail === userData.email) {
      setEmailExpanded(false);
      return;
    }
    
    // Check if SSO accounts are linked
    const hasLinkedSSO = userData.settings?.connectedAccounts?.google || userData.settings?.connectedAccounts?.apple;
    
    if (hasLinkedSSO) {
      Alert.alert(
        "Cannot Change Email",
        "You cannot change your email address while SSO accounts are linked. Please disconnect your Google or Apple accounts first, then change your email.",
        [
          { text: "OK", style: "default" },
          { 
            text: "Disconnect SSO", 
            style: "destructive",
            onPress: () => {
              setEmailExpanded(false);
              // Scroll to connected accounts section
              // Note: In a real app, you might want to add a ref to scroll to that section
            }
          }
        ]
      );
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    
    setIsLoading(true);
    try {
      // TODO: Send verification email via Firebase
      setEmailVerificationPending(true);
      setShowVerificationModal(true);
      Alert.alert("Verification Sent", "Check your inbox for the verification code.");
    } catch (error) {
      Alert.alert("Error", "Failed to send verification email.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification code submission
  const handleVerificationSubmit = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert("Invalid Code", "Please enter the complete 6-digit verification code.");
      return;
    }
    
    setIsLoading(true);
    try {
      // TODO: Verify code with backend
      // Use updateUserData for email since it's not part of UserSettings
      await updateUserData({ email: newEmail });
      setEmailVerificationPending(false);
      setShowVerificationModal(false);
      setEmailExpanded(false);
      setVerificationCode("");
      setNewEmail("");
      Alert.alert("Success", "Your email has been updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!deleteReason) {
      Alert.alert("Reason Required", "Please share why you're leaving.");
      return;
    }
    
    Alert.alert(
      "Delete Account",
      "Are you sure? This action cannot be undone.",
      [
        { text: "Keep Account", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await deleteAccount(deleteReason);
              // If successful, the user will be navigated away automatically
              // But just in case, close the modal
              setDeleteAccountModal(false);
              setDeleteReason("");
            } catch (error: any) {
              // Always close modal and reset state on error
              setDeleteAccountModal(false);
              setDeleteReason("");
              setIsLoading(false);
              
              // Show the specific error message from deleteAccount function
              Alert.alert("Unable to Delete Account", error.message || "Please try again later.");
            }
          },
        },
      ]
    );
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Join me on FullCircle, a mindful dating app!',
        url: 'https://fullcircle.app', // Replace with your app's URL
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  const handleTestWeeklyLotus = async () => {
    try {
      setIsLoading(true);
      console.log('🪷 Testing weekly lotus assignment...');
      
      const result = await FUNCTIONS.httpsCallable('manualAssignWeeklyLotus')({});
      
      const data = result.data as any;
      console.log('✅ Weekly lotus test result:', data);
      
      if (data.success) {
        // Refresh user data to show updated lotus count
        if (userData.userId) {
          try {
            await fetchUserData(userData.userId, false);
            console.log('✅ User data refreshed after weekly lotus test');
          } catch (refreshError) {
            console.warn('⚠️ Failed to refresh user data:', refreshError);
          }
        }
        
        Alert.alert(
          '✅ Weekly Lotus Test Successful!',
          `${data.message}\n\nProcessed: ${data.processedCount} users\nEligible: ${data.eligibleUsersCount} users\nTimestamp: ${new Date(data.timestamp).toLocaleString()}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '❌ Weekly Lotus Test Failed',
          `Failed to assign weekly lotus: ${data.reason || 'Unknown error'}`,
          [{ text: 'OK' }]
        );
      }
      
    } catch (error: any) {
      console.error('❌ Weekly lotus test error:', error);
      Alert.alert(
        '❌ Error',
        `Failed to test weekly lotus: ${error.message || 'Unknown error occurred'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReasons = [
    "I found someone special",
    "Taking a break",
    "Not enough matches",
    "Too many notifications", 
    "Privacy concerns",
    "Prefer not to share",
    "Other reasons",
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={[styles.headerTitle, fonts.spiritualTitleFont]}>Settings</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.captionFont]}>PROFILE</Text>
          
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Pause Profile</Text>
              <Text style={[styles.rowDescription, fonts.captionFont]}>
                Pausing hides your profile from new people while keeping current matches.
              </Text>
            </View>
            <Switch
              value={isPaused}
              onValueChange={handlePauseToggle}
              trackColor={{ false: colors.border, true: '#8B4513' + '80' }}
              thumbColor={isPaused ? '#8B4513' : colors.textMuted}
            />
          </View>

          <View style={styles.separator} />
          
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Show Last Active</Text>
              <Text style={[styles.rowDescription, fonts.captionFont]}>
                {showLastActive 
                  ? "Share when you were last active with people you haven't matched with yet."
                  : "Keep your activity status private."
                }
              </Text>
            </View>
            <Switch
              value={showLastActive}
              onValueChange={handleLastActiveToggle}
              trackColor={{ false: colors.border, true: '#8B4513' + '80' }}
              thumbColor={showLastActive ? '#8B4513' : colors.textMuted}
            />
          </View>

          <View style={styles.separator} />
          
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Current Lotus Count</Text>
              <Text style={[styles.rowDescription, fonts.captionFont]}>
                You currently have {userData.numOfLotus || 0} lotus available
                {userData.lastLotusAssignedAt && (
                  `\nLast assigned: ${new Date(
                    userData.lastLotusAssignedAt.toDate ? 
                    userData.lastLotusAssignedAt.toDate() : 
                    userData.lastLotusAssignedAt
                  ).toLocaleDateString()}`
                )}
              </Text>
            </View>
            <View style={styles.lotusBadge}>
              <Text style={[styles.lotusBadgeText, fonts.captionFont]}>
                {userData.numOfLotus || 0} 🪷
              </Text>
            </View>
          </View>
        </View>

        {/* Safety Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.captionFont]}>SAFETY</Text>
          
          <TouchableOpacity 
            style={styles.row}
            onPress={() => router.navigate("/user/SelfieVerificationScreen" as any)}
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>
                Photo Verification
                {userData.settings?.isSelfieVerified && (
                  <Text> ✨</Text>
                )}
              </Text>
              <Text style={[styles.rowDescription, fonts.captionFont]}>
                {userData.settings?.isSelfieVerified 
                  ? "Your photos are verified"
                  : "Verify your photos to build trust and get more matches"
                }
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Phone & Email Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.captionFont]}>CONTACT INFO</Text>
          
          <TouchableOpacity style={styles.row} onPress={togglePhoneExpand}>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>
                {userData.phoneNumber || "Phone Number"}
              </Text>
            </View>
            <Ionicons 
              name={phoneExpanded ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={colors.textMuted} 
            />
          </TouchableOpacity>
          
          <Animated.View
            style={[
              styles.expandableContent,
              {
                maxHeight: phoneAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 80],
                }),
                opacity: phoneAnimation,
              },
            ]}
          >
            <Text style={[styles.expandedText, fonts.captionFont]}>
              Your phone number is permanently linked to your account and cannot be changed.
            </Text>
          </Animated.View>

          <View style={styles.separator} />

          <TouchableOpacity 
            style={[
              styles.row,
              (userData.settings?.connectedAccounts?.google || userData.settings?.connectedAccounts?.apple) && styles.disabledRow
            ]} 
            onPress={() => {
              // Only allow email editing if no SSO accounts are linked
              if (!userData.settings?.connectedAccounts?.google && !userData.settings?.connectedAccounts?.apple) {
                toggleEmailExpand();
              }
            }}
            disabled={userData.settings?.connectedAccounts?.google || userData.settings?.connectedAccounts?.apple}
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>
                {userData.email || "Email Address"}
              </Text>
              {(userData.settings?.connectedAccounts?.google || userData.settings?.connectedAccounts?.apple) && (
                <Text style={[styles.linkedAccountNote, fonts.captionFont]}>
                  Linked to SSO account
                </Text>
              )}
            </View>
            {!userData.settings?.connectedAccounts?.google && !userData.settings?.connectedAccounts?.apple && (
              <Text style={[styles.editText, fonts.buttonFont]}>
                Edit
              </Text>
            )}
          </TouchableOpacity>
          
          <Animated.View
            style={[
              styles.expandableContent,
              {
                maxHeight: emailAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 150], // Increased height to prevent cut-off
                }),
                opacity: emailAnimation,
              },
            ]}
          >
            <TextInput
              style={[styles.emailInput, fonts.inputFont]}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Enter your new email"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={styles.updateButton} 
              onPress={handleEmailChange}
              disabled={isLoading}
            >
              {isLoading ? (
                <OuroborosLoader 
                  size={50}
                  duration={3000}
                  fillColor="#F5E6D3"
                  strokeColor="#7B6B5C"
                  strokeWidth={1.5}
                  loop={true}
                />
              ) : (
                <Text style={[styles.updateButtonText, fonts.buttonFont]}>Update Email</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {emailVerificationPending && (
            <TouchableOpacity 
              style={styles.verifyRow}
              onPress={() => setShowVerificationModal(true)}
            >
              <Text style={[styles.verifyText, fonts.spiritualBodyFont]}>Verify your email address ✨</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.captionFont]}>NOTIFICATIONS</Text>
          
          <TouchableOpacity 
            style={styles.row}
            onPress={() => router.navigate("/user/PushNotifications" as any)}
          >
            <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Push Notifications</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Developer Section */}
        {__DEV__ && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.captionFont]}>🧪 DEVELOPER TOOLS</Text>
            
            <TouchableOpacity 
              style={styles.row}
              onPress={() => router.navigate("/user/NotificationTester" as any)}
            >
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Test Notifications</Text>
                <Text style={[styles.rowDescription, fonts.captionFont]}>
                  Debug and test push notification system
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.row}
              onPress={handleTestWeeklyLotus}
              disabled={isLoading}
            >
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Test Weekly Lotus</Text>
                <Text style={[styles.rowDescription, fonts.captionFont]}>
                  Manually trigger weekly lotus assignment
                </Text>
              </View>
              {isLoading ? (
                <OuroborosLoader 
                  size={24}
                  duration={2000}
                  fillColor="#F5E6D3"
                  strokeColor="#7B6B5C"
                  strokeWidth={1.5}
                  loop={true}
                />
              ) : (
                <View style={styles.rowRight}>
                  <View style={styles.lotusBadge}>
                    <Text style={[styles.lotusBadgeText, fonts.captionFont]}>
                      {userData.numOfLotus || 0} 🪷
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.captionFont]}>SUBSCRIPTION</Text>
          
          {userData.subscription?.isActive ? (
            <View style={[styles.row, styles.goldSubscriptionRow]}>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, fonts.spiritualBodyFont, styles.goldText]}>
                  Full Circle ✨
                </Text>
                <Text style={[styles.rowDescription, fonts.captionFont, styles.goldText]}>
                  You have premium access
                </Text>
              </View>
              <View style={styles.goldBadge}>
                <Text style={[styles.goldBadgeText, fonts.captionFont]}>ACTIVE</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.row}
              onPress={() => router.navigate("/user/FullCircleSubscription" as any)}
            >
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Upgrade to Full Circle</Text>
                <Text style={[styles.rowDescription, fonts.captionFont]}>
                  Unlock premium features and enhance your experience
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Connected Accounts Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.captionFont]}>CONNECTED ACCOUNTS</Text>
          
          {/* Google Account */}
          <View style={[
            styles.accountRow,
            userData.settings?.connectedAccounts?.google && styles.connectedAccountRow
          ]}>
            <View style={styles.accountInfo}>
              <View style={styles.accountHeader}>
                <Text style={[styles.accountTitle, fonts.spiritualBodyFont]}>Google</Text>
                {userData.settings?.connectedAccounts?.google && (
                  <View style={styles.connectedBadge}>
                    <Text style={[styles.connectedBadgeText, fonts.captionFont]}>CONNECTED</Text>
                  </View>
                )}
              </View>
              {userData.settings?.connectedAccounts?.google && (
                <Text style={[styles.accountEmail, fonts.captionFont]}>
                  {userData.email}
                </Text>
              )}
            </View>
            
            {isConnectingGoogle ? (
              <OuroborosLoader 
                size={40}
                duration={3000}
                fillColor="#F5E6D3"
                strokeColor="#7B6B5C"
                strokeWidth={1.5}
                loop={true}
              />
            ) : (
              <Switch
                value={userData.settings?.connectedAccounts?.google || false}
                onValueChange={handleGoogleToggle}
                trackColor={{ false: colors.border, true: '#8B4513' + '80' }}
                thumbColor={userData.settings?.connectedAccounts?.google ? '#8B4513' : colors.textMuted}
                disabled={isConnectingGoogle}
              />
            )}
          </View>

          {/* Apple Account */}
          <View style={[
            styles.accountRow,
            userData.settings?.connectedAccounts?.apple && styles.connectedAccountRow
          ]}>
            <View style={styles.accountInfo}>
              <View style={styles.accountHeader}>
                <Text style={[styles.accountTitle, fonts.spiritualBodyFont]}>Apple</Text>
                {userData.settings?.connectedAccounts?.apple && (
                  <View style={styles.connectedBadge}>
                    <Text style={[styles.connectedBadgeText, fonts.captionFont]}>CONNECTED</Text>
                  </View>
                )}
              </View>
              {userData.settings?.connectedAccounts?.apple && (
                <Text style={[styles.accountEmail, fonts.captionFont]}>
                  {userData.email}
                </Text>
              )}
            </View>
            
            <Switch
              value={userData.settings?.connectedAccounts?.apple || false}
              onValueChange={async (value) => {
                if (value) {
                  // Connect Apple account
                  try {
                    await handleAppleSignIn();
                    
                    // After successful Apple connection, update the email field
                    // This mirrors the Google connection behavior
                    if (FIREBASE_AUTH.currentUser?.email) {
                      await updateUserData({
                        email: FIREBASE_AUTH.currentUser.email,
                      });
                      console.log("Successfully updated email from Apple account:", FIREBASE_AUTH.currentUser.email);
                    }
                  } catch (error) {
                    console.error("Apple sign-in error:", error);
                  }
                } else {
                  // Disconnect Apple account
                  handleDisconnectApple();
                }
              }}
              trackColor={{ false: colors.border, true: '#8B4513' + '80' }}
              thumbColor={userData.settings?.connectedAccounts?.apple ? '#8B4513' : colors.textMuted}
            />
          </View>
        </View>

        <View style={styles.section}>
         <Text style={[styles.sectionTitle, fonts.captionFont]}>SHARE</Text>
        
          <TouchableOpacity 
            style={styles.row}
            onPress={handleShareApp}
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Share FullCircle</Text>
              <Text style={[styles.rowDescription, fonts.captionFont]}>
                Invite friends to join our community
              </Text>
            </View>
            <Ionicons name="share-social-outline" size={20} color={colors.textDark} />
          </TouchableOpacity>
        </View>


        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.captionFont]}>LEGAL</Text>
          
          <TouchableOpacity 
            style={styles.row}
            onPress={() => router.navigate("/user/PrivacyPolicy" as any)}
          >
            <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.row}
            onPress={() => router.navigate("/user/TermsOfService" as any)}
          >
            <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Log Out & Delete Account */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Text style={[styles.logoutText, fonts.spiritualBodyFont]}>Log Out</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => setDeleteAccountModal(true)}
          >
            <Text style={[styles.deleteText, fonts.captionFont]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Pause Confirmation Modal */}
      <Modal
        visible={showPauseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPauseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, fonts.spiritualTitleFont]}>Pause Your Profile?</Text>
            <Text style={[styles.modalDescription, fonts.spiritualBodyFont]}>
              Pausing will hide your profile from new people. You can still chat with current matches and unpause anytime.
            </Text>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={confirmPause}
            >
              <Text style={[styles.modalButtonText, fonts.buttonFont]}>Yes, Pause Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setShowPauseModal(false)}>
              <Text style={[styles.modalCancelText, fonts.captionFont]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Email Verification Modal */}
      <Modal
        visible={showVerificationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVerificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, fonts.spiritualTitleFont]}>Verification Code</Text>
            <Text style={[styles.modalDescription, fonts.spiritualBodyFont]}>
              We sent a verification code to {newEmail}
            </Text>
            
            <TextInput
              style={[styles.verificationInput, fonts.inputFont]}
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="000000"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={6}
            />
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handleVerificationSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <OuroborosLoader 
                  size={50}
                  duration={3000}
                  fillColor="#F5E6D3"
                  strokeColor="#7B6B5C"
                  strokeWidth={1.5}
                  loop={true}
                />
              ) : (
                <Text style={[styles.modalButtonText, fonts.buttonFont]}>Verify Code</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setShowVerificationModal(false)}>
              <Text style={[styles.modalCancelText, fonts.captionFont]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={deleteAccountModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDeleteAccountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, fonts.spiritualTitleFont]}>Why are you leaving?</Text>
            
            {deleteReasons.map((reason, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.reasonOption,
                  deleteReason === reason && styles.reasonOptionSelected,
                ]}
                onPress={() => setDeleteReason(reason)}
              >
                <Text style={[
                  styles.reasonText,
                  fonts.spiritualBodyFont,
                  deleteReason === reason && styles.reasonTextSelected,
                ]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
            
            {isLoading ? (
              <View style={styles.loaderContainer}>
                <OuroborosLoader 
                  size={50}
                  duration={3000}
                  fillColor="#F5E6D3"
                  strokeColor="#7B6B5C"
                  strokeWidth={1.5}
                  loop={true}
                />
              </View>
            ) : (
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteModalButton]}
                onPress={handleDeleteAccount}
              >
                <Text style={[styles.modalButtonText, fonts.buttonFont]}>Delete Account</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity onPress={() => setDeleteAccountModal(false)}>
              <Text style={[styles.modalCancelText, fonts.captionFont]}>Keep Account</Text>
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
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing.lg,
      paddingTop: Platform.OS === 'ios' ? 20 : 10,
      paddingBottom: Spacing.lg,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: {
      width: 24,
    },
    headerTitle: {
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      letterSpacing: 0.5,
    },
    closeButton: {
      padding: Spacing.xs,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      marginTop: Spacing.xl,
      paddingHorizontal: Spacing.lg,
    },
    sectionTitle: {
      fontSize: Typography.sizes.xs,
      color: colors.textMuted,
      marginBottom: Spacing.md,
      textTransform: "uppercase",
      letterSpacing: 1,
      fontWeight: Typography.weights.medium,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: Spacing.md,
      backgroundColor: colors.card,
      marginVertical: Spacing.xs,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    goldSubscriptionRow: {
      borderColor: '#FFD700',
      borderWidth: 2,
      backgroundColor: '#FFD700' + '10',
    },
    goldBadge: {
      backgroundColor: '#FFD700',
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.md,
    },
    goldBadgeText: {
      color: '#FFFFFF',
      fontSize: Typography.sizes.xs,
      fontWeight: Typography.weights.bold,
    },
    goldText: {
      color: '#B8860B',
    },
    lotusBadge: {
      backgroundColor: '#8B4513',
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.md,
    },
    lotusBadgeText: {
      color: '#FFFFFF',
      fontSize: Typography.sizes.xs,
      fontWeight: Typography.weights.bold,
    },
    rowContent: {
      flex: 1,
      marginRight: Spacing.md,
    },
    rowRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    rowTitle: {
      fontSize: Typography.sizes.base,
      color: colors.textDark,
      fontWeight: Typography.weights.medium,
      marginBottom: Spacing.xs,
      letterSpacing: 0.3,
    },
    rowDescription: {
      fontSize: Typography.sizes.sm,
      color: colors.textLight,
      lineHeight: 20,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: Spacing.sm,
      marginHorizontal: Spacing.lg,
    },
    editText: {
      fontSize: Typography.sizes.base,
      color: '#8B4513',
      fontWeight: Typography.weights.medium,
    },
    expandableContent: {
      overflow: "hidden",
      paddingHorizontal: Spacing.lg,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      marginTop: Spacing.xs,
    },
    expandedText: {
      fontSize: Typography.sizes.sm,
      color: colors.textLight,
      lineHeight: 20,
      padding: Spacing.md,
    },
    emailInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      fontSize: Typography.sizes.base,
      marginTop: Spacing.sm,
      backgroundColor: colors.background,
      color: colors.textDark,
    },
    updateButton: {
      backgroundColor: '#8B4513',
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      alignItems: "center",
      marginTop: Spacing.md,
      marginBottom: Spacing.md,
    },
    updateButtonText: {
      color: "#FFFFFF",
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.semibold,
      letterSpacing: 0.5,
    },
    verifyRow: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      backgroundColor: '#8B4513' + '10',
      borderRadius: BorderRadius.lg,
      marginTop: Spacing.sm,
    },
    verifyText: {
      fontSize: Typography.sizes.base,
      color: '#8B4513',
      fontWeight: Typography.weights.medium,
    },
    bottomSection: {
      marginTop: Spacing['2xl'],
      marginBottom: Spacing['2xl'],
      alignItems: "center",
    },
    logoutButton: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    logoutText: {
      fontSize: Typography.sizes.lg,
      color: colors.textDark,
      fontWeight: Typography.weights.medium,
      letterSpacing: 0.3,
    },
    deleteButton: {
      marginTop: Spacing.lg,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
    },
    deleteText: {
      fontSize: Typography.sizes.sm,
      color: '#CD5C5C',
      fontWeight: Typography.weights.medium,
      letterSpacing: 0.3,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      padding: Spacing['2xl'],
      width: "90%",
      maxWidth: 400,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: {
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      marginBottom: Spacing.sm,
      textAlign: "center",
      letterSpacing: 0.5,
    },
    modalDescription: {
      fontSize: Typography.sizes.base,
      color: colors.textLight,
      marginBottom: Spacing.xl,
      textAlign: "center",
    },
    verificationInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      fontSize: Typography.sizes.xl,
      textAlign: "center",
      letterSpacing: 8,
      marginBottom: Spacing.xl,
      backgroundColor: colors.background,
      color: colors.textDark,
    },
    modalButton: {
      backgroundColor: '#8B4513',
      borderRadius: BorderRadius.md,
      padding: Spacing.lg,
      alignItems: "center",
      marginBottom: Spacing.md,
    },
    deleteModalButton: {
      backgroundColor: '#CD5C5C',
    },
    loaderContainer: {
      alignItems: "center",
      marginBottom: Spacing.md,
      paddingVertical: Spacing.sm,
    },
    modalButtonText: {
      color: "#FFFFFF",
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.semibold,
      letterSpacing: 0.5,
    },
    modalCancelText: {
      fontSize: Typography.sizes.base,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: Spacing.sm,
    },
    reasonOption: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    reasonOptionSelected: {
      borderColor: '#8B4513',
      backgroundColor: '#8B4513' + '10',
    },
    reasonText: {
      fontSize: Typography.sizes.base,
      color: colors.textLight,
    },
    reasonTextSelected: {
      color: '#8B4513',
      fontWeight: Typography.weights.medium,
    },
    connectedAccountInfo: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      backgroundColor: '#8B4513' + '10',
      borderRadius: BorderRadius.md,
      marginTop: Spacing.xs,
      borderWidth: 1,
      borderColor: '#8B4513' + '20',
    },
    connectedAccountText: {
      fontSize: Typography.sizes.sm,
      color: '#8B4513',
      fontStyle: 'italic',
    },
    // New account styles
    accountRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: Spacing.md,
      backgroundColor: colors.card,
      marginVertical: Spacing.xs,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    connectedAccountRow: {
      borderColor: '#8B4513',
      borderWidth: 2,
      backgroundColor: '#8B4513' + '08',
    },
    accountInfo: {
      flex: 1,
      marginRight: Spacing.md,
    },
    accountHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: Spacing.xs,
    },
    accountTitle: {
      fontSize: Typography.sizes.base,
      color: colors.textDark,
      fontWeight: Typography.weights.medium,
      marginRight: Spacing.sm,
    },
    connectedBadge: {
      backgroundColor: '#8B4513',
      paddingHorizontal: Spacing.xs,
      paddingVertical: 2,
      borderRadius: BorderRadius.sm,
    },
    connectedBadgeText: {
      color: '#FFFFFF',
      fontSize: Typography.sizes.xs,
      fontWeight: Typography.weights.bold,
      letterSpacing: 0.5,
    },
    accountEmail: {
      fontSize: Typography.sizes.sm,
      color: colors.textLight,
      fontStyle: 'italic',
    },
    // Disabled email row styles
    disabledRow: {
      opacity: 0.6,
      backgroundColor: colors.background,
    },
    linkedAccountNote: {
      fontSize: Typography.sizes.xs,
      color: colors.textMuted,
      fontStyle: 'italic',
      marginTop: 2,
    },
    disabledEditText: {
      color: colors.textMuted,
    },
    marketingSection: {
      marginTop: 30,
      paddingBottom: 20,
    },
  });
};