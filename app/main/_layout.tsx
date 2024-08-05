import React from "react";
import { Tabs } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";

export default function MainStackLayout() {
  return (
    <Tabs>
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
            <Icon name="heart" color={color} size={size} />
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
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
