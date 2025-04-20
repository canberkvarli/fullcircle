import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useUserContext } from "@/context/UserContext";
import { Link } from "expo-router";

const SoulChats: React.FC = () => {
  const { userData, createOrFetchChat, fetchChatMatches, getImageUrl } =
    useUserContext();
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndProcessMatches = async () => {
    try {
      // fetch chat matches from context (ensure your fetchChatMatches returns match data)
      const fetchedMatches = await fetchChatMatches();
      // Process each match to download their photos (convert storage paths to valid URLs)
      const processedMatches = await Promise.all(
        fetchedMatches.map(async (match: any) => {
          if (match && match.photos && match.photos.length > 0 && getImageUrl) {
            const processedPhotos = await Promise.all(
              match.photos.map(async (photoPath: string) => {
                // Call getImageUrl to get a downloadable URL
                const url = await getImageUrl(photoPath);
                return url;
              })
            );
            return {
              ...match,
              photos: processedPhotos.filter((url) => url !== null),
            };
          }
          return match;
        })
      );
      setMatches(processedMatches.filter((match) => match !== null));
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAndProcessMatches();
  }, [userData, fetchChatMatches, getImageUrl]);

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

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Matches</Text>
      {matches.map((match) => {
        // Generate chat ID using a sorted combination of the IDs
        const chatId = [userData.userId, match.userId].sort().join("_");
        return (
          <Link
            key={match.userId}
            href={`/user/${userData.userId}/chats/${chatId}?otherUserId=${match.userId}&matchUser=${encodeURIComponent(JSON.stringify(match))}`}
            onPress={async () => {
              await createOrFetchChat(userData.userId, match.userId);
            }}
          >
            <View style={styles.matchRow}>
              <View style={styles.avatarContainer}>
                {match.photos && match.photos[0] ? (
                  <Image
                    source={{ uri: match.photos[0] }}
                    style={styles.photo}
                  />
                ) : (
                  <Text>No Image</Text>
                )}
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
          </Link>
        );
      })}
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
