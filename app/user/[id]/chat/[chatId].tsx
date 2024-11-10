import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useUserContext } from "@/context/UserContext";
import { FIRESTORE } from "@/services/FirebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";
import potentialMatches from "@/data/potentialMatches"; // Import mock data

const Chat: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { otherUserId } = route.params as { otherUserId: string };
  const { userData } = useUserContext();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [otherUserData, setOtherUserData] = useState<any | null>(null);

  useEffect(() => {
    // Use mock data or fetch from Firebase
    const fetchOtherUserData = async () => {
      // Fallback to mock data if Firebase is not used
      const mockUser = potentialMatches.find(
        (user) => user.userId === otherUserId
      );

      if (mockUser) {
        setOtherUserData(mockUser);
      } else {
        // Fetch from Firebase if available
        const userRef = doc(FIRESTORE, `users/${otherUserId}`);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          setOtherUserData(userSnapshot.data());
        }
      }
    };

    // Fetch chat data using the unique chatId
    const fetchChatMessages = async () => {
      const chatId = [userData.userId, otherUserId].sort().join("-");
      const chatRef = doc(FIRESTORE, `chats/${chatId}`);

      const unsubscribe = onSnapshot(chatRef, (docSnapshot) => {
        const chatData = docSnapshot.data();
        if (chatData && chatData.messages) {
          setMessages(chatData.messages);
        }
      });

      // Cleanup listener on component unmount
      return () => unsubscribe();
    };

    fetchOtherUserData();
    fetchChatMessages();
  }, [otherUserId, userData.userId]);

  const handleSendMessage = async (message: string) => {
    if (message.trim() === "") return; // Prevent sending empty messages

    const chatRef = doc(
      FIRESTORE,
      `users/${userData.userId}/chats/${otherUserId}`
    );
    try {
      await updateDoc(chatRef, {
        messages: arrayUnion({
          sender: userData.userId,
          text: message,
          timestamp: new Date().toISOString(),
        }),
      });

      setNewMessage(""); // Clear the input after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="chevron-left" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.chatTitle}>
        Chat with {otherUserData ? otherUserData.firstName : "Loading..."}
      </Text>

      <ScrollView style={styles.messageContainer}>
        {messages.length === 0 ? (
          <Text style={styles.noMessagesText}>No messages yet!</Text>
        ) : (
          messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                message.sender === userData.userId
                  ? styles.sentMessage
                  : styles.receivedMessage,
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <Button title="Send" onPress={() => handleSendMessage(newMessage)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  backButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  chatTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  messageContainer: {
    flex: 1,
    marginVertical: 20,
  },
  noMessagesText: {
    textAlign: "center",
    fontSize: 16,
    color: "#aaa",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  sentMessage: {
    backgroundColor: "#cfe9ff",
    alignSelf: "flex-end",
  },
  receivedMessage: {
    backgroundColor: "#f0f0f0",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#ccc",
    marginRight: 10,
  },
});

export default Chat;
