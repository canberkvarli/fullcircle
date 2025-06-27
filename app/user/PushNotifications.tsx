import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  StyleSheet,
  useColorScheme,
  Platform,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

export default function PushNotifications() {
  const router = useRouter();
  const { userData, updateUserSettings } = useUserContext();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);
  
  const [notifications, setNotifications] = useState({
    enableAll: userData.settings?.pushNotifications?.enableAll ?? true,
    muteAll: userData.settings?.pushNotifications?.muteAll ?? false,
    newLikes: userData.settings?.pushNotifications?.newLikes ?? true,
    newMatches: userData.settings?.pushNotifications?.newMatches ?? true,
    newMessages: userData.settings?.pushNotifications?.newMessages ?? true,
    promotions: userData.settings?.pushNotifications?.promotions ?? true,
    announcements: userData.settings?.pushNotifications?.announcements ?? true,
  });

  const handleNotificationToggle = async (key: keyof typeof notifications, value: boolean) => {
    let newNotifications = { ...notifications };
    
    // Special handling for enableAll and muteAll
    if (key === 'enableAll') {
      if (value) {
        // Enable all notifications
        newNotifications = {
          enableAll: true,
          muteAll: false,
          newLikes: true,
          newMatches: true,
          newMessages: true,
          promotions: true,
          announcements: true,
        };
      } else {
        // Just turn off enableAll
        newNotifications.enableAll = false;
      }
    } else if (key === 'muteAll') {
      if (value) {
        // Mute all notifications
        newNotifications = {
          ...newNotifications,
          muteAll: true,
          enableAll: false,
        };
      } else {
        // Just turn off muteAll
        newNotifications.muteAll = false;
      }
    } else {
      // Regular notification toggle
      newNotifications[key] = value;
      
      // Check if all individual notifications are enabled
      const allEnabled = newNotifications.newLikes && 
                        newNotifications.newMatches && 
                        newNotifications.newMessages && 
                        newNotifications.promotions && 
                        newNotifications.announcements;
      
      if (allEnabled && !newNotifications.muteAll) {
        newNotifications.enableAll = true;
      } else {
        newNotifications.enableAll = false;
      }
    }
    
    setNotifications(newNotifications);
    
    // Update in backend
    await updateUserSettings({
      pushNotifications: newNotifications,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, fonts.spiritualTitleFont]}>Divine Messages</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* All Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.captionFont]}>COSMIC COMMUNICATION</Text>
          
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Embrace All Sacred Messages</Text>
              <Text style={[styles.rowDescription, fonts.captionFont]}>
                Open your spirit to receive all divine notifications from the universe
              </Text>
            </View>
            <Switch
              value={notifications.enableAll}
              onValueChange={(value) => handleNotificationToggle('enableAll', value)}
              trackColor={{ false: colors.border, true: '#8B4513' + '80' }}
              thumbColor={notifications.enableAll ? '#8B4513' : colors.textMuted}
              disabled={notifications.muteAll}
            />
          </View>

          <View style={styles.separator} />
          
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Silence All Sacred Whispers</Text>
              <Text style={[styles.rowDescription, fonts.captionFont]}>
                Enter a peaceful state of digital meditation and silence
              </Text>
            </View>
            <Switch
              value={notifications.muteAll}
              onValueChange={(value) => handleNotificationToggle('muteAll', value)}
              trackColor={{ false: colors.border, true: '#8B4513' + '80' }}
              thumbColor={notifications.muteAll ? '#8B4513' : colors.textMuted}
            />
          </View>
        </View>

        {/* Notification Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.captionFont]}>SACRED NOTIFICATION TYPES</Text>
          
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Hearts of Appreciation</Text>
              <Text style={[styles.rowDescription, fonts.captionFont]}>
                When souls appreciate your divine energy ✨
              </Text>
            </View>
            <Switch
              value={notifications.newLikes}
              onValueChange={(value) => handleNotificationToggle('newLikes', value)}
              trackColor={{ false: colors.border, true: '#8B4513' + '80' }}
              thumbColor={notifications.newLikes ? '#8B4513' : colors.textMuted}
              disabled={notifications.muteAll}
            />
          </View>

          <View style={styles.separator} />
          
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Sacred Soul Connections</Text>
              <Text style={[styles.rowDescription, fonts.captionFont]}>
                When the universe aligns two kindred spirits 🌟
              </Text>
            </View>
            <Switch
              value={notifications.newMatches}
              onValueChange={(value) => handleNotificationToggle('newMatches', value)}
              trackColor={{ false: colors.border, true: '#8B4513' + '80' }}
              thumbColor={notifications.newMatches ? '#8B4513' : colors.textMuted}
              disabled={notifications.muteAll}
            />
          </View>

          <View style={styles.separator} />
          
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Divine Conversations</Text>
              <Text style={[styles.rowDescription, fonts.captionFont]}>
                When sacred souls reach out with heartfelt messages 💫
              </Text>
            </View>
            <Switch
              value={notifications.newMessages}
              onValueChange={(value) => handleNotificationToggle('newMessages', value)}
              trackColor={{ false: colors.border, true: '#8B4513' + '80' }}
              thumbColor={notifications.newMessages ? '#8B4513' : colors.textMuted}
              disabled={notifications.muteAll}
            />
          </View>

          <View style={styles.separator} />
          
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Cosmic Offerings</Text>
              <Text style={[styles.rowDescription, fonts.captionFont]}>
                Exclusive spiritual gifts and sacred promotions from the Circle
              </Text>
            </View>
            <Switch
              value={notifications.promotions}
              onValueChange={(value) => handleNotificationToggle('promotions', value)}
              trackColor={{ false: colors.border, true: '#8B4513' + '80' }}
              thumbColor={notifications.promotions ? '#8B4513' : colors.textMuted}
              disabled={notifications.muteAll}
            />
          </View>

          <View style={styles.separator} />
          
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, fonts.spiritualBodyFont]}>Universal Updates</Text>
              <Text style={[styles.rowDescription, fonts.captionFont]}>
                Sacred announcements about new energies and features in the Circle
              </Text>
            </View>
            <Switch
              value={notifications.announcements}
              onValueChange={(value) => handleNotificationToggle('announcements', value)}
              trackColor={{ false: colors.border, true: '#8B4513' + '80' }}
              thumbColor={notifications.announcements ? '#8B4513' : colors.textMuted}
              disabled={notifications.muteAll}
            />
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="heart" size={24} color="#8B4513" style={styles.infoIcon} />
            <Text style={[styles.infoText, fonts.spiritualBodyFont]}>
              Stay connected with your soul tribe and never miss a sacred opportunity to deepen your cosmic connections with kindred spirits.
            </Text>
          </View>
        </View>
      </ScrollView>
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
    backButton: {
      padding: Spacing.xs,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerTitle: {
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      letterSpacing: 0.5,
    },
    headerRight: {
      width: 32,
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
      marginBottom: Spacing.lg,
      textTransform: "uppercase",
      letterSpacing: 1,
      fontWeight: Typography.weights.medium,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      backgroundColor: colors.card,
      marginVertical: Spacing.xs,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: 1,
        },
      }),
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
      lineHeight: 18,
      fontStyle: 'italic',
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: Spacing.sm,
      marginHorizontal: Spacing.lg,
    },
    infoSection: {
      marginTop: Spacing['2xl'],
      marginBottom: Spacing['2xl'],
      paddingHorizontal: Spacing.lg,
    },
    infoCard: {
      backgroundColor: '#8B4513' + '10',
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#8B4513' + '20',
    },
    infoIcon: {
      marginBottom: Spacing.md,
    },
    infoText: {
      fontSize: Typography.sizes.base,
      color: colors.textLight,
      textAlign: "center",
      lineHeight: 24,
      fontStyle: "italic",
      letterSpacing: 0.3,
    },
  });
};