import React from "react";
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
    <View style={{ width: size, height: size }}>
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
    right: -6,
    top: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
