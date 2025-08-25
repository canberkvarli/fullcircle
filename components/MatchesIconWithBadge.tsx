import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useUserContext } from "@/context/UserContext";

export const MatchesIconWithBadge: React.FC<{
  color: string;
  size: number;
}> = ({ color, size }) => {
  const { unreadMatchesCount } = useUserContext();
  const display = unreadMatchesCount > 99 ? "99+" : String(unreadMatchesCount);

  return (
    <View style={{ width: size + 10, height: size + 10, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="chatbox" size={size} color={color} />
      {unreadMatchesCount > 0 && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{display}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    position: "absolute",
    right: -3,
    top: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    zIndex: 1000,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.2,
  },
});
