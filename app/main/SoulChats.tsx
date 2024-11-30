import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useUserContext } from "@/context/UserContext";
import { FIRESTORE } from "@/services/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "expo-router";

const SoulChats: React.FC = () => {
  const { userData, createOrFetchChat } = useUserContext();
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchLastMessage = async (chatId: string) => {
    try {
      const chatDocRef = doc(FIRESTORE, `chats/${chatId}`);
      const chatDoc = await getDoc(chatDocRef);

      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        const messages = chatData.messages || []; // Default to empty array if no messages
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1]; // Get the last message
          return lastMessage.text || ""; // Assuming `text` field exists
        }
      }
    } catch (error) {
      console.error(`Failed to fetch last message for chat ${chatId}:`, error);
    }
    return null;
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const userDocRef = doc(FIRESTORE, `users/${userData.userId}`);
        const userDoc = await getDoc(userDocRef);

        let userMatches = [];
        if (userDoc.exists() && userDoc.data().matches) {
          userMatches = userDoc.data().matches;
        } else if (userData.matches) {
          userMatches = userData.matches;
        }

        if (!userMatches || userMatches.length === 0) {
          setMatches([]);
          return;
        }

        const matchDetails = await Promise.all(
          userMatches.map(async (matchId: string) => {
            const matchDocRef = doc(FIRESTORE, `users/${matchId}`);
            const matchDoc = await getDoc(matchDocRef);
            if (!matchDoc.exists()) return null;

            const matchData: { userId: string; lastMessage?: string | null } = {
              userId: matchId,
              ...(matchDoc.data() as Record<string, unknown>),
            };

            // Fetch the last message for the chat
            const chatId = [userData.userId, matchId].sort().join("_"); // Chat ID convention
            matchData.lastMessage = await fetchLastMessage(chatId);

            return matchData;
          })
        );

        setMatches(matchDetails.filter((match) => match !== null));
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7E7972" />
      </View>
    );
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
                {match.lastMessage
                  ? match.lastMessage.length > 40
                    ? `${match.lastMessage.slice(0, 40)}...`
                    : match.lastMessage
                  : `Start the match with ${match.firstName}`}
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
    backgroundColor: "#EDE9E3",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "left",
    color: "#7E7972",
  },
  noMatchesContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDE9E3",
  },
  noMatchesText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#7E7972",
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#D3C6BA",
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
    color: "#7E7972",
  },
  conversationText: {
    fontSize: 15,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDE9E3",
  },
});

export default SoulChats;
