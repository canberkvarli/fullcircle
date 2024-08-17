import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import { useUserContext } from "@/context/UserContext";
import potentialMatches from "@/data/potentialMatches";

const { width: screenWidth } = Dimensions.get("window");

const SoulChats: React.FC = () => {
  const { userData } = useUserContext();
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Simulate fetching matches from userData or a data source
        const userMatches = userData.matches || [];
        console.log("User matches:", userMatches);
        // Fetch match details based on IDs
        const matchDetails = potentialMatches.filter((user) =>
          userMatches.includes(user.userId)
        );
        setMatches(matchDetails);
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, [userData]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (matches.length === 0) {
    return (
      <View style={styles.noMatchesContainer}>
        <Text style={styles.noMatchesText}>No matches yet!</Text>
        <Text style={styles.noMatchesText}>
          Discover more profiles and connect with people who share your
          interests.
        </Text>
        {/* Add suggestions or actions for discovering more profiles */}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Matches</Text>

      {matches.map((match) => (
        <View key={match.userId} style={styles.matchRow}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: match.photos[0] }} style={styles.photo} />
          </View>
          <View style={styles.matchInfo}>
            <Text style={styles.matchName}>{match.firstName}</Text>
            {/* Conditionally render conversation text or prompt */}
            <Text style={styles.conversationText}>
              {match.lastMessage
                ? match.lastMessage
                : `Start the match with ${match.firstName}`}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    marginTop: 25,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "left",
  },
  noMatchesContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  noMatchesText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    overflow: "hidden", // Ensure the image does not overflow the container
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  conversationText: {
    fontSize: 15,
    color: "#666",
  },
});

export default SoulChats;
