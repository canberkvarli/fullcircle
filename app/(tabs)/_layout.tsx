import React from "react";
import { View, Image, Platform, useColorScheme } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useUserContext } from "@/context/UserContext";
import { HeartIconWithBadge } from "@/components/HeartIconWithBadge";
import { MatchesIconWithBadge } from "@/components/MatchesIconWithBadge";
import { Colors } from "@/constants/Colors";

// Custom icon component for spiritual glow effect
const SpiritualIcon = ({ 
  iconName, 
  color, 
  size, 
  focused,
  colors
}: { 
  iconName: string; 
  color: string; 
  size: number; 
  focused: boolean;
  colors: any;
}) => (
  <View style={{
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    {/* Spiritual glow for active state */}
    {focused && (
      <View style={{
        position: 'absolute',
        width: size + 16,
        height: size + 16,
        borderRadius: (size + 16) / 2,
        backgroundColor: colors.primary,
        opacity: 0.2,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 8,
      }} />
    )}
    <Ionicons name={iconName as any} color={color} size={size} />
  </View>
);

// Custom avatar component with spiritual glow
const SpiritualAvatar = ({ 
  photoUri, 
  color, 
  size, 
  focused,
  colors
}: { 
  photoUri?: string; 
  color: string; 
  size: number; 
  focused: boolean;
  colors: any;
}) => {
  if (!photoUri) {
    return <SpiritualIcon iconName="person" color={color} size={size} focused={focused} colors={colors} />;
  }

  return (
    <View style={{
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Spiritual glow for active avatar */}
      {focused && (
        <View style={{
          position: 'absolute',
          width: size + 12,
          height: size + 12,
          borderRadius: (size + 12) / 2,
          backgroundColor: colors.primary,
          opacity: 0.3,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.7,
          shadowRadius: 10,
          elevation: 10,
        }} />
      )}
      
      <View style={{
        width: size + 4,
        height: size + 4,
        borderRadius: (size + 4) / 2,
        overflow: "hidden",
        borderWidth: focused ? 2 : 1,
        borderColor: focused ? colors.primary : colors.primary + '60',
        backgroundColor: colors.primary + '10',
      }}>
        <Image
          source={{ uri: photoUri }}
          style={{ 
            width: size, 
            height: size,
            margin: focused ? 1 : 0.5,
            borderRadius: size / 2,
          }}
        />
      </View>
    </View>
  );
};

export default function TabsLayout() {
  const { userData } = useUserContext();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 90,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === 'ios' ? 25 : 12,
          paddingTop: 12,
          position: 'absolute',
          shadowColor: colors.textDark,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="Connect"
        options={{
          tabBarLabel: "Connect",
          tabBarIcon: ({ color, size, focused }) => (
            <SpiritualIcon 
              iconName="search" 
              color={color} 
              size={size} 
              focused={focused}
              colors={colors}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="KindredSpirits"
        options={{
          tabBarLabel: "Kindred Spirits",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              position: 'relative',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {/* Spiritual glow for active state */}
              {focused && (
                <View style={{
                  position: 'absolute',
                  width: size + 16,
                  height: size + 16,
                  borderRadius: (size + 16) / 2,
                  backgroundColor: colors.primary,
                  opacity: 0.2,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: 8,
                  elevation: 8,
                }} />
              )}
              <HeartIconWithBadge color={color} size={size} />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="SoulChats"
        options={{
          tabBarLabel: "Soul Chats",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              position: 'relative',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {/* Spiritual glow for active state */}
              {focused && (
                <View style={{
                  position: 'absolute',
                  width: size + 16,
                  height: size + 16,
                  borderRadius: (size + 16) / 2,
                  backgroundColor: colors.primary,
                  opacity: 0.2,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: 8,
                  elevation: 8,
                }} />
              )}
              <MatchesIconWithBadge color={color} size={size} />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="SacredSelf"
        options={{
          tabBarLabel: "Sacred Self",
          tabBarIcon: ({ color, size, focused }) => (
            <SpiritualAvatar
              photoUri={userData?.photos?.[0]}
              color={color}
              size={size}
              focused={focused}
              colors={colors}
            />
          ),
        }}
      />
    </Tabs>
  );
}