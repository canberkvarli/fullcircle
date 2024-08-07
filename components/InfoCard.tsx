import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useUserContext } from "@/context/UserContext";

const InfoCard = ({
  title,
  content,
  currentMatch,
}: {
  title: string;
  content: string;
  currentMatch: any;
}) => {
  const { likeMatch } = useUserContext();
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoContent}>{content}</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => likeMatch(currentMatch.userId)}>
          <Icon name="heart" size={30} color="red" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    position: "relative",
  },
  infoTitle: {
    fontSize: 14,
    color: "gray",
    marginBottom: 5,
    textAlign: "center",
  },
  infoContent: {
    fontSize: 18,
    marginVertical: 5,
    textAlign: "center",
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  icon: {
    marginHorizontal: 10,
  },
});

export default InfoCard;
