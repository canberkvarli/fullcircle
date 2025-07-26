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
import LottieView from "lottie-react-native";
import ChatOptionsModal from "@/components/modals/ChatOptionsModal";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import { Colors, Typography, Spacing } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
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

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [otherUserData, setOtherUserData] = useState<any>(null);
  const [fullUserData, setFullUserData] = useState<any>(null);
  const [matchDate, setMatchDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "profile">("chat");
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isUnmatching, setIsUnmatching] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState<{ viaOrb: boolean; viaRadiance: boolean } | null>(null);
  
  // Animation for smooth sliding between tabs
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Loading animation refs
  const loadingPulse = useRef(new Animated.Value(0)).current;
  const loadingFadeIn = useRef(new Animated.Value(0)).current;
  const loadingFadeOut = useRef(new Animated.Value(1)).current;
  const contentFadeIn = useRef(new Animated.Value(0)).current;

  // Enhanced loading state management with immediate mandala display
  useEffect(() => {
    // Show mandala immediately when component mounts
    setShowLoadingScreen(true);
    
    let minimumTimeElapsed = false;
    let dataReady = false;

    // Minimum display time timer (1 second to see the animation)
    const minimumTimer = setTimeout(() => {
      minimumTimeElapsed = true;
      if (dataReady) {
        handleTransitionToContent();
      }
    }, 1000);

    // Check if data is ready
    const checkDataReady = () => {
      if (!isLoading && chatId) {
        dataReady = true;
        if (minimumTimeElapsed) {
          handleTransitionToContent();
        }
      }
    };

    const handleTransitionToContent = () => {
      // Smooth fade out loading screen
      Animated.timing(loadingFadeOut, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }).start(() => {
        setShowLoadingScreen(false);
        setShowContent(true);
        // Fade in main content
        Animated.timing(contentFadeIn, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    };

    // Initial check
    checkDataReady();

    // Cleanup
    return () => {
      clearTimeout(minimumTimer);
    };
  }, [isLoading, chatId]);

  // Start loading animations immediately
  useEffect(() => {
    // Start animations immediately when component mounts
    Animated.timing(loadingFadeIn, {
      toValue: 1,
      duration: 300, // Faster initial fade-in
      useNativeDriver: true,
    }).start();

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(loadingPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(loadingPulse, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []); // Remove dependencies to start immediately

  // Parse matchUser and detect connection method
  useEffect(() => {
    if (matchUser) {
      try {
        const parsedUser = JSON.parse(matchUser);
        setOtherUserData(parsedUser);

        // Detect connection method
        const method = {
          viaOrb: parsedUser.theirConnectionMethod?.viaOrb || 
                  parsedUser.connectionMethods?.[parsedUser.userId]?.viaOrb || 
                  parsedUser.viaOrb || 
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

  // Create/fetch chatId and get match date - with immediate response
  useEffect(() => {
    let mounted = true;

    // Don't try to create chat if unmatching
    if (isUnmatching) return;

    // Start the async operation immediately but don't block
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
        text: `You matched with ${otherUserData?.firstName || "them"}! ✨`,
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

  // Handle tab change with smooth sliding animation
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

  // Get connection method info
  const getConnectionInfo = () => {
    if (!connectionMethod) return null;
    
    if (connectionMethod.viaOrb && connectionMethod.viaRadiance) {
      return {
        icon: "planet" as const,
        text: "Orb & Radiance Match",
        color: "#8B4513"
      };
    } else if (connectionMethod.viaOrb) {
      return {
        icon: "planet" as const,
        text: "Orb Match",
        color: "#8B4513"
      };
    } else if (connectionMethod.viaRadiance) {
      return {
        icon: "radio" as const,
        text: "Radiance Match",
        color: "#D4AF37"
      };
    }
    return null;
  };

  // System message renderer
  const renderSystemMessage = (props: any) => {
    return (
      <View style={[styles.systemMessageContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.systemMessage, { 
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: '#8B4513'
        }]}>
          <View style={[styles.systemIconContainer, { backgroundColor: '#8B4513' + '15' }]}>
            <Ionicons name="heart" size={20} color="#8B4513" />
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
  const renderSend = (props: any) => (
    <Send 
      {...props}
      containerStyle={{
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 0,
        marginBottom: 10,
        marginLeft: 0,
        marginTop: 0,
      }}
      textStyle={{ display: 'none' }}
    >
      <View style={[styles.sendButton, { backgroundColor: "#8B4513" }]}>
        <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
      </View>
    </Send>
  );

  // Show loading screen immediately, then check for content readiness
  if (showLoadingScreen) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Animated.View 
          style={[
            styles.loader,
            { 
              opacity: Animated.multiply(loadingFadeIn, loadingFadeOut)
            }
          ]}
        >
          {/* Animated Lottie Container - Only the mandala */}
          <Animated.View
            style={[
              styles.lottieContainer,
              {
                opacity: loadingPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
                transform: [
                  {
                    scale: loadingPulse.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.95, 1.05, 0.95],
                    }),
                  },
                ],
              }
            ]}
          >
            <LottieView
              source={require('../../../../assets/animations/loading_mandala.json')}
              autoPlay
              loop
              style={styles.lottieAnimation}
              speed={0.8}
            />
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    );
  }

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
      
      {/* Main Content with Fade-in Animation */}
      <Animated.View style={[{ flex: 1 }, { opacity: contentFadeIn }]}>
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { 
            backgroundColor: colors.background,
            borderBottomColor: colors.border
          }]}>
            {/* Connection Method Indicator */}
            {connectionInfo && (
              <View style={[styles.connectionBanner, { 
                backgroundColor: connectionInfo.color + '08',
                borderColor: connectionInfo.color + '20'
              }]}>
                <Ionicons name={connectionInfo.icon} size={16} color={connectionInfo.color} />
                <Text style={[styles.connectionText, fonts.spiritualBodyFont, { color: connectionInfo.color }]}>
                  {connectionInfo.text}
                </Text>
              </View>
            )}

            <View style={styles.headerTop}>
              <View style={styles.backAndTitle}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
                >
                  <Ionicons name="chevron-back" size={24} color="#8B4513" />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                  <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
                    {otherUserData?.firstName || "Soul"}
                  </Text>
                  <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
                    Connected ✨
                  </Text>
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
                <Ionicons 
                  name="chatbubble-ellipses" 
                  size={16} 
                  color={activeTab === "chat" ? "#8B4513" : colors.textLight}
                  style={styles.tabIcon}
                />
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
                <Ionicons 
                  name="person-circle" 
                  size={16} 
                  color={activeTab === "profile" ? "#8B4513" : colors.textLight}
                  style={styles.tabIcon}
                />
                <Text style={[
                  styles.tabText, 
                  fonts.spiritualBodyFont,
                  { color: activeTab === "profile" ? "#8B4513" : colors.textLight },
                  activeTab === "profile" && styles.activeTabText
                ]}>
                  Essence
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
                  behavior={Platform.OS === "ios" ? "padding" : undefined}
                  keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
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
                    alwaysShowSend
                    minInputToolbarHeight={72}
                    bottomOffset={Platform.OS === "ios" ? 20 : 0}
                    keyboardShouldPersistTaps="never"
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
                      isMatched={true}
                    />
                  </ScrollView>
                ) : (
                  <View style={styles.profileLoader}>
                    <Animated.View
                      style={[
                        styles.lottieContainer,
                        {
                          opacity: loadingPulse.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          }),
                          transform: [
                            {
                              scale: loadingPulse.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0.95, 1.05, 0.95],
                              }),
                            },
                          ],
                        }
                      ]}
                    >
                      <LottieView
                        source={require('../../../../assets/animations/loading_mandala.json')}
                        autoPlay
                        loop
                        style={styles.lottieAnimation}
                        speed={0.8}
                      />
                    </Animated.View>
                    <Text style={[styles.loadingText, fonts.spiritualBodyFont, { color: '#8B4513' }]}>
                      Loading profile...
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          </View>
        </SafeAreaView>
      </Animated.View>
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
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  connectionText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginLeft: Spacing.xs,
    letterSpacing: 0.3,
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
    paddingHorizontal: Spacing.xl,
  },
  lottieContainer: {
    width: 150,
    height: 150,
    marginBottom: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  loadingText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  inputToolbar: {
    borderTopWidth: 1,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    minHeight: 72,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  inputPrimary: {
    alignItems: "flex-end",
    justifyContent: "center",
    flexDirection: "row",
  },
  textInput: {
    fontSize: Typography.sizes.base,
    lineHeight: Typography.sizes.base * 1.4,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 28,
    borderWidth: 1.5,
    maxHeight: 100,
    minHeight: 48,
    flex: 1,
    marginRight: Spacing.md,
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    maxWidth: "90%",
  },
  systemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
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
});

export default Chat;