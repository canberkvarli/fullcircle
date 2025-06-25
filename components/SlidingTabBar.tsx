import React, { useEffect, useRef } from "react";
import {
  Animated,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from "expo-router";
import { useUserContext } from "@/context/UserContext";

interface SlidingTabBarProps {
  /** Animated translateY value to slide the bar up/down */
  translateY: Animated.AnimatedInterpolation<number>;
}

const TabItem = ({ 
  iconName, 
  label, 
  isActive, 
  onPress, 
  customIcon 
}: {
  iconName?: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
  customIcon?: React.ReactNode;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Scale animation on active state
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1.1 : 1,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start();

    // Glow animation for active state
    Animated.timing(glowAnim, {
      toValue: isActive ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isActive]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.tabIconContainer}>
        {/* Cosmic glow effect */}
        <Animated.View 
          style={[
            styles.cosmicGlow, 
            { 
              opacity: glowOpacity,
              transform: [{ scale: scaleAnim }]
            }
          ]} 
        />
        
        {/* Icon container */}
        <Animated.View 
          style={[
            styles.iconWrapper,
            isActive && styles.activeIconWrapper,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          {customIcon ? customIcon : (
            <Ionicons 
              name={iconName as any} 
              size={22} 
              color={isActive ? '#FFD700' : '#8E8E93'} 
            />
          )}
        </Animated.View>
      </View>
      
      {/* Label with fade effect */}
      <Animated.Text 
        style={[
          styles.label,
          isActive && styles.activeLabel,
          { opacity: isActive ? 1 : 0.7 }
        ]}
      >
        {label}
      </Animated.Text>
      
      {/* Active indicator dot */}
      {isActive && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );
};

export default function SlidingTabBar({ translateY }: SlidingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { userData } = useUserContext();

  // Cosmic background animation
  const cosmicRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(cosmicRotation, {
        toValue: 1,
        duration: 30000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotationStyle = {
    transform: [{
      rotate: cosmicRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      })
    }]
  };

  // Determine active tab
  const getActiveTab = () => {
    if (pathname.includes('/Connect')) return 'connect';
    if (pathname.includes('/KindredSpirits')) return 'kindred';
    if (pathname.includes('/SoulChats')) return 'chats';
    if (pathname.includes('/SacredSelf')) return 'self';
    return 'connect';
  };

  const activeTab = getActiveTab();

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      {/* Cosmic background pattern */}
      <Animated.View style={[styles.cosmicBackground, rotationStyle]} />
      
      {/* Gradient overlay for depth */}
      <View style={styles.gradientOverlay} />
      
      {/* Tab items */}
      <View style={styles.tabsRow}>
        <TabItem
          iconName="search"
          label="Connect"
          isActive={activeTab === 'connect'}
          onPress={() => router.push("/(tabs)/Connect")}
        />

        <TabItem
          iconName="heart"
          label="Kindred Spirits"
          isActive={activeTab === 'kindred'}
          onPress={() => router.push("/(tabs)/KindredSpirits")}
        />

        <TabItem
          iconName="chatbubbles"
          label="Soul Chats"
          isActive={activeTab === 'chats'}
          onPress={() => router.push("/(tabs)/SoulChats")}
        />

        <TabItem
          label="Sacred Self"
          isActive={activeTab === 'self'}
          onPress={() => router.push("/(tabs)/SacredSelf")}
          customIcon={
            userData?.photos && userData.photos.length > 0 ? (
              <View style={[
                styles.avatarWrapper,
                activeTab === 'self' && styles.activeAvatarWrapper
              ]}>
                <Image source={{ uri: userData.photos[0] }} style={styles.avatar} />
                {activeTab === 'self' && <View style={styles.avatarGlow} />}
              </View>
            ) : (
              <Ionicons 
                name="person" 
                size={22} 
                color={activeTab === 'self' ? '#FFD700' : '#8E8E93'} 
              />
            )
          }
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.2)',
    zIndex: 20,
    overflow: 'hidden',
  },
  cosmicBackground: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 100,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 10, 15, 0.8)',
  },
  tabsRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    position: 'relative',
  },
  tabIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  cosmicGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  activeIconWrapper: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  label: {
    fontSize: 10,
    color: "#8E8E93",
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeLabel: {
    color: "#FFD700",
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    position: 'relative',
  },
  activeAvatarWrapper: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  avatarGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
});