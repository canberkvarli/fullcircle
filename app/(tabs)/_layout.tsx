import React from "react";
import { View, Image, Platform, useColorScheme } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useUserContext } from "@/context/UserContext";
import {LikedByIconWithBadge} from "@/components/LikedByIconWithBadge";
import { MatchesIconWithBadge } from "@/components/MatchesIconWithBadge";
import { Colors, Typography, Spacing } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import OuroborosSVG from "@/components/ouroboros/OuroborosSVG"; // Import your Ouroboros SVG

// Spiritual Ouroboros icon component
const SpiritualOuroboros = ({ 
  color, 
  size, 
  focused
}: { 
  color: string; 
  size: number; 
  focused: boolean;
}) => (
  <View style={{
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    width: size + 4,
    height: size + 4,
  }}>
    <OuroborosSVG
      size={focused ? 55 : 50}
      fillColor={focused ? '#8B4513' : color}
      strokeColor={focused ? '#8B4513' : color}
      strokeWidth={focused ? 1 : 0.8}
    />
  </View>
);

// Simple spiritual icon component
const SpiritualIcon = ({ 
  iconName, 
  color, 
  size, 
  focused
}: { 
  iconName: string; 
  color: string; 
  size: number; 
  focused: boolean;
}) => (
  <View style={{
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  }}>
    <Ionicons 
      name={iconName as any} 
      color={focused ? '#8B4513' : color} 
      size={focused ? size + 2 : size} 
    />
  </View>
);

// Simple spiritual avatar component
const SpiritualAvatar = ({ 
  photoUri, 
  color, 
  size, 
  focused
}: { 
  photoUri?: string; 
  color: string; 
  size: number; 
  focused: boolean;
}) => {
  if (!photoUri) {
    return (
      <SpiritualIcon 
        iconName="person-circle" 
        color={color} 
        size={size} 
        focused={focused} 
      />
    );
  }

  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <View style={{
        width: size + 4,
        height: size + 4,
        borderRadius: (size + 4) / 2,
        overflow: "hidden",
        borderWidth: focused ? 2 : 1,
        borderColor: focused ? '#8B4513' : '#8B4513' + '40',
        backgroundColor: '#8B4513' + '10',
      }}>
        <Image
          source={{ uri: photoUri }}
          style={{ 
            width: size, 
            height: size,
            margin: focused ? 0 : 0.5,
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
  const fonts = useFont();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 100 : 70,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === 'ios' ? 35 : 8,
          paddingTop: 12,
          paddingHorizontal: Spacing.md,
          position: 'absolute',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarActiveTintColor: '#8B4513', // Sacred brown
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          ...fonts.spiritualBodyFont,
          fontSize: Typography.sizes.xs,
          fontWeight: Typography.weights.medium,
          marginTop: 3,
          letterSpacing: 0.2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="Connect"
        options={{
          tabBarLabel: "Connect",
          tabBarIcon: ({ color, size, focused }) => (
            <SpiritualOuroboros 
              color={color} 
              size={size} 
              focused={focused}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="KindredSpirits"
        options={{
          tabBarLabel: "Spirits",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 2,
            }}>
              <LikedByIconWithBadge 
                color={focused ? '#8B4513' : color} 
                size={focused ? size + 2 : size} 
              />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="SoulChats"
        options={{
          tabBarLabel: "Chats",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 2,
            }}>
              <MatchesIconWithBadge 
                color={focused ? '#8B4513' : color} 
                size={focused ? size + 2 : size} 
              />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="SacredSelf"
        options={{
          tabBarLabel: "Self",
          tabBarIcon: ({ color, size, focused }) => (
            <SpiritualAvatar
              photoUri={userData?.photos?.[0]}
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      
      {process.env.EXPO_PUBLIC_ENV === 'development' && (
        <Tabs.Screen
          name="DevTools"
          options={{
            tabBarLabel: "Dev",
            tabBarIcon: ({ color, size, focused }) => (
              <SpiritualIcon 
                iconName="construct" 
                color={color} 
                size={size} 
                focused={focused} 
              />
            ),
          }}
        />
      )}
    </Tabs>
  );
}