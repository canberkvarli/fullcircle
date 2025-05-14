import React from "react";
import { View, Image } from "react-native";
import { Tabs } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";
import { useUserContext } from "@/context/UserContext";
import { HeartIconWithBadge } from "@/components/HeartIconWithBadge";

export default function TabsLayout() {
  const { userData } = useUserContext();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 80,
          backgroundColor: "#EDE9E3",
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#7E7972",
        tabBarInactiveTintColor: "#D3C6BA",
      }}
    >
      <Tabs.Screen
        name="Connect"
        options={{
          tabBarLabel: "Connect",
          tabBarIcon: ({ color, size }) => (
            <Icon name="search" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="RadiantSouls"
        options={{
          tabBarLabel: "Radiant Souls",
          tabBarIcon: ({ color, size }) => (
            <Icon name="star" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="KindredSpirits"
        options={{
          tabBarLabel: "Kindred Spirits",
          tabBarIcon: ({ color, size }) => (
            <HeartIconWithBadge color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="SoulChats"
        options={{
          tabBarLabel: "Soul Chats",
          tabBarIcon: ({ color, size }) => (
            <Icon name="comments" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="SacredSelf"
        options={{
          tabBarLabel: "Sacred Self",
          tabBarIcon: ({ color, size, focused }) =>
            userData?.photos?.[0] ? (
              <View
                style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  overflow: "hidden",
                  borderWidth: focused ? 2 : 0,
                  borderColor: focused ? "#D8BFAA" : "transparent",
                }}
              >
                <Image
                  source={{ uri: userData.photos[0] }}
                  style={{ width: size, height: size }}
                />
              </View>
            ) : (
              <Icon name="user" color={color} size={size} />
            ),
        }}
      />
    </Tabs>
  );
}
