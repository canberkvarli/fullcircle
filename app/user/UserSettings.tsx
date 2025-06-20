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
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import styles from "@/styles/User/UserSettingsStyles";

export default function UserSettings() {
  const router = useRouter();
  const { userData, updateUserSettings, signOut, deleteAccount } = useUserContext();
  
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
      });      if (value) newNotifications.muteAll = false;
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
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    
    setIsLoading(true);
    try {
      // TODO: Send verification email via Firebase
      setEmailVerificationPending(true);
      setShowVerificationModal(true);
      Alert.alert("Verification Sent", "Check your email for the verification code.");
    } catch (error) {
      Alert.alert("Error", "Failed to send verification email.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification code submission
  const handleVerificationSubmit = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert("Invalid Code", "Please enter the 6-digit verification code.");
      return;
    }
    
    setIsLoading(true);
    try {
      // TODO: Verify code with backend
      await updateUserSettings({ pushNotifications: notifications });
      setEmailVerificationPending(false);
      setShowVerificationModal(false);
      setEmailExpanded(false);
      Alert.alert("Success", "Email updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  };
  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!deleteReason) {
      Alert.alert("Please select a reason", "Let us know why you're leaving.");
      return;
    }
    
    Alert.alert(
      "Delete Account",
      "Are you sure? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await deleteAccount();
            } catch (error) {
              Alert.alert("Error", "Failed to delete account.");
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const deleteReasons = [
    "I met someone",
    "I didn't like the way I felt while using Circle",
    "Prefer not to say",
    "Taking a break from dating",
    "Too many notifications",
    "Not enough matches",
    "Other",
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Icon name="times" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Profile</Text>
              <Text style={styles.rowDescription}>
                Pausing prevents your profile from being shown to new people. You can still chat with your current matches.
              </Text>
            </View>
            <Switch
              value={isPaused}
              onValueChange={handlePauseToggle}
              trackColor={{ false: "#E0E0E0", true: "#D8BFAA" }}
              thumbColor={isPaused ? "#fff" : "#f4f3f4"}
            />
          </View>

          <View style={styles.separator} />
          
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Show Last Active Status</Text>
              <Text style={styles.rowDescription}>
                {showLastActive 
                  ? "People viewing your profile can see your last active status and you can see theirs. Your matches won't be shown your last active status."
                  : "No one can see your last active status, and you cannot see when others were last active."
                }
              </Text>
            </View>
            <Switch
              value={showLastActive}
              onValueChange={handleLastActiveToggle}
              trackColor={{ false: "#E0E0E0", true: "#D8BFAA" }}
              thumbColor={showLastActive ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Safety Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety</Text>
          
          <TouchableOpacity 
            style={styles.row}
            onPress={() => router.push("/user/SelfieVerification" as any)}
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>
                Selfie Verification
                {userData.settings?.isSelfieVerified && (
                  <Icon name="check-circle" size={18} color="#4CAF50" style={{ marginLeft: 8 }} />
                )}
              </Text>
              <Text style={styles.rowDescription}>
                {userData.settings?.isSelfieVerified 
                  ? "Your profile is verified"
                  : "Verify your profile to increase trust and get more matches"
                }
              </Text>
            </View>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Phone & Email Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phone & Email</Text>
          
          <TouchableOpacity style={styles.row} onPress={togglePhoneExpand}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>{userData.areaCode || "Phone Number"}</Text>
            </View>
            <Icon name={phoneExpanded ? "chevron-up" : "chevron-down"} size={16} color="#999" />
          </TouchableOpacity>
          
          <Animated.View
            style={[
              styles.expandableContent,
              {
                maxHeight: phoneAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 60],
                }),
                opacity: phoneAnimation,
              },
            ]}
          >
            <Text style={styles.expandedText}>
              Note: You can't change the phone number associated with your account.
            </Text>
          </Animated.View>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.row} onPress={toggleEmailExpand}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>{userData.email || "Email Address"}</Text>
            </View>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          
          <Animated.View
            style={[
              styles.expandableContent,
              {
                maxHeight: emailAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 100],
                }),
                opacity: emailAnimation,
              },
            ]}
          >
            <TextInput
              style={styles.emailInput}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Enter new email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={styles.updateButton} 
              onPress={handleEmailChange}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.updateButtonText}>Update Email</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {emailVerificationPending && (
            <TouchableOpacity 
              style={styles.verifyRow}
              onPress={() => setShowVerificationModal(true)}
            >
              <Text style={styles.verifyText}>Verify your new email address</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <TouchableOpacity 
            style={styles.row}
            onPress={() => router.push("/user/PushNotifications" as any)}
          >
            <Text style={styles.rowTitle}>Push Notifications</Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          
          <TouchableOpacity 
            style={styles.row}
            onPress={() => router.push("/user/FullCircleSubscription" as any)}
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Subscribe to Circle</Text>
              <Text style={styles.rowDescription}>
                {userData.fullCircleSubscription 
                  ? "You are currently subscribed to FullCircle"
                  : "You are not currently subscribed"
                }
              </Text>
            </View>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Language & Region Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language & Region</Text>
          
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>App Language</Text>
              <Text style={styles.rowDescription}>English</Text>
            </View>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Connected Accounts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Accounts</Text>
          
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Google</Text>
            <Switch
              value={userData.settings?.connectedAccounts?.google || false}
              onValueChange={() => console.log("Toggle Google")}
              trackColor={{ false: "#E0E0E0", true: "#D8BFAA" }}
              thumbColor="#f4f3f4"
            />
          </View>

          <View style={styles.separator} />
          
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Apple</Text>
            <Switch
              value={userData.settings?.connectedAccounts?.apple || false}
              onValueChange={() => console.log("Toggle Apple")}
              trackColor={{ false: "#E0E0E0", true: "#D8BFAA" }}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowTitle}>Privacy Policy</Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>

          <View style={styles.separator} />
          
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowTitle}>Terms of Service</Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Log Out & Delete Account */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => setDeleteAccountModal(true)}
          >
            <Text style={styles.deleteText}>Delete Account</Text>
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
            <Text style={styles.modalTitle}>Enter Verification Code</Text>
            <Text style={styles.modalDescription}>
              We sent a 6-digit code to {newEmail}
            </Text>
            
            <TextInput
              style={styles.verificationInput}
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="000000"
              keyboardType="numeric"
              maxLength={6}
            />
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handleVerificationSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalButtonText}>Verify</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setShowVerificationModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
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
            <Text style={styles.modalTitle}>Why are you leaving Circle?</Text>
            
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
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalButtonText}>Delete My Account</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setDeleteAccountModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}