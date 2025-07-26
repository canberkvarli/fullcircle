import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform,
  useColorScheme,
  Animated,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { useUserContext } from "@/context/UserContext";
import { Link, useRouter } from "expo-router";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

const SoulChats: React.FC = () => {
  const {
    userData,
    createOrFetchChat,
    subscribeToChatMatches,
    getImageUrl
  } = useUserContext();

  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  // Animation for smooth loading
  const loadingPulse = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start loading animation
    Animated.loop(
      Animated.timing(loadingPulse, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      { resetBeforeIteration: true }
    ).start();

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

  const handleChatPress = (match: any) => {
    // Navigate immediately without waiting
    const chatId = [userData.userId, match.userId].sort().join("_");
    router.navigate(`/user/${userData.userId}/chats/${chatId}?otherUserId=${match.userId}&matchUser=${encodeURIComponent(JSON.stringify(match))}`);
    
    // Create/fetch chat in background (don't await)
    createOrFetchChat(userData.userId, match.userId).catch(error => {
      console.error("Error creating/fetching chat in background:", error);
    });
  };

  // Helper function to get connection methods for this match
  const getConnectionMethods = (match: any) => {
    return {
      theirMethod: {
        viaOrb: match.theirConnectionMethod?.viaOrb || 
                match.connectionMethods?.[match.userId]?.viaOrb || 
                match.viaOrb || 
                false,
        viaRadiance: match.theirConnectionMethod?.viaRadiance || 
                     match.connectionMethods?.[match.userId]?.viaRadiance || 
                     match.viaRadiance || 
                     false
      },
      ourMethod: {
        viaOrb: match.myConnectionMethod?.viaOrb || 
                match.connectionMethods?.[userData.userId]?.viaOrb || 
                false,
        viaRadiance: match.myConnectionMethod?.viaRadiance || 
                     match.connectionMethods?.[userData.userId]?.viaRadiance || 
                     false
      }
    };
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
        
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
              Soul Chats
            </Text>
            <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
              Your{' '}
              <Text style={styles.highlightedWord}>conversations</Text>
              {' await'}
            </Text>
          </View>
        </View>
        
        <View style={styles.loadingContainer}>
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
              source={require('../../assets/animations/loading_mandala.json')}
              autoPlay
              loop
              style={styles.lottieAnimation}
              speed={0.8}
            />
          </Animated.View>
        </View>
      </View>
    );
  }

  if (!matches.length) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
        
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
              Soul Chats
            </Text>
            <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
              Your{' '}
              <Text style={styles.highlightedWord}>conversations</Text>
              {' await'}
            </Text>
          </View>
        </View>

        <View style={styles.noMatchesContainer}>
          <View style={[styles.cosmicSymbol, { backgroundColor: '#8B4513' + '15' }]}>
            <Ionicons name="chatbubbles-outline" size={36} color="#8B4513" />
          </View>
          
          <Text style={[styles.noMatchesTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            Your conversations await
          </Text>
          
          <Text style={[styles.noMatchesSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            Connect with great people and start meaningful conversations. Like profiles to create matches and begin chatting.
          </Text>
          
          <TouchableOpacity
            style={[styles.connectButton, { backgroundColor: '#8B4513', shadowColor: '#8B4513' }]}
            onPress={() => router.push('/Connect')}
            activeOpacity={0.9}
          >
            <Ionicons name="sparkles" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={[styles.connectButtonText, fonts.spiritualBodyFont]}>
              Discover Connections
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
      
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            Soul Chats
          </Text>
          <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            {matches.length}{' '}
            <Text style={styles.highlightedWord}>conversation</Text>
            {matches.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {matches.map((match, index) => {
          const isUnread = match.lastMessage
            ? match.lastMessageSender !== userData.userId
            : true;

          const connectionMethods = getConnectionMethods(match);

          return (
            <View key={match.userId}>
              <TouchableOpacity
                style={[
                  styles.matchRow, 
                  { 
                    backgroundColor: 'transparent',
                  }
                ]}
                onPress={() => handleChatPress(match)}
                activeOpacity={0.7}
              >
                <View style={styles.avatarWrapper}>
                  {/* Enhanced unread glow with divine golden-brown */}
                  {isUnread && (
                    <>
                      <View style={styles.unreadOuterGlow} />
                      <View style={styles.unreadInnerGlow} />
                      <View style={styles.unreadDivineRing} />
                    </>
                  )}
                  
                  <View style={[
                    styles.avatarContainer, 
                    { 
                      backgroundColor: colors.border,
                      borderColor: isUnread ? '#B8860B' : colors.border,
                      borderWidth: isUnread ? 3 : 2,
                      shadowColor: isUnread ? '#D4AF37' : '#000',
                      shadowOffset: { width: 0, height: isUnread ? 4 : 2 },
                      shadowOpacity: isUnread ? 0.3 : 0.1,
                      shadowRadius: isUnread ? 8 : 4,
                      elevation: isUnread ? 8 : 3,
                    }
                  ]}>
                    {match.photos[0] ? (
                      <Image
                        source={{ uri: match.photos[0] }}
                        style={styles.photo}
                      />
                    ) : (
                      <Ionicons name="person" size={42} color={colors.textMuted} />
                    )}
                  </View>
                  
                  {/* Connection Method Indicators - Top Right of Avatar */}
                  {(connectionMethods.theirMethod.viaOrb || connectionMethods.theirMethod.viaRadiance) && (
                    <View style={styles.connectionIndicators}>
                      {connectionMethods.theirMethod.viaOrb && (
                        <View style={[styles.connectionBadge, styles.orbIndicator]}>
                          <Ionicons name="planet" size={11} color="#FFFFFF" />
                        </View>
                      )}
                      {connectionMethods.theirMethod.viaRadiance && (
                        <View style={[styles.connectionBadge, styles.radianceIndicator]}>
                          <Ionicons name="radio" size={11} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  )}
                  
                  {/* Enhanced unread indicator with divine golden center */}
                  {isUnread && (
                    <View style={styles.unreadDot}>
                      <View style={styles.unreadDotInner} />
                      <View style={styles.unreadDotCenter} />
                    </View>
                  )}
                </View>
                
                <View style={styles.matchInfo}>
                  <View style={styles.matchHeader}>
                    <View style={styles.nameRow}>
                      <Text style={[
                        styles.matchName, 
                        fonts.spiritualBodyFont,
                        { color: colors.textDark },
                        isUnread && styles.unreadText
                      ]}>
                        {match.firstName}
                      </Text>
                      
                      {/* Connection icons next to name */}
                      {(connectionMethods.theirMethod.viaOrb || connectionMethods.theirMethod.viaRadiance) && (
                        <View style={styles.nameConnectionIcons}>
                          {connectionMethods.theirMethod.viaOrb && (
                            <View style={styles.nameConnectionIcon}>
                              <Ionicons name="planet" size={13} color="#8B4513" />
                            </View>
                          )}
                          {connectionMethods.theirMethod.viaRadiance && (
                            <View style={styles.nameConnectionIcon}>
                              <Ionicons name="radio" size={13} color="#D4AF37" />
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                    
                    {match.lastMessageTimestamp && (
                      <Text style={[
                        styles.timeText, 
                        fonts.spiritualBodyFont, 
                        { color: isUnread ? '#8B4513' : colors.textMuted },
                        isUnread && styles.unreadTimeText
                      ]}>
                        {formatTime(match.lastMessageTimestamp)}
                      </Text>
                    )}
                  </View>
                  
                  <Text
                    style={[
                      styles.conversationText,
                      fonts.spiritualBodyFont,
                      { color: isUnread ? colors.textDark : colors.textMuted },
                      isUnread && styles.unreadMessageText
                    ]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {match.lastMessage
                      ? match.lastMessage.length > 60
                        ? `${match.lastMessage.slice(0, 57)}...`
                        : match.lastMessage
                      : `Start your conversation with ${match.firstName}`}
                  </Text>
                </View>
                
                <View style={styles.chatIcon}>
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={isUnread ? '#8B4513' : colors.textMuted}
                  />
                </View>
              </TouchableOpacity>
              
              {/* Enhanced Divider with spiritual touch */}
              {index < matches.length - 1 && (
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerOrnament}>
                    <View style={[styles.dividerDot, { backgroundColor: '#8B4513' + '20' }]} />
                    <View style={[styles.dividerLine, { backgroundColor: "#8B4513" }]} />
                    <View style={[styles.dividerDot, { backgroundColor: '#8B4513' + '20' }]} />
                  </View>
                </View>
              )}
            </View>
          );
        })}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const formatTime = (timestamp: any) => {
  if (!timestamp) return '';
  
  const now = new Date();
  const messageTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diffInMs = now.getTime() - messageTime.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  
  if (diffInHours < 1) {
    return 'Now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h`;
  } else if (diffInDays < 7) {
    return `${Math.floor(diffInDays)}d`;
  } else {
    return messageTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
  },
  
  headerLeft: {
    flex: 1,
  },
  
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  
  highlightedWord: {
    color: '#8B4513',
    textShadowColor: '#D2691E',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.5,
  },
  
  scrollContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  
  lottieContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  lottieAnimation: {
    width: 100,
    height: 100,
  },
  
  noMatchesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  
  cosmicSymbol: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  noMatchesTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    letterSpacing: 0.5,
  },
  
  noMatchesSubtitle: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing['2xl'],
    letterSpacing: 0.3,
    fontStyle: 'italic',
  },
  
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  
  connectButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: 0,
    marginBottom: Spacing.xs,
  },
  
  avatarWrapper: {
    position: 'relative',
    marginRight: Spacing.lg,
  },
  
  // Enhanced smaller avatar
  avatarContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  
  // Divine golden-brown glow effects for unread
  unreadOuterGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderRadius: 48,
    zIndex: 0,
  },
  
  unreadInnerGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    backgroundColor: 'rgba(139, 69, 19, 0.08)',
    borderRadius: 44,
    zIndex: 1,
  },
  
  unreadDivineRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderWidth: 2,
    borderColor: 'rgba(184, 134, 11, 0.6)',
    borderRadius: 41,
    zIndex: 2,
  },
  
  photo: {
    width: '100%',
    height: '100%',
  },
  
  // Connection indicators on avatar (top-right)
  connectionIndicators: {
    position: 'absolute',
    top: -2,
    right: -2,
    flexDirection: 'row',
    gap: 2,
    zIndex: 5,
  },
  
  connectionBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  
  orbIndicator: {
    backgroundColor: '#8B4513',
  },
  
  radianceIndicator: {
    backgroundColor: '#D4AF37',
  },
  
  // Enhanced unread dot with divine center
  unreadDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  
  unreadDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D4AF37',
  },
  
  unreadDotCenter: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B4513',
  },
  
  matchInfo: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  matchName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.3,
  },
  
  // Connection icons next to name
  nameConnectionIcons: {
    flexDirection: 'row',
    marginLeft: Spacing.sm,
    gap: Spacing.xs,
  },
  
  nameConnectionIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  
  timeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.2,
  },
  
  conversationText: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.sizes.sm * 1.4,
    letterSpacing: 0.2,
  },
  
  // Bold styling for unread messages
  unreadText: {
    fontWeight: Typography.weights.bold,
    color: '#1A1A1A',
  },
  
  unreadTimeText: {
    fontWeight: Typography.weights.bold,
  },
  
  unreadMessageText: {
    fontWeight: Typography.weights.bold,
    color: '#2C2C2C',
  },
  
  chatIcon: {
    padding: Spacing.xs,
  },
  
  // Enhanced spiritual divider
  dividerContainer: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  
  dividerOrnament: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
  },
  
  dividerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  
  dividerLine: {
    flex: 1,
    height: 1,
    marginHorizontal: Spacing.sm,
    opacity: 0.3,
  },
  
  bottomSpacing: {
    height: Spacing['3xl'],
  },
});

export default SoulChats;