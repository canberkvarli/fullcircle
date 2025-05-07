import React from "react";
import { View, Image } from "react-native";
import { Tabs } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";
import { useUserContext } from "@/context/UserContext";
import { HeartIconWithBadge } from "@/components/HeartIconWithBadge";

export default function MainStackLayout() {
  const { userData } = useUserContext();

  return (
    <Tabs
      screenOptions={{
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
          headerShown: false,
          tabBarLabel: "Connect",
          tabBarIcon: ({ color, size }) => (
            <Icon name="search" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="RadiantSouls"
        options={{
          headerShown: false,
          tabBarLabel: "Radiant Souls",
          tabBarIcon: ({ color, size }) => (
            <Icon name="star" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="KindredSpirits"
        options={{
          headerShown: false,
          tabBarLabel: "Kindred Spirits",
          tabBarIcon: ({ color, size }) => (
            <HeartIconWithBadge color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="SoulChats"
        options={{
          headerShown: false,
          tabBarLabel: "Soul Chats",
          tabBarIcon: ({ color, size }) => (
            <Icon name="comments" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="SacredSelf"
        options={{
          headerShown: false,
          tabBarLabel: "Sacred Self",
          tabBarIcon: ({ color, size, focused }) =>
            userData?.photos && userData.photos.length > 0 ? (
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
