import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import styles from "@/styles/User/PushNotificationsStyles"

export default function PushNotifications() {
  const router = useRouter();
  const { userData, updateUserSettings } = useUserContext();
  
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
          <Icon name="chevron-left" size={24} color="#7E7972" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Push Notifications</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* All Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Notifications</Text>
          
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Enable All Notifications</Text>
            <Switch
              value={notifications.enableAll}
              onValueChange={(value) => handleNotificationToggle('enableAll', value)}
              trackColor={{ false: "#E0E0E0", true: "#D8BFAA" }}
              thumbColor={notifications.enableAll ? "#fff" : "#f4f3f4"}
              disabled={notifications.muteAll}
            />
          </View>

          <View style={styles.separator} />
          
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Mute All Notifications</Text>
            <Switch
              value={notifications.muteAll}
              onValueChange={(value) => handleNotificationToggle('muteAll', value)}
              trackColor={{ false: "#E0E0E0", true: "#D8BFAA" }}
              thumbColor={notifications.muteAll ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Notification Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          
          <View style={styles.row}>
            <Text style={styles.rowTitle}>New Likes</Text>
            <Switch
              value={notifications.newLikes}
              onValueChange={(value) => handleNotificationToggle('newLikes', value)}
              trackColor={{ false: "#E0E0E0", true: "#D8BFAA" }}
              thumbColor={notifications.newLikes ? "#fff" : "#f4f3f4"}
              disabled={notifications.muteAll}
            />
          </View>

          <View style={styles.separator} />
          
          <View style={styles.row}>
            <Text style={styles.rowTitle}>New Matches</Text>
            <Switch
              value={notifications.newMatches}
              onValueChange={(value) => handleNotificationToggle('newMatches', value)}
              trackColor={{ false: "#E0E0E0", true: "#D8BFAA" }}
              thumbColor={notifications.newMatches ? "#fff" : "#f4f3f4"}
              disabled={notifications.muteAll}
            />
          </View>

          <View style={styles.separator} />
          
          <View style={styles.row}>
            <Text style={styles.rowTitle}>New Messages</Text>
            <Switch
              value={notifications.newMessages}
              onValueChange={(value) => handleNotificationToggle('newMessages', value)}
              trackColor={{ false: "#E0E0E0", true: "#D8BFAA" }}
              thumbColor={notifications.newMessages ? "#fff" : "#f4f3f4"}
              disabled={notifications.muteAll}
            />
          </View>

          <View style={styles.separator} />
          
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Promotions</Text>
              <Text style={styles.rowDescription}>Exclusive offers and news</Text>
            </View>
            <Switch
              value={notifications.promotions}
              onValueChange={(value) => handleNotificationToggle('promotions', value)}
              trackColor={{ false: "#E0E0E0", true: "#D8BFAA" }}
              thumbColor={notifications.promotions ? "#fff" : "#f4f3f4"}
              disabled={notifications.muteAll}
            />
          </View>

          <View style={styles.separator} />
          
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Announcements</Text>
              <Text style={styles.rowDescription}>What's new on Circle</Text>
            </View>
            <Switch
              value={notifications.announcements}
              onValueChange={(value) => handleNotificationToggle('announcements', value)}
              trackColor={{ false: "#E0E0E0", true: "#D8BFAA" }}
              thumbColor={notifications.announcements ? "#fff" : "#f4f3f4"}
              disabled={notifications.muteAll}
            />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Stay connected with your matches and never miss an opportunity to connect with someone special.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}