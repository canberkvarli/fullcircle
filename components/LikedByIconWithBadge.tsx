import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useUserContext } from "@/context/UserContext";

interface Props {
  color: string;
  size: number;
}

export const LikedByIconWithBadge: React.FC<Props> = ({ color, size }) => {
  const { userData } = useUserContext();
  const count = userData.likesReceivedCount ?? 0;
  const display = count > 50 ? "50+" : String(count);

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <Ionicons name="heart" color={color} size={size} />
      {count > 0 && (
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
    right: -10,
    top: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 15,
    backgroundColor: "#E53935", // Vivid red instead of brown or purple
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.2,
  },
});