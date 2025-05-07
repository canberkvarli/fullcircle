import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useUserContext } from "@/context/UserContext";

interface Props {
  color: string;
  size: number;
}

export const HeartIconWithBadge: React.FC<Props> = ({ color, size }) => {
  const { userData } = useUserContext();
  const count = userData.likesReceivedCount ?? 0;
  const display = count > 50 ? "50+" : String(count);

  return (
    <View style={{ width: size, height: size }}>
      <Icon name="heart" color={color} size={size} />
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
    right: -6,
    top: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "purple",
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
