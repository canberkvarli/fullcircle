import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useUserContext } from "@/context/UserContext";
import potentialMatches from "@/data/potentialMatches";
import { FIRESTORE } from "@/services/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "expo-router";

const SoulChats: React.FC = () => {
  const { userData, createOrFetchChat } = useUserContext();
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const userDocRef = doc(FIRESTORE, `users/${userData.userId}`);
        const userDoc = await getDoc(userDocRef);

        let userMatches = [];
        if (userDoc.exists() && userDoc.data().matches) {
          userMatches = userDoc.data().matches;
          console.log("Matches from Firestore:", userMatches);
        } else {
          //  Fallback to potentialMatches if matches not found in Firestore
          userMatches = userData.matches || [];
          console.log("Matches from potentialMatches:", userMatches);
        }

        // Fetch detailed data for each matched user
        const matchDetails = await Promise.all(
          userMatches.map(async (matchId: string) => {
            const matchDocRef = doc(FIRESTORE, `users/${matchId}`);
            const matchDoc = await getDoc(matchDocRef);
            return matchDoc.exists()
              ? { userId: matchId, ...matchDoc.data() }
              : null;
          })
        );

        // Filter out any null responses if some users no longer exist
        setMatches(matchDetails.filter((match) => match !== null));
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
      </View>
    );
  }

  const navigateToChat = async (otherUserId: string) => {
    const chatId = await createOrFetchChat(userData.userId, otherUserId);
    if (chatId) {
      router.push(
        `/user/${userData.userId}/chats/${chatId}?otherUserId=${otherUserId}`
      );
    } else {
      console.log("Failed to create or fetch chat ID.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Matches</Text>

      {matches.map((match) => (
        <TouchableOpacity
          key={match.userId}
          onPress={() => navigateToChat(match.userId)}
        >
          <View style={styles.matchRow}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: match.photos[0] }} style={styles.photo} />
            </View>
            <View style={styles.matchInfo}>
              <Text style={styles.matchName}>{match.firstName}</Text>
              <Text style={styles.conversationText}>
                {match.lastMessage || `Start the match with ${match.firstName}`}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
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
    overflow: "hidden",
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
