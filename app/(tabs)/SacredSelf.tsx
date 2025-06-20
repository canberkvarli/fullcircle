import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Animated,
} from "react-native";
import styles from "@/styles/Main/SacredSelfStyles";
import Icon from "react-native-vector-icons/FontAwesome";
import { Link } from "expo-router";
import { useUserContext } from "@/context/UserContext";

export default function SacredSelf() {
  const { userData } = useUserContext();
  const [activeTab, setActiveTab] = useState("Get more");
  const [verified, setVerified] = useState(false);
  const [showHeader, setShowHeader] = useState(false); // State to control header visibility
  const scrollY = useRef(new Animated.Value(0)).current;

  const avatarHeight = 150; // Approximate height of avatar + padding

  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
  };

  const handleVerify = () => {
    setVerified(true);
    console.log("Verification requested");
  };

  // Monitor the scroll position and set the header visibility
  scrollY.addListener(({ value }) => {
    if (value > avatarHeight && !showHeader) {
      setShowHeader(true);
    } else if (value <= avatarHeight && showHeader) {
      setShowHeader(false);
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Circle</Text>
        <View style={styles.icons}>
          <Link
            href={{ pathname: "/user/DatingPreferences" as any }}
            style={styles.sliderIcon}
          >
            <Icon
              name="sliders"
              size={24}
              color="black"
              style={styles.preferencesIcon}
            />
          </Link>
          <Link href="/user/UserSettings">
            <Icon
              name="cog"
              size={24}
              color="black"
              style={styles.iconSpacing}
            />
          </Link>
        </View>
      </View>

      {/* Conditional rendering for user name and verification icon */}
      {showHeader && (
        <View style={styles.animatedHeader}>
          <Text style={styles.animatedUserName}>{userData.firstName}</Text>
          <Icon
            name="check-circle"
            size={20}
            color={verified ? "green" : "black"}
            style={styles.verifyIcon}
          />
        </View>
      )}

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.profileSection}>
          <Link href={"/user/EditUserProfile" as any}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: userData.photos?.[0] }}
                style={styles.profileImage}
              />
              <Icon
                name="pencil"
                size={16}
                color="white"
                style={styles.editIconContainer}
              />
            </View>
          </Link>
          <View style={styles.userNameContainer}>
            <Text style={styles.userName}>{userData.firstName}</Text>
            <TouchableOpacity onPress={handleVerify}>
              <Icon
                name={verified ? "check-circle" : "check"}
                size={20}
                color={verified ? "green" : "black"}
                style={styles.verifyIcon}
              />
            </TouchableOpacity>
          </View>
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
            style={[styles.tab, activeTab === "My Circle" && styles.activeTab]}
            onPress={() => handleTabSwitch("My Circle")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "My Circle" && styles.activeTabText,
              ]}
            >
              My Circle
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {activeTab === "Get more" ? (
            <>
              <View style={styles.fullCircleImageContainer}>
                <Image
                  source={require("../../assets/images/fullcircle-couple.jpg")} // Replace with actual image URI
                  style={styles.fullCircleImage}
                />
                <View style={styles.fullCircleTextContainer}>
                  <Text style={styles.fullCircleText}>FullCircle</Text>
                  <Text style={styles.subText}>
                    Get seen sooner and go on 3x as many dates
                  </Text>
                  <Link
                    style={styles.upgradeButton}
                    href={{ pathname: "user/FullCircleSubscription" as any }}
                  >
                    <Text style={styles.upgradeButtonText}>Upgrade</Text>
                  </Link>
                </View>
              </View>

              <View style={styles.iconButtonsContainer}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => console.log("Day Pass clicked")}
                >
                  <Icon name="sun-o" size={24} color="black" />
                  <View style={styles.iconButtonTextContainer}>
                    <Text style={styles.iconButtonTitle}>Day Pass</Text>
                    <Text style={styles.iconButtonSubtitle}>
                      Unlock divine potential for 24 hours
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => console.log("Boost clicked")}
                >
                  <Icon name="bolt" size={24} color="black" />
                  <View style={styles.iconButtonTextContainer}>
                    <Text style={styles.iconButtonTitle}>Amplify</Text>
                    <Text style={styles.iconButtonSubtitle}>
                      Shine your light to 11x more souls
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => console.log("Roses clicked")}
                >
                  <Icon name="pagelines" size={24} color="black" />
                  <View style={styles.iconButtonTextContainer}>
                    <Text style={styles.iconButtonTitle}>Sacred Offering</Text>
                    <Text style={styles.iconButtonSubtitle}>
                      Double the chance of a sacred connection
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text>My Circle content goes here...</Text>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
