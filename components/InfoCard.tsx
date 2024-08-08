import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useUserContext } from "@/context/UserContext";

const InfoCard = ({
  title,
  content,
  currentPotentialMatch,
}: {
  title: string;
  content: string;
  currentPotentialMatch: any;
}) => {
  const { likeMatch, loadNextPotentialMatch } = useUserContext();
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoContent}>{content}</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity
          onPress={() => {
            likeMatch(currentPotentialMatch.userId).then(() =>
              loadNextPotentialMatch()
            );
          }}
        >
          <Icon name="heart" size={30} color="grey" style={styles.icon} />
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
    justifyContent: "flex-end",
    marginTop: 10,
    paddingRight: 20,
  },
  icon: {
    marginHorizontal: 10,
  },
});

export default InfoCard;
