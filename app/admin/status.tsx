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

export default function AdminStatus() {
  const fonts = useFont();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            📊 System Status
          </Text>
          <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
            Monitor app performance and system health
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.placeholderContainer}>
          <Ionicons name="analytics" size={64} color={colors.textMuted} />
          <Text style={[styles.placeholderTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
            System Status
          </Text>
          <Text style={[styles.placeholderText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
            This section will show:
          </Text>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="server" size={20} color={colors.primary} />
              <Text style={[styles.featureText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                Server performance metrics
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="people" size={20} color={colors.primary} />
              <Text style={[styles.featureText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                Active user counts
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="time" size={20} color={colors.primary} />
              <Text style={[styles.featureText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                Response time monitoring
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="warning" size={20} color={colors.primary} />
              <Text style={[styles.featureText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                Error rates and alerts
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
