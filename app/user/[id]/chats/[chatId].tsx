import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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
import PotentialMatch from "@/components/PotentialMatch";
import Modal from "react-native-modal";

const Chat: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { otherUserId } = route.params as { otherUserId: string };
  const { userData, createOrFetchChat } = useUserContext();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [otherUserData, setOtherUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Chat");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [matchDate, setMatchDate] = useState<string>("");

  useEffect(() => {
    const fetchOtherUserData = async () => {
      setIsLoading(true);
      const userRef = doc(FIRESTORE, `users/${otherUserId}`);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        setOtherUserData(userSnapshot.data());
      } else {
        setOtherUserData({ firstName: "Kindred Soul" });
      }

      setIsLoading(false);
    };

    fetchOtherUserData();
  }, [otherUserId]);

  useEffect(() => {
    const fetchChatMessages = async () => {
      const chatId = await createOrFetchChat(userData.userId, otherUserId);
      if (chatId) {
        const chatRef = doc(FIRESTORE, `chats/${chatId}`);

        const unsubscribe = onSnapshot(chatRef, (docSnapshot) => {
          const chatData = docSnapshot.data();
          if (chatData && chatData.messages) {
            const sortedMessages = chatData.messages.sort(
              (a: any, b: any) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            );
            setMessages(sortedMessages);
          }
        });

        return () => unsubscribe();
      }
    };

    fetchChatMessages();
  }, [otherUserId, userData.userId]);

  const handleSendMessage = async (message: string) => {
    if (message.trim() === "") return;

    const chatId = await createOrFetchChat(userData.userId, otherUserId);
    if (chatId) {
      const chatRef = doc(FIRESTORE, `chats/${chatId}`);
      try {
        await updateDoc(chatRef, {
          messages: arrayUnion({
            senderId: userData.userId,
            receiverId: otherUserId,
            text: message,
            timestamp: new Date().toISOString(),
          }),
        });
        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.error("No chatId found");
    }
  };

  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);

    // Check for invalid date
    if (isNaN(date.getTime())) {
      return ""; // Return empty string for invalid date
    }

    // Format the date into a readable format (e.g., "Mon, Aug 5, 10:00 AM")
    return date.toLocaleString("en-US", {
      weekday: "short", // Example: Mon
      month: "short", // Example: Aug
      day: "numeric", // Example: 5
      hour: "numeric", // Example: 10
      minute: "2-digit", // Example: 00
      hour12: true, // Example: PM
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={18} color="black" />
        </TouchableOpacity>
        <Text style={styles.otherUserName}>{otherUserData?.firstName}</Text>

        <TouchableOpacity style={styles.optionsButton} onPress={toggleModal}>
          <Icon name="ellipsis-h" size={24} color="#7E7972" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "Chat" && styles.activeTab]}
              onPress={() => handleTabSwitch("Chat")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "Chat" && styles.activeTabText,
                ]}
              >
                Chat
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "Profile" && styles.activeTab]}
              onPress={() => handleTabSwitch("Profile")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "Profile" && styles.activeTabText,
                ]}
              >
                Profile
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.messageContainer}>
            {activeTab === "Chat" ? (
              <>
                {messages.length === 0 && isLoading === false ? (
                  <View style={styles.noMessagesWrapper}>
                    <Text style={styles.noMessagesDate}>{matchDate}</Text>
                    <Text style={styles.noMessagesText}>
                      {`Start the chat with ${otherUserData?.firstName}`}
                    </Text>
                  </View>
                ) : (
                  messages.map((message, index) => {
                    const currentTimestamp = new Date(message.timestamp);
                    const previousTimestamp =
                      index > 0
                        ? new Date(messages[index - 1].timestamp)
                        : null;

                    const showTimestamp =
                      !previousTimestamp ||
                      Math.abs(
                        currentTimestamp.getTime() - previousTimestamp.getTime()
                      ) >
                        60 * 1000;

                    return (
                      <View key={index}>
                        {showTimestamp && (
                          <View style={styles.timestampWrapper}>
                            <Text>
                              <Text style={styles.dateText}>
                                {
                                  formatTimestamp(message.timestamp).split(
                                    ","
                                  )[0]
                                }
                              </Text>
                              {", "}
                              <Text style={styles.dateText}>
                                {
                                  formatTimestamp(message.timestamp).split(
                                    ","
                                  )[1]
                                }
                              </Text>{" "}
                              <Text style={styles.timeText}>
                                {formatTimestamp(message.timestamp)
                                  .split(",")[2]
                                  ?.trim()}
                              </Text>
                            </Text>
                          </View>
                        )}
                        <View
                          style={[
                            styles.messageBubble,
                            message.senderId === userData.userId
                              ? styles.sentMessage
                              : styles.receivedMessage,
                          ]}
                        >
                          <Text style={styles.messageText}>{message.text}</Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </>
            ) : (
              <View style={styles.profileSection}>
                <PotentialMatch
                  currentPotentialMatch={otherUserData}
                  isMatched={true}
                />
              </View>
            )}
          </ScrollView>

          {activeTab === "Chat" && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type a message"
                value={newMessage}
                onChangeText={setNewMessage}
                onSubmitEditing={() => handleSendMessage(newMessage)}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => handleSendMessage(newMessage)}
              >
                <Icon name="arrow-up" size={24} color="black" />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* Modal for options */}
      <Modal
        isVisible={isModalVisible}
        style={styles.modal}
        onBackdropPress={toggleModal}
        onBackButtonPress={toggleModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalOption} onPress={() => {}}>
            <Text style={styles.modalOptionText}>Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={() => {}}>
            <Text style={styles.modalOptionText}>Block</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={toggleModal}>
            <Text style={styles.modalOptionText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
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
  backButton: {
    padding: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  otherUserName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7E7972",
    textAlign: "left",
  },
  optionsButton: {
    padding: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    marginVertical: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: "#7E7972",
  },
  tabText: {
    fontSize: 16,
    color: "#7E7972",
  },
  activeTabText: {
    color: "#7E7972",
    fontWeight: "bold",
  },
  messageContainer: {
    flex: 1,
  },
  noMessagesWrapper: {
    alignItems: "center",
    marginVertical: 20,
  },
  noMessagesText: {
    fontSize: 18,
    color: "#7E7972",
  },
  noMessagesDate: {
    fontSize: 14,
    color: "#B8C1B2",
    marginBottom: 5,
    fontStyle: "italic",
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
  },
  sendButton: {
    marginLeft: 10,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContainer: {
    backgroundColor: "#EDE9E3",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalOption: {
    paddingVertical: 15,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#7E7972",
    textAlign: "center",
  },
  profileSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timestampWrapper: {
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    color: "#7E7972",
  },
  timeText: {
    fontSize: 12,
    color: "#D3C6BA",
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 25,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#D8BFAA",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#B8C1B2",
  },
  messageText: {
    color: "#FFFFFF",
  },
});

export default Chat;
