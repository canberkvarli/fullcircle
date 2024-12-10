import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useUserContext } from "@/context/UserContext";

const InfoCard = ({
  title,
  content,
  currentPotentialMatch,
  isMatched = false,
}: {
  title: string;
  content: string;
  currentPotentialMatch: any;
  isMatched?: boolean;
}) => {
  const { likeMatch, loadNextPotentialMatch } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await likeMatch(currentPotentialMatch.userId);
      loadNextPotentialMatch();
    } catch (error) {
      console.error("Error liking match: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoContent}>{content}</Text>
      <View style={styles.iconContainer}>
        {!isMatched && (
          <TouchableOpacity onPress={handleLike} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="grey" />
            ) : (
              <Icon name="heart" size={30} color="grey" style={styles.icon} />
            )}
          </TouchableOpacity>
        )}
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
