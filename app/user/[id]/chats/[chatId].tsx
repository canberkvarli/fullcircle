import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  IMessage,
  User as GCUser,
  Send,
} from "react-native-gifted-chat";
import ChatOptionsModal from "@/components/modals/ChatOptionsModal";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import PotentialMatch from "@/components/PotentialMatch";
import ReportModal from "@/components/modals/ReportModal";

const { width: screenWidth } = Dimensions.get("window");

const Chat: React.FC = () => {
  const { otherUserId, matchUser } = useRoute().params as any;
  const router = useRouter();

  const {
    userData,
    createOrFetchChat,
    subscribeToChatMessages,
    sendMessage,
    markChatAsRead,
    fetchUserById,
    reportUser,
    unmatchUser,
  } = useUserContext();

  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [otherUserData, setOtherUserData] = useState<any>(null);
  const [fullUserData, setFullUserData] = useState<any>(null);
  const [matchDate, setMatchDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "profile">("chat");
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isUnmatching, setIsUnmatching] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Parse matchUser and fetch full data
  useEffect(() => {
    if (matchUser) {
      try {
        const parsedUser = JSON.parse(matchUser);
        setOtherUserData(parsedUser);

        // Fetch full user data for profile tab
        const fetchData = async () => {
          const data = await fetchUserById(parsedUser.userId);
          setFullUserData(data);
        };
        fetchData();
      } catch {
        setOtherUserData({ firstName: "Kindred Soul" });
      }
    }
  }, [matchUser, otherUserId]);
  // Create/fetch chatId and get match date
  useEffect(() => {
    let mounted = true;

    // Don't try to create chat if unmatching
    if (isUnmatching) return;

    (async () => {
      const id = await createOrFetchChat(userData.userId, otherUserId);
      if (mounted && !isUnmatching) {
        setChatId(id);
        setMatchDate(new Date());
        setIsLoading(false);

        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userData.userId, otherUserId, createOrFetchChat, isUnmatching]);
  // Subscribe to messages
  useEffect(() => {
    if (!chatId || !matchDate) return;

    const unsubscribe = subscribeToChatMessages(chatId, (rawMsgs: any[]) => {
      // Create the match message
      const matchMessage: IMessage = {
        _id: "match-indicator",
        text: `You matched with ${otherUserData?.firstName || "them"}!`,
        createdAt: matchDate,
        system: true, // This makes it a system message
        user: {
          _id: "system",
          name: "System",
        },
      };

      // Format chat messages
      const chatMessages = rawMsgs
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

      // Combine match message with chat messages
      // The match message will always be at the beginning (oldest)
      const allMessages = [...chatMessages, matchMessage];
      setMessages(allMessages);

      // Mark as read only if there's at least one message from the other user
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
    matchDate,
  ]);

  // Handle tab change with swipe-like animation
  const handleTabChange = (tab: "chat" | "profile") => {
    setActiveTab(tab);

    const toValue = tab === "chat" ? 0 : -screenWidth;

    Animated.spring(slideAnim, {
      toValue,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  // Send new message
  const handleSend = useCallback(
    async (newMsgs: IMessage[] = []) => {
      if (!chatId) return;

      for (const m of newMsgs) {
        await sendMessage(chatId, m.text || "", userData.userId, otherUserId);
      }
    },
    [chatId, sendMessage, userData.userId, otherUserId]
  );

  // Add a custom system message renderer for the match indicator:
  const renderSystemMessage = (props: any) => {
    return (
      <View style={styles.systemMessageContainer}>
        <View style={styles.systemMessage}>
          <Icon
            name="heart"
            size={16}
            color="#D8BFAA"
            style={styles.systemHeartIcon}
          />
          <Text style={styles.systemMessageText}>
            {props.currentMessage.text}
          </Text>
          <Text style={styles.systemMessageDate}>
            {props.currentMessage.createdAt.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>
      </View>
    );
  };
  // Custom bubble renderer with better styling
  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: "#D8BFAA",
          marginRight: 8,
          marginVertical: 2,
        },
        left: {
          backgroundColor: "#B8C1B2",
          marginLeft: 8,
          marginVertical: 2,
        },
      }}
      textStyle={{
        right: { color: "#fff", fontSize: 16 },
        left: { color: "#fff", fontSize: 16 },
      }}
    />
  );

  // Custom input toolbar with larger text input
  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      primaryStyle={styles.inputPrimary}
    />
  );

  // Custom send button
  const renderSend = (props: any) => (
    <Send {...props}>
      <View style={styles.sendButton}>
        <Icon name="send" size={18} color="#fff" />
      </View>
    </Send>
  );

  // Render match indicator - only show when no messages
  const renderMatchIndicator = () => {
    if (messages.length > 0) return null;

    return (
      <View style={styles.matchIndicatorContainer}>
        <View style={styles.matchIndicator}>
          <Icon
            name="heart"
            size={16}
            color="#D8BFAA"
            style={styles.heartIcon}
          />
          <Text style={styles.matchText}>
            You matched with {otherUserData?.firstName || "them"}!
          </Text>
          <Text style={styles.matchDate}>
            {matchDate?.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#D8BFAA" />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <ChatOptionsModal
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
        onUnmatch={async () => {
          setOptionsVisible(false);
          setIsUnmatching(true); // Set flag to prevent operations

          // Navigate immediately
          router.replace("/(tabs)/SoulChats");

          // Perform unmatch after navigation
          await unmatchUser(otherUserId);
        }}
        onReport={() => {
          setOptionsVisible(false);
          setShowReportModal(true);
        }}
      />
      <ReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        userName={otherUserData?.firstName || "this user"}
        onSubmit={async (reason, details) => {
          setShowReportModal(false); // Close modal immediately

          // Navigate away first
          router.replace("/(tabs)/SoulChats");

          // Then submit report in background
          setTimeout(async () => {
            const success = await reportUser(otherUserId, reason, details);
            if (success) {
              // Optionally show a toast or notification that report was submitted
              console.log("Report submitted successfully");
            } else {
              // You might want to show an error notification here
              console.error("Failed to submit report");
            }
          }, 300);
        }}
      />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.backAndTitle}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Icon name="chevron-left" size={24} color="#7E7972" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {otherUserData?.firstName || "Chat"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setOptionsVisible(true)}
              style={styles.moreButton}
            >
              <Icon name="ellipsis-v" size={20} color="#7E7972" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "chat" && styles.activeTab]}
              onPress={() => handleTabChange("chat")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "chat" && styles.activeTabText,
                ]}
              >
                Chat
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "profile" && styles.activeTab]}
              onPress={() => handleTabChange("profile")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "profile" && styles.activeTabText,
                ]}
              >
                Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Container with swipe animation */}
        <View style={styles.contentWrapper}>
          <Animated.View
            style={[
              styles.slidingContainer,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {/* Chat View */}
            <View style={styles.tabContent}>
              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
              >
                <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
                  <GiftedChat
                    messages={messages}
                    onSend={handleSend}
                    user={{
                      _id: userData.userId,
                      name: userData.firstName,
                      avatar: userData.photos?.[0],
                    }}
                    placeholder="Type a message…"
                    showUserAvatar={false}
                    renderBubble={renderBubble}
                    renderInputToolbar={renderInputToolbar}
                    renderSend={renderSend}
                    renderSystemMessage={renderSystemMessage} // Add this
                    alwaysShowSend
                    scrollToBottomStyle={styles.scrollToBottom}
                    minInputToolbarHeight={56}
                    bottomOffset={Platform.OS === "ios" ? 20 : 0}
                    keyboardShouldPersistTaps="never"
                    textInputProps={{
                      style: styles.textInput,
                      placeholder: "Type a message…",
                      placeholderTextColor: "#999",
                      multiline: true,
                      maxLength: 1000,
                    }}
                  />
                </Animated.View>
              </KeyboardAvoidingView>
            </View>

            {/* Profile View using PotentialMatch component */}
            <View style={styles.tabContent}>
              {fullUserData ? (
                <ScrollView
                  style={styles.profileScrollView}
                  contentContainerStyle={styles.profileContent}
                  showsVerticalScrollIndicator={false}
                >
                  <PotentialMatch
                    currentPotentialMatch={fullUserData}
                    isMatched={true}
                    onLike={() => {}}
                    disableInteractions={true}
                  />
                </ScrollView>
              ) : (
                <View style={styles.profileLoader}>
                  <ActivityIndicator size="large" color="#D8BFAA" />
                  <Text style={styles.profileLoadingText}>
                    Loading profile...
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE9E3",
  },
  header: {
    backgroundColor: "#EDE9E3",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backAndTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7E7972",
    marginLeft: 8,
  },
  moreButton: {
    padding: 8,
    marginRight: -8,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#D8BFAA",
  },
  tabText: {
    fontSize: 16,
    color: "#B8C1B2",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#7E7972",
    fontWeight: "bold",
  },
  contentWrapper: {
    flex: 1,
    overflow: "hidden",
  },
  slidingContainer: {
    flexDirection: "row",
    width: screenWidth * 2,
    height: "100%",
  },
  tabContent: {
    width: screenWidth,
    height: "100%",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#7E7972",
    fontStyle: "italic",
  },
  inputToolbar: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 56,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
  },
  inputPrimary: {
    alignItems: "flex-end",
    justifyContent: "center",
    flexDirection: "row",
  },
  textInput: {
    fontSize: 16,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#F8F8F8",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    maxHeight: 100,
    minHeight: 40,
    flex: 1,
    marginRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D8BFAA",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  scrollToBottom: {
    backgroundColor: "#D8BFAA",
    borderRadius: 20,
    width: 40,
    height: 40,
  },
  matchIndicatorContainer: {
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  matchIndicator: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  heartIcon: {
    marginBottom: 8,
  },
  matchText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7E7972",
    textAlign: "center",
    marginBottom: 4,
  },
  matchDate: {
    fontSize: 14,
    color: "#B8C1B2",
  },
  profileScrollView: {
    flex: 1,
    backgroundColor: "#EDE9E3",
  },
  profileContent: {
    paddingBottom: 20,
  },
  profileLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#7E7972",
    fontStyle: "italic",
  },
  systemMessageContainer: {
    alignItems: "center",
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  systemMessage: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F5F5F5",
    maxWidth: "80%",
  },
  systemHeartIcon: {
    marginBottom: 6,
  },
  systemMessageText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#7E7972",
    textAlign: "center",
    marginBottom: 4,
  },
  systemMessageDate: {
    fontSize: 13,
    color: "#B8C1B2",
    fontStyle: "italic",
  },
});

export default Chat;
