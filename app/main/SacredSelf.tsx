import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useUserContext } from "@/context/UserContext";

export default function SacredSelf() {
  const { userData } = useUserContext();
  const [activeTab, setActiveTab] = useState("Get more");

  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Circle</Text>
        <View style={styles.icons}>
          <TouchableOpacity onPress={() => console.log("Preferences clicked")}>
            <Icon name="sliders" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log("Settings clicked")}>
            <Icon
              name="cog"
              size={24}
              color="black"
              style={styles.iconSpacing}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: userData.photos?.[0] }}
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={styles.editIconContainer}
            onPress={() => console.log("Edit photo clicked")}
          >
            <Icon name="pencil" size={16} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{userData.firstName}</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Get more" && styles.activeTab]}
          onPress={() => handleTabSwitch("Get more")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Get more" && styles.activeTabText,
            ]}
          >
            Get more
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "My Hinge" && styles.activeTab]}
          onPress={() => handleTabSwitch("My Hinge")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "My Hinge" && styles.activeTabText,
            ]}
          >
            My Hinge
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContent}>
        {activeTab === "Get more" ? (
          <Text>Get more content goes here...</Text>
        ) : (
          <Text>My Hinge content goes here...</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 25,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  icons: {
    flexDirection: "row",
  },
  iconSpacing: {
    marginLeft: 16,
  },
  profileSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "black",
    borderRadius: 12,
    padding: 4,
  },
  userName: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "black",
  },
  tabText: {
    fontSize: 18,
  },
  activeTabText: {
    fontWeight: "bold",
  },
  tabContent: {
    padding: 16,
  },
});
