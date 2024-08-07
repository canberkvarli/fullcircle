import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const InfoCard = ({
  title,
  content,
  onLike,
  onDislike,
}: {
  title: string;
  content: string;
  onLike: () => void;
  onDislike: () => void;
}) => {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoContent}>{content}</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={onDislike}>
          <Icon name="times" size={30} color="red" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onLike}>
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
