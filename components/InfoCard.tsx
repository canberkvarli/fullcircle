import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

type InfoCardProps = {
  title: string;
  content: string;
  currentPotentialMatch: any;
  isMatched?: boolean;
  onLike: (userId: string) => void;
  disableInteractions: boolean;
};

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  content,
  currentPotentialMatch,
  isMatched = false,
  onLike,
  disableInteractions,
}) => (
  <View style={styles.infoCard}>
    <Text style={styles.infoTitle}>{title}</Text>
    <Text style={styles.infoContent}>{content}</Text>
    {!isMatched && (
      <TouchableOpacity
        onPress={() =>
          !disableInteractions && onLike(currentPotentialMatch.userId)
        }
        disabled={disableInteractions}
        style={styles.iconContainer}
      >
        <Icon
          name="heart"
          size={30}
          color={disableInteractions ? "#ccc" : "grey"}
        />
      </TouchableOpacity>
    )}
  </View>
);

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
