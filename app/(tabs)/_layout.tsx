import React, { useRef, useEffect, useState } from "react";
import { View, Image, Platform, useColorScheme, Animated } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useUserContext } from "@/context/UserContext";
import {LikedByIconWithBadge} from "@/components/LikedByIconWithBadge";
import { MatchesIconWithBadge } from "@/components/MatchesIconWithBadge";
import { Colors, Typography, Spacing } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import OuroborosSVG from "@/components/ouroboros/OuroborosSVG"; // Import your Ouroboros SVG
import OuroborosLoader from "@/components/ouroboros/OuroborosLoader"; // Import your Ouroboros Loader

// Animated Spiritual Ouroboros icon component
const AnimatedSpiritualOuroboros = ({ 
  color, 
  size, 
  focused,
  userData
}: { 
  color: string; 
  size: number; 
  focused: boolean;
  userData?: any;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const animationKey = useRef(0);

  useEffect(() => {
    // Always increment the key when focused to ensure animation restarts
    if (focused) {
      animationKey.current += 1;
    }

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: focused ? 1.1 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scaleAnim, opacityAnim]);

  // Force re-render when focused to ensure animation restarts
  const forceUpdate = useRef(0);
  if (focused) {
    forceUpdate.current += 1;
  }

  return (
    <Animated.View style={{
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 2,
      width: size + 4,
      height: size + 4,
      transform: [{ scale: scaleAnim }],
      opacity: opacityAnim,
    }}>
      {focused ? (
        <OuroborosLoader
          key={`loader-${animationKey.current}-${forceUpdate.current}`}
          size={55}
          fillColor={userData?.subscription?.isActive ? "#F5E6D3" : "#8B4513"}
          strokeColor={userData?.subscription?.isActive ? "#B8860B" : "#BFA98A"}
          strokeWidth={1}
          duration={2000}
          loop={false}
          variant="landing"
        />
      ) : (
        <OuroborosSVG
          size={50}
          fillColor={color}
          strokeColor={color}
          strokeWidth={0.8}
        />
      )}
    </Animated.View>
  );
};

// Animated spiritual icon component
const AnimatedSpiritualIcon = ({ 
  iconName, 
  color, 
  size, 
  focused,
  userData
}: { 
  iconName: string; 
  color: string; 
  size: number; 
  focused: boolean;
  userData?: any;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: focused ? 1.1 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scaleAnim, opacityAnim]);

  // Golden colors for subscribed users
  const goldenColor = userData?.subscription?.isActive ? '#DAA520' : '#8B4513'; // GoldenRod for subscribed, brown for others
  const focusedColor = userData?.subscription?.isActive ? '#B8860B' : '#8B4513'; // DarkGoldenRod for focused subscribed

  return (
    <Animated.View style={{
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 2,
      transform: [{ scale: scaleAnim }],
      opacity: opacityAnim,
    }}>
      <Ionicons 
        name={iconName as any} 
        color={focused ? focusedColor : goldenColor} 
        size={focused ? size + 2 : size} 
      />
    </Animated.View>
  );
};

// Animated spiritual avatar component
const AnimatedSpiritualAvatar = ({ 
  photoUri, 
  color, 
  size, 
  focused,
  userData
}: { 
  photoUri?: string; 
  color: string; 
  size: number; 
  focused: boolean;
  userData?: any;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const borderAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: focused ? 1.1 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(borderAnim, {
        toValue: focused ? 2 : 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [focused, scaleAnim, opacityAnim, borderAnim]);

  // Golden colors for subscribed users
  const goldenColor = userData?.subscription?.isActive ? '#DAA520' : '#8B4513'; // GoldenRod for subscribed, brown for others
  const focusedColor = userData?.subscription?.isActive ? '#B8860B' : '#8B4513'; // DarkGoldenRod for focused subscribed

  if (!photoUri) {
    return (
      <Animated.View style={{
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}>
        <Ionicons 
          name="person-circle" 
          color={goldenColor} 
          size={size} 
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{
      alignItems: 'center',
      justifyContent: 'center',
      transform: [{ scale: scaleAnim }],
      opacity: opacityAnim,
    }}>
      <Animated.View style={{
        width: size + 4,
        height: size + 4,
        borderRadius: (size + 4) / 2,
        overflow: "hidden",
        borderWidth: borderAnim,
        borderColor: focused ? focusedColor : goldenColor + '40',
        backgroundColor: goldenColor + '10',
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
      </Animated.View>
    </Animated.View>
  );
};

// Animated LikedBy icon with badge
const AnimatedLikedByIcon = ({ 
  color, 
  size, 
  focused,
  userData
}: { 
  color: string; 
  size: number; 
  focused: boolean;
  userData?: any;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: focused ? 1.1 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scaleAnim, opacityAnim]);

  // Golden colors for subscribed users
  const goldenColor = userData?.subscription?.isActive ? '#DAA520' : '#8B4513'; // GoldenRod for subscribed, brown for others
  const focusedColor = userData?.subscription?.isActive ? '#B8860B' : '#8B4513'; // DarkGoldenRod for focused subscribed

  return (
    <Animated.View style={{
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 2,
      transform: [{ scale: scaleAnim }],
      opacity: opacityAnim,
    }}>
      <LikedByIconWithBadge 
        color={focused ? focusedColor : goldenColor} 
        size={focused ? size + 2 : size} 
      />
    </Animated.View>
  );
};

// Animated Matches icon with badge
const AnimatedMatchesIcon = ({ 
  color, 
  size, 
  focused,
  userData
}: { 
  color: string; 
  size: number; 
  focused: boolean;
  userData?: any;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: focused ? 1.1 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scaleAnim, opacityAnim]);

  // Golden colors for subscribed users
  const goldenColor = userData?.subscription?.isActive ? '#DAA520' : '#8B4513'; // GoldenRod for subscribed, brown for others
  const focusedColor = userData?.subscription?.isActive ? '#B8860B' : '#8B4513'; // DarkGoldenRod for focused subscribed

  return (
    <Animated.View style={{
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 2,
      transform: [{ scale: scaleAnim }],
      opacity: opacityAnim,
    }}>
      <MatchesIconWithBadge 
        color={focused ? focusedColor : goldenColor} 
        size={focused ? size + 2 : size} 
      />
    </Animated.View>
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
            <AnimatedSpiritualOuroboros 
              color={color} 
              size={size} 
              focused={focused}
              userData={userData}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="KindredSpirits"
        options={{
          tabBarLabel: "Spirits",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedLikedByIcon 
              color={color} 
              size={size} 
              focused={focused}
              userData={userData}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="SoulChats"
        options={{
          tabBarLabel: "Chats",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedMatchesIcon 
              color={color} 
              size={size} 
              focused={focused}
              userData={userData}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="SacredSelf"
        options={{
          tabBarLabel: "Self",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedSpiritualAvatar
              photoUri={userData?.photos?.[0]}
              color={color}
              size={size}
              focused={focused}
              userData={userData}
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
              <AnimatedSpiritualIcon 
                iconName="construct" 
                color={color} 
                size={size} 
                focused={focused} 
                userData={userData}
              />
            ),
          }}
        />
      )}
    </Tabs>
  );
}