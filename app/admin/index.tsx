import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { useFont } from '@/hooks/useFont';
import auth from '@react-native-firebase/auth';

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const fonts = useFont();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  useEffect(() => {
    const user = auth().currentUser;
    setCurrentUser(user);
  }, []);

  const AdminSection = ({ 
    title, 
    subtitle, 
    icon, 
    onPress, 
    color = '#8B4513',
    badge 
  }: {
    title: string;
    subtitle: string;
    icon: string;
    onPress: () => void;
    color?: string;
    badge?: string;
  }) => (
    <TouchableOpacity
      style={[styles.adminSection, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.sectionContent}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={28} color={color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.sectionTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
            {title}
          </Text>
          <Text style={[styles.sectionSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
            {subtitle}
          </Text>
        </View>
        {badge && (
          <View style={[styles.badge, { backgroundColor: color }]}>
            <Text style={[styles.badgeText, fonts.spiritualBodyFont]}>
              {badge}
            </Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            🛡️ Admin Panel
          </Text>
          <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
            System administration and management
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Debug Info Section */}
        {currentUser && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              🔍 Debug Info
            </Text>
            
            <View style={[styles.debugCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.debugTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                Your User ID (UID):
              </Text>
              <Text style={[styles.uidText, fonts.spiritualBodyFont, { color: colors.primary }]}>
                {currentUser.uid}
              </Text>
              <Text style={[styles.debugSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                Copy this UID and add it to the admin list in functions/adminAccess.js
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionHeader, fonts.spiritualBodyFont, { color: colors.textDark }]}>
            🧪 Development Tools
          </Text>
          
          <AdminSection
            title="Dev Tools"
            subtitle="Testing utilities, notifications, and system functions"
            icon="flask"
            onPress={() => router.push('/admin/devtools')}
            color="#FF6B6B"
            badge="Dev"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionHeader, fonts.spiritualBodyFont, { color: colors.textDark }]}>
            🗄️ Database Operations
          </Text>
          
          <AdminSection
            title="User Management"
            subtitle="View, edit, and manage user accounts and data"
            icon="people"
            onPress={() => router.push('/admin/users')}
            color="#4ECDC4"
            badge="DB"
          />

          <AdminSection
            title="Data Operations"
            subtitle="Seed, clean, and manage database content"
            icon="database"
            onPress={() => router.push('/admin/data')}
            color="#45B7D1"
            badge="Data"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionHeader, fonts.spiritualBodyFont, { color: colors.textDark }]}>
            📊 Analytics & Monitoring
          </Text>
          
          <AdminSection
            title="System Status"
            subtitle="Monitor app performance and system health"
            icon="analytics"
            onPress={() => router.push('/admin/status')}
            color="#96CEB4"
            badge="Stats"
          />

          <AdminSection
            title="Logs & Events"
            subtitle="View system logs and user activity"
            icon="document-text"
            onPress={() => router.push('/admin/logs')}
            color="#FFEAA7"
            badge="Logs"
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 69, 19, 0.1)',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    zIndex: 10,
    padding: Spacing.sm,
    borderRadius: 20,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionHeader: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  adminSection: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: Typography.sizes.sm,
    opacity: 0.8,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  debugCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.1)',
    alignItems: 'center',
  },
  debugTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  uidText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  debugSubtitle: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: Typography.sizes.sm * 1.4,
  },
  bottomSpacing: {
    height: Spacing['3xl'],
  },
});
