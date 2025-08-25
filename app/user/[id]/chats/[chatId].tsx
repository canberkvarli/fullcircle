import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  ScrollView,
  useColorScheme,
  Animated,
} from "react-native";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  IMessage,
  User as GCUser,
  Send,
} from "react-native-gifted-chat";
import { Ionicons } from '@expo/vector-icons';
import ChatOptionsModal from "@/components/modals/ChatOptionsModal";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import { Colors, Typography, Spacing } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import { CustomIcon } from "@/components/CustomIcon";
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
    markNewMatchAsRead,
    fetchUserById,
    reportUser,
    unmatchUser,
  } = useUserContext();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

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
  const [connectionMethod, setConnectionMethod] = useState<{ viaLotus: boolean; viaRadiance: boolean } | null>(null);
  
  // Animation for smooth sliding between tabs
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Parse matchUser and detect connection method
  useEffect(() => {
    if (matchUser) {
      try {
        const parsedUser = JSON.parse(matchUser);
        setOtherUserData(parsedUser);

        // Detect connection method
        const method = {
          viaLotus: parsedUser.theirConnectionMethod?.viaLotus || 
                  parsedUser.connectionMethods?.[parsedUser.userId]?.viaLotus || 
                  parsedUser.viaLotus || 
                  false,
          viaRadiance: parsedUser.theirConnectionMethod?.viaRadiance || 
                       parsedUser.connectionMethods?.[parsedUser.userId]?.viaRadiance || 
                       parsedUser.viaRadiance ||
                       false
        };

        setConnectionMethod(method);

        // Fetch full user data for profile tab
        const fetchData = async () => {
          const data = await fetchUserById(parsedUser.userId);
          setFullUserData(data);
        };
        fetchData();
      } catch {
        setOtherUserData({ firstName: "Soul" });
      }
    }
  }, [matchUser, otherUserId]);

  // Create/fetch chatId and get match date
  useEffect(() => {
    let mounted = true;

    if (isUnmatching) return;

    const initializeChat = async () => {
      try {
        const id = await createOrFetchChat(userData.userId, otherUserId);
        if (mounted && !isUnmatching) {
          setChatId(id);
          setMatchDate(new Date());
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error creating/fetching chat:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeChat();

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
        system: true,
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



  // Handle tab change with gentler sliding animation
  const handleTabChange = (tab: "chat" | "profile") => {
    setActiveTab(tab);
    
    const toValue = tab === "chat" ? 0 : -screenWidth;
    
    Animated.spring(slideAnim, {
      toValue,
      tension: 60,        // Reduced tension for gentler movement
      friction: 12,       // Increased friction for smoother deceleration
      useNativeDriver: true,
    }).start();
  };

  // Send new message
  const handleSend = useCallback(
    async (newMsgs: IMessage[] = []) => {
      if (!chatId) return;

      // Check if this is a new match (no messages yet)
      const isNewMatch = messages.length === 1; // Only the system match message exists
      
      for (const m of newMsgs) {
        await sendMessage(chatId, m.text || "", userData.userId, otherUserId);
      }
      
      // If this was a new match, mark it as read to remove the unread badge
      if (isNewMatch) {
        markNewMatchAsRead(chatId, userData.userId).catch(console.error);
      }
    },
    [chatId, sendMessage, userData.userId, otherUserId, messages.length, markNewMatchAsRead]
  );

  // Get connection method info
  const getConnectionInfo = () => {
    if (!connectionMethod) return null;
    
    if (connectionMethod.viaLotus && connectionMethod.viaRadiance) {
      return {
        icon: "lotus" as const,
        text: "Lotus & Radiance Match",
      };
    } else if (connectionMethod.viaLotus) {
      return {
        icon: "lotus" as const,
        text: "Lotus Match",
      };
    } else if (connectionMethod.viaRadiance) {
      return {
        icon: "halo" as const,
        text: "Radiance Match",
        color: "#F1C40F"
      };
    }
    return null;
  };

  // Get system message icon based on connection method
  const getSystemMessageIcon = () => {
    if (!connectionMethod) return "heart";
    
    if (connectionMethod.viaLotus) {
      return "lotus";
    } else if (connectionMethod.viaRadiance) {
      return "halo";
    }
    return "heart";
  };

  // Get system message icon color
  const getSystemMessageIconColor = () => {
    if (!connectionMethod) return "#8B4513";
    
    if (connectionMethod.viaLotus) {
      return "";
    } else if (connectionMethod.viaRadiance) {
      return "#F1C40F";
    }
    return "#8B4513";
  };

  // System message renderer
  const renderSystemMessage = (props: any) => {
    const systemIcon = getSystemMessageIcon();
    const systemIconColor = getSystemMessageIconColor();
    const isCustomIcon = systemIcon === "lotus" || systemIcon === "halo";
    
    return (
      <View style={[styles.systemMessageContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.systemMessage, { 
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: systemIconColor
        }]}>
          <View style={styles.systemIconContainer}>
            {isCustomIcon ? (
              <CustomIcon name={systemIcon} size={38} color={systemIconColor} />
            ) : (
              <Ionicons name={systemIcon as any} size={38} color={systemIconColor} />
            )}
          </View>
          <Text style={[styles.systemMessageText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
            {props.currentMessage.text}
          </Text>
          <Text style={[styles.systemMessageDate, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            Connected • {props.currentMessage.createdAt.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>
      </View>
    );
  };

  // Bubble renderer
  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: "#8B4513",
          marginRight: Spacing.md,
          marginVertical: Spacing.md,
          borderRadius: 24,
          paddingHorizontal: Spacing.sm,
          shadowColor: '#8B4513',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 3,
        },
        left: {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1.5,
          marginLeft: Spacing.md,
          marginVertical: Spacing.xs,
          borderRadius: 24,
          paddingHorizontal: Spacing.sm,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        },
      }}
      textStyle={{
        right: { 
          color: "#FFFFFF", 
          fontSize: Typography.sizes.base,
          fontFamily: fonts.spiritualBodyFont?.fontFamily,
          lineHeight: Typography.sizes.base * 1.3,
          letterSpacing: 0.3,
        },
        left: { 
          color: colors.textDark, 
          fontSize: Typography.sizes.base,
          fontFamily: fonts.spiritualBodyFont?.fontFamily,
          lineHeight: Typography.sizes.base * 1.3,
          letterSpacing: 0.3,
        },
      }}
    />
  );

  // Input toolbar
  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={[styles.inputToolbar, { 
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        shadowColor: '#8B4513'
      }]}
      primaryStyle={styles.inputPrimary}
    />
  );

  // Send button
  const renderSend = (props: any) => {
    const hasText = props.text && props.text.trim().length > 0;
    return (
      <Send 
        {...props}
        containerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 0,
          marginBottom: 0,
          marginLeft: 0,
          marginTop: 0,
        }}
        textStyle={{ display: 'none' }}
      >
        <View style={[
          styles.sendButton, 
          { 
            backgroundColor: hasText ? "#8B4513" : "#D3D3D3",
            opacity: hasText ? 1 : 0.6
          }
        ]}>
          <Ionicons 
            name="arrow-up" 
            size={18} 
            color={hasText ? "#FFFFFF" : "#808080"} 
          />
        </View>
      </Send>
    );
  };

  const connectionInfo = getConnectionInfo();

  return (
    <>
      <ChatOptionsModal
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
        onUnmatch={async () => {
          setOptionsVisible(false);
          setIsUnmatching(true);
          router.replace("/(tabs)/SoulChats");
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
          setShowReportModal(false);
          router.replace("/(tabs)/SoulChats");
          setTimeout(async () => {
            const success = await reportUser(otherUserId, reason, details);
            if (success) {
              console.log("Report submitted successfully");
            } else {
              console.error("Failed to submit report");
            }
          }, 300);
        }}
      />
      
      {/* Main Content - Instant loading, no wrapper needed */}
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { 
            backgroundColor: colors.background,
            borderBottomColor: colors.border
          }]}>
            <View style={styles.headerTop}>
              <View style={styles.backAndTitle}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
                >
                  <Ionicons name="chevron-back" size={24} color="#8B4513" />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                  <View style={styles.nameWithIcon}>
                    <Text style={[styles.headerTitle, fonts.spiritualLargeTitleFont, { color: colors.textDark }]}>
                      {otherUserData?.firstName || "Soul"}
                    </Text>
                    {/* Connection icon next to name */}
                    {connectionMethod?.viaLotus && (
                      <CustomIcon name="lotus" size={28} style={styles.nameIcon} />
                    )}
                    {connectionMethod?.viaRadiance && !connectionMethod?.viaLotus && (
                      <CustomIcon name="halo" size={28} color="#F1C40F" style={styles.nameIcon} />
                    )}
                  </View>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setOptionsVisible(true)}
                style={styles.moreButton}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#8B4513" />
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === "chat" && styles.activeTab]}
                onPress={() => handleTabChange("chat")}
              >
                <Text style={[
                  styles.tabText, 
                  fonts.spiritualBodyFont,
                  { color: activeTab === "chat" ? "#8B4513" : colors.textLight },
                  activeTab === "chat" && styles.activeTabText
                ]}>
                  Chat
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === "profile" && styles.activeTab]}
                onPress={() => handleTabChange("profile")}
              >
                <Text style={[
                  styles.tabText, 
                  fonts.spiritualBodyFont,
                  { color: activeTab === "profile" ? "#8B4513" : colors.textLight },
                  activeTab === "profile" && styles.activeTabText
                ]}>
                  Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content with Smooth Sliding Animation */}
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
                >
                  <GiftedChat
                    messages={messages}
                    onSend={handleSend}
                    user={{
                      _id: userData.userId,
                      name: userData.firstName,
                      avatar: userData.photos?.[0],
                    }}
                    placeholder="Send a message..."
                    showUserAvatar={false}
                    renderBubble={renderBubble}
                    renderInputToolbar={renderInputToolbar}
                    renderSend={renderSend}
                    renderSystemMessage={renderSystemMessage}
                    alwaysShowSend={true}
                    minInputToolbarHeight={56}
                    bottomOffset={0}
                    keyboardShouldPersistTaps="handled"
                    messagesContainerStyle={{ backgroundColor: colors.background }}
                    renderChatEmpty={() => <View />}
                    renderChatFooter={() => null}
                    scrollToBottomComponent={() => null}
                    loadEarlier={false}
                    infiniteScroll={false}
                    isLoadingEarlier={false}
                    renderLoadEarlier={() => null}
                    textInputProps={{
                      style: [styles.textInput, { 
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.textDark,
                        fontFamily: fonts.spiritualBodyFont?.fontFamily,
                      }],
                      placeholder: "Send a message...",
                      placeholderTextColor: colors.textLight,
                      multiline: true,
                      maxLength: 1000,
                      underlineColorAndroid: 'transparent',
                    }}
                  />
                </KeyboardAvoidingView>
              </View>

              {/* Profile View */}
              <View style={styles.tabContent}>
                {fullUserData ? (
                  <ScrollView
                    style={[{ flex: 1 }, { backgroundColor: colors.background }]}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                  >
                    <PotentialMatch
                      currentPotentialMatch={fullUserData}
                      currentUserData={userData}
                      isMatched={true}
                    />
                  </ScrollView>
                ) : (
                  <View style={styles.profileLoader}>
                    <View style={styles.simpleSpinner}>
                      <Ionicons name="refresh" size={32} color="#7B6B5C" />
                    </View>
                    <Text style={[styles.profileLoadingText, fonts.spiritualBodyFont, { color: '#7B6B5C' }]}>
                      Loading essence...
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
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? Spacing.sm : Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  connectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: Spacing.md,
    backgroundColor: '#FFFFFF',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
    borderRadius: 20,
  },
  backAndTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleContainer: {
    marginLeft: Spacing.sm,
  },

  nameWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  nameIcon: {
    marginLeft: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
    opacity: 0.8,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  moreButton: {
    padding: Spacing.sm,
    marginRight: -Spacing.sm,
    borderRadius: 20,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    borderRadius: 8,
  },
  activeTab: {
    borderBottomColor: "#8B4513",
    backgroundColor: '#8B4513' + '08',
  },
  tabIcon: {
    marginRight: Spacing.xs,
  },
  tabText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.3,
  },
  activeTabText: {
    fontWeight: Typography.weights.semibold,
  },
  contentWrapper: {
    flex: 1,
    overflow: "hidden",
  },
  tabContent: {
    width: screenWidth,
    height: "100%",
    flex: 1,
  },
  slidingContainer: {
    flexDirection: "row",
    width: screenWidth * 2,
    height: "100%",
  },
  profileLoadingText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    marginTop: Spacing.md,
    letterSpacing: 0.3,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  inputToolbar: {
    borderTopWidth: 1,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    minHeight: 56,
    backgroundColor: '#FFFFFF',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    paddingBottom: Platform.OS === 'ios' ? 0 : Spacing.xs,
  },
  inputPrimary: {
    alignItems: "flex-end",
    justifyContent: "center",
    flexDirection: "row",
    paddingVertical: 8,
  },
  textInput: {
    fontSize: Typography.sizes.base,
    lineHeight: Typography.sizes.base * 1.4,
    marginTop: 0,
    marginBottom: 0,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderRadius: 28,
    borderWidth: 1.5,
    maxHeight: 100,
    minHeight: 40,
    flex: 1,
    marginRight: Spacing.md,
    backgroundColor: '#FFFFFF',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#8B4513',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  systemMessageContainer: {
    alignItems: "center",
    marginVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  systemMessage: {
    borderRadius: 24,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    backgroundColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    maxWidth: "90%",
  },
  systemIconContainer: {
    marginBottom: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  systemMessageText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    textAlign: "center",
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
    lineHeight: Typography.sizes.base * 1.4,
  },
  systemMessageDate: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
    letterSpacing: 0.2,
    textAlign: "center",
  },
  profileLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  simpleSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5E6D3',
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
    shadowColor: '#7B6B5C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default Chat;