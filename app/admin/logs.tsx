import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/Colors';
import { useFont } from '@/hooks/useFont';

export default function AdminLogs() {
  const fonts = useFont();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            📋 Logs & Events
          </Text>
          <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
            View system logs and user activity
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.placeholderContainer}>
          <Ionicons name="document-text" size={64} color={colors.textMuted} />
          <Text style={[styles.placeholderTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
            Logs & Events
          </Text>
          <Text style={[styles.placeholderText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
            This section will display:
          </Text>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="bug" size={20} color={colors.primary} />
              <Text style={[styles.featureText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                System error logs and debugging info
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="person" size={20} color={colors.primary} />
              <Text style={[styles.featureText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                User login and activity logs
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="shield" size={20} color={colors.primary} />
              <Text style={[styles.featureText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                Security and authentication events
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="analytics" size={20} color={colors.primary} />
              <Text style={[styles.featureText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                Performance and usage metrics
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="filter" size={20} color={colors.primary} />
              <Text style={[styles.featureText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                Filterable log views by date and type
              </Text>
            </View>
          </View>
          
          <Text style={[styles.comingSoon, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
            Coming soon...
          </Text>
        </View>
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
  },
  headerContent: {
    alignItems: 'center',
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
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },
  placeholderTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  featureList: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  featureText: {
    fontSize: Typography.sizes.base,
    marginLeft: Spacing.md,
    flex: 1,
  },
  comingSoon: {
    fontSize: Typography.sizes.lg,
    fontStyle: 'italic',
    opacity: 0.6,
    marginTop: Spacing.xl,
  },
});
