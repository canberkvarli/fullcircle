import React from "react";
import {
  Animated,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useUserContext } from "@/context/UserContext";

interface SlidingTabBarProps {
  /** Animated translateY value to slide the bar up/down */
  translateY: Animated.AnimatedInterpolation<number>;
}

export default function SlidingTabBar({ translateY }: SlidingTabBarProps) {
  const router = useRouter();
  const { userData } = useUserContext();

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => router.push("/(tabs)/Connect")}
      >
        <Icon name="search" size={24} color="#7E7972" />
        <Text style={styles.label}>Connect</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => router.push("/(tabs)/RadiantSouls")}
      >
        <Icon name="star" size={24} color="#D3C6BA" />
        <Text style={styles.label}>Radiant Souls</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => router.push("/(tabs)/KindredSpirits")}
      >
        <Icon name="heart" size={24} color="#D3C6BA" />
        <Text style={styles.label}>Kindred Spirits</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => router.push("/(tabs)/SoulChats")}
      >
        <Icon name="comments" size={24} color="#D3C6BA" />
        <Text style={styles.label}>Soul Chats</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => router.push("/(tabs)/SacredSelf")}
      >
        {userData?.photos && userData.photos.length > 0 ? (
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: userData.photos[0] }} style={styles.avatar} />
          </View>
        ) : (
          <Icon name="user" size={24} color="#D3C6BA" />
        )}
        <Text style={styles.label}>Sacred Self</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    backgroundColor: "#EDE9E3",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  label: {
    fontSize: 10,
    color: "#7E7972",
    marginTop: 2,
  },
  avatarWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D8BFAA",
  },
  avatar: {
    width: 24,
    height: 24,
  },
});
