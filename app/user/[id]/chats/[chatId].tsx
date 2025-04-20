import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useUserContext } from "@/context/UserContext";
import Icon from "react-native-vector-icons/FontAwesome";

const Chat: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { otherUserId, matchUser } = route.params as {
    otherUserId: string;
    matchUser?: string;
  };
  const { userData, createOrFetchChat, subscribeToChatMessages, sendMessage } =
    useUserContext();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [otherUserData, setOtherUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  // State for auto-expanding input
  const [inputHeight, setInputHeight] = useState<number>(40); // initial height

  const scrollViewRef = useRef<ScrollView>(null);

  // Parse matchUser from route params.
  useEffect(() => {
    if (matchUser) {
      try {
        const parsed = JSON.parse(matchUser);
        setOtherUserData(parsed);
      } catch (error) {
        console.error("Failed to parse matchUser:", error);
        setOtherUserData({ firstName: "Kindred Soul" });
      }
    } else {
      setOtherUserData({ firstName: "Kindred Soul" });
    }
  }, [matchUser]);

  // Manage placeholder delay.
  useEffect(() => {
    let timer: any;
    if (messagesLoaded && messages.length === 0) {
      timer = setTimeout(() => {
        setShowPlaceholder(true);
      }, 1000);
    } else {
      setShowPlaceholder(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [messagesLoaded, messages]);

  // Subscribe to chat messages using context helper.
  useEffect(() => {
    const subscribe = async () => {
      const chatId = await createOrFetchChat(userData.userId, otherUserId);
      if (chatId) {
        const unsubscribe = subscribeToChatMessages(chatId, (msgs) => {
          setMessages(msgs);
          if (!messagesLoaded) {
            setMessagesLoaded(true);
            setIsLoading(false);
          }
          // Optionally log sender for debugging.
          if (msgs.length > 0) {
            console.log(
              "Current user:",
              userData.userId,
              "Latest message sender:",
              msgs[msgs.length - 1].sender
            );
          }
        });
        return unsubscribe;
      }
    };

    let unsubscribeFunction: any;
    subscribe().then((unsubscribe) => {
      unsubscribeFunction = unsubscribe;
    });
    return () => {
      if (unsubscribeFunction && typeof unsubscribeFunction === "function") {
        unsubscribeFunction();
      }
    };
  }, [
    otherUserId,
    userData.userId,
    createOrFetchChat,
    subscribeToChatMessages,
    messagesLoaded,
  ]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;
    const chatId = await createOrFetchChat(userData.userId, otherUserId);
    if (chatId) {
      await sendMessage(chatId, newMessage, userData.userId, otherUserId);
      // Reset the text input and its height.
      setNewMessage("");
      setInputHeight(40);
    }
  };

  // Auto-scroll to end when messages change.
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  }, [messages]);

  // Scroll to bottom when the keyboard opens.
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }
    );
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  // Function to scroll to the bottom immediately.
  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={75} // Adjust based on your header/status bar height if needed.
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-left" size={18} color="black" />
          </TouchableOpacity>
          <Text style={styles.otherUserName}>{otherUserData?.firstName}</Text>
          <TouchableOpacity style={styles.optionsButton}>
            <Icon name="ellipsis-h" size={24} color="#7E7972" />
          </TouchableOpacity>
        </View>

        {/* Message List */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageContainer}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "flex-end",
            paddingBottom: 20,
          }}
        >
          {showPlaceholder ? (
            <View style={styles.noMessagesWrapper}>
              <Text style={styles.noMessagesText}>
                Start the chat with {otherUserData?.firstName}
              </Text>
            </View>
          ) : (
            messages.map((message, index) => {
              const isSent = message.sender === userData.userId;
              const senderName = isSent
                ? "You"
                : otherUserData?.firstName || "";
              return (
                <View key={index} style={styles.messageWrapper}>
                  <Text style={styles.senderName}>{senderName}</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={scrollToBottom}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        isSent ? styles.sentMessage : styles.receivedMessage,
                      ]}
                    >
                      <Text style={styles.messageText}>{message.text}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Input Field with auto-expanding height */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { height: inputHeight }]}
            placeholder="Type a message"
            value={newMessage}
            multiline
            onChangeText={setNewMessage}
            onSubmitEditing={handleSendMessage}
            onContentSizeChange={(event) => {
              const { height } = event.nativeEvent.contentSize;
              // Limit maximum height to 100 pixels
              setInputHeight(Math.min(height + 20, 100));
            }}
            scrollEnabled={inputHeight >= 100}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
          >
            <Icon name="arrow-up" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9F8",
    paddingHorizontal: 15,
    marginTop: 25,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },
  backButton: { padding: 10 },
  otherUserName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7E7972",
    textAlign: "left",
  },
  optionsButton: { padding: 10 },
  messageContainer: { flex: 1 },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderColor: "#D3C6BA",
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#EDE9E3",
    fontSize: 16,
    textAlignVertical: "top",
  },
  sendButton: { marginLeft: 10 },
  messageWrapper: { marginVertical: 8, paddingHorizontal: 10 },
  senderName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#7E7972",
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 25,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#D8BFAA",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#B8C1B2",
  },
  messageText: { color: "#FFFFFF" },
  noMessagesWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  noMessagesText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#7E7972",
  },
});

export default Chat;
