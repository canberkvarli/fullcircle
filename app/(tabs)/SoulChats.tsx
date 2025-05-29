import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { useUserContext } from "@/context/UserContext";
import { Link } from "expo-router";
import LottieView from "lottie-react-native";
import loadingMandalaAnimation from "../../assets/animations/loading_mandala.json";

const SoulChats: React.FC = () => {
  const { userData, createOrFetchChat, subscribeToChatMatches, getImageUrl } =
    useUserContext();

  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToChatMatches(
      userData.userId,
      async (chatList) => {
        const withPhotos = await Promise.all(
          chatList.map(async (m) => {
            const urls = m.photos?.length
              ? (await Promise.all(m.photos.map(getImageUrl))).filter(Boolean)
              : [];
            return { ...m, photos: urls };
          })
        );
        setMatches(withPhotos);
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, [userData.userId, subscribeToChatMatches, getImageUrl]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <LottieView
          source={loadingMandalaAnimation}
          autoPlay
          loop
          style={styles.loaderAnimation}
        />
      </View>
    );
  }

  if (!matches.length) {
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
        const chatId = [userData.userId, match.userId].sort().join("_");
        // Show as unread if:
        // 1. There's a message and it's from the other user, OR
        // 2. It's a new match with no messages (empty lastMessage)
        const isUnread = match.lastMessage
          ? match.lastMessageSender !== userData.userId
          : true;

        return (
          <Link
            key={match.userId}
            href={`/user/${userData.userId}/chats/${chatId}?otherUserId=${match.userId}&matchUser=${encodeURIComponent(
              JSON.stringify(match)
            )}`}
            onPress={async () => {
              await createOrFetchChat(userData.userId, match.userId);
            }}
          >
            <View style={styles.matchRow}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatarContainer}>
                  {match.photos[0] ? (
                    <Image
                      source={{ uri: match.photos[0] }}
                      style={styles.photo}
                    />
                  ) : (
                    <Text>No Image</Text>
                  )}
                </View>
                {isUnread && <View style={styles.unreadDot} />}
              </View>
              <View style={styles.matchInfo}>
                <Text style={[styles.matchName, isUnread && styles.unreadText]}>
                  {match.firstName}
                </Text>
                <Text
                  style={[
                    styles.conversationText,
                    isUnread && styles.unreadText,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {match.lastMessage
                    ? match.lastMessage.length > 40
                      ? `${match.lastMessage.slice(0, 35)}...`
                      : match.lastMessage
                    : `Start the chat with ${match.firstName}`}
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
    backgroundColor: "#EDE9E3",
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#7E7972",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDE9E3",
  },
  loaderAnimation: {
    width: 120,
    height: 120,
  },
  noMatchesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDE9E3",
    padding: 16,
  },
  noMatchesText: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 10,
    color: "#7E7972",
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#D3C6BA",
    paddingRight: 16,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  unreadDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#3B82F6",
  },
  matchInfo: {
    flex: 1,
    paddingRight: 8,
  },
  matchName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7E7972",
    marginBottom: 4,
  },
  conversationText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 20,
  },
  unreadText: {
    fontWeight: "bold",
    color: "#000",
  },
});

export default SoulChats;
