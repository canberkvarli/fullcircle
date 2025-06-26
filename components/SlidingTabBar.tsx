import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, useColorScheme, Image } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import { LikedByIconWithBadge } from "@/components/LikedByIconWithBadge";
import { MatchesIconWithBadge } from "@/components/MatchesIconWithBadge";
import { useUserContext } from "@/context/UserContext";

interface TabItemProps {
  icon?: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
  renderIcon?: () => React.ReactNode;
}

const TabItem: React.FC<TabItemProps> = ({ icon, label, isActive, onPress, renderIcon }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  
  // Simple scale animation without mixing drivers
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabItem}
      activeOpacity={1}
    >
      <Animated.View 
        style={[
          styles.tabContent,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        {renderIcon ? renderIcon() : (
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={isActive ? '#8B4513' : colors.textMuted} 
          />
        )}
        <Text 
          style={[
            styles.tabLabel, 
            fonts.spiritualBodyFont,
            { color: isActive ? '#8B4513' : colors.textMuted }
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

interface SlidingTabBarProps {
  translateY: Animated.Value;
}

const SlidingTabBar: React.FC<SlidingTabBarProps> = ({ translateY }) => {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { userData } = useUserContext();

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          transform: [{ translateY }] // This is passed from parent with native driver
        }
      ]}
    >
      <View style={styles.tabBar}>
        <TabItem
          icon="sparkles"
          label="Connect"
          isActive={false}
          onPress={() => handleTabPress('/Connect')}
        />
        
        <TabItem
          label="Spirits"
          isActive={false}
          onPress={() => handleTabPress('/KindredSpirits')}
          renderIcon={() => (
            <LikedByIconWithBadge 
              color={colors.textMuted} 
              size={20} 
            />
          )}
        />
        
        <TabItem
          label="Chats"
          isActive={false}
          onPress={() => handleTabPress('/SoulChats')}
          renderIcon={() => (
            <MatchesIconWithBadge 
              color={colors.textMuted} 
              size={20} 
            />
          )}
        />
        
        <TabItem
          renderIcon={() => (
            userData?.photos?.[0] ? (
              <View style={[styles.avatarContainer, { borderColor: '#8B4513' + '40' }]}>
                <Image
                  source={{ uri: userData.photos[0] }}
                  style={styles.avatar}
                />
              </View>
            ) : (
              <Ionicons name="person" size={20} color={colors.textMuted} />
            )
          )}
          label="Self"
          isActive={false}
          onPress={() => handleTabPress('/SacredSelf')}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  
  tabBar: {
    flexDirection: 'row',
    height: '100%',
    paddingBottom: 20,
    paddingTop: 8,
    paddingHorizontal: Spacing.md,
  },
  
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  tabLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  
  avatarContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    margin: 1,
  },
});

export default SlidingTabBar;