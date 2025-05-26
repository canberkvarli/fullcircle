import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  IMessage,
  User as GCUser,
} from "react-native-gifted-chat";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useUserContext } from "@/context/UserContext";

const Chat: React.FC = () => {
  const { otherUserId, matchUser } = useRoute().params as any;
  const router = useRouter();

  const {
    userData,
    createOrFetchChat,
    subscribeToChatMessages,
    sendMessage,
    markChatAsRead,
  } = useUserContext();

  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [otherUserData, setOtherUserData] = useState<any>(null);

  // parse matchUser
  useEffect(() => {
    if (matchUser) {
      try {
        setOtherUserData(JSON.parse(matchUser));
      } catch {
        setOtherUserData({ firstName: "Kindred Soul" });
      }
    }
  }, [matchUser]);

  // create/fetch chatId
  useEffect(() => {
    let mounted = true;
    (async () => {
      const id = await createOrFetchChat(userData.userId, otherUserId);
      if (mounted) {
        setChatId(id);
        setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userData.userId, otherUserId, createOrFetchChat]);

  // subscribe to messages
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = subscribeToChatMessages(chatId, (rawMsgs: any[]) => {
      const formatted = rawMsgs
        .map((m, idx) => ({
          _id: `${m.timestamp}-${idx}`,
          text: m.text,
          createdAt: new Date(m.timestamp),
          user: {
            _id: m.sender,
            name:
              m.sender === userData.userId
                ? userData.firstName
                : otherUserData?.firstName,
            avatar:
              m.sender === userData.userId
                ? userData.photos?.[0]
                : otherUserData?.photos?.[0],
          } as GCUser,
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setMessages(formatted);

      // mark as read only if there's at least one message from the other user
      const hasMessagesFromOther = rawMsgs.some(
        (m) => m.sender === otherUserId
      );
      if (rawMsgs.length > 0 && hasMessagesFromOther) {
        markChatAsRead(chatId, userData.userId).catch(console.error);
      }
    });

    return unsubscribe;
  }, [
    chatId,
    userData.userId,
    otherUserId,
    subscribeToChatMessages,
    otherUserData,
    markChatAsRead,
  ]);

  // send new message
  const handleSend = useCallback(
    async (newMsgs: IMessage[] = []) => {
      if (!chatId) return;

      for (const m of newMsgs) {
        await sendMessage(chatId, m.text || "", userData.userId, otherUserId);
      }
    },
    [chatId, sendMessage, userData.userId, otherUserId]
  );

  // UI overrides
  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: "#D8BFAA" },
        left: { backgroundColor: "#B8C1B2" },
      }}
      textStyle={{
        right: { color: "#fff" },
        left: { color: "#fff" },
      }}
    />
  );

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      primaryStyle={styles.inputPrimary}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="chevron-left" size={24} color="#7E7972" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {otherUserData?.firstName || "Chat"}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#7E7972" />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <View style={{ flex: 1 }}>
            <GiftedChat
              messages={messages}
              onSend={handleSend}
              user={{
                _id: userData.userId,
                name: userData.firstName,
                avatar: userData.photos?.[0],
              }}
              placeholder="Type a message…"
              showUserAvatar
              renderUsernameOnMessage
              renderBubble={renderBubble}
              renderInputToolbar={renderInputToolbar}
            />
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE9E3",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#EDE9E3",
    borderBottomWidth: 1,
    borderBottomColor: "#D3C6BA",
  },
  headerTitle: {
    paddingLeft: 12,
    fontSize: 20,
    fontWeight: "bold",
    color: "#7E7972",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputToolbar: {
    borderTopWidth: 1,
    borderTopColor: "#D3C6BA",
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  inputPrimary: {
    alignItems: "center",
  },
});

export default Chat;
