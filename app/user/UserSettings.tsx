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
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  Platform,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

export default function UserSettings() {
  const router = useRouter();
  const { userData, updateUserSettings, signOut, deleteAccount, updateUserData } = useUserContext();
  
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
  const [isLoading, setIsLoading] = useState(false);
  
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
    setIsPaused(value);
    await updateUserSettings({ isPaused: value });
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
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert("Sacred Connection", "Please enter a valid email address to maintain your cosmic flow.");
      return;
    }
    
    setIsLoading(true);
    try {
      // TODO: Send verification email via Firebase
      setEmailVerificationPending(true);
      setShowVerificationModal(true);
      Alert.alert("Divine Verification", "Check your sacred inbox for the verification code.");
    } catch (error) {
      Alert.alert("Cosmic Interference", "Failed to send verification email.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification code submission
  const handleVerificationSubmit = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert("Sacred Code", "Please enter the complete 6-digit verification code.");
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
      setVerificationCode(""); // Clear the verification code
      setNewEmail(""); // Clear the new email input
      Alert.alert("Divine Success", "Your email has been updated successfully! ✨");
    } catch (error) {
      Alert.alert("Cosmic Interference", "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!deleteReason) {
      Alert.alert("Sacred Feedback", "Please share why you're leaving our cosmic community.");
      return;
    }
    
    Alert.alert(
      "Release Your Energy",
      "Are you certain? This sacred journey cannot be retraced.",
      [
        { text: "Keep Connecting", style: "cancel" },
        {
          text: "Release & Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await deleteAccount();
            } catch (error) {
              Alert.alert("Cosmic Interference", "Unable to release your account at this time.");
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const deleteReasons = [
    "I found my soul connection",
    "Taking a spiritual break",
    "The energy didn't align",
    "Too many cosmic notifications",
    "Not enough sacred matches",
    "Prefer not to share",
    "Other reasons",
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={[styles.headerTitle, fonts.spiritualTitleFont]}>Sacred Settings</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.captionFont]}>SACRED PROFILE</Text>
          
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Pause Your Journey</Text>
              <Text style={[styles.rowDescription, fonts.captionFont]}>
                Pausing conceals your divine light from new souls while maintaining connections with current matches.
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
              <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Last Active Aura</Text>
              <Text style={[styles.rowDescription, fonts.captionFont]}>
                {showLastActive 
                  ? "Share your cosmic presence timing with seeking souls. Matches won't see this sacred information."
                  : "Keep your spiritual timeline private from all souls."
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
        </View>

        {/* Safety Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.captionFont]}>SACRED SAFETY</Text>
          
          <TouchableOpacity 
            style={styles.row}
            onPress={() => router.navigate("/user/SelfieVerificationScreen" as any)}
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>
                Divine Verification
                {userData.settings?.isSelfieVerified && (
                  <Text> ✨</Text>
                )}
              </Text>
              <Text style={[styles.rowDescription, fonts.captionFont]}>
                {userData.settings?.isSelfieVerified 
                  ? "Your divine essence is verified"
                  : "Verify your sacred self to build trust and attract more connections"
                }
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Phone & Email Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.captionFont]}>COSMIC COMMUNICATION</Text>
          
          <TouchableOpacity style={styles.row} onPress={togglePhoneExpand}>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>
                {userData.phoneNumber || "Sacred Contact"}
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
              Your sacred phone number is eternally bound to your cosmic identity and cannot be altered.
            </Text>
          </Animated.View>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.row} onPress={toggleEmailExpand}>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>
                {userData.email || "Divine Email"}
              </Text>
            </View>
            <Text style={[styles.editText, fonts.buttonFont]}>Edit</Text>
          </TouchableOpacity>
          
          <Animated.View
            style={[
              styles.expandableContent,
              {
                maxHeight: emailAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 120],
                }),
                opacity: emailAnimation,
              },
            ]}
          >
            <TextInput
              style={[styles.emailInput, fonts.inputFont]}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Enter your new cosmic email"
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
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[styles.updateButtonText, fonts.buttonFont]}>Update Sacred Email</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {emailVerificationPending && (
            <TouchableOpacity 
              style={styles.verifyRow}
              onPress={() => setShowVerificationModal(true)}
            >
              <Text style={[styles.verifyText, fonts.spiritualBodyFont]}>Verify your divine email address ✨</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.captionFont]}>COSMIC NOTIFICATIONS</Text>
          
          <TouchableOpacity 
            style={styles.row}
            onPress={() => router.navigate("/user/PushNotifications" as any)}
          >
            <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Divine Messages</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.captionFont]}>SACRED SUBSCRIPTION</Text>
          
          <TouchableOpacity 
            style={styles.row}
            onPress={() => router.navigate("/user/FullCircleSubscription" as any)}
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Full Circle Journey</Text>
              <Text style={[styles.rowDescription, fonts.captionFont]}>
                {userData.fullCircleSubscription 
                  ? "You are embracing the complete cosmic experience ✨"
                  : "Unlock your full spiritual potential"
                }
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Connected Accounts Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.captionFont]}>CONNECTED ENERGIES</Text>
          
          <View style={styles.row}>
            <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Google Harmony</Text>
            <Switch
              value={userData.settings?.connectedAccounts?.google || false}
              onValueChange={() => console.log("Toggle Google")}
              trackColor={{ false: colors.border, true: '#8B4513' + '80' }}
              thumbColor={userData.settings?.connectedAccounts?.google ? '#8B4513' : colors.textMuted}
            />
          </View>

          <View style={styles.separator} />
          
          <View style={styles.row}>
            <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Apple Essence</Text>
            <Switch
              value={userData.settings?.connectedAccounts?.apple || false}
              onValueChange={() => console.log("Toggle Apple")}
              trackColor={{ false: colors.border, true: '#8B4513' + '80' }}
              thumbColor={userData.settings?.connectedAccounts?.apple ? '#8B4513' : colors.textMuted}
            />
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.captionFont]}>SACRED AGREEMENTS</Text>
          
          <TouchableOpacity style={styles.row}>
            <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Privacy Covenant</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.separator} />
          
          <TouchableOpacity style={styles.row}>
            <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Terms of Sacred Service</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Log Out & Delete Account */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Text style={[styles.logoutText, fonts.spiritualBodyFont]}>Release Session</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => setDeleteAccountModal(true)}
          >
            <Text style={[styles.deleteText, fonts.captionFont]}>Release Sacred Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Email Verification Modal */}
      <Modal
        visible={showVerificationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVerificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, fonts.spiritualTitleFont]}>Sacred Verification Code</Text>
            <Text style={[styles.modalDescription, fonts.spiritualBodyFont]}>
              We sent divine numerology to {newEmail}
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
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[styles.modalButtonText, fonts.buttonFont]}>Verify Sacred Code</Text>
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
            <Text style={[styles.modalTitle, fonts.spiritualTitleFont]}>Why are you leaving our sacred circle?</Text>
            
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
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.deleteModalButton]}
              onPress={handleDeleteAccount}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[styles.modalButtonText, fonts.buttonFont]}>Release My Sacred Journey</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setDeleteAccountModal(false)}>
              <Text style={[styles.modalCancelText, fonts.captionFont]}>Continue My Journey</Text>
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
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
    rowContent: {
      flex: 1,
      marginRight: Spacing.md,
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
      fontStyle: 'italic',
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
      fontStyle: 'italic',
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
      fontStyle: 'italic',
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
  });
};