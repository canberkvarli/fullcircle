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
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
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

  const handleChatPress = async (match: any) => {
    const chatId = [userData.userId, match.userId].sort().join("_");
    await createOrFetchChat(userData.userId, match.userId);
    router.navigate(`/user/${userData.userId}/chats/${chatId}?otherUserId=${match.userId}&matchUser=${encodeURIComponent(JSON.stringify(match))}`);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'light' ? "dark-content" : "light-content"} />
        
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
              Chats
            </Text>
            <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textLight }]}>
              Your{' '}
              <Text style={styles.highlightedWord}>conversations</Text>
              {' await'}
            </Text>
          </View>
        </View>
        
        <View style={styles.loadingContainer}>
          <View style={[styles.loadingMandala, { backgroundColor: '#8B4513' + '10' }]}>
            <Ionicons name="chatbubbles" size={24} color="#8B4513" />
          </View>
          <Text style={[styles.loadingText, fonts.spiritualTitleFont, { color: '#8B4513' }]}>
            Loading Your Chats
          </Text>
          <Text style={[styles.loadingSubtext, fonts.spiritualBodyFont, { color: colors.textLight }]}>
            Getting your conversations ready
          </Text>
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
            <Ionicons name="chatbubbles-outline" size={32} color="#8B4513" />
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
            Chats
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
        {matches.map((match) => {
          const isUnread = match.lastMessage
            ? match.lastMessageSender !== userData.userId
            : true;

          return (
            <TouchableOpacity
              key={match.userId}
              style={[styles.matchRow, { borderBottomColor: colors.border }]}
              onPress={() => handleChatPress(match)}
              activeOpacity={0.7}
            >
              <View style={styles.avatarWrapper}>
                <View style={[
                  styles.avatarContainer, 
                  { 
                    backgroundColor: colors.border,
                    borderColor: isUnread ? '#FFD700' : '#8B4513' + '20',
                    borderWidth: isUnread ? 2.5 : 2,
                    shadowColor: isUnread ? '#FFD700' : 'transparent',
                    shadowOpacity: isUnread ? 0.4 : 0,
                    shadowRadius: isUnread ? 4 : 0,
                    elevation: isUnread ? 4 : 0,
                  }
                ]}>
                  {match.photos[0] ? (
                    <Image
                      source={{ uri: match.photos[0] }}
                      style={styles.photo}
                    />
                  ) : (
                    <Ionicons name="person" size={32} color={colors.textMuted} />
                  )}
                </View>
              </View>
              
              <View style={styles.matchInfo}>
                <View style={styles.matchHeader}>
                  <Text style={[
                    styles.matchName, 
                    fonts.spiritualBodyFont,
                    { color: colors.textDark },
                    isUnread && styles.unreadText
                  ]}>
                    {match.firstName}
                  </Text>
                  {match.lastMessageTimestamp && (
                    <Text style={[styles.timeText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                      {formatTime(match.lastMessageTimestamp)}
                    </Text>
                  )}
                </View>
                
                <Text
                  style={[
                    styles.conversationText,
                    fonts.spiritualBodyFont,
                    { color: colors.textMuted },
                    isUnread && styles.unreadMessageText
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {match.lastMessage
                    ? match.lastMessage.length > 35
                      ? `${match.lastMessage.slice(0, 32)}...`
                      : match.lastMessage
                    : `Start your conversation with ${match.firstName}`}
                </Text>
              </View>
              
              <View style={styles.chatIcon}>
                <Ionicons 
                  name="chevron-forward" 
                  size={16} 
                  color={colors.textMuted} 
                />
              </View>
            </TouchableOpacity>
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  
  loadingMandala: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderBottomWidth: 1,
    marginBottom: Spacing.sm,
  },
  
  avatarWrapper: {
    position: 'relative',
    marginRight: Spacing.lg,
  },
  
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  
  photo: {
    width: '100%',
    height: '100%',
  },
  
  unreadDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
  
  matchName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.3,
  },
  
  timeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.2,
  },
  
  conversationText: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.sizes.sm * 1.3,
    letterSpacing: 0.2,
  },
  
  unreadText: {
    fontWeight: Typography.weights.bold,
  },
  
  unreadMessageText: {
    fontWeight: Typography.weights.semibold,
  },
  
  chatIcon: {
    padding: Spacing.xs,
  },
  
  bottomSpacing: {
    height: Spacing['3xl'],
  },
});

export default SoulChats;